---
title: 用node+vuepress+docker打造团队文档知识库
date: 2020-08-10
tags: [node,docker,vuepress]
categories: [前端工具]
---

## 前言

所在的团队有着知识总结和输出的好氛围，每个月都会有同事进行技术上的一些分享，分享的资料一般都是`markdown`文件放置在`gitlab`中。我在`gitlab`中看这些文档的时候，发现文档管理不够集中，比较散落，文档分布到了不同的仓库下(权限管理原因)，不能快速得呈现出来，总是要点来点去，加上`gitlab`的阅读体验也不好，所以就想着应该有个工具来集中管理这些文档。但是团队上目前是没有想要的工具了，于是便萌生了要做一款文档知识管理工具的想法。现在这个想法已经落地，下面就来跟大家一起来总结复盘下。

## 准备工作

产生想法容易，但把想法落地可不容易。于是我把这个想法告诉了团队领导，团队领导表示赞同，说可以试着把这块工具做出来，因为团队是有文档管理上的一些问题需要解决，能做出工具来解决问题当然很好了。

那要怎么去做呢？关于的一些文档的开源工具，业界上有很多很多，但是`vuepress` 我是用得比较多的，比较熟悉，加上团队一直都是用`vue`相关技术栈，以后要加功能改造也容易一些，所以就决定使用`vuepress`来渲染这些文档。关于`vuepress`的介绍和使用可以查阅[官网](https://vuepress.vuejs.org/zh/)。

渲染文档工具确定，文档哪里来？当然是从`gitlab`上拉过来，现在的文档都放置到`gitlab`各个仓库中，所以需要想办法拉取这个文档下来。于是，我想到可以使用`gitlab`提供的的`api`去把这些文档拉取下来，之前做脚手架的时候，就是用`gitlab api`去做了一些事情，所以就想到了这点。当时也想过用`download for git`这个库来拉取，但是这个库会把整个仓库东西都拉取下来，觉得没必要，所以就决定写脚本用`gitlab api`拉取好了。

文档拉取和文档渲染都确定了，部署呢？说到部署，就肯定离不开`docker`了，用`docker`可以实现快速部署，大大提高效率，用它准没错。再配合`gitlab webhook`，在仓库有提交的情况，`gitlab`会发一次http请求，这样，我可以写一个后端接口来实现一套轻量级的自动化部署机制。

经过了思考和摸索，大致流程已经确定，技术选型如下：

关键技术：

- nodejs

- vuepress

- gitlab api
- koa2
- webhook

部署方案：

- pm2部署node后端服务

- docker && docker-compose

对了，这次开发我还决定使用TDD(测试驱动开发)方式，因为这套都是一些脚本函数，测试用例容易写，开发效率也高。

## 开发实现

在写代码之前，拿工具先把流程图画出来，这样就可以看着流程图来编码，比较舒服了

这是在开发完成之后修改的流程图：

![image-20201016171138785](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20201016171138785.png)

工程目录如下：

![image-20201016213406628](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20201016213406628.png)



上文说了这块是用TDD方式去开发的，所以可以看到基本上每个src下的文件都会有对应的单元测试文件

![image-20201016215448834](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20201016215448834.png)



总体流程和项目结构就这样，没做得很复杂，算是比较简单，下面再来每个步骤的一些具体实现。

### 拉取文档

执行`yarn fetch`，实际上就是执行`node src/index.js`语句，也就是入口文件，代码精简过后就是这样

```js
const DESTDOCS = path.resolve(process.cwd(), "docs");
const COPYDOCS = path.resolve(process.cwd(), "src/docs");

function rmdocs() {
  return rmrf(DESTDOCS);
}

function copydocs() {
  return copy(COPYDOCS, DESTDOCS);
}

async function build() {
  try {
    // 拉取文档...
    await fetch();

    // 构建config.js...
    await genConfig();

    log(`Success!`);
  } catch (error) {
    log(error);
  }
}

(function() {
  rmdocs();
  copydocs();
  build();
})();
```

`fetch函数`在`src/fetch.js`文件中实现，主要就是负责调取`gitlab api`去拉取仓库文档还有图片，因为`gitlab api`只提供了获取单个文件流的接口，所以需要递归读取文件夹进行拉取

```js
async function fetch(item) {
  const { projectId, name, text, url } = item;

  log(`开始拉取${chalk.cyan(`【${text}】`)}项目仓库文档...`);

  // 递归拉取文件夹文件
  async function _fetch(folderPath) {
    const projectTree = await getProjectTree({
      projectId,
      params: {
        path: folderPath ? folderPath : ""
      }
    });

    for (const _ of projectTree) {
      if (_.type === "tree") {
        const path = folderPath === "" ? _.name : `${folderPath}/${_.name}`;
        await _fetch(path);
      }

      // 拉取 md 文件
      if (_.type === "blob" && _.name.replace(/^.*\.(md)$/, "$1") === "md") {
        await saveMarkdown({
          projectId,
          filePath: _.path,
          destPath: path.resolve(DESTDIR, name, _.path),
          url
        });

        log(`拉取 ${chalk.cyan(text)} 项目 ${chalk.cyan(_.path)} 文档成功！`);
      }

      // 拉取图片
      if (isFetchImg) {
        if (_.type === "blob" && isImgFile(_.name)) {
          await saveImg({
            projectId,
            filePath: _.path,
            destPath: path.resolve(DESTDIR, name, _.path)
          });

          log(`拉取 ${chalk.cyan(text)} 项目 ${chalk.cyan(_.path)} 图片成功！`);
        }
      }
    }
  }

  await _fetch("");

  log(`拉取${chalk.cyan(`【${text}】`)}项目仓库文档成功`);
}

module.exports = async function() {
  const len = fetchItems.length;

  log(`共发现 ${chalk.cyan(len)} 个仓库，准备开始拉取...`);

  try {
    await pipePromise(...fetchItems.map(_ => () => fetch(_)))();
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
```

这个是拉取一个仓库的逻辑，拉取多个仓库的话，我用了个管道函数进行串行管理，这个管道函数实现如下：

```js
const pipePromise = (...functions) => input =>
  functions.reduce((chain, func) => chain.then(func), Promise.resolve(input));
```

这样就保证了仓库按顺序进行拉取

执行效果如下：

![1E066E6409C3AF6D07A46B1ADA149D67](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/1E066E6409C3AF6D07A46B1ADA149D67.jpg)

这样就把文档和图片拉取下来了。在拉取图片过程中，遇到一个小坑，就是`axios`在node中，使用`get`请求的时候，如果不指定`responseType`为`arraybuffer`，那么就会默认使用`buffer.toString`方法进行编码，而且默认值为`utf-8`方式，`axios`源码如下：

![image-20201016225210065](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20201016225210065.png)

由于`gitlab api`请求图片文件流，默认是返回`base64`编码的流，如果用`utf-8`再编码一次，就会出问题了。当时在保存图片后，打开一直显示格式错误，后来写了demo对比了`Buffer`内容，还有用了原生`http`方式请求了才发现原来是`axios`返回的内容有问题，接着就去翻了下`axios`源码，找到了真正的原因，解决了问题。

### 生成vuepress配置文件

首先，vuepress是需要根据配置文件生成想要的效果的，比如页面导航栏和侧边栏的信息都需要根据文档内容生成，比如：

```js
module.exports = {
  title: "广州研发部知识库",
  base: "/ks/",
  dest: "dist",
  description: "Just playing around",
  _fetchImg: true,
	themeConfig: {
    // 导航栏
    nav: [
      {
        text: "前端",
        items: [
          {
            text: "前端技术月报",
            projectId: 1284,
            name: "doc-fe-monthly-report",
            items: [{ text: "2020", link: "/doc-fe-monthly-report/2020/" }]
          },
          // 等等...
          ]
      }
    ],
    // 侧边栏
    sidebar: {
      "/doc-fe-monthly-report/2020/": [
        {
          title: "2020",
          children: ["", "03.md", "04.md", "05.md", "06.md", "07.md"]
        }
      ],
      "/doc-fe-web-gis-base/1_GIS基础知识/": [
        {
          title: "1_GIS基础知识",
          children: [
            "",
            "GIS科普篇.md",
            "地图.md",
            "坐标系统.md",
            "空间数据分析.md",
            "空间数据模型.md"
          ]
        }
      ],
      // 等等...
    }
}
```

这样就可以根据配置文件出来这种效果：

![image-20201018152022732](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20201018152022732.png)



所以，当文档发生变动(增删改)的情况下，页面内容也需要更改，vuepress依赖于配置文件，我们不可能手动写上去吧，这多费时费力，必须一切都由脚本自动生成，只要**约定好相关规范**，拉取和生成配置文件都可以使用脚本完成。说到规范，这边约定了以下几个：

- 每个文件目录下，必须要有一个`README.md`的文件

- 文档图片统一放置到项目根目录的`img`文件夹中

- img 图片和文件夹名都不能包含中文字符串和空格等一些奇怪字符，后缀名都应该是小写的如（"jpg", "jpeg", "png", "svg", "bmp", "gif", "webp"）
- 标题必须按顺序`#、##、###、####`进行编排

> 约定大于配置

约定好了规范，写自动生成配置文件脚本就不难了，这边附上重要函数的逻辑，比较简单：

```js
// 生成 themeConfig.nav 下的 items，即导航栏相关配置
function genNav(data) {
  data.forEach(_ => {
    const { name } = _;

    const path = `docs/${name}/`;

    const dirData = readDir(path, false);

    _.items = dirData.map(dir => {
      return {
        text: dir,
        link: `/${name}/${dir}/`
      };
    });
  });

  return data;
}

// 生成 themeConfig.sidebar
function genSidebar(data) {
  config.themeConfig.sidebar = data.reduce((acc, cur) => {
    const { items } = cur;
    items.forEach(item => {
      const { text, link } = item;
      const key = link;
      const value = [
        {
          title: text,
          children: readDir(`docs${link}`)
        }
      ];

      acc[key] = value;
    });

    return acc;
  }, {});

  return config;
}
```

### 自动化部署

如果没有自动化部署，只能通过人工去本地打包，然后把打包好的文件放到web服务器中。这是很传统的做法，现在是2020年了，再使用这种做法就非常尴尬了，主要是真的很麻烦。自动化部署在今时今日已经非常流行，目前有许多工具也可以实现，比如jenkins和gitlab ci这些。这套工具很小，所以觉得暂时没必要使用jenkins这些了，于是就自己做了一套简易版的前端自动化部署方案。

那么这套方案是怎么实现的呢？

原理其实很简单，因为gitlab提供的webhook，实际上，在代码提交的时候，会触发gitlab的某些event，接着便会发个http请求，这个http请求可以是jenkins的，也可以是自己写的，因为这边不用jenkins，就自己写个简单的接口，然后执行相关自动化部署脚本即可。用nodejs+koa框架可以快速搭建一个http应用服务，再写个post服务监听，收到请求后，让程序跑下自动化部署脚本就可以了。

关于webhook，在gitlab的仓库下可以进行设置

![image-20201018162858731](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20201018162858731.png)

事件使用push events触发，master分支

![image-20201018162944203](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20201018162944203.png)

好了，这边gitlab webhook配置就完成了，下面看看自动化部署服务相关代码：

```js
// 状态锁，避免出现多个仓库同一时间 git push 导致同时触发 docker 部署
let pending = false;

async function deploy() {
  pending = true;

  const cwd = path.resolve(__dirname, "../");

  try {
    await execa.command(`yarn build`, {
      cwd,
      stdio: "inherit"
    });

    await execa.command(`docker-compose down`, {
      cwd,
      stdio: "inherit"
    });

    await execa(
      "sh",
      ["-c", "docker-compose build --no-cache && docker-compose up -d"],
      {
        cwd,
        stdio: "inherit"
      }
    );

    console.log("自动部署成功！");
  } catch (error) {
    console.log(error);

    console.log("自动部署失败！");
  }

  pending = false;
}

router.post(`/ks-auto-deploy`, async (ctx, next) => {
  log();

  const { body } = ctx.request;

  // TODO: 后期可以通过project相关信息做增量更新...
  if (body && body.project) {
    const { description } = body.project;

    log(`接收到 ${description} 项目的更新请求...`);

    log();

    if (!pending) {
      deploy();

      ctx.response.status = 200;
      ctx.body = {
        status: "success",
        message: "请求成功"
      };
    } else {
      ctx.response.status = 403;
      ctx.body = {
        status: "fail",
        message: "正在部署，阻止重复请求"
      };
    }
  } else {
    ctx.response.status = 400;
    ctx.body = {
      status: "fail",
      message: "参数异常"
    };
  }

  await next();
});

app.use(koaBody());
app.use(router.routes());

app.listen(9001, () => {
  console.log(`start at http://localhost:9001`);
});
```

可以看到，代码其实不用很多便可以实现。这边用了个状态锁来避免在同一时间出现多个仓库同时触发了打包脚本，在前面打包没完成的情况下，再次触发是比较危险的操作，所以在同一时间只能跑一次部署脚本。部署脚本也很简单了，就是跑下`docker-compose`的一些shell命令即可。不得不说，用`docker-compose`部署真的很方便，非常推荐大家去学习下。

还有的是，这边使用pm2部署node服务，pm2是一套进程管理工具，内置了非常多的功能，比如负载均衡、自动重启、监控等等，用这套工具部署node应用简单方便。这边就不介绍使用方法了，看文档便可学会如何使用，[文档地址](https://pm2.keymetrics.io/)。好了，自动化部署的总结就到这里。

## 总结

很开心这套工具在团队内部中使用了起来，又一个想法落地了😁。做这套工具没有花很多时间，不过也是靠平时不断地学习和积累吧。把平常学习的知识，用到项目和一些工具上进行验证，是一种很有意思的事情。做出这套工具后，在公司大群上进行了技术分享，因为当时很多同事可能对自动化部署这些不是很了解，所以比较惊讶，原来这些还可以这么玩，比想象中的要容易得多。其实这些只是开始，随着需求的增多，应用也会变得越来越复杂，目前这套工具还只是简单够用，满足目前的需求，以后如果需求变多变复杂，就需要更多的技术去支撑了。

这次的复盘就到这里，如果有什么想法和建议，感谢提出，欢迎交流！




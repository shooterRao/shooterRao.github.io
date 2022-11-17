---
title: 记一次系统前端底层升级总结
date: 2019-04-27
tags: [vue,重构,前端架构]
categories: [vue]
---

## 前言

年后回来，直接从广州飞去上海，参与了一个比较大的类后台管理系统(封闭开发完后统计有10w+行代码)的开发，并负责了该系统的底层升级和子系统的开发，在升级和开发过程期间，遇到了不少问题，在解决问题的过程中学到了很多，觉得很有必要进行总结复盘一下，下面就来聊聊这次升级系统的过程。

## 关于这次升级

听同事说，当时时间比较急，对`vuecli3`不太熟悉，就选了基于`vuecli2`进行快速开发。因为有**6**个系统，页面非常多，所以在底层代码的上没有太多的时间进行优化。在我参与进来之后，我收到了一些同事的反馈和还没有解决的问题，比如首屏加载慢，路由设计存在问题，刷新页面菜单无法高亮等等。跟开发的小伙伴和领导沟通一番之后，他们决定让我去负责解决当前的这些问题，还有重新设计系统架构，所以当时压力也是有点大的。我想了下，既然要升级重做，那就把我之前研究出来的成果都一并用上，然后逐步解决。我重新起了一个副本，从0️⃣搭建环境，开始了这段升级旅程👊

下面是关于这次升级的feature：

- 基于vuecli3
- layout层抽象，实现子系统间灵活切换
- 路由表按子系统模块进行划分注册
- 子系统根据路由表信息渲染，实现动态可配置
- 目录结构重新整理，代码规范约束
- 统一管理api请求和响应的拦截，并规范好api请求方式
- 全局组件规范管理，避免重复造轮子
- 全局组件、指令、vuex-module自动化注册
- sass变量及函数注入，布局使用rem方式
- jest 单元测试
- jenkins+docker自动化打包部署
- 首屏优化、兼容IE11

👇开始分点进行总结

## 关于vuecli3

在上两个月，vue官方推出了vuecli3的`release`版。跟以往熟悉的cli2相比，cli3生成的项目确实变了不少。首先官方开始推崇无`Eject`化，关于webpack的相关配置全部隐藏，只提供`vue.config.js`接口进行相关配置的更改。这样，对于不怎么需要更改webpack配置的开发者来说，可以把注意力都放在业务层上，无须过多关心底层插件的配置信息。但是对于要大量修改webpack配置的开发者来说，需要学习`webpack-chain`的使用，才能准确得更改webpack的配置信息。除此之外，vuecli3对一些生态和依赖都进行了全面的升级，比如`Bebel7`,`webpack`升级到了4.x，代码编译优化，打包速度都有了相关提升。

其实，对于我们这目前的项目来说，从cli2迁移到cli3的成本并不大，底层webpack的配置修改得并不多，cli2能配的cli3同样能配，只是配的方法稍有不同。上层的页面都可以无缝进行迁移。对于**cli2版增加的webpack配置**，有以下几项：

- `sass-resources-loader`注入全局scss变量
- 生产环境剔除`console.log`
- 打包文件出口路径修改

`cli3`实现以上几点的方法： 

- 注入全局scss变量的方式:

在`vue.config.js`中增加：

```js
module.exports = {
  css: {
    loaderOptions: {
      // 给 sass-loader 传递选项
      sass: {
        data: `@import "@/styles/mixin.scss";`
      }
    }
  },
}
```

- 生产环境剔除`console.log`

同样在`vue.config.js`中增加：

```js
// 引入uglifyjs插件
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  configureWebpack: {
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            compress: {
              warnings: false,
              drop_console: true,
              drop_debugger: true
            }
          },
          parallel: true, // 并行压缩
        })
      ]
    },
  }
}
```

- 打包文件出口路径修改

```js
module.exports = {
  baseUrl: process.env.NODE_ENV === "development" ? "/" : "./",
}
```

## 容器布局组件重写

关于系统的布局方式，我简单画了下：

![Layout](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog01.png)

之前基于cli2的版本，是把**系统内容**用`<router-view/>`进行管理，蓝色圈中的地方又包了一层`<router-view/>`，外面的路由采用动态路由去管理： 

```js
{
  name: "System",
  path: "/System/:id",
  props: true,
  component: System
}
```

对应系统页面的url`http://localhost:8080/#/System/0/FZBZDataview`

```
id: 0 => 系统1
id: 1 => 系统2
id: 2 => 系统3
...
```

这种设计有个**问题**，就是在vue动态路由中，`/System/:id`中的`id`可以是任何值，如果不进行判断验证逻辑的话，`http://localhost:8080/#/System/xxx/FZBZDataview`都会跳转到该系统页面，**并不能跳转到此时应该跳转到的404页面**

还有个小问题，就是在菜单高亮的处理上，由于在上面设计的基础上，额外加了很多状态进行管理，导致实现菜单高亮方式过于复杂了，于是我顺便把实现菜单高亮的方式一并重写了。

下面先来聊聊我对于容器组件的设计思路： 

![设计思路](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog02.png)

```
├── Layout
│   ├── Header                 # 头部组件
│   ├── SubList                # 左侧菜单组件
│   └── Layout.vue             # Layout组件
|   └── index.js
```

> 把容器组件抽象出来，对于以后需求和UI的变动，也可以灵活应变了

- 先来解决菜单高亮

菜单高亮用`$route`来进行处理的话，就比较简洁了

```js
// 组件computed
computed: {
  currentPreRouteName() {
    return this.$route.matched[0].name;
  }
},
methods: {
  // 高亮list-item
  computedClass(item) {
    const className = ["list-item"];
    const { name } = item;
    const { currentPreRouteName } = this;
    if (currentPreRouteName === name) {
      className.push("active");
    }
    return className;
  },
}
```

在模板上的处理,

```html
<ul class="app-nav-list">
  <li :class="computedClass(navItem)" v-for="navItem in navList" :key="navItem.name">
    <router-link :to="navItem.path">
      {{navItem.meta.navTitle}}
    </router-link>
  </li>
</ul>
```

换成计算`$route`的`path`进行管理，比起之前的版本，不需要增加额外的状态，不需要watch，也解决了之前刷新页面无法自动高亮的问题(之前为什么不能高亮，具体原因我还没仔细研究，额外加的状态太多绕得比较晕😂)

- 解决无法跳转404页面

之前不能跳转到404页面的原因主要在之前用了动态路由去渲染系统页面，没有加逻辑处理拦截跳转到404。对于这种情况，我采取的解决方案是取消用动态路由去管理，改成匹配对应路由渲染对应的系统

举个🌰：

```js
{
  path: "/FZBZ",
  name: "FZBZ",
  meta: {
    navTitle: "系统一",
    icon: "icon-fzbz"
  },
  redirect: "/FZBZ/BaseDateHandle",
  component: Layout,
  children: [
    {
      path: "BaseDateHandle",
      name: "BaseDateHandle",
      meta: {
        navTitle: "基期数据处理",
        icon: "icon-shujuchanpinliulan"
      },
      component: () =>
        import(/* webpackChunkName: "BaseDateHandle" */ "FZBZ/BaseDateHandle")
    },
  ]
}
```

对应路由路径便是`http://localhost:9096/#/FZBZ/BaseDateHandle`，少了一层router-view，url也简洁了许多。

加个404跳转：

```js
// 没匹配到的路径都跳转到404页面
{
  path: "*",
  name: "404Page",
  component: error404Page
}
```

## 系统菜单改为根据路由表信息进行渲染

之前系统菜单是请求本地自定义json去渲染的，这种方式我认为和路由表不能形成很好的映射，未来如果接入权限的话也很不方便进行控制，所以我统一改成读取路由表信息进行渲染

我写了几个工具函数，根据路由表去过滤路由信息

```js
import routes from "@/router/routes";

/**
 * @param {Object} item
 * @description 判断一个对象中是否存在children
 * @returns Boolean
 */
export const hasChild = item => {
  return item.children && item.children.length !== 0;
};

/**
 * @param {Array} routes 路由表
 * @description 根据路由表获取NavList
 * @returns {Array}
 */
export const getNavList = () => {
  const navList = routes
    .filter(item => item.meta && item.meta.navTitle)
    .map(item => {
      if (!hasChild(item)) {
        // path置空，router-link就可以阻止该导航
        item.path = "";
      }
      return item;
    });
  return navList;
};

/**
 * @param {Object} currentRoute $route
 * @description 根据当前页面路由进行匹配路由表，获取二级路由表
 * @returns {Array} subNavList
 */
export const getSubNavList = currentRoute => {
  // 先获取一级路由名
  const preRouteName = currentRoute.matched[0].name;
  const len = routes.length;
  // 从路由表里面找到对应的二级菜单
  let SubNavList = [];
  let i = -1;
  while (++i < len) {
    if (preRouteName === routes[i].name) {
      SubNavList = routes[i].children;
      break;
    }
  }
  return SubNavList;
};
```

一个是获取系统菜单，一个是根据系统名去获取对应的二级子菜单信息

Portal页和Layout页皆由该方式进行渲染

## 路由表按系统划分进行重构

因为有6个系统，每个系统又有几十个页面，这样统一放在一个js里面，会显得无比笨重，也很容易改错里面的路由信息，所以，针对这种情况，我改成按系统名划分路由表：

```
├── router                      # 路由表管理
│   └── routes
│       ├── fzbz.js             
│       ├── fzsc.js             
│       ├── ghss.js             
│       ├── jcyj.js             
│       ├── zbmx.js             
│       └── zxpg.js             
```

`index.js`里面注册路由：

```js
// nav-list按照挂载路由顺序渲染
import fzbz from "./fzbz";
import fzsc from "./fzsc";
import ghss from "./ghss";
import jcyj from "./jcyj";
import zxpg from "./zxpg";
import zbmx from "./zbmx";

export default [
  ...,
  {
    ...fzbz
  },
  {
    ...fzsc
  },
  {
    ...ghss
  },
  {
    ...jcyj
  },
  {
    ...zxpg
  },
  {
    ...zbmx
  }
];
```

这样的话，对新加进来的开发人员也会非常友好，一眼就能知道该去哪里配置路由表啦😁

## 目录结构重新整理

之前的`src`目录结构

```
├── src
│   ├── components                  # 页面和页面组件
│   ├── App.vue                     # Vue根组件
│   ├── main.js                     # 项目入口文件
│   ├── router                      # 路由
│   ├── store                       # vuex
│   ├── style                       # 全局css
│   ├── utils                       # 工具函数
│   ├── registerComponent           # 注册全局组件
```

整理成👇：

```
.
├── src
│   ├── main.js                     # 项目入口文件
│   ├── App.vue                     # Vue根组件
│   ├── layout                      # 容器布局组件
│   ├── api                         # 后端api统一管理
│   ├── assets                      # 静态文件
│   ├── components                  # 通用组件
│   ├── icon                        # icon
│   ├── mock                        # mockjs
│   ├── plugins                     # 插件管理
│   ├── register                    # 统一注册echarts、全局组件
│   ├── router                      # 路由表管理
│   │   └── routes                  # 系统路由表
│   ├── store                       # vuex
│   ├── styles                      # 全局scss变量、全局样式
│   ├── utils                       # 通用工具函数
│   └── views                       # 页面
└── vue.config.js                   # 工程配置文件
└── test                            # 单元测试
```

## pre-commit

pre-commit作用好处不用多说，git commit前执行lint

安装`husky`，`lint-stage`插件，package.json中配置
```js
"lint-staged": {
  "src/**/*.{vue,js}": [
    "yarn lint",
    "git add"
  ],
  "src/**/*.{json,md,css,scss}": [
    "prettier --write",
    "git add"
  ]
},
"husky": {
  "hooks": {
    "pre-commit": "lint-staged"
  }
}
```

## sass 函数编写

颜色、字体、等变量全局管理，各系统同用一套，比如：

```css
@mixin scw($size, $color: $fontColor_1, $weight: 400) {
  font-size: $size;
  color: $color;
  font-weight: $weight;
}
// 一级字体
@mixin T1 {
  @include scw(1.46rem, $fontColor_1, 700);
}
// 二级字体
@mixin T2 {
  @include scw(1.25rem, $fontColor_1, 700);
}
// 三级字体
@mixin T3 {
  @include scw(0.94rem, $fontColor_1, 500);
}
```

比如按钮的样式管理，在组件里是这么用的：

```css
@mixin btn-super($size: 1, $bgcolor: $color1890ff, $fontcolor: $colorffffff) {
  @if $size == 1 {
    @include B1();
  }
  @if $size == 2 {
    @include B2();
  }
  @if $size == 3 {
    @include B3();
  }
  @include scw(0.83rem, $fontcolor, normal);
  @include btn-assist();
  background-color: $bgcolor;
  border-color: $bgcolor;
}
```

此外，系统全部使用 `rem` 布局，采用 `vw +font-size` 方案：

```css
html {
  font-size: 1vw !important;
}
```

## 首屏优化

之前听说由于静态资源比较多，首屏加载比较慢。我build了下发现，`app.js`居然高达**17m**！这样加载首屏肯定慢了！我追踪了下发现，都是一些地图json文件太大导致的，主要是下面这些代码产生的问题：

```js
echarts.registerMap("china", require("../static/map/china.json");
echarts.registerMap("guangzhou",require("../static/map/cities/guangzhou.json"));
echarts.registerMap("beijing", require("../static/map/cities/beijing.json"));
echarts.registerMap("shenyang", require("../static/map/cities/shenyang.json"));
```

`require`是同步引入，webpack会把这些庞大的`json`全部同步打包到`app.js`里面，所以会非常大。后来凡童鞋提供了一个思路，问我能不能用异步加载，这样会不会体积小一点？答案是肯定的，把上面代码改成读取本地json，读取完后再进行注册：

```js
// 采用异步的方式注册json地图
const jsonMap = {
  china: "static/map/china.json",
  chinacity: "static/map/china-cities.json",
  cj_citylevel: "static/map/changjiang_city_level.json",
  cj_up_mid_down: "static/map/changjiang_up_mid_down.json",
  cj_provincial: "static/map/changjiang_provincial.json",
  ningxiacity: "static/map/Ningxia.json"
};

for (const i in jsonMap) {
  if (Object.prototype.hasOwnProperty.call(jsonMap, i))
    axios.get(jsonMap[i]).then(res => {
      echarts.registerMap(i, res.data);
    });
}
```

经测试，打包后的体积明显减少！但是，还有优化空间，比如有些系统的路由组件不是异步组件，我们可以全部改成组件懒加载

```js
{
  ...,
  component: () => import(/* webpackChunkName: "BaseDateHandle" */ "FZBZ/BaseDateHandle")},
}
```

再打包，`app.js`已经减少到`180k`左右了，从`17m`到`180k`，速度提升可以说是非常明显了。

但是`vendor.js`还是高达`2m`，主要原因用的是第三方的包太多，`iview`也没改成按需加载，`echarts`也是，以后会针对这些包进行相关优化。

此外，之前打包的代码是没有配置`gzip`的，开启`gzip`速度会更快，为了实现这个功能，我使用了webpack的一个插件，加点配置就可实现

`vue.config.js`增加配置
```js
const CompressionPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = ["js", "css"];
module.exports = {
  configureWebpack: {
    // gzip
    plugins: process.env.NODE_ENV === "production" ? [
      new CompressionPlugin({
        filename: "[path].gz[query]",
        algorithm: "gzip",
        test: new RegExp("\\.(" + productionGzipExtensions.join("|") + ")$"),
        threshold: 10240,
        minRatio: 0.8
      })
    ] : []
  }
}
```

首屏优化，永无止境！

## 兼容IE11

这个系统需要兼容ie11，现在有了 `babel` 加持，并不需要担心太多 `js` 方面的问题。现在cli3也已经默认帮我们引入 `promise`、 `es6.symbol` 等一些重要模块的 `polyfill`，所以不需要我们额外配置。目前的问题，其中一个就是用的第三方库`vue-echarts-v3`是用`es6`编写的，由于`vuecli3`底层的`webpack`配置中，`node_modules`下的包是默认不走`Babel`编译的，我们在`npm`装的包，作者没有帮我们去编译，而是希望我们手动去配置编译[vue-echarts-v3使用需求](https://github.com/xlsdg/vue-echarts-v3#usage)

增加`vue.config.js`配置：

```js
module.exports = {
  transpileDependencies: ["node_modules/vue-echarts-v3"]
}
```

👆问题解决

but...

👇还有个问题

凡童鞋反应有的页面在ie中打不开，经追踪，凡是用到了`iview`的`Tabs`组件都打不开，通过报错信息，查到`Tabs`组件里用到了数组`findIndex`这个比较新的api，这个api在所有的ie中都不支持。因为`iview`也是`node_modules`下的，同样也无法走Babel编译，我采取的解决方法是，手动引用polyfill，不用上面的方案了，因为`iview`生产版已经被`Babel`编译过了，只不过没有用到`babel-polyfill`。

后来，查阅`vuecli3`的[polyfill选项](https://cli.vuejs.org/zh/guide/browser-compatibility.html#polyfill)，可以通过配置实现相关api的`polyfill`，然后按需引入，这种也是一种不错的解决方案。

## 自动注册全局组件

系统中，我们根据UI设计的组件，开发了许多全局组件，我发现每一次开发完成，都要去`registerComponent.js`中进行手动注册，感觉比较麻烦，于是我决定用自动注册组件方法进行全局注册，一劳永逸：

```js
import Vue from "vue";

// 检索目录下的模块
const req = require.context(".", true, /\.vue$/);

req.keys().forEach(fileName => {
  // require模块
  // 过滤掉不以 Nr 开头的文件夹，比如eyemap
  if (fileName.includes("Nr")) {
    const componentConfig = req(fileName);
    const name =
      fileName.name ||
      fileName.replace(/^\.\/(.*\/)?/, "").replace(/\.vue$/, "");
    // 过滤掉不以 Nr 开头的 .vue 文件
    /^Nr/.test(name) &&
      Vue.component(name, componentConfig.default || componentConfig);
  }
});
```

然后在`registerComponent.js`中加入

```js
// 全局组件注册
import "@/components";
```

这样，在`components`文件下的所有组件都视为全局组件了

![全局组件](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/A966FB85-843C-475C-B830-1A1A736BB658.png)

其实，自动注册的方法也可以在别的地方进行使用，例如自动注册 `vuex module`：

```js
const files = require.context(".", true, /\.js$/);
const modules = {};

files.keys().forEach(key => {
  if (key === "./index.js") {
    return;
  }
  const moduleName = key.split("/")[1].split(".")[0];
  modules[moduleName] = files(key).default;
});

export default modules;
```

还有自动注册全局指令：

```js
import Vue from "vue";

const req = require.context(".", false, /\.\/(?!index\.)\w*\.js$/);

req.keys().forEach(fileName => {
  const model = req(fileName);
  const name = fileName.replace(/\.\//, "").replace(/\.js$/, "");
  Vue.directive(name, model.default || model);
});
```

## 系统初始化流程

![初始化流程](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/%E7%B3%BB%E7%BB%9F%E5%8D%87%E7%BA%A7%E6%80%BB%E7%BB%93-%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B5%81%E7%A8%8B.png)

图中有出现**读取配置文件**这么一种过程。有一个很重要需求就是系统要给到实施人员到客户现场进行部署和配置，需要暴露一些配置参数给他们进行修改，比如 `api` 、地图服务地址这些。开始我是用vuecli3提供的 `.env` 环境变量去解决的，但是不足的是每次修改完都要重新 `yarn build` 才生效，这样效率太慢了。所以我决定把配置json文件提到外面，在系统初始化前去读取并注入到内部，这样就可以解决重新打包的问题了。

下面读配置是实现细节：

```js
import axios from "axios";
import cachedFn from "./cachedFn";

// 无论多少次import执行函数，都只会使用被缓存的值
// 避免重复请求
export default cachedFn(async () => {
  try {
    const { data } = await axios.get("static/appConfig.json");
    const { data: mapConfig } = await axios.get(
      "static/mockdata/YZT_JSON/mapinit.json"
    );
    const env = process.env.NODE_ENV;
    window.__VERSION__ = data.VERSION;
    return {
      config: data[env],
      mapConfig
    };
  } catch (error) {
    console.log(error);
    return Promise.reject("无法读取配置文件的信息，请检测是否配置正确！");
  }
});
```

其中，有用到了一个缓存函数，因为有别的地方也需要读配置，使用该函数可以避免重复请求

```js
const cachedFn = fn => {
  const cacheMap = new Map();
  return () => {
    const hit = cacheMap.get(fn);
    if (!hit) {
      const data = fn();
      cacheMap.set(fn, data);
      return data;
    }
    return hit;
  };
};
```

取到配置信息后，注入到 `vuex` store里面

```js
(async () => {
  try {
    // 获取配置信息
    const { config, mapConfig } = await getConfig();
    // 初始化基础 config
    store.commit(SET_CONFIG, config);
    store.commit(MAP_INIT_CONFIG, mapConfig);
    // 初始化 eyemap
    const { ARCGISURL } = config;
    Vue.use(eyemap, {
      load: {
        arcgisUrl: ARCGISURL
      }
    });
    // 挂载实例
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount("#app");
  } catch (error) {
    return iview.Notice.error({
      title: "配置出错",
      desc: error
    });
  }
})();
```

这样在vue组件里面也可以拿到相关配置信息进行业务开发了。

## 权限控制

关于权限控制部分，因为当前系统决定只控制到子系统和子系统下的菜单，所以这些都是在运维系统中进行配置，然后在登录时会去获取相关信息，然后在**渲染子系统和子系统菜单列表前进行路由比对过滤**，因为在前面已经**实现用读路由表**去渲染，所以比对过滤路由信息也不算复杂，也不需要用到路由拦截、指令控制显隐等等。代码暂时不贴了，思路就是这样子，以后可能在权限方面有更深的控制，到时实现之后再具体聊聊。

## 单元测试

在一些比较重要的工具模块，还是需要进行单元测试的，这样可以保证代码的健壮性。在这里，我引入了当前比较流行的测试框架 `jest` ，和 `mocha` 不同的是，`jest` 里面集成了很多工具，不需要一个个去安装，像 `mocha` 要配合很多库去使用，所以要学习这些库的 `api`，在不同文档上进行切换和翻阅，不方便的同时也会带来一定的学习成本，`jest` 只需要在一个文档下进行学习编写即可。

安装过程，只需要

```
vue add @vue/unit-jest
```

便可搞定

举个例子演示下，

比如我写了一个轮询工具类：

```js
/**
 * @class PollingAction
 * @param {Function}  callback[回调函数]
 * @param {Number}  time[轮询时间]
 * @param {immediate}  immediate[是否立即执行回调函数]
 * @description  通过给定的TIME进行轮询操作
 */
export default class PollingAction {
  constructor(callback, time = 1000, immediate = false) {
    // 执行状态
    this.running = false;
    // 轮询间隔
    this.time = time;
    // 是否立即执行
    this.immediate = immediate;
    // callback判断
    if (callback) {
      if (typeof callback === "function") {
        this.callback = callback;
      } else {
        throw new Error("参数1 必须是个函数");
      }
    } else {
      this.callback = null;
    }
    // timer控制
    this.timer = null;
  }
  // 执行轮询
  start() {
    // 是否立即执行
    if (this.immediate) {
      this.callback && this.callback();
    }
    this.running = true;
    const onAction = () => {
      this.timer = setTimeout(() => {
        if (this.running) {
          try {
            this.callback && this.callback();
          } catch (error) {
            console.log(error);
            this.cancel();
          }
          return onAction();
        } else {
          return;
        }
      }, this.time);
    };
    return onAction();
  }
  // 取消轮询
  cancel() {
    this.running = false;
    this.timer && clearTimeout(this.timer);
    this.timer = null;
  }
}
```

下面要对其进行一些测试编写：

```js
import PollingAction from "@/utils/pollingAction";

describe('测试 pollAction 轮询类', () => {

  // mock setTimeout
  beforeEach(() => {
    return jest.useFakeTimers();
  });

  test('测试非立即执行轮询', () => {
    const time = 1000;
    const callback = jest.fn();
    const po = new PollingAction(callback, time, false);

    // 触发轮询
    po.start();

    // 此刻不应该触发回调，1000ms 后才触发
    expect(callback).not.toBeCalled();

    // 有2种时间快进方法
    // jest.advanceTimersByTime(1000);
    jest.runOnlyPendingTimers();

    expect(callback).toBeCalled();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), time);// 设置触发时机

    // 消耗时间
    jest.runOnlyPendingTimers();
    expect(callback).toHaveBeenCalledTimes(2); // 第2次触发
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), time);

    // 取消轮询
    po.cancel();
    jest.runOnlyPendingTimers();
    expect(callback).toHaveBeenCalledTimes(2); // po.cancel 生效，回调仍然只执行 2 次

  });

  test('测试立即执行轮询', () => {
    const time = 1000;
    const callback = jest.fn();
    const po = new PollingAction(callback, time, true);

    po.start();

    // start 立马执行回调
    expect(callback).toBeCalled();

    jest.runOnlyPendingTimers();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), time);

    po.cancel();
    jest.runOnlyPendingTimers();
    expect(callback).toHaveBeenCalledTimes(2);

  })
});
```

通过测试，可以验证轮询类写得有没有毛病，这样虽然要写多了些测试代码，但是这是值得的，还有一些重要的模块也要覆盖单元测试。


## 自动化部署

手动打包部署是一件非常🤢的事情，会浪费我们很多时间，这些过程完全要交给机器去帮我们完成，所以必须要采用自动化部署。因为我们在 `gitlab` 下进行开发，所以我们这边用 `gitlab-hooks+jenkins+docker` 方式实现自动化打包部署

基本流程是这样的：

![自动化部署流程](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/%E7%B3%BB%E7%BB%9F%E5%8D%87%E7%BA%A7%E6%80%BB%E7%BB%93-%E8%87%AA%E5%8A%A8%E5%8C%96%E9%83%A8%E7%BD%B2%E6%B5%81%E7%A8%8B.png)

如果要细说的话，内容会很多，完全可以另开篇博客来叙述了😂。还有一些关于vue技巧方面的“干货”，在我的 [Vue 实践小结](http://shooterblog.site/2018/11/04/Vue%E5%AE%9E%E8%B7%B5%E5%B0%8F%E7%BB%93(%E9%95%BF%E6%9C%9F%E6%9B%B4%E6%96%B0)/) 博客中会有讲，大家如有兴趣可以去转转。

## 总结

为了升级开发这个系统，我整整在上海封闭了70多天，体验了下996、9107的生活。经过和10多个前端小伙伴们的一起努力，以及几百上千次的commit，终于完成了系统优化和代码迁移，实在不容易，不过收获满满！最后，这篇文章比较长，感谢您能读到这里，如果文中存在什么不足之处，或者有值得改进的地方，欢迎指出，Chat at anytime!

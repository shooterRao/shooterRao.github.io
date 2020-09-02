---
title: 还在用字体图标吗，试试svg图标吧(内附vuecli-svg-sprite-loader插件)
date: 2020-05-18
tags: [vue,工具]
categories: [vue]
---

## 关于字体图标

相信每位前端童鞋都对字体图标不陌生，毕竟网页必然少不了用大量的图标来装饰页面效果。在很早的时候，我们一般都是用`img`来当作图标来使用，由于大量地使用`img`会造成`http`请求过多的问题，所以这类使用方式也很快就被抛弃了，即使雪碧图也退出了历史的舞台(因为各种定位写法真的太麻烦了！🙃)后来字体图标开始流行起来，因为这种相当于直接加载一类字体，不会使用本地图片，还算蛮方便的。于是乎，像[fontawesome](http://www.fontawesome.com.cn/)这种字体图标库也开始热门起来，但是这种库是不支持定制的，所以，又诞生了[iconmoon](https://icomoon.io/)、阿里巴巴出门的[iconfont](https://www.iconfont.cn)可以支持用户定制化的应用，极大方便了我们的图标管理和开发。包括我目前的公司也是用iconfont来管理各个项目的图标的，虽然iconfont提供了好几种使用方式，但用svg图标之前，一直都是用**font-class**的方式来使用，下面就聊聊关于**font-class**的一些不足之处，以及为什么要开始使用svg图标了😊文章最后，会介绍一个可以在vue项目中快速使用svg图标的[vuecli-svg-sprite-loader插件](https://github.com/shooterRao/vue-cli-plugin-svg-sprite-loader)

## 关于font-class的一些问题

首先，这些问题都是我在项目中亲身经历过的，每个问题的背后都会有一些故事，下面就开始展开说说。

在项目初期，开发人员不是很多，所以用font-class使用还是挺舒服的，毕竟使用挺简单，一个`<i class="iconfont xxx">`就可以直接把图标弄出来了。但是随着项目业务开始变得复杂，子系统越来越多，开发人员也从4人升至15人。业务变多，页面增多，导致图标也会越来越多，这样的话，会导致`iconfont.css`经常要更新，因为我们是用`gitlab`进行协作开发，所以，多人同时修改同个文件的话，就会出现**代码冲突**的问题(这是第一个问题)。为了解决iconfont文件代码冲突这个问题，我们开发人员决定把更新图标的权限交给一个人来管理更新，那个人就是我😂，接下来，我就会收到每个子系统负责人的qq弹窗更新iconfont请求：

> hi，麻烦更新一下图标文件，谢谢啦~

于是乎，我就开始了每天至少更新2次font-class文件(5个文件)的工作...下载、解压、替换...我暗暗吐槽，这玩意为啥**不能增量更新啊**😂so，不能增量更新，是第二个问题。

后来，我们发现，字体图标是不支持多色图标的，如果想要用多色图标还只能用svg或者img了，同样是图标，还不能用同一种方案来解决了，所以，不支持多色图标，是第三个问题。

我们要去找图标的话，只能在iconfont的页面去找，无法在本地进行**全图标预览**，当图标越来越多，如果想快速找到新增的图标，就比较麻烦了。所以，无法本地全图标预览，过于依赖iconfont预览页面是第四个问题。

总结下，font-class目前遇到的这几个问题：

- iconfont.css文件多人更新文件，容易导致git代码冲突
- 无法增量更新
- 不支持多色图标
- 无法做到本地全图标预览

## 寻求解决方案

在遇到了font-class这些问题后，我就开始寻找解决方案。后来发现iconfont还提供了另一种使用图标的方式，**symbol引用**，于是我就开始了一番尝试和体验，使用过来，觉得真的可以解决目前font-class这些问题了！🎉

文中所说，svg图标有以下优点：

- 支持多色图标

- 支持通过font-size、color来调整样式

- 缩放不会失真

- ie9+

接下来，就要思考如何在项目中使用svg图标了

## 如何使用svg图标

最简单的方法是直接在项目`import`引入iconfont生成的`iconfont.js`，再加入一些css代码：

```css
.icon {
   width: 1em; height: 1em;
   vertical-align: -0.15em;
   fill: currentColor;
   overflow: hidden;
 }
```

接着，挑选相应图标的名字

```html
<svg class="icon" aria-hidden="true">
    <use xlink:href="#icon-xxx"></use>
</svg>
```

PS: 这种写法，实际上就是symbol 和 svg sprite方式来使用svg的，关于这种技术的相关文章可以参考[使用SVG symbols建立图标系统](https://www.w3cplus.com/svg/how-to-create-an-icon-system-using-svg-symbols.html)、[未来必热：SVG Sprites技术介绍](https://www.zhangxinxu.com/wordpress/2014/07/introduce-svg-sprite-technology/)

但是，这种暴力的用法虽然是可以实现加载svg，但是仍然**无法做到增量更新**，经过一番研究，增量更新是完全可以实现的，实现的背后，只需要使用webpack的[svg-sprite-loader](https://github.com/JetBrains/svg-sprite-loader)，下面就来讲讲如何通过这个插件做到图标增量更新。

### svg-sprite-loader

[svg-sprite-loader](https://github.com/JetBrains/svg-sprite-loader)是webpack的一个loader，这个插件主要就是可以把多个svg图标都统一打包成sprite，类似如下效果：

![](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/20200518210659.png)

这些图标实际上都是在某个文件夹下统一交给svg-sprite-loader来合成，然后append到`document.body`上。不知道，读到这里的你，能不能和增量更新联系到一起呢？其实就是在项目通过某个文件夹统一管理svg文件，然后通过这个loader进行打包成sprite，这样，就实现了增量更新，如果想要新增图标，只需要把新加的svg文件放到对应的文件夹下就可以了！就如下图所示：

![](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/20200518212523.png)

新增的话，iconfont网站上支持一个或者多个图标下载的，还可以直接复制svg，都很方便

![image-20200519092414738](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20200519092414738.png)

### 如何配置svg-sprite-loader和在项目中使用

在webpack或者vuecli3+下的项目配置都很简单，官方readme提供了详细的教程，下面我拿vue项目的配置举例吧，在`vue.config.js`上加上这些配置信息：

```js
module.exports = {
	chainWebpack: config => {
  	// use svg
    config.module
      .rule("svg")
      .exclude.add(resolve("src/svg")) // url-loader不处理
      .end();
    config.module
      .rule("icon")
      .test(/\.svg$/)
      .include.add(resolve("src/svg"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]"
      })
      .end();
  }
}
```

webpack配置好了，再配合一键导入`src/svg`目录下的所有svg图标，就可以啦~

```js
const requireAll = requireContext => requireContext.keys().map(requireContext);
const req = require.context(".", false, /\.svg$/);
requireAll(req);
```

那么，怎么使用呢？我们要使用这些图标，最简单的方法无非就是通过`use`标签来使用

```html
<use :xlink:href="iconId" />
```

但是如果直接这么写，太麻烦了，直接封装个vue组件就完事啦

```html
<template>
  <i :class="['svg-icon', `svg-icon-${name}`, className]" :style="svgStyle">
    <svg fill="currentColor" aria-hidden="true" width="1em" height="1em">
      <use :xlink:href="iconName" />
    </svg>
  </i>
</template>

<script>
export default {
  name: "SvgIcon",
  props: {
    name: {
      type: String,
      required: true
    },
    className: {
      type: String
    },
    color: {
      type: String
    },
    size: {
      type: Number
    }
  },
  computed: {
    iconName() {
      return `#icon-${this.name}`;
    },
    svgClass() {
      if (this.className) {
        return `${this.className}`;
      }
      return "";
    },
    svgStyle() {
      const { color, size } = this;
      const style = {};
      color && (style.color = color);
      size && (style.fontSize = `${size}px`);
      return style;
    }
  }
};
</script>

<style scoped>
.svg-icon {
  vertical-align: -0.125em;
  line-height: 0;
  display: inline-block;
}
</style>

```

使用的话，轻轻松松，和font-class没啥太大的区别~感觉更方便了有木有😊

```html
<SvgIcon name='图标id' size="32" color="orange"/>
```

### 一些注意点

可能在使用过程中，你会遇到**svg单色图标**设置color不生效的问题。关于svg图标如何设置颜色，可以参考张鑫旭大佬的文章[SVG图标颜色文字般继承与填充](https://www.zhangxinxu.com/wordpress/2014/07/svg-sprites-fill-color-currentcolor/)，上面vue的组件写法是使用了`currentColor`的方式，svg会继承父元素的color的值，但是前提是**path或者g属性不能有fill和fill-rule属性**，因为这会使得`currentColor`无法生效，在iconfont下载的图标，一般都会带有fill属性，需要手动去删掉：

![image-20200519093844204](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20200519093844204.png)

这样，设置color就没问题了~

![image-20200519094339799](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20200519094339799.png)

![image-20200519094353583](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20200519094353583.png)

## 项目图标预览

上文还有个比较需要解决的问题，就是需要本地图标全预览。用了本地图标文件管理，写个预览页面也是so easy的，继续使用[webpack-require-context](https://webpack.js.org/guides/dependency-management/#require-context)方法，把本地图标名都拿到，直接加载就可以啦

```html
<script>
// 获取所有svg的名称
const icons = require
  .context("../svg", false, /\.svg$/)
  .keys()
  .map(name => name.replace(/^\.\/([\w-]+)\.svg/, "$1"));

export default {
  name: 'SvgViewer',
  methods: {
    async handleIconClick(iconName) {
      await navigator.clipboard.writeText(`<SvgIcon name='${iconName}' />`);
      alert(`${iconName}图标代码已复制到剪切板`);
    }
  },
  render() {
    const { SvgIcon } = this.$options.components;
    return (
      <div class="icon-view">
        <p>点一点图标就能取代码</p>
        {icons.map(iconName => (
          <div class="icon" on-click={() => this.handleIconClick(iconName)}>
            <SvgIcon name={iconName} />
            <span class="icon-name">{iconName}</span>
          </div>
        ))}
      </div>
    );
  },
}
</script>
```

配合vue render jsx写法，简直不要太舒服

看看效果：

![image-20200518214323810](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20200518214323810.png)

这样，无法预览本地图标的问题也得到解决了！点下图标，代码还能自动copy到剪切板，提高开发效率🚀！

## 做成vuecli插件，一键快速集成

后来我把这个方案在公司内部进行推广，很多同学都对这个方案感兴趣，想在项目中进行尝试。考虑到要集成到项目中的话，手动集成的方法还是比较麻烦的(包括自己要集成的话)，于是我决定做个vuecli插件出来(因为公司百分之90项目都是vue)，这样可以方便大家快速集成。 开发vuecli插件蛮简单的，官方文档写得很清晰，很快就做出来了：

​	[vuecli-svg-sprite-loader](https://github.com/shooterRao/vue-cli-plugin-svg-sprite-loader)

​	使用的话，非常简单

​	`vue add svg-sprite-loader`

更多信息，欢迎在[github](https://github.com/shooterRao/vue-cli-plugin-svg-sprite-loader)上查阅，如果使用上需要有哪些地方需要改进的，或者有什么bug的，欢迎在issue上提出，交流！如果这个插件帮到了你，我非常开心！

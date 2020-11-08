---
title: vue实践小结(长期更新)
date: 2018-11-04
tags: [vue]
categories: [vue]
---

## 前言

近期都在用 Vue 全家桶进行项目开发，过程中难免会遇到不少问题，这篇博客主要就是记录开发过程中遇到的问题，和每个问题对应的解决方案。此外，Vue 框架和周边生态会一直更新，以及发布新功能，在实践过程中总会遇到一些所谓的“坑”，我也会把填坑过程记录于此。坑是填不完的，这篇博客也是写不完的。🙂

<!--more-->

## Vue

### 子组件改变 props 的方法

由于 vue 遵循单向数据流，不建议在子组件里面直接改变 props 的值，一般通过 3 种方法

- `.sync`修饰符(推荐使用)

```js
// 父组件使用子组件
<Comp :title.sync="title"></Comp>

// 子组件中数据更新到父组件中
this.$emit(update:title, 'xxx');
```

- 通过`$emit`调用父组件事件来改变父组件传给子组件的值，然后在子组件里面`watch` props 的值，状态变化时触发相关反应，原理和第一种方法一样

- 给 props 加个对象字段，如:

```js
props: ['state'],

template: <span>{{state.someData.value}}</span>

// 改
js: this.state.someData.value = xxx; // 直接改变了父组件的data值，不会触发vue warning
```

### 如何在 vue 组件中绑定原生点击事件？

使用`.native`修饰符，这样原生点击事件会绑定到该组件的`$el`节点上

例如使用 iview 某个组件

```html
<Card @click.native="handleClick" />
```

### 使用组件时如何加行内 syle

在使用 vue 组件时，如果想给该组件加个行内 style，需要`:style="{}"`这种写法，直接写 style 不会生效，class 则可以

### 关于 v-model

> `v-model` 是 `v-bind:value` 和 `v-on:input` 和语法糖

```html
<div id="app">
  <input v-model="value" type="text">
  <input :value="value" type="text" @input="value = $event.target.value">
  <custom-input v-model="value"/>
</div>
```

其中，custom-input 的写法

```js
Vue.component("custom-input", {
  props: ["value"],
  template: `
    <input
      :value="value"
      @input="$emit('input', $event.target.value)"
    >
  `
});
```

### render 函数里如何用组件的 v-model

用 iview 中 Poptip 组件举例：

```html
<template>
  <Poptip v-model="visible">
    <a>Click</a>
    <div slot="title">Custom title</div>
    <div slot="content">
      <a @click="close">close</a>
    </div>
  </Poptip>
</template>
<script>
export default {
  data () {
    return {
      visible: false
    }
  },
  methods: {
    close () {
      this.visible = false;
    }
  }
}
</script>
```

用 render 函数方法调用该组件

核心就是把 v-model 拆成 value 和 input 的写法

```js
export default {
  name: "RenderPoptip",
  data() {
    return {
      visible: false
    };
  },
  methods: {
    close() {
      this.visible = false;
    }
  },
  render(h) {
    const vm = this;
    return
    h(
      "Poptip",
      {
        props: {
          value: vm.visible
        },
        on: {
          input: e => {
            this.visible = e;
          }
        },
        ref: "poptip"
      },
      [
        h("a", "click"),
        h(
          "div",
          {
            slot: "title"
          },
          "Custom title"
        ),
        h("div", [
          h(
            "a",
            {
              slot: "content",
              on: {
                click: () => {
                  this.close();
                }
              }
            },
            "关闭"
          )
        ])
      ]
    );
  }
};
```

在 iview 的一些组件中，只提供 render 函数给我们渲染内部的内容，这时候我们可以用以上方法渲染 iview 的其它组件

template 模板写法和 render 写法最终都会渲染成`Vnode`，然后再挂载到 dom 上，在有些场景上，使用 render 写法更为清晰

### Transition 组件 mode

- in-out：新元素先进行过渡，完成之后当前元素过渡离开。

- out-in：当前元素先进行过渡，完成之后新元素过渡进入。

### data 属性不被代理的方法

```js
const app = new Vue({
  data: {
    _app: "",
    $ppa: ""
  }
});
// 以上_app,$ppa都不会被代理，只要加了_和$开头的属性都不会被vue代理
// this._app 和 this.$ppa皆不存在
```

### cli3 传递全局 scss 变量小坑

```js
// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      // 给 sass-loader 传递选项
      sass: {
        // @/ 是 src/ 的别名
        // 所以这里假设你有 `src/variables.scss` 这个文件
        data: `@import "@/variables.scss";`
      }
    }
  }
};
```

**注意**：如果第一个加载的 vue 组件，`<style>`处没有声明`lang=scss`，然后第二个组件中声明了`scoped`也声明了`lang=scss`，那么上面传递的全局变量都会被前缀处理

**解决方案**：第一个组件(通常 App.vue)style 处声明`lang='scss'`且不能声明`scoped`

### watch 路由中复用的组件的属性

在使用`vue-router`中，在/page/a 跳转到 /page/b 中，如果注册的是动态路由，那么它们使用的也是同一个组件，例如 Page.vue。从 a 页面跳转到 b 页面，由于是同一个组件，vue-router 会复用这个在内存中的组件实例，所以相关生命周期不会重复调用，数据也不会更新，所以如果要在跳转页面做一些动作(例如：高亮菜单，数据获取)，就需要用`watch`方法：

```js
data() {
  return {
    subNavList: []
  }
},
watch: {
  '$route': {
    handler: 'getSubNavList',
    immediate: true // 使用这个就不需要在created里面调用getSubNavList
  }
},
methods: {
  getSubNavList(route) {
    this.subNavList = getSubNavList(route)
  }
}
```

### 父组件调用子组件方法

在父组件中用`$refs`或者`$children`拿到对应子组件实例对象进行调用

### 父组件监听子组件生命周期方法

```js
<template>
	<Comp @hook:mounted="hookMounted" />
</template>
```

### 关于数组和对象数据更新视图不更新问题

这些都是 js 的限制，使用`Vue.set`方法解决，或者一些变异方法

[数组更新方法](https://cn.vuejs.org/v2/guide/list.html#%E6%95%B0%E7%BB%84%E6%9B%B4%E6%96%B0%E6%A3%80%E6%B5%8B)

[对象更新方法](https://cn.vuejs.org/v2/guide/list.html#%E5%AF%B9%E8%B1%A1%E6%9B%B4%E6%94%B9%E6%A3%80%E6%B5%8B%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9)

### iview 瞄点组件注意的问题

```html
<div class="anchor-class " v-if="isAnchor">
  <Anchor container=".scrollcontent" show-ink>
    <AnchorLink :href='"?name="+activeName+"#"+index' :title="itemData.name " v-for="(itemData,index) in selectCardList " :key="index " />
  </Anchor>
</div>
```

如果瞄点依赖的 dom 内容是要 ajax 获取信息进行渲染的，那么直接挂载瞄点组件会报错，因为组件渲染是比 ajax 快的，数据没回来，dom 节点没加载，瞄点组件无法扫描需要的 dom 节点，所以会出问题

用`v-if`+`nextTick`即可解决

```js
created() {
  this.$http.get("xxx").then(res => {
    if (res.status === 200) {
      this.$nextTick(() => {
        // nextTick回调函数中，scrollcontent内容已经渲染完毕
        // 这时可以渲染iview瞄点组件了
        this.isAnchor = true;
      });
    }
  });
}
```

### 如何利用`$mount`挂载实例(组件)

什么是`$mount`?

> 如果 Vue 实例在实例化时没有收到 el 选项，则它处于“未挂载”状态，没有关联的 DOM 元素。可以使用 vm.$mount() 手动地挂载一个未挂载的实例

```html
<div id="app">
  <span>{{message}}</span>
</div>
<span id="component-1">
  {{message}}
</span>
<span id="component-2">
  {{message}}
</span>
<span id="component-3">
  <!-- {{message}} -->
</span>
```

- 挂载根实例

```js
// 方法一
new Vue({
  data: {
    message: "hello vue"
  }
}).$mount("#app");

// 方法二
new Vue({
  el: "#app",
  data: {
    message: "hello vue"
  }
});
```

- 组件实例挂载

```js
// 利用extend构造一个组件实例
const MyComponent = Vue.extend({
  // 注意，组件经常会被多次实例
  // 所以data必须是个函数
  data() {
    return {
      message: "component"
    };
  }
});

// 有三种方法可以挂载
// 方法一
new MyComponent().$mount("#component-1");

// 方法二
new MyComponent({
  el: "#component-2"
});

// 方法三
const c = new MyComponent({
  data() {
    return {
      message: "component"
    };
  },
  render: function(h) {
    return h("span", this.message);
  }
}).$mount();
document.getElementById("component-3").appendChild(c.$el);
```

### watch 对象某个字段

```js
watch: {
  "condition.name"(newValue) {
    console.log(newValue);
  }
}
```

### computed 的值可以被 watch

```js
computed: {
  fullName() {
    return this.firstName + this.lastName;
  }
},
watch: {
  fullName(newValue) {
    console.log(newValue);
  }
}
```

### 递归组件用 `jsx`

```js
const renderSubMenu = item => {
  return (
    <Submenu key={item.name} name={computedName(item)}>
      <template slot='title'>
        {this.$scopedSlots.subMenuItem
          ? this.$scopedSlots.subMenuItem(item)
          : [
              item.icon && <i class={["iconfont", item.icon]} />,
              <span class='nr-menu-title' title={item.name}>
                {item.name}
              </span>
            ]}
      </template>
      {item.children.map(item => {
        {
          if (hasChild(item)) {
            return renderSubMenu(item);
          }
          return (
            <MenuItem
              name={computedName(item)}
              key={item.name}
            >
              {this.$scopedSlots.menuItem
                ? this.$scopedSlots.menuItem(item)
                : 
                  <span class='nr-menu-title' title={item.name}>
                    {item.name}
                  </span>
                }
            </MenuItem>
          );
        }
      })}
    </Submenu>
  );
};
```

### v-model 控制显隐的利器（value + input + watch）

```js
const comp = {
  template: `<div v-show="show" @click="close">v-model</div>`,
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      show: this.value
    }
  },
  watch: {
    value(v) {
      this.show = v;
    }
  },
  methods: {
    close() {
      this.$emit("input", !this.show);
    }
  }
}
// use
Vue.component('Comp', comp);
<Comp v-model="show"/>
```

### $attrs、$listeners 针对二次封装有奇效

相当于帮iview-Modal内置属性和事件做一次桥接，这样便拥有和iview-Modal一致的api，非常适合用于组件的二次封装

```html
<Modal v-model="show" v-bind="$attrs" v-on="$listeners">
  <div slot="header" class="modal-header">
    <span class="title">{{$attrs.title}}</span>
  </div>
  <slot></slot>
  <div slot="footer" class="modal-footer">
    <span class="close-btn" @click="handleClose">取消</span>
    <Button @click="handleConfirm">确定</Button>
  </div>
</Modal>

<script>
export default {
  inheritAttrs: false,
  name: "NrModal"
}
</script>
```

### 利用 key 来强制重渲染

```js
Vue.component("comp", {
  template: `<span>组件</span>`,
  created() {
    console.log("被重新渲染了");
  }
});

const app = new Vue({
  el: "#app",
  template: `<div>
    <comp :key="key"/>
    <button @click="update">刷新</button>
  </div>`,
  data: {
    key: 0
  },
  methods: {
    update() {
      this.key++;
    }
  }
});
```

### 动态组件的 :is 值除了是字符串，还可以是什么？

- 组件对象

```js
const comp = {
  render(h) {
    return h('span', '我是组件对象')
  }
}

<component :is="comp"/>

// 或者
import comp from "comp.vue";
<component :is="comp"/>
```

- vue实例

```js
const compConstructor = Vue.extend({
  render(h) {
    return h("h1", "我是vue实例");
  }
})

<component :is="compConstructor"/>
```

- 函数

情况一：返回Promise对象

```js
const componentFn = function() {
  return new Promise(resolve => {
    resolve({
      render(h) {
        return h("h1", "我是Promise返回来的vue组件对象");
      }
    });
  });
}

<component :is="componentFn"/>
```

情况二：返回一个对象(高级异步组件)

```js
const asyncComponentFn = function() {
  return {
    // 需要加载的组件 (应该是一个 `Promise` 对象)
    component: new Promise((resolve, reject) => {
      // reject();
      setTimeout(() => {
        resolve({
          render(h) {
            return h("h1", "我是vue异步组件");
          }
        });
      }, 3000);
    }),
    // 异步组件加载时使用的组件
    loading: {
      render: h => h("h1", "loading...")
    },
    error: {
      render: h => h("h1", "error")
    },
    delay: 0,
    timeout: 3000
  };
}

<component :is="asyncComponentFn"/>
```

### vue 模板解析报错解决方法

> [Vue warn]: You are using the runtime-only build of Vue where the template compiler is not available. Either pre-compile the templates into render functions, or use the compiler-included build.

`vue.config.js`增加别名：

```js
module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js'
      }
    }
  }
```

### 如何用 this.$xxx 方式手动挂载组件

比如我这边有个基于 iview modal 封装的弹窗组件 ErsConfirm，用普通的模板写法就是这样的

```html
<ErsConfirm
  v-model="modal1"
  title="删除"
  confirm-info="确定要删除该项目吗？"
  @on-confirm="ok"
  @on-close="cancel"
/>
```

如果在业务逻辑中存在多个询问弹窗层，写大量模板是比较难受的事情，代码也比较冗余，所以需要用 js 命令式的方式进行组件挂载，这样看起来就优雅得多，下面是实现过程：

```js
import Vue from 'vue';
import ErsConfirm from './ErsConfirm/ErsConfirm.vue';

// Vue.use()
export default function(Vue) {
  Vue.prototype.$ErsConfirm = createErsConfirm;
}

function createErsConfirm(options = {}) {
  const instance = ErsConfirm.newInstance(options);
  instance.show();
}

// 拿属性，不拿方法
function getAttrs(props) {
  return Object.keys(props).reduce((pre, cur) => {
    if (typeof props[cur] !== 'function') {
      pre[cur] = props[cur];
    }
    return pre;
  }, {});
}

function noop() {}

ErsConfirm.newInstance = (props) => {
  const { onConfirm, onClose } = props;
  const attrs = getAttrs(props);
  const instance = new Vue({
    inheritAttrs: false,
    data: {
      visible: false,
    },
    methods: {
      change(value) {
        if (value === false) {
          this.remove();
        }
      },
      remove() {
        setTimeout(() => {
          this.destroy();
        }, 300);
      },
      destroy() {
        this.$destroy();
        if (this.$el) {
          document.body.removeChild(this.$el);
          this.$el = null;
        }
      },
    },
    render() {
      return (
        <ErsConfirm
          value={this.visible}
          on-input={this.change}
          {...{
            attrs,
            on: {
              'on-confirm': onConfirm || noop,
              'on-close': onClose || noop,
            },
          }}
        />
      );
    },
  });

  const component = instance.$mount();
  document.body.appendChild(component.$el);

  return {
    show() {
      instance.visible = true;
    },
  };
};
```

安装插件：

```js
import $ErsConfirm from './$ErsConfirm';
Vue.use($ErsConfirm);
```

这样，就可以用 this.$ErsConfirm 方式来使用了该组件了

```js
this.$ErsConfirm({
  title: '删除',
  confirmInfo: '确定要删除该项目吗？',
  onConfirm: () => {
    console.log('confirm');
  },
  onClose: () => {
    console.log('close');
  },
});
```

推荐一个更强大更通用的手动调用库 [vue-create-api](https://github.com/cube-ui/vue-create-api)



## Vue-router

### beforeEach 路由守卫该注意的

以简单的登录拦截举例：

```js
/**
 * 开启路由守卫
 */
router.beforeEach((to, from, next) => {
  // cookie上存了token，可以不用登录
  const token = getToken();
  if (token) {
    // 如果要跳转的页面是登录页，强制跳转到根页面
    if (to.path === LOGIN_PAGE_PATH) {
      next({ path: "/" });
    }
    next();
  } else {
    // 没存就跳转到登录页面
    if (to.path !== LOGIN_PAGE_PATH) {
      next({
        path: LOGIN_PAGE_PATH
      });
    }
    // 这里如果不加next()，会进入死循环
    // 因为 next({ path: LOGIN_PAGE_PATH })也会触发 beforeEach
    // 所以需要提供最终的next()，才能把导航的状态置为confirmed
    next();
  }
});
```

### vue-router 为 history 时请求本地 static 的小坑

如果`vue-router`使用`history`模式，比如在`http://localhost:8080/about/home`页面下，发起本地json文件`ajax`请求

```js
this.$http.get('static/foo.json').then(res => {
  console.log(res)
})
```

这时控制台会发出404报错，`GET http://localhost:8080/about/static/foo.json 404 (Not Found)`

问题在于发起的请求地址是错的，应该是`http://localhost:8080/static/foo.json`才对

对这种问题，有2种解决方法

-  `static`前面加个`/`，`this.$http.get('/static/foo.json')`，但这种情况打包路径要额外处理

-  vue-router模式改为`hash`模式

### 路由高级异步组件处理方法

```js
const LoadingCom = {
  name: 'loading-com',
  render(h) {
    return h('h1', 'Loading...')
  }
}

const ErrorCom = {
  name: 'error-com',
  render(h) {
    return h('h1', 'Error')
  }
}

function lasyLoadView (AsyncView) {
  const AsyncHandler = () => ({
    // component选项必须返回Promise
    // import('xxx.vue')会返回一个Promise
    component: AsyncView,
    loading: LoadingCom,
    error: ErrorCom,
    // 组件挂载延迟时间，默认200
    // 0的话loading组件也会立即渲染
    delay: 0,
    // 超时渲染error组件
    timeout: 10000
  })
  return Promise.resolve({
    functional: true,
    render(h, { data, children }) {
      return h(AsyncHandler, data, children)
    }
  })
}

// 使用方法
const router = new VueRouter({
  routes: [
    {
      path: 'home',
      // 如果home.vue组件很大，请求很慢
      // 会先渲染loading组件，请求完成再渲染home.vue组件
      component: () => lazyLoadView(import('./home.vue'))
    }
  ]
})
```

未完待续...

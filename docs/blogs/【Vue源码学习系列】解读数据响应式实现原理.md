---
title: 【Vue源码学习系列】解读数据响应式实现原理
date: 2019-07-09
tags: [vue,源码学习]
categories: [vue源码]
---

## 前言

使用`vue`开发有一段时间了，我觉得是时候去深入学习其内部的实现原理了。写过`vue`的童鞋都知道，响应式系统是其最有意思、最独特的特征之一，这个特征可以让我们摆脱了频繁对`dom`的操作，得以让我们更专注于数据层面，因为在`vue`面前，数据和视图是双向绑定的，也就是所谓的数据驱动视图、`mvvm`模型。该文章是vue源码学习系列的第一篇，源码是基于`2.6.10`版本。

关于这个原理，我之前是一直停留于`Object.defineProperty`这个概念中，知道`vue`是通过在`getter`中进行依赖的收集，`setter`中触发视图层的更新。虽然之前有看过一些源码解读的文章，能大概看懂一些，但毕竟还是没有去读过源码，所以对于这部分的很多细节上的处理是比较模糊的。于是决定通过源码去一步步去了解、学习其幕后的操作是什么。非常感谢，`vue`是开源的，任何细节都可以在源码中找到答案。

全文分为三个部分，第一部分为**前置知识**，第二部分为 **从源码中进行原理解读**，第二部分为**实现一个简洁的响应式系统**。

## Part1: 前置知识

### Object.defineProperty

:::tip

`Object.defineProperty()` 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。

:::

源于[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

这个是vue实现响应式系统的核心api，如果浏览器不支持这个api [IE8：逃]，那么就等于是不支持vue框架。在vue3.0中，已经用[proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)取代了这个api，所以对浏览器的版本要求更高了，[IE家族：你又看我们干嘛(￣.￣)]

看看这个api的相关用法：

```js
// 语法
Object.defineProperty(obj, prop, descriptor);

const obj = {};

// 定义一个 a 属性
Object.defineProperty(obj,'a',{
    value:2,
    writable:false, // 是否能重新赋值，默认 false
    configurable:false, // 是否能被删除，以及除 value 和 writable 特性外的其他特性是否可以被修改，默认 false
    enumerable:false, // 是否能被枚举，也就是能不能被 Object.keys 之类的方法枚举出来
   // 当属性值被修改时，会调用此函数，也就是 obj.a = xxx 时
    set(newValue) {
      xxx = newValue
    },
  	// 当访问该属性时，会调用此函数，也就是 obj.a 取 a 值时
    get() {
      return xxx
    }
});
```

vue2.x用这个api做了什么呢？先简单说说，找到一些感觉

```js
new Vue({
  data: {
    a: 123,
    b: 456,
    c: 789
  }
})

// 对 data 对象每个 key 重写 setter，getter函数
// 然后做点"手脚"
Object.defineProperty(data, 'a', {
 get() {
  // 让观察者 watcher 收集这个依赖
 }
 set() {
  // 通知观察者 watcher 做某些事情...
  // 比如更新视图、调用 computed 函数或者调用自定义 watch 的 handler...
 },
})
```

好了，你先知道这些，消化下，然后再来一起看看观察者模式。

### 观察者模式

:::tip

**观察者模式**是[软件设计模式](https://zh.wikipedia.org/wiki/軟件設計模式)的一种。在此种模式中，一个目标对象管理所有相依于它的观察者对象，并且在它本身的状态改变时主动发出通知。这通常透过呼叫各观察者所提供的方法来实现。此种模式通常被用来实时事件处理系统。 --- 维基百科

:::

 vue在实现响应式系统是用了观察者这一设计模式的，这种设计模式其实是非常常见的，在很多系统设计都会用到。怎么理解这个设计模式呢，举个例子，比如我们在github中，**watch**了某个项目，在这个项目有提交更新的时候，我们就会收到邮件提醒，一个项目可以被很多很多的用户**watch**订阅，所以观察者模式其实就是一种一对多的依赖关系，一个主题对象可以被多个观察者订阅，观察者模式也可以称为**发布订阅模式**。

在vue中，可以通过这个类图来继续了解这种设计模式：

![image-20200914133459868](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20200914133459868.png)

什么是`Dep`和`Watcher`呢，你可以先把`Dep`理解成上文中的github项目，把`Watcher`理解成github用户，用代码可以这么写：

```js
const githubProject = {
	watchers: [],
	notify() {
		this.watchers.forEach(watcher => watcher.update());
	},
	addWatcher(watcher) {
		this.watchers.push(watcher);
	}
};

const githubUser = {
	update() {
		alert('updated');
	}
};

// 用户订阅项目
githubProject.addWatcher(githubUser);
// 项目更新了，通知用户
githubProject.notify();
```

看到这里的同学，现在对观察者模式是不是有点概念了呢，开始我看源码的时候，是一头雾水的，后来我去学习了这个设计模式，然后再结合源码研究，这样理解起来就流程多了。下文会对`Dep`和`Watcher`进行源码解读。



## Part2: 原理解读

先来一张官方提供的原理图：

![官方原理图](https://cn.vuejs.org/images/data.png)

再来一张我在读源码过程中，边读边画边改的流程图：

![image-20200913225702859](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20200913225702859.png)

看完了图，了解了响应式实现大致的过程，下面开始解读蓝色方框的重要函数源码~

### observe

:::tip

Attempt to create an observer instance for a value,returns the new observer if successfully observed,or the existing observer if the value already has one.

:::

这个是创建响应式对象的入口，看上面源码的注释，可以知道它可以为某个值创建一个observer实例，如果成功，就返回这个刚创建的observer实例，如果这个值已经有了observer，就则返回这个现有的observer。那么，什么是observer？

这个observer中文翻译是观察者，每个响应式对象都有它自己的观察者，这个观察者很专一，不会观察其它对象，所以你可以理解这个是对象的专属观察者，这个观察者，并非观察者模式中的观察者，你可以理解这个observer是观察者模式的具体实现，它里面的`dep`和`watcher`才是观察者模式里面的主题对象和观察者对象。

在开发中，打印在vue`data`选项注册的对象时常可以看到附带着`__ob__`这个属性，只知道携带了这个属性的对象就是**响应式**的，比如这种：

![__ob__](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/vue-%E5%93%8D%E5%BA%94%E5%BC%8F%E5%8E%9F%E7%90%862.png)

这个其实就是这个值的observer实例啦，这个实例绑定到了`__ob__`属性中。

注意，看到这里，既然出现了`__ob__`，我就顺便解析下很多vue开发人员都遇到过的问题，那就是**为什么有时候我把data里的某个属性值改了，然后但是视图没更新？**我也遇到很多童鞋来问我这个问题。其实这种问题最主要原因是他们没去好好看vue文档，导致他们写出了`vm.items[0] = 'xxx'`或者`vm.b = 'xxx'（b是新增key）`这类写法。通过源码原理去找的话，就直接去看这个视图不更新的对象**有没有包含`__ob__`这个值**，没有的话，说明这个值压根没被观察，也就不是响应式的对象。如果再深入点，就得去看看`__ob__`里面的`dep`和`dep`属性里的`subs`之间的依赖关系是不是正确的，这个下文会讲解，不急。

好，那么先看看这个`__ob__`是如何创建出来的？

来看看源码，你会很快找到答案

```js
/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
export function observe (value: any, asRootData: ?boolean): Observer | void {
  // 注意，这里 isObject 包括对象和数组
  // 也就是过滤掉基本类型和 VNode 的实例
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  // 如果这个值有`__ob__`了，就返回
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    // 可以观察 array 和 object
    // 注意还有个 Object.isExtensible 判断是否可以拓展的对象
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // 就在这里给该值创建observer实例啦
    // 实例化中给 value 添加 `__ob__` 属性
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```

这里的逻辑其实还是比较简单的，接下来一起看看实例化观察者`new Observer()`具体过程。

### Observer

:::tip

Observer class that is attached to each observed object. Once attached, the observer converts the target object's property keys into getter/setters that collect dependencies and dispatch updates.

:::

看源码之前，还是来继续来看看头部注释。这句注释讲得很清楚了，`Observer`是附加到每个观察对象的观察者类， 完成附加后，观察者都把观察对象的属性key默认的getter和setter函数重写，实现数据劫持，getter用来收集依赖，setter用来调度更新。

好，来看看实际源码怎么去attach观察者实例和重写getter/setter函数的：

```js
/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
export class Observer {
  
  constructor (value: any) {
    this.value = value
    this.dep = new Dep() // 用于收集该响应式对象的依赖
    this.vmCount = 0
    // 就在这里attach观察者实例
    // 使用 Object.defineProperty 定义 __ob__ 属性
    // 注意 __ob__ 是不可枚举的
    // 这也就是上文提到的为什么控制台打印响应式对象拥有 __ob__ 这个属性的，即观察者
    def(value, '__ob__', this)
 
    if (Array.isArray(value)) {
      // hasProto => `__proto__` in {}
      // 有 __proto__ 原型则走 protoAugment 方法
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        // 没有的话就需要拿到 arrayMethods 指定的方法重新定义
        copyAugment(value, arrayMethods, arrayKeys)
      }
      // 数组走这里
      this.observeArray(value)
    } else {
      // 对象走这套
      this.walk(value)
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      // 给对象每个 key 进行响应式绑定，重写 getter/setter 方法
      defineReactive(obj, keys[i])
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      // 给数组每个值进行响应式绑定
      // 如果值是对象、数组会递归绑定
      observe(items[i])
    }
  }
}
```

看完上面`Observer`的实现，再结合头部注释，就很容易理解了，实例化`Observer`目的就是给观察对象附加`__ob__`属性和重写setter/getter方法，观察对象包含`Object`和`Array`，对这两者使用了不同的方式处理，`Object`是通过`defineReactive`这个方式实现setter/getter的重写，`Array`的话则特殊点，通过`protoAugment`或者` copyAugment `进行实现响应式绑定，不需要重写setter/getter方法，因为数组你也重写不了😂，下面来看看`defineReactive`重写setter/getter的具体逻辑~

### defineReactive

:::tip

Define a reactive property on an Object.

:::

这个函数的头部注释很好理解了，就是给对象定义响应式属性，利用`Object.defineProperty`实现数据劫持。源码中有一些小细节非常值得我们学习，一起来看看源码：

```js
/**
 * Define a reactive property on an Object.
 */
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep() // 每个 key 都有各自的 dep 实例

  const property = Object.getOwnPropertyDescriptor(obj, key)

  // 这里会判断该属性是否可以被改写 property ，比如被 Object.freeze() 之后的属性就无法修改
  // 所以不想被 vue 重写 getter/setter 的属性可以用 property.configurable = false
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  /*
    data: {
      obj: {
        a: 1,
        __ob__: {

        }
      }
      __ob__: {

      }
    }
  */
  // childOb 是 data.__ob__ || data.obj.__ob__
  // 巧妙利用闭包，如果当前对象存在的 childOb，通知其收集watcher
  // 对每个value都跑一次observe，递归子对象入口
  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    // 重写 data 每个 key 的 getter 函数
    // 先绑定，记住闭包的 dep、childOb
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      // Dep.target 指的是当前 watcher
      // 只有执行时存在 watcher 时才会去收集 dep
      // 避免重复收集依赖
      if (Dep.target) {
        // 收集依赖，也就是当前 watcher 收集这个 dep
        dep.depend()
        if (childOb) {
          // childOb对应着该对象的 __ob__.dep，其实就是该对象__ob__.dep.addSubs(Dep.target)
          // __ob__ 需要 depend() 来让 watcher 收集它进去？
          // 比如 Vue.set(data.obj, 'b', 2) 需要用到__ob__.dep 通知 watcher 的更新
          // 所以当前 watcher 需要收集 __ob__.dep 
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    // 重写data每个key的 setter 函数
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      // (newVal !== newVal && value !== value) 是处理 NaN
      // 新旧值一样就不做处理
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter() // 可能是非单向数据流的警报拦截
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal) // 赋予一个新值时，再次全部 observe 所有字段
      // 通知更新
      dep.notify()
    }
  })
}
```

这块是响应式对象绑定核心实现的地方，该处出现了`dep`相关逻辑，分别用于依赖收集和通知更新。每个属性都有其各自的`dep`实例，这里很巧妙地利用了闭包实现了记住该作用域的`dep`引用。还有一个地方，如果对象的`property.configurable`为`false`，则不会被包装成响应式对象，正如`vue`文档上说可以用`Object.freeze`进行相关优化。在这里我们可以看到`dep`实例有着非常重要的作用，在官方的流程图中并未出现关于`dep`的解析，让我们一起来结合源码看看`dep`到时做了什么，是如何收集依赖和派发通知的。

### Dep

> A dep is an observable that can have multiple directives subscribing to it.

`Dep`是什么？首先，再来看这个类的源码头部注释，大概意思是，`dep`是可观察的，并且有多个订阅它的指令。这里说的指令，其实是指`Watcher`。在观察者模式中，`Dep`无疑就是**目标对象**。每个属性对象都有其各自的`dep`实例，这些实例都是可以被观察订阅的，那么既然可以被观察，它**就要知道它被有多少个watcher订阅了**，所以这里必须要有收集和存储这些观察者的地方，也就是所谓的**观察者池**。注意，这里说的观察，跟上文说的`Observer`观察不太一样，`Watcher`是观察`Dep`。上文有说到`setter`会执行`dep.notify()`方法，所以`Dep`除了有收集观察者，还有向这些观察者发送消息的作用。

啰啰嗦嗦说了那么多，发现还漏了很重要一点，`Dep`其实是`dependence`的简写，指可以被收集的依赖，被谁收集？当然是`Watcher`啦，收集依赖和订阅目标对象都是同一码事！待会在讲`Watcher` 的时候，你就会在源码中看到`collect`、`dependencies`这些关键字。

来看下源码部分：

```js
/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */

let uid = 0

class Dep {
  static target: ?Watcher; // 核心，指向当前 Watcher
  id: number;
  subs: Array<Watcher>; // subs 其实就是 subscribers 缩写，可以称为订阅者啦

  constructor () {
    this.id = uid++
    this.subs = [] // watcher 池
  }

  // 收集 watcher
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  // 移除 watcher
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  // `getter` 中出现的 dep.depend
	// 让当前 watcher 收集这个 dep 依赖
  depend () {
    // 如果当前有存在的 Watcher，就让 watcher 收集依赖
    if (Dep.target) {
      // 这里很巧妙，Watcher.addDep 实际上是调用 this.addSub 方法
      // 也就是通过依赖关系把 Watcher 存到了当前 `dep` 实例中
      Dep.target.addDep(this)
    }
  }

  // 消息通知
  notify () {
    // stabilize the subscriber list first
    // 拷贝一份watcher池，不影响原有的数据
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      // 按注册顺序派发消息
      subs[i].update()
    }
  }
}


// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
// 用于指向当前 Watcher
// 同一时间只有一个 Watcher
Dep.target = null
const targetStack = []

// 给 target 赋值给指定的 Watcher
function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

// 删除最后一个 Watcher
function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
```

 在源码中，我们看到`Deo`可以**添加/删除 watcher**，**让watcher收集自身和向watcher发布消息**。`Dep`其实是扮演着对`Watcher`管理的一种角色。再回顾上文介绍观察者模式的一句话，**一个目标对象管理所有相依于它的观察者对象**，这样是不是都联系起来啦？想是老大管理着一群小弟的感觉，小弟们都在“注视”着老大，等待老大发布各种任务，然后干活。老大需要小弟帮忙干活，小弟需要老大来指挥，所以在这个模式下，两者都有依赖关系，任何一方脱离了组织都没有意义了，下面该来看看`Watcher`的原理了。

### Watcher

:::tip

A watcher parses an expression, collects dependencies, and fires callback when the expression value changes.

This is used for both the $watch() api and directives.

:::

老规矩，看源码前先看头部注释。watcher可以解析表达式，收集依赖，并在表达式的值改变时触发回调事件，$watch和指令同样使用这套。

什么是表达式？`watcher`有个属性叫`expression`，用于记录该`watcher`的表达式。因为`watcher`有三种，所以表达式也有三种。`Watcher`分为`render watcher`、`user watcher`和`computed watcher`这三种，这三种都可以收集依赖dep，因为`expression`不同，所以它们的作用当然也不同。

![image-20200914170435408](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20200914170435408.png)

写一段代码，通过浏览器log，看看它们各自的`expression`：

```html
<div id="app">
 {{value}}
</div>

<script>
 const app = new Vue({
   data: {
     value: 123
   },
   computed: {
     computedValue() {
       return this.value + 1
     }
   },
   watch: {
     value() {
       console.log('user watcher');
     }
   }
 });
  
  app.$mount("#app");
</script>
```

![image-20200914172232830](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20200914172232830.png)

可以看到，确实是有三种不一样的`expression`，这些`expression`是通过一行代码转出来的

```js
this.expression = expOrFn.toString();
```

所以关键还是`expOrFn`函数，这个函数就是`dep`通知观察者要做的事情，更新视图、computed、watch回调函数。

这个函数用`getter`属性记录了

```js
this.getter = expOrFn;
```

除此之外，watcher还包含收集依赖、清除重复依赖、解除依赖、执行回调等逻辑，下面来开始源码逐行解读

```js
let uid = 0

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean; // user watcher
  lazy: boolean; // computed watcher 是 lazy 的
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  before: ?Function;
  getter: Function;
  value: any;

  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    // render watcher 缓存到 vm._watcher
    // vm._watcher 有值肯定是 render-watcher
    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers.push(this) // 装进组件实例_watchers数组里
    // options
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      this.before = options.before
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    // 初始 dirty 为true，因为 computed 的 getter 第一次需要计算，即使没有依赖
    this.dirty = this.lazy // for lazy watchers
    this.deps = [] // 记录上一次的 deps，就是知道哪些 deps 收集了该 watcher
    this.newDeps = [] // 记录最新的 deps
    this.depIds = new Set()
    this.newDepIds = new Set()
    // 表达式
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    // 用 getter 来执行表达式
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      // user watcher 的 expOrFn 是 string，包装返回 function
      // 总之 this.getter 必须是个函数
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    // computed 延迟求值
    // 在读取的时候才去求值
    // 非 computed 直接求值
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get () {
    // 让当前 Dep.target 指向该 watcher
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      // 如果是 computed，回调函数会触发 computed 依赖属性的 getter 函数，computed-watcher 把属性 dep 收集进去
      // watch computed 属性时，this.getter 是 parsePath() 返回的函数
      // 当 watch 计算属性时，读取 computed 属性(parsePath(expOrFn)) -> 触发 computed 的 getter -> user-watcher 被属性 dep 收集进去
      // 如果是 render-watcher，实际是执行 vm._update(vm._render(), hydrating)
      // vm._render 函数会触发 getter 函数，这样 render-watcher 就可以去收集依赖 dep 了 
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      // watch-deep，递归对象收集__ob__.dep.id
      // 对象嵌套越深，性能损耗越大
      if (this.deep) {
        traverse(value)
      }
      // 队列删除该 watcher，恢复前一个 watcher
      popTarget()
      // 清洗一下依赖
      this.cleanupDeps()
    }
    return value
  }

  /**
   * Add a dependency to this directive.
   */
  // 收集依赖
  addDep (dep: Dep) {
    const id = dep.id
    // 比如视图有2个 {{a}} {{a}}，会触发2次getter，需要阻止重复收集依赖
    // 无论数据被读了多少次，同一个依赖只会被收集一次
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      // 为什么要有个 depIds？
      // 数据变更时，newDepIds、newDeps 会清空
      // depIds 缓存了已经收集到的 dep
      // 阻止在数据变更的时候重复收集 dep
      if (!this.depIds.has(id)) {
        dep.addSub(this) // dep 装入该 watcher
      }
    }
  }

  /**
   * Clean up for dependency collection.
   */
  cleanupDeps () {
    // 对上一次收集到的依赖进行清洗
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      // 如果新的不包含旧的，去除该依赖
      // 移除对旧dep的订阅
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    // 每次 watcher 求值后
    // 清空 newDeps 和 newDepIds
    // 使用 deps、depIds 缓存 newDeps、newDepIds
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  // 依赖更新的时候会被触发
  update () {
    /* istanbul ignore else */
    // computed watcher
    if (this.lazy) {
      // dirty 有什么用呢？
      // lazy 表示为 computed
      // 这个 update 是依赖属性变化，也就是 setter 触发的
      // 在 computed 属性的 getter 中，dirty 为 true 时，才会执行 watcher.evaluate 方法
      // 如果 computed 属性没有依赖的话，dirty 就一直为 false
      // 其实就是达到一种缓存的效果，不用每次拿值的时候都重新计算
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      // 加入 watcher 执行队列
      // 在 nextTick 中执行
      queueWatcher(this)
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run () {
    if (this.active) {
      // render-watcher，vnode -> diff -> patch，视图更新
      const value = this.get()
      if (
        // 这里是一个优化，新旧值对比
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  // lazy watcher 就是 computed watcher，This only gets called for lazy watchers.
  evaluate () {
    this.value = this.get()
    // 计算过了，表示缓存干净了
    this.dirty = false
  }

  /**
   * Depend on all deps collected by this watcher.
   */
  // 让这些 deps 被这个 watcher 收集进去
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  /**
   * Remove self from all dependencies' subscriber list.
   */
  // 解除dep和watcher的依赖关系
  teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this)
      }
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
    }
  }
}
```

`Watcher`的源码较上面几个模块比起来，代码稍微复杂了些，里面还包含了对vue的`computed`和`watch`选项的相关逻辑，`computed watcher`和`user watcher`主要用`lazy`和`user`属性来区分。具体这块的实现原理，我会另开一篇文章详细解析，这里暂不分析。主要是其对`Dep`有联系的地方进行解读。关于上面的部分，可以精简为下面代码：

```js
class Watcher {
  constructor(vm, fn) {
    this.vm = vm
    Dep.target = this // 把 Dep.target 指向该实例，同个时间点只能出现一个 watcher 实例
    this.expression = fn.toString();
  }

  addDep() {
    // 收集依赖
  }
  
  get() {
    this.addDep()
  }
  
  run() {
    // 更新视图 || computed || watch 回调
  }

  update() {
    this.run()
  }
}
```

可以看到，其实最核心的地方就是**Dep.target的指向**、**收集依赖**和**触发相关回调**。我们联系上文提到的`dep.depend`方法，实际上就是调用，然后在`setter`中触发`update`方法，最终进行相关视图的更新。

那么，在什么时候会实例化`Watcher`呢？

`render watcher`会在Vue mount的时候进行`new Watcher`。你可能会问，为什么要在`mount`时候实例化？其实这是一种优化。当触发`mount`了，就会调用编译好的`render`函数，**`render`函数会对响应式对象的值进行访问，也就是会触发`getter`函数**，所以这些属性值的`dep`实例就会把当前`watcher`收集起来。**所谓的优化，就是只有视图层(template || render)有用到的值，watcher才会去收集属性dep依赖，触发了`setter`才会调用`vm.render`进行视图更新**。

在data定义了值，但视图层没引用的，即使值变了触发`setter`，也不会走`vm.render`回调，因为`watcher`没有收集到这些`dep`。

所以，我试着用代码验证了下：

```html
<div id="app">
 {{a}}
</div>

<script>
 const app = new Vue({
   data: {
     a: 1,
     b: 2
   }
 });
 
 app.$mount("#app");
</script>
```

![image-20200914175819257](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20200914175819257.png)

没毛病😉

看到了这里，`Dep`和`Watcher`的源码都解析完了，再结合上文说到的观察者模式，有没有对这块更有感觉了呢？

### 针对 Array 的处理

上文有个空缺的地方还没有补上，就是数组是如何做到响应式的？`Object.defineProperty`只能对对象进行响应式绑定，对数组是无法绑定的。`vue`内部先用一个对象原型去继承数组这些原生方法，再去给该对象定义数组的方法对应的`key`，当访问这些`key`时会触发`getter`劫持监听，这样就做到了`push`或者`pop`等方法时视图也进行相关更新。

这边先贴上我在公司进行分享的ppt截图：

![image-20200914180221968](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/blog/image-20200914180221968.png)

再结合源码来看看：

还记得上面`Observer`类中有这些相关逻辑吗：

```js
if (Array.isArray(value)) {
  // hasProto => `__proto__` in {}
    if (hasProto) {
      // 针对数组实现响应式的方法
      protoAugment(value, arrayMethods)
    } else {
      // 没有的话就需要拿到 arrayMethods 指定的方法重新定义
      copyAugment(value, arrayMethods, arrayKeys)
    }
  }
```

这里有个`protoAugment`和`copyAugment`方法，看看里面是什么：

```js
/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src: Object) {
  target.__proto__ = src
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}
```

`protoAugment`原来是通过改变`__proto__`的值来改变`target`的原型，`copyAugment`则是给这个没有原型的对象设上数组方法。

我们可以在`protoAugment`函数中看到，会把数组的原型链指向`arrayMethods`，那么`arrayMethods`又是什么呢？

源码如下：

```js
const arrayProto = Array.prototype
// arrayMethods.__proto__ = arrayProto
export const arrayMethods = Object.create(arrayProto)
```

原来`arrayMethods`是通过`Object.create`方法实现对`Array`原型方法的继承，也就是说`arrayMethods`的原型对象是`arrayProto`，所有`Array`的方法`arrayMethods`都可以访问。

下面来看看`key`的绑定和劫持：

```js
// 只劫持一下这几种方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // 闭包缓存当前的方法
  const original = arrayProto[method]
  // def 其实是 Object.defineProperty 的封装
  def(arrayMethods, method, function mutator (...args) {
    // 执行拿到结果
    const result = original.apply(this, args)
    // 拿到 Observer 实例
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 对于增加数组长度、有新值插入或者更改，都要走一遍`observe`方法
    if (inserted) ob.observeArray(inserted)
    // 通过 dep 发布消息，通知每个 watcher
    ob.dep.notify()
    return result
  })
})
```

所以，通过源码分析和上面的截图，我们可以知道了为什么`vue`无法检测数组某个索引值的改动或者直接修改数组的长度了，[文档参考](https://cn.vuejs.org/v2/guide/list.html#%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9)

到这里，`vue`响应式相关原理已经讲解完毕，结合上面的流程图和源码，再回顾一下，希望能帮助你理解其中的原理知识。`vue`的源码实现真的非常精妙，我们可以在里面学习到非常多的知识。

## Part3: 实现一个简易的响应式系统

有了上面源码基础，再结合自己的理解，我们可以试着从0开始实现一个简易的响应式系统

```js

  function isObject(obj) {
    return obj !== null && typeof obj === 'object';
  };

  // 数组响应式相关实现
  function protoAugment(target, src) {
    target.__proto__ = src
  }

  const arrayProto = Array.prototype;
  const arrayMethods = Object.create(arrayProto);

  const methods = [
    'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'
  ];

  methods.forEach(method => {
    Object.defineProperty(arrayMethods, method, {
      value: function mutator(...args) {
        const original = arrayProto[method];
        const result = original.apply(this, args);
        console.log('触发 array methods');
        return result
      }
    })
  })

  class Observer {
    constructor(value) {
      this.value = value;
      this.dep = new Dep();
      Object.defineProperty(value, '__ob__', {
        value: this,
        configurable: true,
        writable: true,
        enumerable: false
      });
      if (Array.isArray(value)) {
        protoAugment(value, arrayMethods);
      } else {
        this.walk(value);
      }
    }

    walk(obj) {
      const keys = Object.keys(obj);
      keys.forEach(key => defineReactive(obj, key));
    }

    observeArray(items) {
      for (let i = 0, l = items.length; i < l; i++) {
        observe(items[i])
      }
    }
  }

  function observe(value) {
    if (!isObject(value)) {
      return;
    }

    let ob

    if (Object.prototype.hasOwnProperty.call(value, '__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__
    } else {
      ob = new Observer(value);
    }

    return ob;
  }

  // 绑定响应式对象
  function defineReactive(obj, key, val) {

    // 把 dep 实例存在当前的闭包里，每个属性都有其对应的 dep 实例
    const dep = new Dep();

    val = obj[key];
    // 递归
    let childOb = observe(val);

    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter() {
        console.log('get');
        // 让当前 Watcher 收集这个依赖 dep
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        return val;
      },
      set: function reactiveSetter(newVal) {
        console.log('set');
        if (newVal === val) {
          return;
        }
        val = newVal;
        dep.notify(); // 通知更新
      }
    });
  }

  let depId = 0;

  class Dep {
    constructor() {
      this.id = depId++;
      this.subs = [];
    }

    depend() {
      if (Dep.target) {
        Dep.target.addDep(this)
      }
    }

    addSub(watcher) {
      this.subs.push(watcher)
    }

    // 发布
    notify() {
      const subs = this.subs.slice()
      subs.forEach(sub => sub.update())
    }
  }

  // 观察者
  class Watcher {
    constructor(vm, fn) {
      Dep.target = this // target指向自己
      this.value = fn() // `render` 触发 `getter`，dep.depend() -> watcher.addDep() 收集 dep 依赖
      this.cb = fn
    }

    addDep(dep) {
      dep.addSub(this)
    }

    update() {
      this.cb();
    }
  }

  class Vue {
    constructor(options) {
      if (options && options.data) {
        this.data = options.data
      }
      observe(this.data);
      // render watcher
      new Watcher(this, this.render.bind(this));
    }

    render() {
      this.data.value; // getter
    }
  }

  const data = {
    value: 123,
    obj: {
      foo: {
        name: 'foo',
      },
    },
    arr: [1, 2, 3],
    text: 'hello'
  }

  const vm = new Vue({
    data
  });

  vm.data.value; // get
  vm.data.value = 666; // set && update
```

一个简洁的`vue`响应式系统其实不用很多的代码就能做出来，这都归功于`vue`数据驱动的思想和优雅的设计。关于响应式原理，简单来说就是通过`Object.defineProperty`这个api去进行构造响应式对象，递归对象重写每个key的`setter`和`getter`方法，并在闭包中给每个`key`配置一个`dep`实例，在`getter`函数中收集各种`Watcher`实例，最后在`setter`函数中通知所有收集到的`Watcher`更新视图，反复去思考、验证这个流程、原理，相信你就能理解了。

## 总结

通过vue源码学习，给我最大的收获就是，读源码的时候，千万不能忽略源码里自带的英文注释。先读懂这些注释，然后再去研究里面的逻辑，这样读起来效率会高很多，这些注释不但可以给你提供思考的方向，还能让你去感受到作者的意图。

源码阅读算是跟大神近距离交流的一种方式吧，从中可以学习到作者的设计意图和整体思想。读源码是非常具有挑战性的，不是说看了一遍就能理解，很多地方的逻辑不会写得很直观，需要反复看，反复嚼，读懂之后，你会不禁感叹，“这写得也太妙了！”。对源码吃得越透，会很好地辅助平常的开发，写出更优雅的代码，对问题、bug的定位也会更加迅速。

这篇文章其实在一年前就已经写完，过了段时间再看，很尴尬，原来之前写的很多都是有问题的，里面很多地方都解读不对，可能当初理解的层面就在那了吧，所以赶紧把之前写错的地方重新修正，避免误导人。现在发现，网上很多文章对这块的解读也是有问题的，所以在读他人文章的时候，最好能保持质疑，然后自己去验证，不然一年前的你看这篇文章的话，你就会被误导😂（不排除这篇文章还有问题）。不过很庆幸，看了之前写的东西并找到了问题，也算是一种进步了。

 如果文中还存在不足之处和存在的问题，欢迎提出质疑！一起学习，一起进步！

## 参考文章

- [Vue.js 技术揭秘](https://ustbhuangyi.github.io/vue-analysis/)
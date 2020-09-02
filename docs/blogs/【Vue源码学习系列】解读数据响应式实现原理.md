---
title: 【Vue源码学习系列】解读数据响应式实现原理
date: 2019-07-09
tags: [vue, 源码学习]
categories: [vue源码]
---

## 前言

使用`vue`开发有一段时间了，我觉得是时候去深入学习其内部的实现原理了。写过`vue`的童鞋都知道，响应式系统是其最有意思、最独特的特征之一，这个特征可以让我们摆脱了频繁对`dom`的操作，得以让我们更专注于数据层面，因为在`vue`面前，数据和视图是双向绑定的，也就是所谓的数据驱动视图、`mvvm`模型。该文章是vue源码学习系列的第一篇，源码是基于`2.6.10`版本。

## 读源码前...

关于这个原理，我之前是一直停留于`Object.defineProperty`这个概念中，知道`vue`是通过在`getter`中进行依赖的收集，`setter`中触发视图层的更新。虽然之前有看过一些源码解读的文章，能大概看懂一些，但毕竟还是没有去读过源码，所以对于这部分的很多细节上的处理是比较模糊的。于是决定通过源码去一步步去了解、学习其幕后的操作是什么。非常感谢，`vue`是开源的，任何细节都可以在源码中找到答案。

全文分为两个部分，第一部分为**从源码中进行原理解读**，第二部分为**从0开始实现一个简洁的响应式系统**。

## Part1: 原理解读

先来一张官方提供的原理图：

![官方原理图](https://cn.vuejs.org/images/data.png)

从图中可以看出，`render`函数会触发`getter`在`Watcher`对象中进行`Collect as Dependency`(收集依赖)，然后在`setter`中通知`Watcher`进行视图层的更新。这个架构图中，可以看出其响应式原理实际上是用了**观察者模式**，观察者模式是一种一对多的依赖关系，当某个**被监听**的对象更新时，所有监听它的对象都会**收到通知**，然后触发相关事件等等。用类比的方式，可以这么说，`github`上的每个用户都是`Watcher`，用户间可以互相`follow`，如果被`follow`的用户`star`了某个项目或者`created`了新项目，`followers`则会主页上看到他们的动态。这张图只是`vue`响应式思想的精华，但是还是有很多细节需要去学习和掌握的。

来一张我在读源码过程中，边读边画边改的流程图：

![vue响应式原理](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/vue-%E5%93%8D%E5%BA%94%E5%BC%8F%E5%8E%9F%E7%90%861.png)

这张图可以说很具体的描述了响应式系统工作流程。在画的过程中，通过打断点和写demo，不断地去验证和修改里面的细节，花了我不少精力。但是整体下来，也让我对整个响应式的过程有了更清晰的了解，终于不是停留在`Object.defineProperty`层面上了。`Object.defineProperty`虽说确实是基础，但是如果只知道这个`api`是远远不足以掌握`vue`响应式原理，况且`vue3.0`也将用`Proxy`取代`Object.defineProperty`。

### observe

> 响应式源码位于`src/core/observer`

在开发中，打印在vue`data`选项注册的对象时常可以看到附带着`__ob__`这个属性，只知道携带了这个属性的对象就是**响应式**的，比如这种：

![__ob__](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/vue-%E5%93%8D%E5%BA%94%E5%BC%8F%E5%8E%9F%E7%90%862.png)

那么，这个属性具体是如何注册进去的，又有何用呢？

在我画的流程图可以看出，`observe`是响应式的入口，这里逻辑主要是给对象实例化一个`Observer`，也就是上图中响应式对象携带的`__ob__`属性，我把源码贴出来看看，通过注释来进行解读：

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
  // 防止重复实例化 Observer
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    // 这里判断暂且忽略
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // 给该对象弄个 Observer
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```

这里的逻辑其实还是比较简单的，通过上面尤大的英文注释也可以看到这块函数的作用。接下来一起看看`Observer`具体内容。

### Observer

`Observer`是一个类，这个类有2个很重要的方法，分别是`walk`和`observeArray`，分别是对对象和数组的进行响应式绑定，来看看实际源码：

```js
export class Observer {
  
  constructor (value: any) {
    this.value = value
    this.dep = new Dep() // 用于收集该响应式对象的依赖
    this.vmCount = 0
    // 使用 Object.defineProperty 定义 __ob__ 属性
    // 这也就是上文提到的为什么控制台打印响应式对象拥有 __ob__ 这个属性
    // 注意 __ob__ 是不可枚举的
    // Vue.set 方法需要用到这个属性
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      // hasProto => `__proto__` in {}
      if (hasProto) {
        // 针对数组实现响应式的方法
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
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

看完上面`Observer`的实现，其最主要的目的就是给对象和数组递归进行响应式绑定，只不过**这2者的绑定方式有区别的**，数组是绑定原理下文会去说，让我们先来看看给对象`key`进行响应式绑定的`defineReactive`方法做了哪些事情。

### defineReactive

`defineReactive`其实就是使用`Object.defineProperty`的地方了，所以说这里会有收集依赖和通知更新的相关逻辑，除了这些，还有一些小细节非常值得我们学习，一起来看看源码：

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
  // 用于收集当前对象某个key的依赖
  // 利用闭包，巧妙地实现了每个 key 都拥有了其各自 dep 实例
  const dep = new Dep()

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

  // 对每个value都跑一次observe，递归入口
  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    // 重写 data 每个 key 的 getter 函数
    // 先绑定，记住当前的 dep、childOb
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        // 收集依赖
        dep.depend()
        // 利用闭包，如果当前对象存在 childOb，通知其收集依赖
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            // 收集数组的依赖
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

      // 新旧值一样就不做处理
      // (newVal !== newVal && value !== value) 是处理 NaN
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }

      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      // 赋予一个新值时，再次全部执行 observe
      childOb = !shallow && observe(newVal)
      // 通知 Watcher 更新
      dep.notify()
    }
  })
}
```

这块是响应式对象绑定核心实现的地方，该处出现了`dep`相关逻辑，分别用于依赖收集和通知更新。每个属性都有其各自的`dep`实例，这里很巧妙地利用了闭包实现了记住作用域的`dep`引用。还有一个地方，如果对象的`property.configurable`为`false`，则不会被包装成响应式对象，正如`vue`文档上说可以用`Object.freeze`进行相关优化。在这里我们可以看到`dep`实例有着非常重要的作用，在官方的流程图中并未出现关于`dep`的解析，让我们一起来结合源码看看`dep`到时做了什么，是如何收集依赖和派发通知的。

### Dep

`Dep`可以理解成可以被`Watcher`观察的对象，也可以说是~~订阅者~~**发布者**。上文说了每个属性对象都有其各自的`dep`实例，这些实例都是可以被观察的，那么既然可以被观察，它**就要知道有多少位（观察者||订阅者）(Watcher)**，所以这里必须要有收集和存储这些观察者的地方，也就是所谓的**依赖收集地**。上文有说到`setter`会执行`dep.notify()`方法，所以`dep`除了有收集依赖，还有向这些依赖发送消息的作用。

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
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = [] // 依赖收集池
  }

  // 收集依赖
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  // 移除依赖
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  // `getter` 中出现的 dep.depend
  depend () {
    // 如果当前有存在的 Watcher，就添加依赖
    if (Dep.target) {
      // 这里很巧妙，Watcher.addDep 实际上是调用 this.addSub 方法
      // 也就是通过依赖关系把 Watcher 存到了当前 `dep` 实例中
      Dep.target.addDep(this)
    }
  }

  // 消息通知
  notify () {
    // stabilize the subscriber list first
    // 拷贝一份依赖池，不影响原有的数据
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

我们可以看到，`Dep`其实扮演着对`Watcher`管理的一种角色。也就是**观察者模式**中**一对多**的依赖关系。所以说`Dep`是响应式系统中不可或缺的一环。同样的，`Watcher`也是非常重要了，脱离`Watcher`的`Dep`将没有任何意义，下面来看看`Watcher`的源码实现。

### Watcher

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
  cb: Function; // 回调
  id: number;
  deep: boolean;
  user: boolean; // user watcher 用户定义的 watcher
  lazy: boolean; // computed watcher computed 选项
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>; // 观察者池
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  before: ?Function;
  getter: Function;
  value: any;

  constructor (
    vm: Component,
    expOrFn: string | Function, // 函数表达式或者方法
    cb: Function, // 回调
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers.push(this)
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
    this.dirty = this.lazy // for lazy watchers
    // 这里 新旧dep 比对主要用于优化
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = process.env.NODE_ENV !== 'production'
      // 便于调试
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
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
    // computed 是惰性的，在 evaluate 方法才会去计算取值
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get () {
    pushTarget(this) // 就上文说的让 Dep.target 指向当前实例
    let value
    const vm = this.vm
    try {
      // 这里就是触发 `getter` 的地方，进行依赖收集
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
      if (this.deep) {
        // 深度收集依赖
        traverse(value)
      }
      popTarget() // 清除 Dep.target 当前指向，避免反复收集
      this.cleanupDeps()
    }
    return value
  }

  /**
   * Add a dependency to this directive.
   */
  // 添加订阅者
  addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        // 上文有说到，watcher.addDep 最终就是调 dep.addSub
        dep.addSub(this)
      }
    }
  }

  /**
   * Clean up for dependency collection.
   */
  // 清除依赖相关逻辑
  cleanupDeps () {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
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
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      // 同步的话，直接执行
      this.run()
    } else {
      // 异步推入更新队列中
      queueWatcher(this)
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  // 执行 callback
  run () {
    if (this.active) {
      const value = this.get()
      if (
        // 这里有个优化，会有新老值的对比，如果不变就不会重新执行相关回调，比如 render 函数
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
            // 属性
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
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }

  /**
   * Depend on all deps collected by this watcher.
   */
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  /**
   * Remove self from all dependencies' subscriber list.
   */
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

`Watcher`的源码较上面几个模块比起来，代码稍微复杂了些，其实里面包含了对vue的`computed`和`watch`选项的相关逻辑，关于这块的实现原理，我会另开一篇文章详细解析，最近还在研究中，所以就暂不详细解读计算属性和侦听属性相关逻辑了。主要是其对`Dep`有联系的地方进行解读。关于上面的部分，可以精简为下面代码：

```js
class Watcher {
  constructor(vm, fn) {
    this.vm = vm
    Dep.target = this
    this.value = fn()
    this.cb = fn
  }

  addDep(dep) {
    dep.addSub(this)
  }

  update() {
    this.cb(); // vm.render
  }
}
```

可以看到，其实最核心的地方就是**Dep.target的指向**、**收集当前Watcher**和**触发相关回调**。我们联系上文提到的`dep.addSub`方法，其实最终目的就是把**当前的观察者收入到触发了`getter`的属性闭包`dep`实例中**，然后在`setter`中触发`update`方法，最终进行相关视图的更新。

那么，在什么时候会实例化`Watcher`呢？

`Watcher`有视图`render watcher`、`user watcher`和`computed watcher`这三种。`render watcher`会在Vue`mount`的时候进行`new Watcher`。你可能会问，为什么要在`mount`时候实例化？其实这是一种优化。当触发`mount`了，就会调用编译好的`render`函数，**`render`函数会对响应式对象的值进行访问，也就是会触发`getter`函数**，所以这些属性值的`dep`实例就会把当前`watcher`收集起来。**所谓的优化，就是只有视图层(template || render)有用到的值，才会把当前`watcher`实例`push`到对应的`dep`实例中，触发了`setter`才会进行`vm.render`视图更新**。定义了值了的视图层没引用的，即使值变了触发`setter`，也不会走`vm.render`，因为`watcher`没被收集进去。

所以，我试着验证了下，在模板层引用了应用了

```html
<div id="app">
 {{value}}
 {{computedValue}}
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
 })
</script>
```

![watcher](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/vue-%E5%93%8D%E5%BA%94%E5%BC%8F%E5%8E%9F%E7%90%863.png)

在源码处，我打了个log看看`value`的`dep`实例收集到的`watcher`，我们可以看到，图中`dep`实例收集到了2个`watcher`，分别是`render watcher`和`computed watcher`，`expression`可以看到对应的回调，不过只有在非生产环境有效，主要是方便我们去调试。在图中框中的地方还可以看到`computed`属性的函数表达式，为什么`computed`可以缓存？可以通过这些联系到，只有当`computed`里面的依赖(属性)被改变并且触发了`setter`，这时该依赖属性的`dep`才会触发`notify`方法进行消息发布，通知这个`computed watcher`执行这个函数表达式，如果视图`render watcher`被收集进去了，这样最后视图层就会触发`re-render`。

`Dep`和`Watcher`是观察者模式经典实现，依赖的收集和消息的发布都交给`Dep`，`Watcher`则负责了触发视图更新和相关的自定义回调事件。

### 针对 Array 的处理

上文有个空缺的地方还没有补上，就是数组是如何做到响应式的？`Object.defineProperty`只能对对象进行响应式绑定，对数组是无法绑定的。`vue`内部先用一个对象原型去继承数组这些原生方法，再去给该对象定义数组的方法对应的`key`，当访问这些`key`时会触发`getter`劫持监听，这样就做到了`push`或者`pop`等方法时视图也进行相关更新。

可能这样干讲会有点难理解，还是结合源码来看看：

还记得上面`Observer`类中有这些相关逻辑吗：

```js
if (Array.isArray(value)) {
  // hasProto => `__proto__` in {}
    if (hasProto) {
      // 针对数组实现响应式的方法
      protoAugment(value, arrayMethods)
    }
  }
```

这里有个`protoAugment`方法，看看里面是什么：

```js
/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src: Object) {
  target.__proto__ = src
}
```

原来是通过改变`__proto__`的值来改变`target`的原型，我们可以在看到，当`value`值为`array`时，会把该值的原型指向`arrayMethods`，那么`arrayMethods`又是什么呢？

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
    // 通过 dep 发布消息
    ob.dep.notify()
    return result
  })
})
```

所以，通过源码，我们可以知道了为什么`vue`无法检测数组某个索引值的改动或者直接修改数组的长度了，[文档参考](https://cn.vuejs.org/v2/guide/list.html#%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9)

到这里，`vue`响应式相关原理已经讲解完毕，结合上面的流程图和源码，再回顾一下，希望能帮助你理解其中的原理知识。`vue`的源码实现真的非常精妙，我们可以在里面学习到非常多的知识。

## Part2: 实现一个简易的响应式系统

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
        // 收集当前属性与 Watcher 中的依赖关系
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
      this.value = fn() // `render` 触发 `getter`，然后通知 `dep` 收集依赖
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

一个简洁的`vue`响应式系统其实不用很多的代码就能做出来，这都归功于`vue`数据驱动的思想和优雅的设计。

## 总结

最后总结下，关于响应式原理，简单来说就是通过`Object.defineProperty`这个api去进行构造响应式对象，递归对象重写每个key的`setter`和`getter`方法，并在闭包中给每个`key`配置一个`dep`实例，在`getter`函数中收集各种`Watcher`实例，最后在`setter`函数中通知所有收集到的`Watcher`更新视图，反复去思考、验证这个流程、原理，相信你就能理解了。

通过这次源码阅读和学习，收获颇多。源码阅读算是跟大神近距离交流的一种方式吧，从中可以学习到作者的设计意图和思想。源码学习是非常具有挑战性的，不是说看了一遍就能理解，很多地方的逻辑不会写得很直观，需要反复看，反复嚼，还需要借鉴一些好的资料才能理解。对源码吃得越透，会很好地辅助平常的开发，对问题、bug的定位也会更加迅速。

如果文中存在不足之处，希望大家可以指出，一起进步。

## 参考文章

- [Vue.js 技术揭秘](https://ustbhuangyi.github.io/vue-analysis/)
- [【2019 前端进阶之路】深入 Vue 响应式原理，活捉一个 MVVM](https://zhuanlan.zhihu.com/p/61915640)
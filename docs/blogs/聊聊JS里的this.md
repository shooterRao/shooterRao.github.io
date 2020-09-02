---
title: 聊聊JS里的this
date: 2018-02-28
tags: [js,this] 
categories: [js基础]
---

## 前言

在我刚开始学js和写js时，以及在工作中，我都被`this`这家伙困扰过，迷惑过。经过我查阅书籍和反复实践，终于大致搞懂了关于`this`这个机制，其实，它并不难，还是挺有意思的。下面我就来总结和解析下什么是`this`。

<!--more-->

## 什么是this？为什么要用this？

> 'this'是JS中一个机制，也是一个关键字，它被自动定义在所有函数的作用域中。

> 在设计API中，使用'this'会以一种更加优雅的方式来传递一个对象的引用，使得API设计更加简洁，拓展性更强。例如在面向对象编程中，"this"的使用会非常频繁。

### 我开始对this的误解

#### 误解一：this指向函数自身
demo:
```javaScript
function fn() {
  this.count++;
}
fn.count = 0;
fn();
fn();
console.log(fn.count);// 0
```
看完上面那段代码，如果你感到惊讶的话，不要慌，我当时也是这种感觉，哈哈，this就是这样，对初学者迷惑极大，Follow me，让我带你逐步击退这些迷惑。

事实上，上面代码中，函数`fn`内部的this指向是全局对象`window`或者`global`(Node.js中)，并没有指向函数`fn`自身。为什么this指向全局对象去了？因为**非严格模式下**，**全局作用域**中函数被**独立**调用时，它的this默认指向（绑定）`window`或者`global`；在**严格模式中**，它的this为`undefined`。

> 注意：在全局对象中，浏览器运行环境的是`window`，Node环境中是`global`

#### 误解二：this指向函数的作用域
抛出个demo:
```javaScript
function fn() {
  var a = 1;
  this.b();// 这里this指向的是window
}
function b() {
  console.log(this.a);// 这个this指向的也是window
}
fn();// 报错a is not defined
```
上面代码开始是希望函数`b`能通过this来访问函数`fn`作用域变量a，但是事实并不能。函数`b`里的this不会在词法作用域中查到函数`fn`里的变量a，它们的this均指向`window`。如果想要函数`b`访问函数`fn`里的`a`变量，可以使用闭包解决
```javaScript
function fn() {
  var a = 1;
  function b() {
    console.log(a)
  }
  b();
}
fn();// 1
```

## 揭开this这一机制的真实面纱
总的来说，你只要牢记这两点：

* this不指向函数自身，也不指向函数作用域
* this是在**函数被调用时**发生的绑定，它的(绑定)指向完全取决于函数在哪里被调用，并不是在编写时绑定

其中，第一点已经举例证明，现在来细说第二点。

### 函数被调用时，this的绑定规则(重点)

#### 默认绑定

当函数被**独立**调用时，也就是直接`函数名( )`，没有new啊，call，apply，作为对象的方法调用这些，函数里的this会被默认绑定到全局对象（在非严格模式下），也就是上文中两个demo，里面的函数的this均指向全局对象。

给上文**误解一**里demo加点料加深理解：

```javaScript
var count = 0;
function fn() {
  this.count++;// this指向window
}
fn.count = 0;
fn();// 实际调用的是window.fn()
fn();
console.log(fn.count);// 0
console.log(count);// 2 实际调用的是window.count
```

#### 隐式绑定

这条规则具体是这样的，函数如果被某个对象(举例obj对象)拥有，且**作为obj对象的方法调用**时，函数里面的this就是obj对象。

举个demo：
```JavaScript
function fn () {
  console.log(this.a);
}
var obj = {
  a: 1,
  fn: fn
}
obj.fn();// 1

// 或者
var obj = {
  a: 1,
  fn: function() {
    console.log(this.a);
  }
}
obj.fn();// 1
```
这个规则会有几种常见的“怪现象”，举个demo，在回调函数中：
```javaScript
function cb(fn) {
  fn&&fn();// 看，调用位置在这！
}
function fn () {
  console.log(this.a);
}
var a = 2;// window的
var obj = {
  a: 1,
  fn: fn
};

cb(obj.fn);// 2

```
为什么会这样？其实，是酱紫的，函数`fn`**并没有作为obj对象的方法**被调用，而是通过obj对象传入给函数`cb`，作为回调进行调用，也就是直接`fn()`调用了，触发了上面的**默认绑定**，this被绑定到`window`对象中。

那么，有没有方法让函数`fn`访问`obj`对象的属性`a`呢？答案是有的，如下：
```javaScript
function cb(fn) {
  fn&&fn();// 看，调用位置在这！
}
function fn () {
  console.log(this.a);
}
var a = 2;// window的
var obj = {
  a: 1,
  fn: fn
};

cb(obj.fn.bind(obj));// 1

```
哈哈，终于可以获取`obj`对象的属性`a`啦，关于`bind`绑定，就要说说有关显式绑定了。

#### 显式绑定

js提供了`call`,`apply`以及ES5提供的`bind`方法给我们来强制绑定函数的this。

demo:

```javaScript
function fn() {
  console.log(this.a);
};
var obj = {a: 1};
fn.call(obj);// 1
```

> `call`和`apply`的区别是调用函数时，传参的方法不同。

demo: 
```javaScript
var obj = {
  a: 1
};
function fn(params) {
  console.log(this.a,params)
};
fn.call(obj,2); // call传参是一个个传
fn.apply(obj,[2]); // apply传参是传一个数组
```

说说`bind`。`bind`会返回一个硬编码的新函数，它会把你指定的参数设置为this的上下文并调用原始函数(来自：《你不知道的JavaScript》)

在上文隐式绑定的末尾，就用了`bind`来绑定this实现访问obj对象里的a属性。

你可以用`call`或者`apply`来简单模拟实现`bind`方法。

```javaScript
if(!Function.prototype.bind) {
  Function.prototype.bind = function(context) {
    var self = this,args = Array.prototype.slice.call(arguments, 1),;
    return function() {
      self.apply(context, args.concat(Array.prototype.slice.call(arguments)))
    }
  }
}
```

#### new绑定

在使用new来调用函数，会执行下面的操作

1. 创建一个全新的对象
2. 这个新对象会被执行[[Prototype]]连接
3. 这个新对象会指向(绑定)到函数调用的this
4. 如果函数没有返回其他对象，那么new函数调用会自动返回这个新对象

demo：
```JavaScript
function fn(a) {
  this.a = a;
}
var obj = new fn(1);
obj.a // 1

// 以上代码，可以这么理解
var obj = {};// 创建新对象
obj.__proto__ = fn.prototype;// 关联原型链
fn.call(obj);// 绑定this;
```

### 关于箭头函数里的this

> 箭头函数里this，不采用上面的4种原则，而是根据外层（函数或者全局）作用域来决定this，它会继承外层函数调用的this绑定。

箭头函数能解决什么有关this的问题？

举个demo：
```JavaScript
var a = 123;
var obj = {
  a: 1,
  fn: function() {
    // 若obj.fn(), 这个作用域this指向obj; 
    return function() {
      // 这种情况下，这个闭包里的this是无法访问外部作用域的this
      console.log(this.a);// this指向全局
    }
  }
}
obj.fn()();// 123

// ES5
var obj = {
  a: 1,
  fn: function() {
    // 用self保存当前this的引用；
    var self = this;
    return function() {
      console.log(self.a);// 1
    }
  }
}
obj.fn()();// 1

// 使用箭头函数
var obj = {
  a: 1,
  fn: function() {
    return () => {
      // 箭头继承了外层函数的this的绑定
      console.log(this.a);
    }
  }
}
obj.fn()();// 1
``` 
箭头函数书写简洁，清晰明了。

还有在`setTimeout`回调函数中，同样可以使用

```javaScript
function Fn(a) {
  this.a = a;
  setTimeout(() => {
    console.log(this.a);
  },0)
};
new Fn(1);// 1
```

还有，在React开发中，用箭头函数或者`bind`可以解决函数中this的绑定问题。

### 小结

这篇文章的内容都是我在读《你不知道的JavaScript》和《高程3》中总结出来的，加上一些自己的理解。如果有不对的地方，烦请指出，如果对你有帮助，我很开心^_^
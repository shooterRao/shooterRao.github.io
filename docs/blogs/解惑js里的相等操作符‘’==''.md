---
title: 解惑js里的相等操作符"=="和"==="
date: 2018-01-29
tags: [js]
categories: [js基础]
---

## 前言

发现有一段时间没写博客了，时间过得真的很快，转眼来到了2018，那么，今天就开启2018年的第一篇博客吧！

<!--more-->

### 先来讨论下js里的"=="

在js里面，使用==时，不同类型的值也可以被看作是相等的，这可能会让写js的萌新们感到困惑，为什么`'1' == 1`会被判断为true？还有`undefined == null`也会被判断为true等等,甚至还有一些更为神奇的“怪现象”，其实，这都是"=="操作符会触发js引擎进行**隐式转换**，便产生了各种让萌新们感到神奇的现象（下文会举出demo，让你吃惊下，哈哈）<br>
经过我查阅资料，用一个表格来概括下

| 类型(x) | 类型(y) | 结果 |
| ------- | -------   | ---- |
| null | undefined | true |
| undefined | null | true |
| 数字 | 字符串 | x == toNumber(y) |
| 字符串 | 数字 | toNumber(x) == y |
| 布尔值 | 任何类型 | toNumber(x) == y |
| 任何类型 | 布尔值 | x == toNumber(y) |
| 字符串或数字 | 对象 | x == toPrimitive(y) |
| 对象 | 字符串或数字 | toPrimitive(x) == y |

> 如果 x 和 y 是相同类型，javaScript会比较它们的值或对象值。其他没有列在这个表格中的情况都会返回false。

> toNumber 和 toPrimitive 方法是内部进行的，就是上文提到的**隐式转换**

#### toNumber

| 值类型 | 结果 |
| -----  | ----- |
| undefined | NaN |
| null | 0 |
| 布尔值 | true => 1,false => 0|
| 数字 | 数字对应的值|
| 字符串 | 包含字母 => NaN,都是数字 => 对应数字
| 对象 | Number(toPrimitive(vale)) |

#### toPrimitive

关于这个toPrimitive,来一段很有意思的js代码来展开讨论

```javascript
const a = {
    num : 1,
    valueOf: function() {
        return a.num++
    }
}

console.log( a == 1 && a == 2 && a==3 ) // true
```

居然返回的是true！有没有让你感到惊讶呢？
先冷静下，看看为什么会返回true。其实，这都是js引擎在背后搞的鬼。首先，a是一个对象，根据上面的表格，当对象和数字进行`==`判断时，会进行`toPrimitive(a) == 1`判断，触发了toPrimitive，这个方法内部是这样的，先调用对象的valueOf方法，看看能不能返回原始值，有原始值就返回，不能的话，就接着调用toString的方法，有值的话就返回，没有的话，返回一个false。

看完了这段文字，那么上面的问题就很好理解为什么返回true了，首先，toPrimitive(a) 会调用`a.valueOf`方法，然而对象a自带了valueOf方法(可以理解为把原生的valueOf方法给覆盖了),上面有3个`==`,就触发了三次`toPrimitive(a)`,第一次调用valueOf, 返回的值为1，第二次返回的值为2，第三次返回的值为3，那么，最后就会返回true了！

> 总结：在有关 == 中，数字是大佬，如果 == 两边没有数字，就先找到能调用toNumber()方法的那个(boolean转数字的优先级最大)

> 关于为什么 undefined == null 为true，是因为undefined是继承自null，并且undefined是一种数据类型，进行 == 判断时，js引擎会进行**隐式转换**为true

### 关于"==="操作符

如果比较的两个值类型不同，比较的结果就是false。
如果比较的两个值类型相同，结果会根据下表判断

| 类型(x) | 值 | 结果 |
| ----- | ---- | ---- |
| 数字 | x和y数值相同(除了NaN) | true |
| 字符串 | x和y是相同的字符 | true |
| 布尔值 | x和y都是true或false | true |
| 对象 | x和y引用同一个对象 | true |

### 还有一些补充

在ES5中，`===`是有点小bug的，比如

```javascript
+0 === -0 // true
NaN === NaN // false
```
NaN不全等于NaN这个问题，在ES6中，提出了“同值相等”这一算法来解决这个问题，`Object.is()`就是实现这算法的API。它用来比较两个值是否严格相等。

```JavaScript
Object.is(+0,-0) // false
Object.is(NaN,NaN) // true 
```

> 所以，在以后部署了ES6的环境中，尽量使用`Object.is`来判断，ES5中就使用"==="，少用"=="。













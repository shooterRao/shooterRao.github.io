---
title: div垂直水平居中的N种方法
date: 2017-11-20
tags: [css布局]
categories: [css]
---

## 前言

div 动态垂直水平居中的方法有很多种，每种实现的方法都值得学习，今天就在这里总结下。

**注意布局**

```html
<div class="content">
  <div class="content-div"></div>
</div>
```

**20190411 新增一个更简单的方法**

### flex + margin: auto

```css
.content {
  display: flex;
}
.content-div {
  margin: auto;
}
```

### (已知 div 高度和宽度的情况下)

#### 方法一

```css
.content {
  position: relative;
}
.content-div {
  position: absolute;
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100px;
  height: 100px;
}
```

注意: 父元素有没有高度和宽度都可以实现水平垂直居中，但是子元素一定要设置宽高

#### 方法二

这种方法很好理解，用得也比较多，运用百分比和宽高的负一半实现水平垂直居中

```css
.content {
  position: relative;
}
.content-div {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -(宽度1/2) px;
  margin-top: -(高度1/2) px;
}
```

### 不知道 div 高度和宽度情况下

#### 方法一

display-table 比较经典的居中方法

```css
body {
  display: table;
}
.content {
  display: table-cell;
  vertical-align: middle;
}
.content-div {
  margin: 0 auto;
}
```

#### 方法二

css transform，不方便的是根据浏览器不同需要写些前缀

```css
.content {
  position: relative;
}
.content-div {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

#### 方法三

这是最快最方便的方法了，写 flex 布局建议配合 postcssd 的 Autoprefixer 插件来写，效率会很高,
一般用于移动端

```css
.content {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

#### 单用 margin 也是可以的(需要知道 div 高宽度)

```css
.content {
    height: 600px;
    width: 600px;
    display: inline-block; /* 开启BFC */
}
.content-div {
    margin: 250px;
    height: 100px;
    width: 100px;
}
```

关于 BFC 可以参考这篇[博客](https://www.w3cplus.com/css/understanding-block-formatting-contexts-in-css.html)

新增一篇大神写的文章链接，非常详细了[23 个垂直居中技巧](http://csscoke.com/2018/08/21/css-vertical-align/)

### 结语

### 以上都是很实用的 div 垂直水平居中方法，多练练，多写写，多积累

---
title: 用React-Native+Mobx做一个迷你水果商城APP
date: 2017-12-27 22:57:50
tags: [react-native,mobx]
categories: [react-native]
---

## 前言

最近一直在学习微信小程序，在学习过程中，看到了[wxapp-mall](https://github.com/lin-xin/wxapp-mall)这个微信小程序的项目，觉得很不错，UI挺小清新的，便clone下来研究研究，在看源码过程中，发现并不复杂，用不多的代码来实现丰富的功能确实令我十分惊喜，于是，我就想，如果用react-native来做一个类似这种小项目难不难呢，何况，写一套代码还能同时跑Android和IOS（小程序也是。。。），要不写一个来玩玩？有了这个想法，我便直接react-native init 一个project来写一下吧(๑•̀ㅂ•́)و✧

先来张动图，dengdengdeng~~

![show](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/fruitstore-show.gif)

## 技术框架和组件

 - react "16.0.0"
 - react-native "0.51.0"
 - mobx: "3.4.1"
 - mobx-react: "4.3.5"
 - react-navigation: "1.0.0-beta.21"
 - react-native-scrollable-tab-view: "0.8.0"
 - react-native-easy-toast: "1.0.9"
 - react-native-loading-spinner-overlay: "0.5.2"

-------------------

### 为什么要用Mobx?

Mobx是可扩展的状态管理工具，比`react-redux`要简单，上手也比较快。在这个小项目中，因为没有后台服务接口，用的都是本地的假数据，为了模拟实现 **浏览商品 =>加入购物车=>结账=>清空购物车=>还原商品原始状态** 这么一个流程，便用Mobx来管理所有的数据以及商品的状态(有没有选中，有没有加入购物车)，这样，所有的页面都可以共享数据以及改变商品的状态，页面之间的数据和商品状态都是同步更新的。具体用Mobx怎么来实现这流程，在下面会分享使用感受和遇到的一些小坑。



## 开始

先`react-native init`一个`project`，然后用`yarn`或者`npm`装好所有的依赖和组件。因为使用Mobx会用到ES7中[装饰器](http://es6.ruanyifeng.com/#docs/decorator)，所以还要安装`babel-plugin-transform-decorators-legacy`这个插件，然后在`.babelrc`文件下添加以下内容即可。

```javascript
{  
    "presets": ["react-native"],  
    "plugins": ["transform-decorators-legacy"]
}
```

### 项目结构

```
|-- android 
|-- ios
|-- node_modules
|-- src
    |-- common // 公用组件
    |-- img // 静态图片
    |-- mobx // mobx store
        |-- newGoods.js // 首页新品数据
        |-- cartGoods.js // 购物车数据
        |-- categoryGoods.js // 分类页数据
        |-- store.js // store仓库，管理数据状态    
    |-- scene 
        |-- Cart // 购物车页面
        |-- Category // 分类页
        |-- Home // 首页
        |-- ItemDetail // 商品信息页
        |-- Mine // 我的页面   
    |-- Root.js // root.js主要内容是配置react-navigation(导航器)
|-- index.js // 主入口

```
在`Root.js`文件中，有关**react-navigation**的配置和使用方法可以参考下 [官方文档](https://reactnavigation.org/docs/intro/) 和 [这篇博客](http://blog.csdn.net/u013718120/article/details/72357698) ，里面都写得十分详细，有关**react-navigation**的疑问我都在这2篇文章中找到答案，在这里相关**react-navigation**配置，使用方法和项目里面页面布局，组件写法，在这里不打算细说，因为都比较简单，更多的是讨论**Mobx**实现功能的一些逻辑和方法，**screen**文件夹下的组件都写有注释的(°ー°〃)

## 主要还是来聊聊Mobx吧

先来看看用Mobx实现的具体流程，看下面的动图(⊙﹏⊙)

ps: 可能图片太大，加载有点慢，请稍等......

![pay](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/fruitstore-pay.gif)


### 1. 数据存储和获取

这些都是用假数据来模拟实现的，在最开始，先写好假数据的数据结构，例如：

```javascript
"data":
    [{ 
        "name": "那么大西瓜",
        "price": "2.0", 
        "image": require('../img/a11.png'),        
        "count": 0, 
        "isSelected": true
        },...]
```
在Mobx文件夹下的`store.js`，在这里主要是存储和管理app用到的所有商品的数据，将逻辑和状态从组件中移至一个独立的，可测试的单元，这个单元在每个页面下都可以用到。

```javascript
import { observable, computed, action } from 'mobx'
import cartGoods from './cartGoods'
import newGoods from './newGoods'
import categoryGoods from './catetgoryGoods'

/** 
* 根store 
* @class RootStore 
* CartStore 为购物车页面的数据 
* NewGoodsStore 为首页的数据 
* categoryGoodsStore 为分类页的数据 
*/

class RootStore {       
    constructor() {     
      this.CartStore = new CartStore(cartGoods,this)  
      this.NewGoodsStore = new NewGoodsStore(newGoods,this)   
      this.categoryGoodsStore = new categoryGoodsStore(categoryGoods,this)  
}}

Class CartStore{
    @observable  allDatas = {}    
    constructor(data,rootStore) {    
    this.allDatas = data 
    this.rootStore = rootStore 
    }
}

Class NewGoodsStore{
   ...跟上面一样
}

Class categoryGoodsStore{
  ...跟上面一样
}
// 返回RootStore实例  
export default new RootStore()
```
这里用了`RootStore`来实例化所有了`stores`（购物车，首页，分类页分别拥有各自的store），

这样，可以通过`RootStore` 来管理和操作`stores`，从而实现它们之间的相互通信，共享引用。

其次，存储数据用了Mobx的[@observable](http://cn.mobx.js.org/refguide/observable.html)方法，就是把数据成为观察者，当用户操作视图，导致数据发生变化时，注意，配合`react-mobx`提供的[@observer](http://cn.mobx.js.org/refguide/observer-component.html)可以自动更新视图，非常方便。

此外，为了把`Mobx`的`Rootstore`注入到`react-native`的组件中，要通过`mobx-react`提供的`Provider`实现，在`Root.js`下，我是这么写的：

```javascript
// 全局注册并注入mobx的Rootstore实例，首页新品，分类页，商品详情页，购物车页面都要用到store
import {Provider} from 'mobx-react'

// 获取store实例
import store from './mobx/store' 
const  Navigation = () => {   
 return (     
	 <Provider rootStore={store}> 
		 <Navigator/> 
	 </Provider> 
)}
```
把Rootstore实例注入到组件树中后，那么，是不是在组件中直接使用`this.props.rootStore`就可以取到了呢？

“不是的”，我们还需要在要用到Rootstore的组件里，要加点小玩意，在`HomeScreen.js`（首页中这么写：

```javascript
import { inject, observer } from 'mobx-react'

@inject('rootStore') // 缓存rootStore,也就是在Root.js注入的
@observer // 将react组件转变为响应式组件, 数据改变自动触发render函数
export default class HomeScreen extends Component {
     ......
}
```

加上了`@inject('rootStore')`，我们就可以愉快地使用 `this.props.rootStore` 来拿到我们想要的数据啦^_^ ，同样，在商品信息，分类页，购物车页面js下，也需要使用`@inject('rootStore')`来实现数据的获取，然后再一步步地把数据传到它们的子组件中。

### 2. 加入购物车的实现

在首页和分类页中，都可以点击跳转到商品信息页，然后再加入到购物车里

![add](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/fruitstore-add.gif)

**实现方法：**

在`itemDetail.js`下，也就是商品信息页面下，加入购物车的逻辑是这样子的:

```javascript
addCart(value) {
 if(this.state.num == 0) { 
    this.refs.toast.show('添加数量不能为0哦~')
     return; 
}        
// 加入购物车页面的列表上 
// 点一次，购物车数据同步刷新 
this.updateCartScreen(value)
this.refs.toast.show('添加成功^_^请前往购物车页面查看')
}
// 同步更新购物车页面的数据
updateCartScreen (value) { 
    let name = this.props.navigation.state.params.value.name;
    // 判断购物车页面是否存在同样名字的物品 
    let index;
    if(this.props.rootStore.CartStore)
    index = this.props.rootStore.CartStore.allDatas.data.findIndex(e => (e.name === name))
    // 不存在
    if(index == -1) {
    this.props.rootStore.CartStore.allDatas.data.push(value) 
    // 加入CartStore里
    // 并让购物车icon更新
    let length = this.props.rootStore.CartStore.allDatas.data.length 
    this.props.rootStore.CartStore.allDatas.data[length - 1].count += this.state.num}
    else { 
    // 增加对应name的count
    this.props.rootStore.CartStore.allDatas.data[index].count += this.state.num  
    }
}
```
简单的说，先获取水果的名称`name`，然后再去判断`Mobx`的`CartStore`里面是否存在同样的名称的水果，如果有就增加对应`name`的数量`count`，如果没有，就往`CartStore`中增加数据，切换到购物车页面时，视图会同步刷新，看到已加入购物车的水果。

### 3. 改变商品状态同步更新视图

当用户在购物车页面操作商品状态时，数据改变时，视图会跟着同步刷新。

例如，商品的增加数量，减少数据，选中状态，商品全选和商品删除，总价格都会随着商品的数量变化而变化。

图又来了~~

![state](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/fruitstore-state.gif)

实现上面的功能，主要用到了Mobx提供的[action](http://cn.mobx.js.org/refguide/action.html)方法，action是用来修改状态的，也就是用action来修改商品的各种状态（数量，选中状态...），这些action，我是写在`store.js`的CartStore类中的，下面贴出代码

```javascript
 // 购物车store
class CartStore {
    @observable allDatas = {}
    constructor(data,rootStore) { 
    this.allDatas = data
    this.rootStore = rootStore
}
     //加
    @action
    add(money) { 
    this.allDatas.totalMoney += money 
}

    // 减
    @action
    reduce(money) { 
    this.allDatas.totalMoney -= money 
}
    // checkbox true 
    @action
    checkTrue(money) {
        this.allDatas.totalMoney += money
    }  
    // checkbox false
    @action
    checkFalse(money) {
    if(this.allDatas.totalMoney <=0 ) 
    return 
    this.allDatas.totalMoney -= money
}
    // 全选
    @action
    allSelect() {
    if(this.allDatas.isAllSelected) {
    // 重置totalMoney 
    this.allDatas.totalMoney = 0 
    this.allDatas.data.forEach(e=> {
    this.allDatas.totalMoney += e.count * e.price})}
    else { 
    this.allDatas.totalMoney = 0 
}}
    // check全选    
    @action 
    check() { 
    // 所有checkbox为true时全选才为true 
    let allTrue = this.allDatas.data.every(v => ( v.isSelected === true ))
    if(allTrue) { 
    this.allDatas.isAllSelected  = true 
    }else { 
    this.allDatas.isAllSelected = false 
}}
    // 删 
    @action
    delect(name) { 
    this.allDatas.data = this.allDatas.data.filter (e => (e.name !== name ))
}
    // 总价格
    @computed get totalMoney() { 
    let money = 0;
    let arr =  this.allDatas.data.filter(e => (e.isSelected === true))
    arr.forEach(e=> (money += e.price * e.count))
    return money
}}
```

所有修改商品状态的逻辑都在上面代码里面，其中，`totalMoney`是用了Mobx的[@computed](http://cn.mobx.js.org/refguide/computed-decorator.html)方法，`totalMoney`是依赖于`CartStore`的`data`数据，也就是商品数据，但`data`的值发生改变时，它会重新计算返回。如果了解`vue`的话，这个就相当于`vue`的计算属性。

### 4. 结算商品

商品结算和清空购物车的逻辑都写在`CartCheckOut.js`里面，实现过程很简单，贴上代码吧：

```javascript
 // 付款
    pay() { 
    Alert.alert('您好',`总计:￥ ${this.props.mobx.CartStore.totalMoney}`, 
    {text: '确认支付', onPress: () => this.clear()},
    {text: '下次再买', onPress: () => null}],{ cancelable: false })}
// 清空购物车 
    clear() { 
    this.setState({visible: !this.state.visible})
    setTimeout(()=>{ 
    this.setState({ loadText: '支付成功!欢迎下次光临!' }) 
        setTimeout(()=> { this.setState({ visible: false },
        ()=>{ this.props.mobx.CartStore.allDatas.data = []
        // 把所有商品count都变为0 
        this.props.mobx.NewGoodsStore.allDatas.data.forEach(e=> e.count = 0)
        this.props.mobx.categoryGoodsStore.allDatas.data.forEach( e => { 
        e.detail.forEach(value => { value.count = 0 }) 
  })
    })},1500)},2000)}
```
这里主要用了`setTimeout`和一些方法来模拟实现 **支付中 => 支付完成 => 清空购物车 => 还原商品状态**。

好了，这个流程就搞定了，哈哈。

### 5.遇到的小坑

1.我写了一个数组的乱序方法，里面有用到`Array.isArray()`这个方法来判断是否为数组，但是，我用这个乱序函数时，想用来搞乱store里面的数组时，发现一直没有执行，觉得很奇怪。然后我直接用`Array.isArray()`这个方法来判断`store`里面的数组，返回的一直都是`false`。。。于是我就懵了。。。后来，我去看了Mobx官方文档，终于找到了[答案](http://cn.mobx.js.org/best/pitfalls.html)。原来，`store`里面存放的数组，并不是真正的数组，而是`obverableArray`，如果要让`Array.isArray()`判断为`true`，就要在取到`store`的数组时，加个`.slice()`方法，或者`Array.from()`都可以。

2.同样，也是obverableArray的问题。在购物车页面时，我用了FlatList来渲染购物车的item，起初，当我增加商品到购物车，发现购物车页面并没有刷新。有了上面的踩坑经验，我认为是obverableArray引起的，因为FlatList的data接收的是real Array，于是，我用这样的方法：

```javascript
@computed get dataSource() { 
    return this.props.rootStore.CartStore.allDatas.data.slice();
}
...
<FlatList  data={this.dataSource} .../>
```
于是，购物车视图就可以自动地刷新了，在[官方文档](http://cn.mobx.js.org/best/pitfalls.html)上也有写到。

3.还有一个就是自己粗心造成的。我写完这个项目后，和朋友出去玩时，顺便发给朋友看看，他在删除商品时发现，从上往下删删不了，从下往上删就可以。后来我用模拟器测试也是如此，于是就去看看删除商品的逻辑，发现没有问题，再去看`store`的数据，发现也是可以同步更新的，只是视图没有更新，于是我又在`FlatList`去找原因，终于，原因找到了，主要是在`keyExtractor`里面，用数组的`index`是不可以的，要用`name`来作为`key`，也就是说这里的`key`值，要足够稳定的，不能用`index`（索引）去绑定`key`，这也是`react`的语法之一。因为我删除商品方法其实是根据`name`来删的，而不是`index`，所以用`index`来作为`FlatList`的Item的`key`时是会出现bug的。

```javascript
_keyExtractor = (item,index)=> { 
    // 千万别用index，不然在删购物车数据时，如果从第一个item开始删会产生节点渲染错乱的bug 
    return item.name
}
```

## 写在最后

### 总结

断断续续花了差不多一个星期才写好，总得来说，我感觉用**react-native**来写这么一个商城项目要比**小程序**实现要复杂点，主要是在写组件上花的时间要多一点，和这里用Mobx来模拟实现购物流程也花了我些时间。**Android**打包成**apk**可以在我的模拟器上和我朋友的**Android**手机上完美运行，还没发现什么bug，**IOS**的因为我没**MAC**，所以暂时还没打包测试T.T，希望有条件的小伙伴可以clone下来，帮我测测，有Issue的话可以提下，多谢多谢ヽ(✿ﾟ▽ﾟ)ノ

附上github项目地址： [https://github.com/shooterRao/react-native-fruitStore](https://github.com/shooterRao/react-native-fruitStore) (如果感兴趣，希望能点下Star，给予点鼓励，谢谢！)

### 致谢

这个小项目的灵感出于[wxapp-mall](https://github.com/lin-xin/wxapp-mall)，在此款小程序的基础上，优化了购物逻辑和一些交互上的修改。有些UI和Icon也沿用了此款小程序，我也得到了原作者的允许，非常感谢。此外，我还要特别感谢**肖JerryShaw**帮我作的水果图和App的logo，还有也要感谢**Keson**帮忙测试和提供建议。


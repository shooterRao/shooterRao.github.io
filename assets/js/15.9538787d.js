(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{508:function(a,t,s){a.exports=s.p+"assets/img/G1.eef3212c.png"},509:function(a,t,s){a.exports=s.p+"assets/img/G2.89771d94.png"},550:function(a,t,s){"use strict";s.r(t);var n=s(6),e=Object(n.a)({},(function(){var a=this,t=a.$createElement,n=a._self._c||t;return n("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[n("h2",{attrs:{id:"前言"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#前言"}},[a._v("#")]),a._v(" 前言")]),a._v(" "),n("p",[a._v("前段时间，完成了公司项目的底层代码重构，主要内容是采用新的导航器---"),n("strong",[a._v("react-navigation")]),a._v("，来取代之前用的react官方提供的页面导航器"),n("strong",[a._v("Navigator")]),a._v("。重构期间，不是很顺利，踩了不少坑，毕竟是底层的代码，所以重构起来非常谨慎，怕影响到上层的业务逻辑。大部分的重构都是由我一个人负责完成，做了不少笔记，刚好我的个人博客撘好了，那就在这里总结一下重构过程吧。")]),a._v(" "),n("h2",{attrs:{id:"question-为什么要重构"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#question-为什么要重构"}},[a._v("#")]),a._v(" Question：为什么要重构？")]),a._v(" "),n("p",[a._v("首先，重构不是老大要求的，而是我提出来的并得到允许才进行的。为什么我要提出要抛弃Navigator？有几点：")]),a._v(" "),n("blockquote",[n("ul",[n("li",[a._v("react-native官方提供的页面导航器组件Navigator性能非常不好，这点官方也承认了，在react-native"),n("strong",[a._v("0.44")]),a._v("版本之后已经删掉了这个组件，并推荐使用第三方组件"),n("strong",[a._v("react-navigation")]),a._v("。")]),a._v(" "),n("li",[a._v("在我用Navigator实际项目开发中，就感觉到了它的不友好，性能非常差。特别是开启Chrome远程调试的时候，在页面跳转中会导致整个程序的卡死，崩溃，所以我只能用Android Studio来看debug，然而Android Studio查看JSON数据很是蛋疼，不能像Chrome那样可以格式化JSON，所以非常影响我的开发效率。")]),a._v(" "),n("li",[a._v("react-navigation就是为了解决这个问题而生的，据称性能非常接近原生，我写了几个demo发现确实解决了我之前遇到的问题。")]),a._v(" "),n("li",[a._v("既然官方已经宣布不再维护Navigator，如果项目在往后要升级react-native版本，那就必须放弃Navigator这个组件。")])])]),a._v(" "),n("h2",{attrs:{id:"重构前的准备"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#重构前的准备"}},[a._v("#")]),a._v(" 重构前的准备")]),a._v(" "),n("p",[a._v("大家都知道，想要重构底层的代码，就首先要把项目结构弄得非常熟悉，尽量不要影响上层的业务代码，不然bug多得修到你想吐=。=")]),a._v(" "),n("p",[a._v("（本来想用七牛云图床来展示分析导图的，但是注册七牛云要绑定域名，域名购买还是审核实名制，总之今天是用不了图床的了orz...）\n算了，就用文字 + 代码来说说吧...")]),a._v(" "),n("p",[n("img",{attrs:{src:s(508),alt:'"基本逻辑"'}})]),a._v(" "),n("p",[a._v("之前的项目整个页面跳转都是通过Navigator来维护的，所有的页面跳转和通讯通过AppService类提供的静态方法进行，再细点页面跳转和数据传递都是使用"),n("code",[a._v("AppService.forward")]),a._v("这个方法实现。其中，\n"),n("code",[a._v("AppService.forward(Route)")]),a._v("，这个方法会接收"),n("code",[a._v("Route")]),a._v("对象，这个对象的结构是"),n("code",[a._v("{name:'',dest:'',param:{}}")]),a._v(","),n("code",[a._v("name")]),a._v("是获取的数据的接口名,"),n("code",[a._v("dest")]),a._v("是页面名,"),n("code",[a._v("param")]),a._v("是传递的参数。")]),a._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",[n("code",[a._v("页面A--(to)---\x3eNavigator[AppService.forward(Route)]--(to)---\x3e页面B\n")])])]),n("h2",{attrs:{id:"开始重构"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#开始重构"}},[a._v("#")]),a._v(" 开始重构")]),a._v(" "),n("p",[a._v("弄清了项目的设计结构，就要开始着手替换"),n("code",[a._v("Navigator")]),a._v("的计划了。首先，我要做到的就是要用最小的成本来实现组件的替换。当前项目的页面结构分为多个模块，每个模块下又具分为多个子页面，都是"),n("code",[a._v("模块名_页面具名.js")]),a._v("。在"),n("code",[a._v("app.js")]),a._v(",也就是根文件下，会全局注册模块页面，然后通过"),n("code",[a._v("AppService.forward(页面具名)")]),a._v("来进行跳转，这就是Navigator的实现方式。我只有"),n("strong",[a._v("用react-navigation实现页面跳转的方法和Navigator实现方法一致")]),a._v("，才能最大程度的减少项目的重构成本，毕竟在外层的代码有太多太多是用到"),n("code",[a._v("Appservice.forward(Route)")]),a._v("这个方法了。")]),a._v(" "),n("h3",{attrs:{id:"关于页面跳转的实现"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#关于页面跳转的实现"}},[a._v("#")]),a._v(" 关于页面跳转的实现")]),a._v(" "),n("p",[n("code",[a._v("react-navigation")]),a._v("提供的页面跳转方法只要是通过"),n("code",[a._v("StackNavigator")]),a._v("这个api来实现的:"),n("br")]),a._v(" "),n("p",[n("code",[a._v("StackNavigator(RouteConfigs, StackNavigatorConfig)")]),n("br"),a._v(" "),n("strong",[a._v("下面只给出demo")])]),a._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",[n("code",[a._v("const Navs = StackNavigator({\n    页面名:{screen: (页面.js)},\n    页面名:{screen: (页面.js)},\n    页面名:{screen: (页面.js)},\n    ...\n},{\n    编写基本配置...\n    如跳转动画选择，\n    导航栏显示方式，\n    还有页面回调等等\n})\n\n跳转就是使用\nthis.props.navigation.navigate('页面名',{参数})来实现\n")])])]),n("p",[n("img",{attrs:{src:s(509),alt:'"基本逻辑"'}})]),a._v(" "),n("p",[a._v("我在"),n("code",[a._v("app.js")]),a._v("里面全局注册StackNavigator, 并改写了一个"),n("code",[a._v("function")]),a._v("来格式化装有"),n("strong",[a._v("页面名.js")]),a._v("对象的数据格式，让这个对象的数据结构为"),n("code",[a._v("{页面名:{screen: (页面名.js)},...}")]),a._v("(这是"),n("code",[a._v("react-navigation")]),a._v("规定的)，初始化页面默认为"),n("strong",[a._v("start.js(登录页)")]),a._v("。")]),a._v(" "),n("div",{staticClass:"language-javascript line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-javascript"}},[n("code",[n("span",{pre:!0,attrs:{class:"token comment"}},[a._v("// 格式化成{wd.home:{screen:wd.home}}")]),a._v("\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("function")]),a._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[a._v("initPages")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),n("span",{pre:!0,attrs:{class:"token parameter"}},[a._v("pages")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),a._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("{")]),a._v("\n\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[a._v("// pages是一个包含所有项目页面引用的对象")]),a._v("\n\t"),n("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("const")]),a._v(" allPages "),n("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("{")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("}")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n\t"),n("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("let")]),a._v(" obj "),n("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("{")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("}")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n\t"),n("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("for")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),n("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("let")]),a._v(" key "),n("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("in")]),a._v(" pages"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("{")]),a._v("\n\t\tobj "),n("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("{")]),a._v("screen"),n("span",{pre:!0,attrs:{class:"token operator"}},[a._v(":")]),a._v(" pages"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("[")]),a._v("key"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("]")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("}")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n\t\tallPages"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("[")]),n("span",{pre:!0,attrs:{class:"token template-string"}},[n("span",{pre:!0,attrs:{class:"token template-punctuation string"}},[a._v("`")]),n("span",{pre:!0,attrs:{class:"token interpolation"}},[n("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[a._v("${")]),a._v("key"),n("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[a._v("}")])]),n("span",{pre:!0,attrs:{class:"token template-punctuation string"}},[a._v("`")])]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("]")]),a._v(" "),n("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" obj\n\t"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("}")]),a._v("\n\t"),n("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("return")]),a._v(" allPages\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("}")]),a._v("\n\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("const")]),a._v(" screenPages "),n("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[a._v("initPages")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),a._v("AppService"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("pages"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("const")]),a._v(" Navs "),n("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[a._v("StackNavigator")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),a._v("\n    "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("{")]),a._v("\n\tstart"),n("span",{pre:!0,attrs:{class:"token operator"}},[a._v(":")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("{")]),a._v("screen"),n("span",{pre:!0,attrs:{class:"token operator"}},[a._v(":")]),a._v("start"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("}")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(",")]),a._v("\n\t"),n("span",{pre:!0,attrs:{class:"token operator"}},[a._v("...")]),a._v("screenPages\n    "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("}")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(",")]),a._v(" \n    "),n("span",{pre:!0,attrs:{class:"token operator"}},[a._v("...")]),a._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),a._v("\n")])]),a._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[a._v("1")]),n("br"),n("span",{staticClass:"line-number"},[a._v("2")]),n("br"),n("span",{staticClass:"line-number"},[a._v("3")]),n("br"),n("span",{staticClass:"line-number"},[a._v("4")]),n("br"),n("span",{staticClass:"line-number"},[a._v("5")]),n("br"),n("span",{staticClass:"line-number"},[a._v("6")]),n("br"),n("span",{staticClass:"line-number"},[a._v("7")]),n("br"),n("span",{staticClass:"line-number"},[a._v("8")]),n("br"),n("span",{staticClass:"line-number"},[a._v("9")]),n("br"),n("span",{staticClass:"line-number"},[a._v("10")]),n("br"),n("span",{staticClass:"line-number"},[a._v("11")]),n("br"),n("span",{staticClass:"line-number"},[a._v("12")]),n("br"),n("span",{staticClass:"line-number"},[a._v("13")]),n("br"),n("span",{staticClass:"line-number"},[a._v("14")]),n("br"),n("span",{staticClass:"line-number"},[a._v("15")]),n("br"),n("span",{staticClass:"line-number"},[a._v("16")]),n("br"),n("span",{staticClass:"line-number"},[a._v("17")]),n("br"),n("span",{staticClass:"line-number"},[a._v("18")]),n("br"),n("span",{staticClass:"line-number"},[a._v("19")]),n("br"),n("span",{staticClass:"line-number"},[a._v("20")]),n("br"),n("span",{staticClass:"line-number"},[a._v("21")]),n("br")])]),n("h3",{attrs:{id:"关于页面数据传递的实现"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#关于页面数据传递的实现"}},[a._v("#")]),a._v(" 关于页面数据传递的实现")]),a._v(" "),n("p",[a._v("完成了页面跳转，接下来就要实现页面之间的数据了。")]),a._v(" "),n("p",[a._v("在使用Navigator的时候，数据都存放在"),n("code",[a._v("Route.param")]),a._v("对象里面，然后在跳转目标页面里面通过"),n("code",[a._v("this.props.route.param")]),a._v("来获取传来的数据。")]),a._v(" "),n("p",[a._v("在react-navigation中，数据是通过props.navigation.navigate这个api来进行传递的，比如：")]),a._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",[n("code",[a._v("页面A---\x3ethis.props.navigation.navigate('页面B'，{参数})---\x3e页面B\n\n在页面B内可以通过this.props.navigation.state.params来接收参数\n")])])]),n("p",[a._v("现在，我就按照这种思路，重写了"),n("code",[a._v("AppService.forward()")]),a._v("这个函数，还有在"),n("code",[a._v("BasePage.js（ps:用于页面继承的类）")]),a._v("也做了大量修改。页面的跳转和数据传递，还是通过"),n("code",[a._v("AppService.forward(Route)")]),a._v("这种形式来传，"),n("code",[a._v("Route")]),a._v("对象的数据结构保持不变，一切的逻辑都在底层的AppService这个类里面进行重写和改造，分点实现是这样的:")]),a._v(" "),n("blockquote",[n("ul",[n("li",[a._v("props.route 替换为 props.navigation.state.params")]),a._v(" "),n("li",[a._v("this.props.route.param替换为this.props.navigation.state.params.param")])])]),a._v(" "),n("p",[a._v("现在，在页面B是通过"),n("code",[a._v("this.props.navigation.state.params.param")]),a._v("来获取参数，这样，基本实现了从最底层无缝地用react-navigation替换掉Navigator。")]),a._v(" "),n("h3",{attrs:{id:"关于数据请求接口name字段的处理"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#关于数据请求接口name字段的处理"}},[a._v("#")]),a._v(" 关于数据请求接口name字段的处理")]),a._v(" "),n("p",[a._v("在页面跳转过程中，如果"),n("code",[a._v("Appservice.forward(Route)")]),a._v("中"),n("code",[a._v("Route")]),a._v("里面有"),n("code",[a._v("name")]),a._v("字段，跳转的目标页面会根据这个接口"),n("code",[a._v("name")]),a._v("来请求数据，所以，我在AppService类中同样做了处理,基本是这样的:")]),a._v(" "),n("div",{staticClass:"language-JavaScript line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-javascript"}},[n("code",[n("span",{pre:!0,attrs:{class:"token comment"}},[a._v("// 优先处理name字段")]),a._v("\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("const")]),a._v(" param "),n("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("{")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("}")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\nRoute"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("name "),n("span",{pre:!0,attrs:{class:"token operator"}},[a._v("?")]),a._v(" param加入name字段 "),n("span",{pre:!0,attrs:{class:"token operator"}},[a._v(":")]),a._v(" param加入dest和param字段\nAppService"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[a._v("forward")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[a._v("'页面名'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(",")]),a._v("param"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[a._v("// 注意，这里AppService.forward已经被我封装好了，相当于")]),a._v("\nAppService"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("forward "),n("span",{pre:!0,attrs:{class:"token operator"}},[a._v("==")]),a._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("this")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("props"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("navigation"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("navigate\n")])]),a._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[a._v("1")]),n("br"),n("span",{staticClass:"line-number"},[a._v("2")]),n("br"),n("span",{staticClass:"line-number"},[a._v("3")]),n("br"),n("span",{staticClass:"line-number"},[a._v("4")]),n("br"),n("span",{staticClass:"line-number"},[a._v("5")]),n("br"),n("span",{staticClass:"line-number"},[a._v("6")]),n("br"),n("span",{staticClass:"line-number"},[a._v("7")]),n("br")])]),n("p",[a._v("当然，具体的代码还是有很多业务逻辑判断来进行处理的，加上额外的组件有一些方法也需要进行重写，上面只是简单地说明了name的处理方法。")]),a._v(" "),n("h2",{attrs:{id:"总结"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#总结"}},[a._v("#")]),a._v(" 总结")]),a._v(" "),n("p",[a._v("在公司的新项目中，这套react-natvigation方案已经开始使用，解决了chrome调试崩溃的问题，大大提高了开发效率。说真的，项目重构学到的知识还是很多的，比如，重构的过程中，我对react的使用有了更深的了解，在项目重构前，我做了不少关于react-navigation的demo，查阅了有关react-navigation的"),n("a",{attrs:{href:"https://reactnavigation.org/docs/intro/",target:"_blank",rel:"noopener noreferrer"}},[a._v("文档"),n("OutboundLink")],1),a._v("，还有"),n("a",{attrs:{href:"http://blog.csdn.net/sinat_17775997/article/details/70176688",target:"_blank",rel:"noopener noreferrer"}},[a._v("博客"),n("OutboundLink")],1),a._v("。对react-navigation的使用也越加熟悉。其实重构要做的不仅仅上面说的这些，还是有些耦合度有点高的组件，得一个个解耦，只有真正做到最大程度组件间的解耦，才能更好地维护项目代码。如何去降低代码之间的耦合度，也是一个非常值得探索的方向。")])])}),[],!1,null,null,null);t.default=e.exports}}]);
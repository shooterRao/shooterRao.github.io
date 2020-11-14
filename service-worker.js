/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "0e69b88f3bc947c67fdb0562f7c632b7"
  },
  {
    "url": "assets/css/0.styles.1c793696.css",
    "revision": "2d4f0dda6db5dd4c912e8a89567bc97b"
  },
  {
    "url": "assets/img/1.06ee7b70.png",
    "revision": "06ee7b70dbaa0d06a3392487833067fa"
  },
  {
    "url": "assets/img/1.39dd8d7f.png",
    "revision": "39dd8d7f1512388796895c57bcb1311d"
  },
  {
    "url": "assets/img/1.8c27b711.png",
    "revision": "8c27b711df6c13dc63913bc93314ad7f"
  },
  {
    "url": "assets/img/10.e919c3f1.png",
    "revision": "e919c3f1119c4a4882a181c76b017781"
  },
  {
    "url": "assets/img/2.b78e6c97.png",
    "revision": "b78e6c97c0f3dc2013a2a5615df091aa"
  },
  {
    "url": "assets/img/2.d4899e8f.png",
    "revision": "d4899e8feb67be622b6cb893a2ff9e8c"
  },
  {
    "url": "assets/img/2.f0f62aaf.png",
    "revision": "f0f62aafd5a93dc4c055058bbe1d6304"
  },
  {
    "url": "assets/img/3.31e7837d.png",
    "revision": "31e7837d6b2f529e08f1b4f37d2bc574"
  },
  {
    "url": "assets/img/3.9c4e604a.png",
    "revision": "9c4e604a75b8f1938fa29b01b46f4173"
  },
  {
    "url": "assets/img/3.b5562ad2.png",
    "revision": "b5562ad2654f3fe8463a7e897c33f249"
  },
  {
    "url": "assets/img/4.6a59988d.png",
    "revision": "6a59988d2ba42a0bc6f0929823dc09ea"
  },
  {
    "url": "assets/img/4.c7670098.png",
    "revision": "c7670098fccf18e9e4704bbeeaaeb5ff"
  },
  {
    "url": "assets/img/5.a857ffbb.png",
    "revision": "a857ffbbcdd870e8eb2b0a94d3a66ef1"
  },
  {
    "url": "assets/img/5.d52a80ec.png",
    "revision": "d52a80ecfc5b0f514d76deb84a50ac07"
  },
  {
    "url": "assets/img/6.8dbeffaa.png",
    "revision": "8dbeffaa87b533bf63b5c20b6a1a3d2f"
  },
  {
    "url": "assets/img/6.dd7bc492.png",
    "revision": "dd7bc4923c5f89b77046302727b25771"
  },
  {
    "url": "assets/img/7.a734e2af.png",
    "revision": "a734e2af895c3b74f9bca7538350e7a2"
  },
  {
    "url": "assets/img/8.1514c40c.png",
    "revision": "1514c40c6a669fd1fadaed567f2d066d"
  },
  {
    "url": "assets/img/8.3065700a.png",
    "revision": "3065700aa1cfc7a5312859e61e8d1575"
  },
  {
    "url": "assets/img/9.457c6516.png",
    "revision": "457c6516158076c3a1f4c671c1fe7512"
  },
  {
    "url": "assets/img/9.6f26cf58.png",
    "revision": "6f26cf584aeededff032d8bfb11597ca"
  },
  {
    "url": "assets/img/bg.2cfdbb33.svg",
    "revision": "2cfdbb338a1d44d700b493d7ecbe65d3"
  },
  {
    "url": "assets/img/G1.eef3212c.png",
    "revision": "eef3212cac233c6ddab59c2c7aba1b0f"
  },
  {
    "url": "assets/img/G2.89771d94.png",
    "revision": "89771d942e40729b00d1b26ce1314600"
  },
  {
    "url": "assets/img/test1.4328192a.png",
    "revision": "4328192aa7a999664b3ddbc89da3123a"
  },
  {
    "url": "assets/img/zk.803a0c1a.jpg",
    "revision": "803a0c1a9c047b0c2611b4d3817a0eae"
  },
  {
    "url": "assets/js/1.88acf310.js",
    "revision": "c05d0ce5b7cefbd8618d0cf8813ad440"
  },
  {
    "url": "assets/js/10.d62c995d.js",
    "revision": "a28b30077165da66c411a45a0e80a60d"
  },
  {
    "url": "assets/js/11.45c62cbc.js",
    "revision": "7f5850115e461f6e9149aee02b4cc9bc"
  },
  {
    "url": "assets/js/12.9e8433f0.js",
    "revision": "9d97e898f78eb3bf88d1a6b512613967"
  },
  {
    "url": "assets/js/13.c3dd678c.js",
    "revision": "03847f927e7e5e21b60464336a21ee49"
  },
  {
    "url": "assets/js/14.77235c73.js",
    "revision": "06d66ac15f4bb82db20ba9328e7d87d9"
  },
  {
    "url": "assets/js/15.8f6d6ccf.js",
    "revision": "6aea695a2360d8509b7d3200b666e3a7"
  },
  {
    "url": "assets/js/16.da5ae5b6.js",
    "revision": "f12a41bf95131767b6a8df52c54934ad"
  },
  {
    "url": "assets/js/17.10639488.js",
    "revision": "78d7c9938d898063c4f6a3475834508e"
  },
  {
    "url": "assets/js/18.57280bd3.js",
    "revision": "8f7478ac3eca9eabb40da19a32587d69"
  },
  {
    "url": "assets/js/19.da1f9976.js",
    "revision": "7d06d2e1ab7e87f0144130edf0c54f78"
  },
  {
    "url": "assets/js/20.2d211d0d.js",
    "revision": "cd05f7d7f3bdcc9cce27b24afd6821a6"
  },
  {
    "url": "assets/js/21.e601fa1d.js",
    "revision": "5825ac0a4d307e55fdf03b3a869fd53c"
  },
  {
    "url": "assets/js/22.5f7f53e3.js",
    "revision": "c8f56aa18b8c6008fcffb441ad354196"
  },
  {
    "url": "assets/js/23.dff06c1b.js",
    "revision": "b8f881be81d4f5df05506bc6fac38024"
  },
  {
    "url": "assets/js/24.5e3a5599.js",
    "revision": "3adaeec0385b3de77f49a2a68340771a"
  },
  {
    "url": "assets/js/25.6a4ea3bd.js",
    "revision": "4f99857613129b82ccf1f970076f7304"
  },
  {
    "url": "assets/js/26.3f36eca0.js",
    "revision": "bc38edaabbed73ec8d9786b45a9101ff"
  },
  {
    "url": "assets/js/27.fa3fd918.js",
    "revision": "edf9aa502a1c9bb90335d7bbcde0c50c"
  },
  {
    "url": "assets/js/28.4a3f032d.js",
    "revision": "faedd2ee7d18c64de53ef04d8835b2fe"
  },
  {
    "url": "assets/js/29.1880affb.js",
    "revision": "8a91f84a79490e588c1277c2edf8606c"
  },
  {
    "url": "assets/js/3.3b39e7a0.js",
    "revision": "2b21a7af885fae94cfa9f8c2da4c9968"
  },
  {
    "url": "assets/js/30.84daae45.js",
    "revision": "f96f39f0e4f535d85e20ab37e2149763"
  },
  {
    "url": "assets/js/31.8677ab92.js",
    "revision": "6ac8455009fd73358a9524bff8403037"
  },
  {
    "url": "assets/js/4.078135db.js",
    "revision": "4a4e212e72e38b7e0b2a6aed00889046"
  },
  {
    "url": "assets/js/5.8d61b07d.js",
    "revision": "975cc6febaf732ead63278b259dd78f3"
  },
  {
    "url": "assets/js/6.f943569e.js",
    "revision": "d9df6553016a570fbc3c9b78fe379169"
  },
  {
    "url": "assets/js/7.6f342330.js",
    "revision": "f41dba5e80ab8a8552d132df0ac24abc"
  },
  {
    "url": "assets/js/8.9a332d86.js",
    "revision": "a4aec5b718bb33447791e458e3cec986"
  },
  {
    "url": "assets/js/9.4115a6b8.js",
    "revision": "c08fc4e649711948ff1ef09a85357afb"
  },
  {
    "url": "assets/js/app.efb74be0.js",
    "revision": "bcef9cc068f7103c36fab496cb32a4e8"
  },
  {
    "url": "blogs/div垂直水平居中的N种方法.html",
    "revision": "f5acdaa3b422093422cba90194a2d3df"
  },
  {
    "url": "blogs/GraphQL + Apollo + Vue 牛刀小试.html",
    "revision": "e512fb4864ab1f0d0e05da3db804314c"
  },
  {
    "url": "blogs/VsCode常用开发插件.html",
    "revision": "091b138e7ecbbd03b72552856f00d083"
  },
  {
    "url": "blogs/vuecli2引入arcgis-js-api方案总结.html",
    "revision": "8eedf3e63c1243bbf11d5f6401b7d78f"
  },
  {
    "url": "blogs/vue实践小结(长期更新).html",
    "revision": "2f0bfbdb704465131bedd139d5310ad7"
  },
  {
    "url": "blogs/webpack 3.X 学习笔记(一).html",
    "revision": "8adffe07d17c4095288032d04c62e2d9"
  },
  {
    "url": "blogs/企业级前端脚手架开发总结.html",
    "revision": "7bc8632abf7f206d85224b8e90a87989"
  },
  {
    "url": "blogs/关于函数节流和函数去抖的实现.html",
    "revision": "d7eef5be5abe2984be9ab496e8f047af"
  },
  {
    "url": "blogs/如何用Koa2返回文本和图片流以及解决乱码事件.html",
    "revision": "52e740da0973cbb369b6eaa48ad841de"
  },
  {
    "url": "blogs/手把手教你用Vscode Debugger调试代码.html",
    "revision": "55191a58d6c086ae5ef61c08cbd60017"
  },
  {
    "url": "blogs/用node+vuepress+docker打造团队文档知识库.html",
    "revision": "ffeb021078c7b8c60a353d99efccfe94"
  },
  {
    "url": "blogs/用React-Native+Mobx做一个迷你水果商城APP.html",
    "revision": "2dca56f1dc5a98b2ca9177bba795bd7a"
  },
  {
    "url": "blogs/真实案例引发对\"js内存泄漏\"的一些思考.html",
    "revision": "5bc8a742622175bb9f42ea378a52b70e"
  },
  {
    "url": "blogs/聊聊js里的this.html",
    "revision": "6c5917024a5fc1c260b3c62b6efe3ec6"
  },
  {
    "url": "blogs/解惑js里的相等操作符‘’==''.html",
    "revision": "af868123a48698bf69a3d424d39bac86"
  },
  {
    "url": "blogs/解读vue数据响应式实现原理.html",
    "revision": "cb4e0aebd8fd65ab98a088dffda4323a"
  },
  {
    "url": "blogs/记一次系统前端底层升级总结.html",
    "revision": "c7e3f39e90406d2fe04be33e21fb152a"
  },
  {
    "url": "blogs/运用react-navigation重构项目总结.html",
    "revision": "985de49583a91dab0b416a56245fbf14"
  },
  {
    "url": "blogs/还在用字体图标吗，试试svg图标吧(内附vuecli-svg-sprite-loader插件).html",
    "revision": "7f7ef534a97faf130613d20031c44fad"
  },
  {
    "url": "categories/css/index.html",
    "revision": "2b6501c99740cbd6d0f6775fcdabf8f3"
  },
  {
    "url": "categories/GraphQL/index.html",
    "revision": "de709eda39f5c8469ab92db036d72631"
  },
  {
    "url": "categories/index.html",
    "revision": "ceff13ea98618f9c1234b2434dd3e2bc"
  },
  {
    "url": "categories/js基础/index.html",
    "revision": "c501a9a2e2b8586c615cc55db868be6b"
  },
  {
    "url": "categories/koa2/index.html",
    "revision": "1c3acfe376bda28a4ce52d88c9be57a5"
  },
  {
    "url": "categories/react-native/index.html",
    "revision": "ac4de2094704076a8f6a29b253af5854"
  },
  {
    "url": "categories/tool/index.html",
    "revision": "c30fa7b85fb046fbcf2d995de16f138d"
  },
  {
    "url": "categories/vue/index.html",
    "revision": "4cb46854004130a1de3284bd8f6413a3"
  },
  {
    "url": "categories/vue源码/index.html",
    "revision": "8e5855c77f9979bfbfa73d65953c6ee8"
  },
  {
    "url": "categories/webpack/index.html",
    "revision": "393d18979a9571a267b96848bdc0fa92"
  },
  {
    "url": "categories/前端工具/index.html",
    "revision": "1c232898e4401c67d1050a4be7c3b06e"
  },
  {
    "url": "categories/工具/index.html",
    "revision": "1f42a157382900177270eea2a91f5dcd"
  },
  {
    "url": "categories/性能优化/index.html",
    "revision": "ab155aeedbd511f95e0451cb4b768b12"
  },
  {
    "url": "categories/脚手架/index.html",
    "revision": "9ed70b6b46bc828f4106fde663d441a0"
  },
  {
    "url": "categories/重构/index.html",
    "revision": "ac22b95385c8dba30b8c367eff0df4ea"
  },
  {
    "url": "icons/android-chrome-192x192.png",
    "revision": "f130a0b70e386170cf6f011c0ca8c4f4"
  },
  {
    "url": "icons/android-chrome-512x512.png",
    "revision": "0ff1bc4d14e5c9abcacba7c600d97814"
  },
  {
    "url": "icons/android-chrome-maskable-192x192.png",
    "revision": "845a39478d0e2d4d5d32a092de2de250"
  },
  {
    "url": "icons/android-chrome-maskable-512x512.png",
    "revision": "2695f5feb66cdb0c6f09d0e415824cf9"
  },
  {
    "url": "icons/apple-touch-icon-120x120.png",
    "revision": "936d6e411cabd71f0e627011c3f18fe2"
  },
  {
    "url": "icons/apple-touch-icon-152x152.png",
    "revision": "1a034e64d80905128113e5272a5ab95e"
  },
  {
    "url": "icons/apple-touch-icon-180x180.png",
    "revision": "c43cd371a49ee4ca17ab3a60e72bdd51"
  },
  {
    "url": "icons/apple-touch-icon-60x60.png",
    "revision": "9a2b5c0f19de617685b7b5b42464e7db"
  },
  {
    "url": "icons/apple-touch-icon-76x76.png",
    "revision": "af28d69d59284dd202aa55e57227b11b"
  },
  {
    "url": "icons/apple-touch-icon.png",
    "revision": "66830ea6be8e7e94fb55df9f7b778f2e"
  },
  {
    "url": "icons/favicon-16x16.png",
    "revision": "4bb1a55479d61843b89a2fdafa7849b3"
  },
  {
    "url": "icons/favicon-32x32.png",
    "revision": "98b614336d9a12cb3f7bedb001da6fca"
  },
  {
    "url": "icons/msapplication-icon-144x144.png",
    "revision": "b89032a4a5a1879f30ba05a13947f26f"
  },
  {
    "url": "icons/mstile-150x150.png",
    "revision": "058a3335d15a3eb84e7ae3707ba09620"
  },
  {
    "url": "icons/safari-pinned-tab.svg",
    "revision": "4e857233cbd3bb2d2db4f78bed62a52f"
  },
  {
    "url": "index.html",
    "revision": "a4cf8a43787fcad063a0c23394c06b46"
  },
  {
    "url": "tag/apollo/index.html",
    "revision": "35f30fd30ec72f375ffda0f8ab4c9bff"
  },
  {
    "url": "tag/arcgis/index.html",
    "revision": "121b97cab6b7a79f50e228fe92ccd360"
  },
  {
    "url": "tag/css布局/index.html",
    "revision": "53f3ec4ee71026e3207a8b169777a2eb"
  },
  {
    "url": "tag/docker/index.html",
    "revision": "9ba11ec0a67b3d34929e2672b622176f"
  },
  {
    "url": "tag/GraphQL/index.html",
    "revision": "f32688b0da5f8575de3149591cc02cc2"
  },
  {
    "url": "tag/index.html",
    "revision": "e783cdfa498644ff0c17fd549d05ac6a"
  },
  {
    "url": "tag/js/index.html",
    "revision": "fa29efafd580fbca78e366ab736ed759"
  },
  {
    "url": "tag/koa2/index.html",
    "revision": "3dbf68839ed59613e20fd11a59a2d6ae"
  },
  {
    "url": "tag/mobx/index.html",
    "revision": "aaf585d4614169a6687b5cfe3e561766"
  },
  {
    "url": "tag/node/index.html",
    "revision": "800142dbe467e1480daacec52f7770c9"
  },
  {
    "url": "tag/react-native/index.html",
    "revision": "337380ab7af55f7f5a707a6f518d3fc0"
  },
  {
    "url": "tag/react/index.html",
    "revision": "d8b40d2d80017fc141900b2223bba22a"
  },
  {
    "url": "tag/this/index.html",
    "revision": "36c6e9993200068cc3080e118bca413d"
  },
  {
    "url": "tag/tool/index.html",
    "revision": "8374f335114077739715235d7cc9fe85"
  },
  {
    "url": "tag/vscode/index.html",
    "revision": "261adb9059adef243971df5e180360c6"
  },
  {
    "url": "tag/vue/index.html",
    "revision": "1f1db199ef28cee704f58cb0d1c6545a"
  },
  {
    "url": "tag/vuepress/index.html",
    "revision": "74ba713529e2d1b93bb4ebfc61f74024"
  },
  {
    "url": "tag/webpack/index.html",
    "revision": "079467ac9574bf0e430017dbeed613af"
  },
  {
    "url": "tag/前端工程化/index.html",
    "revision": "616633b8605a1d59c04e1b9363a2fb19"
  },
  {
    "url": "tag/前端架构/index.html",
    "revision": "3bd74088151a545b0fc81cf48512d1d3"
  },
  {
    "url": "tag/工具/index.html",
    "revision": "c3e9f3381335c2994a13179693af1ad4"
  },
  {
    "url": "tag/性能优化/index.html",
    "revision": "b462973db346a3fc4658656eca403032"
  },
  {
    "url": "tag/源码学习/index.html",
    "revision": "b6186bab0749997a3885e0d247a59490"
  },
  {
    "url": "tag/脚手架/index.html",
    "revision": "31a8f51cbaa4e92a76ecfdae44251772"
  },
  {
    "url": "tag/重构/index.html",
    "revision": "0744f368671e1523e4806041600d36b5"
  },
  {
    "url": "timeline/index.html",
    "revision": "d75a5b0348fdd0f230f6313f2fd48edb"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})

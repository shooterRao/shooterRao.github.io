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
    "revision": "1ded36f8365a6d9b14da7ce0503cd6ab"
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
    "url": "assets/js/11.1384acab.js",
    "revision": "8ab0b01b8d5c166a5312f795fd0a1ad3"
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
    "url": "assets/js/15.9538787d.js",
    "revision": "a8b8c3e0571972dc26a2ea29d254cd42"
  },
  {
    "url": "assets/js/16.8917779f.js",
    "revision": "96c87c574f0a6c6cae8c7da650b2f0f5"
  },
  {
    "url": "assets/js/17.4e25faa6.js",
    "revision": "d5f25cc2ce81bf000bb79fabfa86ee37"
  },
  {
    "url": "assets/js/18.8d0e9663.js",
    "revision": "af650c7a1de4da84393904b8db5b2f74"
  },
  {
    "url": "assets/js/19.0ef6d18e.js",
    "revision": "febafacb2bb71ea61caf960a515e4677"
  },
  {
    "url": "assets/js/20.f9f00376.js",
    "revision": "761c2320e3d64da735f296d448af715e"
  },
  {
    "url": "assets/js/21.0174c86d.js",
    "revision": "83ff6cf619170addc8f26212750e2bc9"
  },
  {
    "url": "assets/js/22.bf304af6.js",
    "revision": "5af6a0d5ce5127038109f60cb8824dd1"
  },
  {
    "url": "assets/js/23.67fbfbae.js",
    "revision": "56271c265e0ba85778dd418e9794ffb1"
  },
  {
    "url": "assets/js/24.13491854.js",
    "revision": "2b005e9e567bf6e077aa7870a7506cdc"
  },
  {
    "url": "assets/js/25.b91a31fa.js",
    "revision": "39cfbd11440d49f68cc82bf5f9f6e883"
  },
  {
    "url": "assets/js/26.d7c907d5.js",
    "revision": "fd59c943951b84c43c6840c0a3778bd7"
  },
  {
    "url": "assets/js/27.c4fd3e8f.js",
    "revision": "40f884e4c44490d34d1cad0a20bd3af7"
  },
  {
    "url": "assets/js/28.3c811814.js",
    "revision": "46d4fec843b463813d8f8d66c5a71426"
  },
  {
    "url": "assets/js/29.b0ecd0bd.js",
    "revision": "03261aa1031916eb32a25c6c6b92488c"
  },
  {
    "url": "assets/js/3.3b39e7a0.js",
    "revision": "2b21a7af885fae94cfa9f8c2da4c9968"
  },
  {
    "url": "assets/js/30.4de5466b.js",
    "revision": "6c4380304d91f09934737349f6a56099"
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
    "url": "assets/js/7.85eba70b.js",
    "revision": "391fc21af3570bf442f22599e30540f7"
  },
  {
    "url": "assets/js/8.c86ada2b.js",
    "revision": "01b291baba2f03d482f4d1e79ca27c49"
  },
  {
    "url": "assets/js/9.97d634f1.js",
    "revision": "953eca80eabd2b0d2e41e08ffdb31f09"
  },
  {
    "url": "assets/js/app.69ab4a99.js",
    "revision": "53a41e990c749dbf4cdb54e4991b2d7c"
  },
  {
    "url": "blogs/company-cli.html",
    "revision": "6a0d597262381fa08dd139fd86b9318e"
  },
  {
    "url": "blogs/div-center.html",
    "revision": "11f9d861577b83babb03e21c4af9b8c5"
  },
  {
    "url": "blogs/GraphQL-Apollo-Vue.html",
    "revision": "2aa88213bdaabee50fec1e5d24eb2cae"
  },
  {
    "url": "blogs/js-==.html",
    "revision": "bf956d9f62354f79b93e67950dcade5a"
  },
  {
    "url": "blogs/js-debounce-throttle.html",
    "revision": "eb293035c3e9c4ab6dd97625b8114575"
  },
  {
    "url": "blogs/js-memory-leak.html",
    "revision": "39724981c304c6dba7c0e3fabb463f78"
  },
  {
    "url": "blogs/js-this.html",
    "revision": "57aa9ca1e5ef35994a02ea6fc9bb508e"
  },
  {
    "url": "blogs/Koa2.html",
    "revision": "3be9120ff820a7bf8b2ed81c0c578e3b"
  },
  {
    "url": "blogs/node-vuepress-docker.html",
    "revision": "9c0839c2af1784bb3543c471cf90a315"
  },
  {
    "url": "blogs/react-native-mobx-app.html",
    "revision": "8f3927b3b464d3d21e5a5c5c1097228f"
  },
  {
    "url": "blogs/react-navigation.html",
    "revision": "53a01ede90b2e6c3d0dccbcc87623ec1"
  },
  {
    "url": "blogs/study-webpack3.html",
    "revision": "e37447680cf6738b13af1f28a8c937d6"
  },
  {
    "url": "blogs/svg-icon.html",
    "revision": "88c16b8438d99bc508d690b1fd43d538"
  },
  {
    "url": "blogs/system-update.html",
    "revision": "681c630aeb597196804b79c8731d4433"
  },
  {
    "url": "blogs/vscode-debugger.html",
    "revision": "c1ccb0079c79864a61264253ee14615d"
  },
  {
    "url": "blogs/vscode-ext.html",
    "revision": "2346d70d733e557468f70ba27d4311a0"
  },
  {
    "url": "blogs/vue-practice.html",
    "revision": "4e4e92c7016010fd301a3a5e99fb7c7f"
  },
  {
    "url": "blogs/vue-reactive.html",
    "revision": "6795a764802e0affc6d7bedc5ae36c11"
  },
  {
    "url": "blogs/vuecli-arcgis-js-api.html",
    "revision": "8567e412630a5d8da628383ae8d1a74e"
  },
  {
    "url": "categories/css/index.html",
    "revision": "e19293d968aa3133982c7b634ee4f7d9"
  },
  {
    "url": "categories/GraphQL/index.html",
    "revision": "322cf5bcc36ee0b231e8768e23d56ba0"
  },
  {
    "url": "categories/index.html",
    "revision": "1f30f426bb383addc0033684748b70f4"
  },
  {
    "url": "categories/js基础/index.html",
    "revision": "dad058e98b2919135dcd563a2fd97088"
  },
  {
    "url": "categories/koa2/index.html",
    "revision": "516a8e965ca08e0c4916a1ed123b1018"
  },
  {
    "url": "categories/react-native/index.html",
    "revision": "d9ccf32b51823fbca6527fa373072241"
  },
  {
    "url": "categories/tool/index.html",
    "revision": "5cf8065b523e4774afe2bb80df7da088"
  },
  {
    "url": "categories/vue/index.html",
    "revision": "ed6a44346a6ca667f3225f4c7dc61bae"
  },
  {
    "url": "categories/vue源码/index.html",
    "revision": "85217a75d9e5158f2676b1d3ed866493"
  },
  {
    "url": "categories/webpack/index.html",
    "revision": "61361e3b40e7c4dc91c021eb41000a4d"
  },
  {
    "url": "categories/前端工具/index.html",
    "revision": "b91fc586b5e60a772f853401638f9cd8"
  },
  {
    "url": "categories/工具/index.html",
    "revision": "4cd5d6796aa545b4a321b4182f23a58d"
  },
  {
    "url": "categories/性能优化/index.html",
    "revision": "439338e21eebe83c31d3ee01d534a8f5"
  },
  {
    "url": "categories/脚手架/index.html",
    "revision": "5089fac49e78f61166cbec11989fbee6"
  },
  {
    "url": "categories/重构/index.html",
    "revision": "99d89701d48305bd907a405b55b9fba2"
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
    "revision": "2c339e1b9b2b67f782744880ce50c769"
  },
  {
    "url": "tag/apollo/index.html",
    "revision": "35641f108e61bec3efa76bc599fed957"
  },
  {
    "url": "tag/arcgis/index.html",
    "revision": "bb5a9d22c1ad9c88ea613a45de080326"
  },
  {
    "url": "tag/css布局/index.html",
    "revision": "bead8edf461397aebcc263779265f01c"
  },
  {
    "url": "tag/docker/index.html",
    "revision": "3796ec91eb5507e217f414bd7b7b934d"
  },
  {
    "url": "tag/GraphQL/index.html",
    "revision": "8ba158654b9deaadc57f7adefdb410bf"
  },
  {
    "url": "tag/index.html",
    "revision": "878f2614fb1e0e7f722b0274ed361373"
  },
  {
    "url": "tag/js/index.html",
    "revision": "25f3d77b2768d551b15eb00754929187"
  },
  {
    "url": "tag/koa2/index.html",
    "revision": "773ac03b236bb4249c7e173a737e1832"
  },
  {
    "url": "tag/mobx/index.html",
    "revision": "bbefd4cdedf7a8e553dab2bf259507ff"
  },
  {
    "url": "tag/node/index.html",
    "revision": "ae881efbb9faa5ff7500fc36835a6638"
  },
  {
    "url": "tag/react-native/index.html",
    "revision": "275e3b9cacf7dbce4c2e8f647d3f052a"
  },
  {
    "url": "tag/react/index.html",
    "revision": "f4703d344675decc71bcca75877f9d82"
  },
  {
    "url": "tag/this/index.html",
    "revision": "466a6cdea5306ea7353af730bcdc077b"
  },
  {
    "url": "tag/tool/index.html",
    "revision": "4823e59d5e8bb86d55e9362e2b2c6a7c"
  },
  {
    "url": "tag/vscode/index.html",
    "revision": "a9ce11eb8e7b2aac1f03765f0d452f23"
  },
  {
    "url": "tag/vue/index.html",
    "revision": "67c113970fb13d8a7716506f7ed073d4"
  },
  {
    "url": "tag/vuepress/index.html",
    "revision": "c7fbc2ed1ebd09e8137bdf5f7d0b60cd"
  },
  {
    "url": "tag/webpack/index.html",
    "revision": "b72b757280d484e7050d81e39d79b47c"
  },
  {
    "url": "tag/前端工程化/index.html",
    "revision": "115bdc732aa16f3e708e81abdf9b9669"
  },
  {
    "url": "tag/前端架构/index.html",
    "revision": "f642858b1a880fe4fdf92b32150dfc43"
  },
  {
    "url": "tag/工具/index.html",
    "revision": "9cd11408084cc07b7e50e1287ebd8b90"
  },
  {
    "url": "tag/性能优化/index.html",
    "revision": "d938bd2e3be4ebc2aea803393eab4766"
  },
  {
    "url": "tag/源码学习/index.html",
    "revision": "a23d0dee81944cfb58a9f285ca320c7c"
  },
  {
    "url": "tag/脚手架/index.html",
    "revision": "d9517d1b092c41d279dfebb8cdc290fa"
  },
  {
    "url": "tag/重构/index.html",
    "revision": "5c18705f7122114d1c65170ad92cfced"
  },
  {
    "url": "timeline/index.html",
    "revision": "65379984ed4a69b35b22b00e3a6a2088"
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

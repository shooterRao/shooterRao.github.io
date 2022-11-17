---
title: webpack 3.X 学习笔记(一)
date: 2017-11-27
tags: [webpack]
categories: [webpack]
---

## 前言

不知不觉，webpack现在已经更新到3.8了，新版本增加了几种新功能，打包速度据说也大大提升，因为之前使用和配置的webpack都是2.0以下的，所以想紧跟大部队，继续学习新版本的webpack，顺便做些笔记

**---12月3号更新---**<br>
完善webpack打包配置文件，更全面，更高效

<!--more-->

**前期准备**

> * 1.npm install webpack -g (全局安装)
> * 2.创一个文件夹, npm init 然后接着npm install webpack --save-dev (局部安装)
> * 3.分别创建dist, src两个文件夹
> * 4.在根目录下创建webpack.config.js
> * 5.插件按需安装

## 配置webpack.config.js

```javascript
const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const UglifyJs = require('uglifyjs-webpack-plugin'); // 代码压缩插件
const htmlPlugin = require('html-webpack-plugin'); // html引入文件插件
const extractTextPlugin = require('extract-text-webpack-plugin'); // 把css从js文件中分离出来插件 
const PurifyCSSPlugin = require('purifycss-webpack'); // 消除没用到的css

const website = {
    publicPath: "http://localhost:8081/" 
}

module.exports = {
    entry: {
        entry:'./src/entry.js', 
       // entry2:'./src/entry2.js' 
    },
    output: {
        path: path.resolve(__dirname,'dist'),
        filename: '[name].js', //对应entry的属性名 
        publicPath: website.publicPath // 改为绝对路径
    },
    module: {
        // style-loader(处理路径),css-loader(处理标签)
        rules:[
            {
                test: /\.css$/,
               // use: ['style-loader','css-loader']
                // 
                use: extractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [{
                        loader: "css-loader", options: {importLoaders: 1}
                    },"postcss-loader"]
                })
            },{
                test:/\.(png|jpg|gif)/,
                use:[{
                    // url-loader主要把图片打包成base64
                    // 配合file-loader使用,file-loader可以解决引用路径的问题
                    loader:'url-loader', 
                    options:{
                        limit: 5000, //小于500000就生成base64
                        outputPath: 'images/'
                    }
                }]
            },{
                test:/\.(htm|html)$/i,
                use:['html-withimg-loader']
            },
            {
                test: /\.less$/,
                // less和scss配置方法一样
                use: extractTextPlugin.extract({
                    use: [{
                        loader: "css-loader"
                    },"postcss-loader",{
                        loader: "less-loader"
                    },],
                    fallback: "style-loader"
                })
            },{
                test:/\.js$/,
                use:{
                    loader: 'babel-loader'
                },
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
      //  new UglifyJs(), // 压缩代码
        new htmlPlugin({
            minify:{
                removeAttributeQuotes: true
            },
            hash: true, // 哈希，不产生缓存
            template: './src/index.html' // 入口文件
        }),
        // 把css文件从js中分离
        new extractTextPlugin("css/index.css"),
        new PurifyCSSPlugin({
            paths: glob.sync(path.join(__dirname,"src/*.html"))
        })
    ],// 插件
    devServer: {
        contentBase:path.resolve(__dirname,'dist'),
        host:'localhost',
        compress:true,// 是否启用服务器压缩
        port:8081 // 端口
    }
}

```
我比较喜欢代码+注释这种方式来记录笔记，这样看起来不会那么乏味

最后，在package.json的scripts中添加"server": "webpack-dev-server"
这个主要是可以通过**npm run server**方式来开启webpack提供的服务,热更新在新版本的webpack已经默认开启了

## 新增
使用css自动补全前缀插件,和babel编译插件,需要在文件根目录下，也就是和webpack.config.js同一路径下,分别创建**.postcss.config.js**和**.babelrc**配置文件

在**.postcss.config.js**文件中,编写
```
module.exports = {
    plugins: [
        require('autoprefixer')
    ]
}
```
在**.babelrc**文件中,编写
```
{
    "presets": [
        "env"
    ]
}
```

使用babel需要安装的插件有**babel-core babel-preset-env**
以后还可以使用**babel-plugin-transform-runtime**这个比较有用的插件

**注意**<br>

在webpack配置文件里，module里面用到的loader,plugins里面用到的插件，都需要用npm安装，如果网速不给力，可以使用cnpm或者配置npm
```
npm config set registry https://registry.npm.taobao.org --global
npm config set disturl https://npm.taobao.org/dist --global
```


## 本篇小结
webpack3.0往后的版本配置简洁了不少，蛮好的，这篇暂时就写这么多，有空会继续更新~


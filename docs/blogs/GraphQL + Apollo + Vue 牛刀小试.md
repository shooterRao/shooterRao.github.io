---
title: GraphQL + Apollo + Vue 牛刀小试
date: 2019-05-25 09:41:52
tags: [GraphQL, Apollo]
categories: [GraphQL]
---

## 前言

GraphQL 这门新技术在去年就开始火热起来，今年也在很多技术周刊、论坛上看到关于这门新技术的研究和讨论。因此作为一名前端开发，紧跟技术潮流是必须的 🤣，周末便花了点时间对 GraphQL 进行了相关学习，学习过程中写了一些简单的 demo，在此过程中发现这玩意是真的香啊，所以决定要开篇博客来记录下这个过程。

<!--more-->

### 什么是 GraphQL ？

当学习一本新技术时，首先就要去了解这门新技术的定位和一些相关概念，然后就要去研究它的诞生能够解决哪些痛点和带来哪些爽点。我个人习惯是直接去[官方文档](https://graphql.cn/)找到这些疑问的答案。打开官网，你就看到了下面有很醒目的一句话：

> 一种用于 API 的查询语言

还附加了几句很有意思的话：

- 请求你所要的数据，不多不少
- 获取多个资源，只用一个请求
- 描述所有的可能的类型系统
- 支持多种语言 (js、java、go)

说实话我看到这些第一反应就是感觉很酷，但也给我带来了很多疑惑，单从纸面上看还是比较难理解的，没有实际操作的话就很难体会上面说的那些特征。所以我开始了一波学习和 demo 的尝试 🤔

GraphQL 一些关键概念包含 `Type`，`Schema`， `Query`, `Mutation`等，下面会分别做一下简单的说明，具体还是要结合实际代码进行分析。

### 查询 (Query)

顺着文档看，首先就看到到了关于**查询**的相关使用，所谓的查询就是向服务端获取你要想的数据，比如我要查所有的用户列表，

```
// 先定义 User 数据结构
type User {
  id: Int!
  name: String!
  age: Int!
}

// query 查询
query {
  // 返回一个User类型的集合
  userList() : [User!]
  // 可以传参查询
  // 根据id查询用户信息
  orderUser(id: Int!) : User
}
```

在 `REST` 风格接口应该是这样子的

```
GET /api/v1/userList
GET /api/V1/userList/:id/
```

这时候，你会对`GraphQL`的解析---**查询语言**会有点小小的感触了

还有，`query`和`type`的使用息息相关，所以在使用`query`的时候，一定要先去了解`type`类型系统，关于`type`类型系统在[官网的文档](https://graphql.cn/learn/schema/#type-system) 上已经写得非常详细，这里我就不具体说了

### 变更 (Mutation)

GraphQL 中的 `Mutation` 是用来改变服务器上的数据的。对应着 `REST` 风格中的 `PUT`,`DELETE`,`POST`。`Mutation`的语法风格和`Query`很类似。关键在解析`Mutation`过程中会有所不同。还有值得注意的是，**查询字段时，是并行执行，而变更字段时，是线性执行，一个接着一个。**

比如说，我要变更一个用户`user`的名字

```
mutation {
  // 通过参数 id 去查到对应的用户信息
  MutationUserName(id: Int!, name: String!) : User!
}

// 解析 MutationUserName DEMO

Mutation: {
  MutationUserName(_, { id, name }) {
    const user = userList.find(val => val.id === id);

      if (!user) {
        throw new Error(`找不到id为 ${id} 的user`);
      }

      user.name = name

      return user;
    }
  }

```

### Schema

在 GraphQL 中，`Schema` 主要是用来描述数据的形态，哪些数据能被查询到，所以在 `Schema` 中主要定义可用数据的数据类型。这么说吧，你想要查到的数据都必须要在 `Schema` 中进行定义，所以这里是需要写很多 `type` 的，这里还需要统一定义 `Query` 和 `Mutation`，也就是要把上面那些定位全部放到这里来

🌰:

```
type User {
  id: Int!
  name: String!
  age: Int!
}

type Query {
  userList() : [User]
  orderUser(id: Int!) : User
}

mutation {
  MutationUserName(id: Int!, name: String!) : User
}
```

很很基础的内容大概就是酱紫，下面应该要开始来一波实战操作了

### Apollo-GraphQL

> Apollo-GraphQL 是基于 GraphQL 封装的一种实现，它可以在服务上进行分层，包括 `REST` api 和 数据库，它包含客户端和服务端，还有 GUI 开发工具，让开发人员可以快速上手进行开发。

![架构图](https://raw.githubusercontent.com/apollographql/apollo/HEAD/docs/source/img/platform-diagram.png)

我在 google 关于 GraphQL 的时候，就发现了这个平台，在官方文档上看到了一些讲解和入门练习。发现其入口门槛其实并不高，安装几个依赖便可快速启动服务端，客户端也支持了 `vue`、`react/rn`、`ng`等热门的前端框架。我这里的 demo 也是根据文档教学一步步做出来的，下面就来讲讲我的 demo 实现过程和一些思路。

### 开始实战

**具体想法**

- 以搭建博客网站为例，有博客列表、分类、博客信息 (query)
- 点击某个博客，跳转到具体文章内容，返回时有已读标注 (mutation)
- 服务端使用 apollo-server-express
- 客户端使用 vue-apollo
- 数据为 mock 的静态 json

#### 搭建服务端

这边采用 `apollo-server-express` 快速搭建服务端

首先安装依赖

```
yarn add apollo-server-express express graphql
```

好，这个 demo 只需要上面三个工具

对于`apollo-server`，比较基本的就是要搞清楚 [schema](https://www.apollographql.com/docs/tutorial/schema) 和 [resolvers](https://www.apollographql.com/docs/tutorial/resolvers) 应该如何定义，这些理解起来还是比较容易，但如果想玩得很溜，肯定需要投入大量的时间去研究。

其实就是

```js
const server = new ApolloServer({
  typeDefs,
  resolvers
});
```

定义好 typeDefs(schema) 和 resolvers，便可快速启动

首先，把 mock 的数据源定好

```json
[
  {
    "id": 1,
    "title": "记一次系统前端底层升级总结",
    "date": "2018-11-11",
    "introduction": "最近参与了一个比较大的类后台管理系统的前端开发(vue技术栈)，并负责了该系统的底层升级，升级过程期间，遇到了不少问题，在解决问题的过程中学到了很多，趁着今天双11没啥事做，那么就花点时间总结下升级系统的过程吧",
    "category": "vue",
    "isRead": false
  },
  {
    "id": 2,
    "title": "Vue实践小结(长期更新)",
    "date": "2018-11-04",
    "introduction": "近期都在用 Vue 全家桶进行项目开发，过程中难免会遇到不少问题，这篇博客主要就是记录开发过程中遇到的问题，和每个问题对应的解决方案。此外，Vue 框架和周边生态会一直更新，以及发布新功能，在实践过程中总会遇到一些所谓的“坑”，我也会把填坑过程记录于此。坑是填不完的，这篇博客也是写不完的。",
    "category": "vue",
    "isRead": false
  },
  {
    "id": 3,
    "title": "如何用Koa2返回文本和图片流以及解决乱码事件",
    "date": "2018-04-05",
    "introduction": "前两天做项目的时候，碰到了一个要在客户端(浏览器)中实现预览 txt 文档和图片的小需求，在开发过程中遇到了一些有趣的小插曲---客户端读取 txt 时出现各种奇怪乱码，图片就没问题。一时半会还没找到好的解决方法，因为那天又刚好周五，所以在周末的时候，我决定宅在家里好好研究如何解决这个有趣的现象。",
    "category": "koa2",
    "isRead": false
  }
][
  ({
    "id": 1,
    "html": "<h1>记一次系统前端底层升级总结</h1>"
  },
  {
    "id": 2,
    "html": "<h1>Vue实践小结(长期更新)</h1>"
  },
  {
    "id": 3,
    "html": "<h1>如何用Koa2返回文本和图片流以及解决乱码事件</h1>"
  })
]
```

然后，要开始思考如何定义 Schema 中的 type

我这边一共定义了以下这些 type

```js
type Article {
  id: Int!
  title: String!
  date: String!
  introduction: String!
  category: String
  isRead: Boolean!
}

type ArticleContent {
  id: Int!
  html: String!
}

type Category {
  num: Int!,
  name: String!
}

type Query {
  fetchArticles: [Article]
  getAllCategories: [Category]
  getArticleContent(id: Int!): ArticleContent
}

type Mutation {
  articleIsRead(id: Int!): Article
}
```

把 这些 schema 转换为 typeDefs, 需要用到

```js
const { gql } = require("apollo-server-express");

module.exports = gql`上面定义的type`;
```

定义 resolvers

`resolvers` 其实是 `query` 和 `mutation` 的实现过程。也就是说这里会进行数据库的查询或者是 api 的调用等等，最终放回的结果在这里出来。

我这边的实现大概是这样的

```js
const articles = require("../data/articles.json");
const articleContent = require("../data/articleContent.json");

const resolvers = {
  Query: {
    fetchArticles() {
      return articles;
    },
    getAllCategories() {
      return articles.reduce((pre, cur) => {
        const cate = pre.find(_ => _.name === cur.category);
        if (cate) {
          cate.num++;
        } else {
          const obj = {
            name: cur.category,
            num: 1
          };
          pre.push(obj);
        }
        return pre;
      }, []);
    },
    getArticleContent(_, { id }) {
      return articleContent.find(val => val.id === id);
    }
  },

  Mutation: {
    // 标记已读
    articleIsRead(_, { id }) {
      const article = articles.find(val => val.id === id);

      if (!article) {
        throw new Error(`找不到id为 ${id} 的文章`);
      }

      if (article.isRead) {
        return article;
      }

      article.isRead = true;

      return article;
    }
  }
};

module.exports = resolvers;
```

好了，typeDefs 和 resolvers 搞定了，写点服务器启动脚本

```js
const express = require("express");
const { ApolloServer } = require("apollo-server-express");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");

const PORT = 4000;

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: {
    endpoint: `/graphql`,
    settings: {
      "editor.theme": "light"
    }
  }
});

server.applyMiddleware({ app });

app.listen(PORT, () =>
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  )
);
```

然后 `node server.js` 一下看看

启动不报错的话，在浏览器`http://localhost:4000/graphql`可以看到图形化页面

![gql-ui](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/gql-ui.png)

试试 query 查询

![gql-query](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/gql-query.png)

服务端搭建完成 🎉

#### 客户端搭建

最近在用 vue 比较多，所以就直接用 `vue create xxx` 进行一顿操作来弄了，主要也是基于 [vue-apollo 文档](https://vue-apollo.netlify.com/zh-cn/guide/) 进行学习和编写

安装？

`yarn add vue-apollo graphql apollo-boost`

```js
import Vue from "vue";
import ApolloClient from "apollo-boost";
import VueApollo from "vue-apollo";

Vue.use(VueApollo);

const apolloClient = new ApolloClient({
  // 你需要在这里使用绝对路径
  uri: "http://localhost:4000/graphql"
});

const apolloProvider = new VueApollo({
  defaultClient: apolloClient
});

new Vue({
  el: "#app",
  apolloProvider,
  render: h => h(App)
});
```

配置支持 `.gql || .graphql` 文件后缀的 webpack loader

vue.config.js

```js
module.exports = {
  // 支持 gql 文件
  chainWebpack: config => {
    config.module
      .rule("graphql")
      .test(/\.(graphql|gql)$/)
      .use("graphql-tag/loader")
      .loader("graphql-tag/loader")
      .end();
  }
};
```

这样就可以导入`xxx.gql`文件了，不一定非要在`.vue`文件或者`.js`文件里面写查询语句了

就是这么简单 😁

so，使用？

接下来就试一下查询多个数据，比如说一起查询博客文章列表和分类信息。验证一下是不是官方说的**获取多个资源，只用一个请求**那么神奇

```js
import gql from "graphql-tag";

const fetchDataGql = gql`
  {
    fetchArticles {
      id
      title
      date
      introduction
      category
      isRead
    }
    getAllCategories {
      num
      name
    }
  }
`;

export default {
  data() {
    return {
      articles: [],
      categories: []
    };
  },
  apollo: {
    fetchData() {
      const vm = this;
      return {
        query: fetchDataGql,
        update(data) {
          vm.articles = data.fetchArticles;
          vm.categories = data.getAllCategories;
        }
      };
    }
  }
};
```

打开浏览器控制台看看

![vue-gql-query](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/vue-gql-query.png)

确实是只有一次请求就能获取到一个页面上所有的资源！最近在做项目的时候，遇到一个页面要请求 5 个`REST`接口，有些接口经常返回了很多页面上用不到的，简单来说就是多余的数据，这样不仅浪费了服务器资源，前后端对接起来也不方便，所以 GraphQL 可以很好地解决这个痛点，真是香啊!

ui 界面上随便写点

![vue-apollo-article](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/vue-apollo-article.png)

好了，查询搞定了，下面试试 变更`mutation`

需求是点击某篇文章，让这篇文章的 title 有个已读标识(opacity: 0.4)

服务端那边已经定义好，客户端代码核心实现

```js
const mArticleISRead = gql`
  mutation articleIsRead($id: Int!) {
    articleIsRead(id: $id) {
      id
      title
      date
      introduction
      category
      isRead
  }
}
`
methods: {
  mutationIsRead(id) {
    this.$apollo.mutate({
      mutation: mArticleISRead,
      variables: {
        id
      },
      update: (store, { data: { articleIsRead } }) => {
        console.log(articleIsRead);
      }
    });
  }
},

```

模板层增加一些判断

```html
<router-link
  :class="{isRead: item.isRead}"
  @click.native="mutationIsRead(item.id)"
  :to="{ name: 'content', params: { id: item.id } }"
>
  {{ item.title }}
</router-link>
```

测试

![vue-apollo-mutation](https://img-1257816861.cos.ap-guangzhou.myqcloud.com/vue-apollo-mutation.png)

done！

写到这里，让我感觉好奇的是，我重新跳转回 article 页面，**并没有重新触发 ajax 请求**，后来看了文档才发现这是由于 Apollo-GraphQL 自带了运行时的 [cache](https://www.apollographql.com/docs/react/recipes/performance#cache-redirects)，变更数据的某个字段是不需要重新去获取最新的列表的，Apollo 会智能去识别然后自动触发视图的 render。这样的话，我在想，这样既然了 Apollo 的缓存机制，是不是就不需要像 vuex、redux、mobX 这些状态管理工具了呢？毕竟都是运行时的数据，如果 Apollo 的 cache 机制能解决状态管理层面上的问题，那么会减少很多项目层级的复杂度吧。凭空想是想不出的，只有在实际项目中才能找到真正的答案。

好了，GraphQL 的服务端和客户端均已搭建，一些自身的想法也得到了相关印证，不断探索、不断验证想法正是学习的一种乐趣 😁

上面代码均已上传到 [github](https://github.com/shooterRao/GraphQL-demo)

### 总结

GraphQL 牛刀小试结束。关于 GraphQL 以后能不能取代 RESTapi 还是一个很富有争议的话题。REST 已经发展多年，它解决了以前的不少问题但也留下了不少问题，GraphQL 还是比较新的，相信还有很多人都不知道有这个技术，即使它已诞生了好多年...还是那句话，每个新的技术的诞生，必然是为了解决某些问题，以及提高生产效率，这样才有它们存在的价值和意义。

关键技术：

nodejs

vuepress

gitlab api

部署：

pm2

docker && docker-compose

自动化部署

webhook

koa2



通过 gitlab api 拉取文档和图片(图片可以不拉) -> 生成vuepress配置文件config.js -> 打包 -> docker 打包镜像部署

自动化部署接口监听 -> 重新打包部署


#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
yarn build

# 进入生成的文件夹
cd .vuepress/dist

echo "Generating a CNAME file..."
echo "shooterblog.site" > CNAME

git init
git add -A
git commit -m '🎉deploy'

# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:shooterRao/shooterRao.github.io.git master:master

cd -
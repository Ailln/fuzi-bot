# fuzi view

[![Apache2 License](https://img.shields.io/badge/license-Apache2-orange.svg)](https://github.com/Ailln/fuzi-view/blob/main/LICENSE)
[![stars](https://img.shields.io/github/stars/Ailln/fuzi-view.svg)](https://github.com/Ailln/fuzi-view/stargazers)
[![forks](https://img.shields.io/github/forks/Ailln/fuzi-view.svg)](https://github.com/Ailln/fuzi-view/network/members)

🤖️ 聊天机器人——`夫子`的交互界面。

## 1 简介

`夫子` 聊天机器人有 5 个模块组成：
1. [fuzi-view](https://github.com/Ailln/fuzi-view): 聊天界面模块，与用户进行交互。
2. [fuzi-nlu](https://github.com/Ailln/fuzi-nlu): 自然语言处理模块，理解用户的问题。
3. fuzi-core: 对话管理模块，推断用户的意图。
4. fuzi-admin: 后台管理模块，管理机器人的设置。
5. fuzi-mark: 数据标注模块，标注用户的问题。

## 2 预览

![预览](.github/fuzi-preview.png)

[>> 点我立即尝试 <<](https://fuzi.ailln.com)

## 3 快速上手

```bash
git clone https://github.com/Ailln/fuzi-view.git

cd fuzi-view
# 安装依赖
npm install

npm run start
# 打开 http://localhost:8000
```

## 4 部署

### 4.1 Docker

```bash
cd fuzi-view
docker build -t fuzi-view:1.0.0 .

docker run -d -p 8000:80 --name fuzi-view fuzi-view:1.0.0
# 打开 http://localhost:8000
```

### 4.2 Kubernetes

```bash
cd fuzi-view
# 准备好镜像
kubectl apply -f deploy/deployment.yaml
# 打开 http://localhost:30100
```

## 5 参考

- [Ant Design](https://ant.design/)
- [React](https://reactjs.org/)

## 6 许可证

[![](https://award.dovolopor.com?lt=License&rt=Apache2&rbc=orange)](./LICENSE)
[![](https://award.dovolopor.com?lt=Ailln's&rt=idea&lbc=lightgray&rbc=red&ltc=red)](https://github.com/Ailln/award)

## 7 交流

请添加微信号：`Ailln_`，备注「fuzi」，我邀请你进入交流群。

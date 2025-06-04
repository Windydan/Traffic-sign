# 交通标志识别系统

## 一键安装依赖

### 后端依赖（Python）
```bash
pip install -r requirements.txt
```

### 前端依赖
本项目前端为原生HTML+JS+CSS，无需额外安装依赖。

## 启动项目

### 1. 启动后端服务
进入 backend 目录，运行：
```bash
python app.py
```
后端服务默认监听 http://localhost:5000

### 2. 启动前端页面
直接用浏览器打开 frontend/index.html 即可。

## 访问方式
- 在前端页面上传图片，后端会自动识别并返回结果。

## 备注
- 如需在服务器部署，建议用 nginx 或其它 web 服务器托管前端静态文件。
- 如遇依赖问题，请确保 Python 版本 >= 3.8。
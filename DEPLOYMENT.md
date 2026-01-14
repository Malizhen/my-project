# 部署指南 - Vercel

本文档介绍如何将心情日记应用部署到 Vercel 线上环境。

## 📋 部署前准备

### 1. 确保项目可以正常构建

在部署之前，先在本地测试构建：

```bash
# 安装依赖（如果还没有安装）
npm install

# 本地测试构建
npm run build

# 预览构建结果
npm run preview
```

如果构建成功，会在 `dist` 目录生成静态文件。

### 2. 将项目上传到 Git 仓库

Vercel 支持从 GitHub、GitLab 或 Bitbucket 部署。推荐使用 GitHub：

```bash
# 初始化 git（如果还没有初始化）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Ready for deployment"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/your-username/your-repo.git

# 推送到 GitHub
git push -u origin main
```

## 🚀 部署到 Vercel

### 方法一：通过 Vercel 网站部署（推荐）

1. **注册/登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录（推荐）

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置项目**
   - **Project Name**: 自定义项目名称（会成为域名的一部分）
   - **Framework Preset**: Vercel 会自动检测为 Vite
   - **Root Directory**: 保持默认 `./`
   - **Build Command**: `npm run build`（自动填写）
   - **Output Directory**: `dist`（自动填写）
   - **Install Command**: `npm install`（自动填写）

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待 1-2 分钟，部署完成
   - 你会获得一个免费域名：`your-project.vercel.app`

### 方法二：通过 Vercel CLI 部署

1. **安装 Vercel CLI**

```bash
npm install -g vercel
```

2. **登录 Vercel**

```bash
vercel login
```

3. **部署项目**

```bash
# 在项目根目录执行
vercel

# 首次部署会询问一些问题：
# ? Set up and deploy "~/Documents/my-project"? [Y/n] y
# ? Which scope do you want to deploy to? [选择你的账号]
# ? Link to existing project? [N/y] n
# ? What's your project's name? [输入项目名称]
# ? In which directory is your code located? ./
```

4. **部署到生产环境**

```bash
vercel --prod
```

## 🔄 自动部署

一旦项目连接到 Vercel，每次推送到 GitHub 都会自动触发部署：

- **主分支**（main/master）→ 自动部署到生产环境
- **其他分支** → 自动生成预览环境

```bash
# 提交代码并推送
git add .
git commit -m "更新功能"
git push origin main

# Vercel 会自动检测并部署
```

## 🌐 配置自定义域名

1. 进入 Vercel 项目页面
2. 点击 "Settings" → "Domains"
3. 输入你的域名（需要提前购买）
4. 根据提示在域名服务商处添加 DNS 记录
5. 等待 DNS 生效（通常几分钟到几小时）

## 📊 查看部署状态

- **访问地址**: https://vercel.com/dashboard
- 查看每次部署的日志和状态
- 查看访问统计和性能指标

## ⚙️ 环境变量配置

如果未来需要添加环境变量（如 API 密钥）：

1. 进入项目 Settings → Environment Variables
2. 添加变量名和值
3. 选择应用环境（Production/Preview/Development）
4. 重新部署项目

## 🔍 故障排查

### 构建失败

查看 Vercel 部署日志，常见问题：

- **依赖安装失败**: 检查 `package.json` 中的依赖版本
- **构建命令错误**: 确认 `npm run build` 本地可以成功
- **内存不足**: 大型项目可能需要升级 Vercel 计划

### 路由 404 问题

- 已配置 `vercel.json` 的路由重写规则
- 所有路由都会指向 `index.html`，由 React Router 处理

### 页面空白

- 检查浏览器控制台是否有错误
- 确认资源路径是否正确（绝对路径 vs 相对路径）

## 📱 测试部署结果

部署成功后，访问你的 Vercel 域名，测试以下功能：

- ✅ 页面正常加载
- ✅ 路由跳转正常
- ✅ 新增日记功能
- ✅ 数据存储（LocalStorage）
- ✅ 统计图表显示
- ✅ 移动端响应式

## 🎯 优化建议

### 性能优化

1. **启用 Gzip 压缩**: Vercel 默认已启用
2. **CDN 加速**: Vercel 全球 CDN 自动启用
3. **代码分割**: 已在 `vite.config.js` 中配置

### SEO 优化

如果需要 SEO，可以：
- 添加 `<meta>` 标签到 `index.html`
- 配置 Open Graph 标签
- 添加 `robots.txt` 和 `sitemap.xml`

### 监控和分析

可集成：
- **Vercel Analytics**: 免费的性能分析
- **Google Analytics**: 用户行为分析

## 📞 需要帮助？

- Vercel 文档: https://vercel.com/docs
- Vite 文档: https://vitejs.dev/guide/
- 项目 GitHub Issues

---

## 🎉 快速部署清单

- [ ] 本地测试 `npm run build` 成功
- [ ] 代码推送到 GitHub
- [ ] 在 Vercel 导入项目
- [ ] 配置构建设置
- [ ] 点击 Deploy
- [ ] 访问生成的域名测试
- [ ] （可选）配置自定义域名

祝你部署顺利！🚀

# 网页版记账本应用

一个基于 React + Ant Design 的轻量级个人记账本应用。

## 功能特性

- ✅ 收支记录管理（添加、编辑、删除）
- ✅ 收支分类管理（预设分类 + 自定义分类）
- ✅ 数据筛选与搜索
- ✅ 月度统计与图表展示
- ✅ 数据本地存储（LocalStorage）
- ✅ 响应式设计（支持移动端）

## 技术栈

- **前端框架**: React 18
- **UI 组件库**: Ant Design 5
- **路由管理**: React Router 6
- **图表库**: Chart.js + react-chartjs-2
- **构建工具**: Vite
- **日期处理**: dayjs

## 安装依赖

```bash
npm install
```

## 运行项目

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动

### 生产构建

```bash
npm run build
```

构建产物将生成在 `dist` 目录

### 预览构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/          # 通用组件
│   └── Layout/         # 布局组件
├── context/            # Context 状态管理
│   └── AppContext.jsx  # 应用全局状态
├── pages/              # 页面组件
│   ├── Home/          # 首页总览
│   ├── AddRecord/     # 记账页面
│   ├── Records/       # 记录列表
│   ├── Statistics/    # 统计分析
│   └── Categories/    # 分类管理
├── utils/              # 工具函数
│   ├── constants.js   # 常量定义
│   ├── storage.js     # LocalStorage 封装
│   ├── validation.js  # 数据验证
│   └── calculations.js # 数据计算
├── App.jsx            # 根组件
└── main.jsx           # 入口文件
```

## 数据存储

应用使用浏览器 LocalStorage 存储数据，包括：

- `expense_records`: 所有收支记录
- `expense_categories`: 所有分类信息

**注意**: 数据仅存储在本地浏览器，清除浏览器数据会导致记录丢失。建议定期导出数据备份。

## 功能说明

### 首页
- 显示本月收入、支出、结余统计
- 提供快速操作入口

### 记账
- 支持添加收入/支出记录
- 可选择分类、日期、添加备注
- 表单验证确保数据有效性

### 记录列表
- 查看所有记录
- 按类型、分类、日期范围筛选
- 关键词搜索
- 编辑和删除记录

### 统计分析
- 选择月份查看统计
- 收入/支出分类占比饼图
- 详细的分类金额列表

### 分类管理
- 查看预设分类和自定义分类
- 添加自定义分类
- 编辑/删除自定义分类
- 预设分类不可修改

## 浏览器兼容性

支持所有现代浏览器（Chrome、Firefox、Safari、Edge）

需要浏览器支持 LocalStorage API

## 开发说明

本项目采用 Vite 作为构建工具，支持热更新。

主要依赖版本：
- React 18.2
- Ant Design 5.12
- React Router 6.20
- Chart.js 4.4

## License

MIT

# 心情日记应用

一个基于 React 的心情日记 Web 应用，帮助用户记录每日心情状态、撰写日记内容，并通过可视化统计了解自己的情绪变化趋势。

## 技术栈

- React 18.2 + Vite 5.0
- Ant Design 5.12
- React Router 6.20
- Chart.js 4.4 + react-chartjs-2
- dayjs 1.11
- LocalStorage数据存储

## 已完成功能

### 第一阶段（核心功能MVP）✅

1. **工具文件**
   - moodConstants.js - 心情常量定义（5级情绪模型）
   - moodStorage.js - LocalStorage数据存储操作
   - moodValidation.js - 表单验证规则
   - moodCalculations.js - 统计计算工具

2. **全局状态管理**
   - MoodContext - 管理日记数据、标签数据、筛选条件

3. **核心组件**
   - MoodSelector - 心情选择器（5级情绪：非常开心/开心/平静/难过/很难过）
   - JournalCard - 日记卡片组件（显示心情、标题、内容摘要、标签）

4. **页面功能**
   - 首页概览 - 展示最近日记和快速操作入口
   - 新增/编辑日记 - 完整的表单功能（日期、心情、标题、内容、标签）
   - 日记列表 - 支持分页加载、批量删除、数据导出
   - 日记详情 - 完整展示单条日记内容
   - 导航系统 - 底部导航栏，支持页面切换

### 第二阶段（完善体验）✅

5. **标签管理**
   - MoodTags - 标签列表展示、新增、编辑、删除
   - 使用次数统计
   - 搜索和排序

### 第三阶段（数据分析）✅

6. **统计分析**
   - MoodStatistics - 完整的统计分析页面
   - 统计卡片（总记录数、连续记录天数、平均心情值、最常心情）
   - 心情趋势图（折线图，30天）
   - 心情分布图（饼图）
   - 热门标签排行（Top 10）
   - 时间范围选择器

## 核心特性

### 5级心情模型
- 😄 非常开心 (5分) - 亮黄色
- 🙂 开心 (4分) - 浅绿色
- 😐 平静 (3分) - 浅蓝色
- 😔 难过 (2分) - 浅灰色
- 😢 很难过 (1分) - 深灰色

### 数据存储
- 使用浏览器 LocalStorage 本地存储
- 存储键名：
  - `mood_journal_entries` - 所有日记记录
  - `mood_journal_tags` - 标签列表
  - `mood_journal_settings` - 用户设置

### 标签系统
- 预设标签：工作、学习、家庭、朋友、运动、娱乐、旅行、健康
- 支持自定义新建标签
- 每条日记最多5个标签

## 安装和运行

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:5173` 运行

### 构建生产版本
```bash
npm run build
```

## 项目结构

```
src/
├── components/
│   ├── Layout/              # 布局组件
│   ├── MoodSelector/        # 心情选择器
│   └── JournalCard/         # 日记卡片
├── context/
│   └── MoodContext.jsx      # 全局状态管理
├── pages/
│   ├── Home/                # 首页
│   ├── AddJournal/          # 新增/编辑日记
│   ├── JournalList/         # 日记列表
│   ├── JournalDetail/       # 日记详情
│   ├── Statistics/          # 统计分析（待完善）
│   └── Categories/          # 标签管理（待完善）
├── utils/
│   ├── moodConstants.js     # 常量定义
│   ├── moodStorage.js       # 数据存储
│   ├── moodValidation.js    # 表单验证
│   └── moodCalculations.js  # 统计计算
├── App.jsx                  # 应用入口
└── main.jsx                 # 主文件
```

## 功能路由

| 路由 | 页面 | 功能 |
|------|------|------|
| / | 首页 | 展示最近日记和统计概览 |
| /add | 新增日记 | 创建新的日记记录 |
| /edit/:id | 编辑日记 | 编辑已有日记 |
| /journals | 日记列表 | 查看所有日记，支持筛选和批量操作 |
| /journals/:id | 日记详情 | 查看单条日记完整内容 |
| /statistics | 统计分析 | 查看心情趋势和统计数据（开发中） |
| /tags | 标签管理 | 管理自定义标签（开发中） |

## 开发计划

### 第四阶段（优化增强）- 待开发
- [ ] FilterPanel - 高级筛选面板
- [ ] MoodCalendar - 本周心情日历组件
- [ ] 完善首页概览（本周心情概况）
- [ ] 数据导入功能完善
- [ ] 响应式布局优化
- [ ] 动画效果和交互细节
- [ ] 性能优化

## 数据格式

### 日记记录结构
```javascript
{
  id: "时间戳_随机数",
  date: "2026-01-12T12:00:00.000Z",
  mood: {
    name: "开心",
    value: 4,
    icon: "🙂",
    color: "#90EE90"
  },
  title: "今天的日记",
  content: "今天心情很不错...",
  tags: ["工作", "学习"],
  createdAt: "2026-01-12T12:00:00.000Z",
  updatedAt: "2026-01-12T12:00:00.000Z"
}
```

## 注意事项

1. **数据存储**：所有数据存储在浏览器的 LocalStorage 中，清除浏览器数据会导致记录丢失
2. **数据备份**：建议定期使用导出功能备份数据
3. **浏览器兼容**：支持 Chrome、Firefox、Safari、Edge 最新版本
4. **存储限制**：LocalStorage 建议不超过 5MB

## 许可证

MIT License

## 作者

心情日记应用 ©2026

# MaiBot 插件仓库网站

🎵 一个现代化的 MaiBot 插件展示和管理平台

## 📖 项目简介

MaiBot 插件仓库网站是一个基于 Vue 3 构建的现代化 Web 应用，专为展示和管理 MaiBot 插件而设计。用户可以通过这个平台浏览、搜索和了解各种 MaiBot 插件，获取插件的详细信息、下载链接等。

## ✨ 主要功能

- 🔍 **智能搜索** - 支持按插件名称、描述、标签等多维度搜索
- 📋 **多视图模式** - 支持网格视图和列表视图切换
- 🎨 **现代化UI** - 基于 Tailwind CSS 和 DaisyUI 的现代化界面设计
- 🌙 **主题切换** - 支持明暗主题切换
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 📄 **分页浏览** - 支持分页浏览大量插件
- 🏷️ **标签分类** - 基于插件类别和关键词的标签系统
- 📊 **插件详情** - 详细的插件信息展示，包括作者、版本、许可证等
- 🔗 **外链跳转** - 支持跳转到插件仓库和主页

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **CSS 框架**: Tailwind CSS + DaisyUI
- **图标**: Iconify Vue
- **开发语言**: JavaScript
- **包管理器**: pnpm

## 📦 项目结构

```
plugin-repo-web/
├── public/                 # 静态资源
│   └── maimai.ico         # 网站图标
├── src/                   # 源代码
│   ├── App.vue           # 主应用组件
│   ├── main.js           # 应用入口
│   ├── style.css         # 全局样式
│   ├── theme-switcher.js # 主题切换逻辑
│   └── assets/           # 资源文件
├── index.html            # HTML 模板
├── package.json          # 项目配置
├── vite.config.js        # Vite 配置
├── tailwind.config.cjs   # Tailwind 配置
└── postcss.config.cjs    # PostCSS 配置
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- pnpm (推荐) 或 npm

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 开发环境

```bash
# 启动开发服务器
pnpm dev

# 或使用 npm
npm run dev
```

访问 `http://localhost:5173` 查看应用

### 构建生产版本

```bash
# 构建生产版本
pnpm build

# 或使用 npm
npm run build
```

### 预览生产版本

```bash
# 预览构建结果
pnpm preview

# 或使用 npm
npm run preview
```

## 🔧 配置说明

### 插件数据源

应用从以下 API 获取插件数据：
```
https://raw.githubusercontent.com/MaiM-with-u/plugin-repo/main/plugin_details.json
```

### 主题配置

项目支持明暗主题切换，主题配置在 `tailwind.config.cjs` 中定义：

- 明亮主题: `emerald`
- 暗色主题: `forest`

### 响应式设计

项目采用移动优先的响应式设计：

- 手机端 (< 768px): 1列网格布局
- 平板端 (768px - 1024px): 2列网格布局  
- 桌面端 (> 1024px): 3列网格布局

## 📱 功能特性详解

### 搜索功能
- 支持实时搜索，无需按下回车
- 搜索范围包括插件名称、描述、作者、标签等
- 搜索结果高亮显示匹配内容

### 视图模式
- **网格视图**: 卡片式布局，适合浏览和发现
- **列表视图**: 紧凑型布局，适合快速查看

### 插件详情弹窗
- 显示完整的插件信息
- 包含版本兼容性、许可证信息
- 提供仓库链接和主页链接
- 支持键盘 ESC 关闭

### 分页系统
- 每页显示 18 个插件
- 智能分页导航
- 支持快速跳转到首页和末页

## 🎨 界面预览

网站采用现代化的材料设计风格，主要颜色为祖母绿 (Emerald)，提供清爽的用户体验。界面包括：

- 响应式导航栏
- 搜索和筛选工具栏
- 插件卡片网格/列表
- 详情弹窗
- 分页导航

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 [LICENSE](LICENSE) 文件中的许可证发布。

## 🔗 相关链接

- [MaiBot 项目](https://github.com/MaiM-with-u/mailauncher)
- [插件仓库](https://github.com/MaiM-with-u/plugin-repo)
- [项目文档](https://github.com/MaiM-with-u/Mailauncher-docs)

## 💡 技术亮点

- 使用 Vue 3 Composition API 实现组件逻辑
- 采用 Tailwind CSS 实现快速样式开发
- 集成 DaisyUI 组件库提升开发效率
- 使用 Iconify 提供丰富的图标资源
- 实现了完整的明暗主题切换机制
- 响应式设计适配各种设备屏幕

## 🚀 部署

推荐使用以下平台部署：

- **Vercel**: 零配置部署，自动构建
- **Netlify**: 支持持续集成和部署
- **GitHub Pages**: 免费静态网站托管
- **自定义服务器**: 使用 nginx 或 apache 托管

构建后的文件位于 `dist/` 目录，直接上传到静态网站托管服务即可。

---

📧 如有问题或建议，请提交 Issue 或联系项目维护者。

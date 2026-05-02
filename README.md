

<p align="center">
    <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/src/assets/logo.png" alt="Vue Print Designer" width="96" height="96" />
</p>

<h1 align="center">Vue Print Designer</h1>

<p align="center">
  <a href="https://github.com/0ldFive/Vue-Print-Designer/stargazers"><img src="https://img.shields.io/github/stars/0ldFive/Vue-Print-Designer?style=flat-square&logo=github" alt="GitHub stars"></a>
  <a href="https://github.com/0ldFive/Vue-Print-Designer/network/members"><img src="https://img.shields.io/github/forks/0ldFive/Vue-Print-Designer?style=flat-square&logo=github" alt="GitHub forks"></a>
  <a href="https://www.npmjs.com/package/vue-print-designer"><img src="https://img.shields.io/npm/dm/vue-print-designer.svg?style=flat-square&logo=npm" alt="NPM Downloads"></a>
  <a href="https://www.npmjs.com/package/vue-print-designer"><img src="https://img.shields.io/npm/v/vue-print-designer.svg?style=flat-square&logo=npm" alt="NPM Version"></a>
  <a href="https://github.com/0ldFive/Vue-Print-Designer/blob/master/LICENSE"><img src="https://img.shields.io/github/license/0ldFive/Vue-Print-Designer?style=flat-square" alt="License"></a>
  <a target="_blank" href="https://qm.qq.com/cgi-bin/qm/qr?k=n-5GjVjM51eH2XvL71r-R8-72r1A2z0V&jump_from=webapi&authKey=zB6r+Q2/Q2/Q2/Q2/Q2/Q2/Q2/Q2/Q2/Q2/Q2/Q2/Q2/Q2/Q2/Q2/Q2/Q2"><img border="0" src="https://img.shields.io/badge/QQ%E7%BE%A4-1038069636-blue.svg?style=flat-square&logo=qq" alt="QQ Group" title="QQ Group"></a>
</p>

<p align="center">
    中文 | <a href="https://github.com/0ldFive/Vue-Print-Designer/blob/master/README_EN.md">English</a>
</p>

Vue Print Designer 是一款可视化打印设计器，面向业务表单、标签、票据、快递单等场景，支持模板化、变量化，并提供静默打印与云打印能力，同时兼容多种导出/打印方式。

<h2>在线演示: <a href="https://0ldfive.github.io/Vue-Print-Designer/" target="_blank" rel="noopener noreferrer">https://0ldfive.github.io/Vue-Print-Designer/</a></h2>

## 界面预览

| 设计器主界面与画布视图 | 打印预览 | 打印参数配置 |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/1.png" alt="设计器主界面" width="240" /> | <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/2.png" alt="打印预览" width="240" /> | <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/3.png" alt="打印参数" width="240" /> |

| 系统设置与偏好 | 快捷键说明 | 高级表格编辑 |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/4.png" alt="系统设置" width="240" /> | <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/5.png" alt="快捷键" width="240" /> | <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/6.png" alt="高级表格" width="240" /> |

## 集成示例

本仓库内置了基于 **dumi + React + Ant Design ProComponents** 的示例站点，用于本地调试、预览和 GitHub Pages 部署。

同时也保留旧版 Vue 集成示例项目，便于迁移历史业务系统时参考。

| 参数调试 | 设计器 | 暗色模式 |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/11.png" alt="集成示例图 11" width="240" /> | <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/12.png" alt="集成示例图 12" width="240" /> | <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/13.png" alt="集成示例图 13" width="240" /> |

- **项目地址**：[https://github.com/0ldFive/vue-designer-sample](https://github.com/0ldFive/vue-designer-sample)
- **在线演示**：[https://0ldfive.github.io/vue-designer-sample/#/designer](https://0ldfive.github.io/vue-designer-sample/#/designer)
- **技术栈**：Vue 3, TypeScript, Element Plus

## 社区交流

欢迎加入 QQ 群一起交流功能使用、二次开发与问题排查。

- QQ 群号：**1038069636**

<p>
    <img src="./docs/images/qq_group.jpg" alt="Vue Print Designer QQ 群二维码（1038069636）" width="120" />
</p>

## 核心特性

- **可视化设计**：全功能拖拽设计器，支持文本/图片/表格/条码/二维码/形状等组件，内置标尺、网格与辅助对齐。
- **智能分页**：自动处理长表格分页，支持表头/表尾重复，无需手写复杂逻辑，所见即所得。
- **React / Ant Design Pro 集成**：基于 React 18、Ant Design 5 与 ProComponents 构建，适合直接嵌入 React / Ant Design Pro 项目。
- **全场景打印**：
  - **浏览器打印**：原生预览与打印。
  - **导出**：支持生成 PDF、图片（拼接/分片）。
  - **客户端打印**：支持**静默打印**（无弹窗直打）与**云打印**（远程任务下发）。
- **企业级功能**：支持自定义纸张、API 数据对接、模板导入导出及精细的打印参数控制（打印机/份数/单双面/DPI）。

## 配套打印客户端（PrintDot Client）

PrintDot Client 是配套的桌面打印助手（Wails + Vue），用于设备发现、连接管理与任务转发，主打“稳定、快速、好上手”。与本项目配合可实现更稳定的本地客户端打印链路。

- 支持平台：Windows / macOS / Linux
- 关键能力：自动发现与识别设备、稳定连接维护与转发队列、轻量后台运行
- 项目地址：https://github.com/0ldFive/PrintDot-Client

| 主界面 - 设备状态与连接管理 | 设置页面 - 偏好与配置选项 |
| --- | --- |
| <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/7.png" alt="PrintDot 主界面" width="140" /> | <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/8.png" alt="PrintDot 设置页面" width="140" /> |

<p>
    <a href="https://github.com/0ldFive/PrintDot-Client/releases" target="_blank" rel="noopener noreferrer">⬇ 下载 PrintDot Client</a>
</p>

## 快速开始

### React / Ant Design Pro 项目接入

适合在现有 React、Ant Design Pro 项目中作为页面或业务模块集成。

#### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn / pnpm

#### 本地开发

```bash
npm install
npm run dev
```

本地示例站点使用与 `@ant-design/pro-components` 一致的 `dumi dev` 工具链。

#### 组件库构建

```bash
npm run build
```

该命令使用与 `@ant-design/pro-components` 相同的 `father build` 工具链，输出 `es/`、`lib/` 和 `dist/` 产物。

#### 示例站点构建

```bash
npm run build:app
```

该命令会先执行组件库构建，再使用 `dumi build` 构建示例站点，输出到 `dist/`，用于预览或部署 GitHub Pages。

#### 建议集成点

- 主设计器：`src/components/PrintDesigner.tsx`
- 示例入口：`site/App.tsx`
- 设计器状态：`src/state/designer.tsx`
- 模板存储：`src/state/templates.ts`（可替换为接口读写）
- 变量与模板数据：`PrintDesignerHandle` 中的 `setVariables` / `loadTemplateData`

自定义元素扩展请查看：[自定义元素扩展指南](https://printdot.cc/docs)



## 项目结构

```
src/
├── components/           # React 组件
│   ├── designer/         # 设计器工作台、工具条、画布与属性面板
│   ├── elements/         # 打印元素渲染（文本、图片、表格、条码等）
│   └── print/            # 打印渲染组件
├── constants/            # 常量定义
├── locales/              # 国际化语言包
├── state/                # React Context / reducer 状态管理
├── types/                # TypeScript 类型声明
└── utils/                # 工具函数
site/
└── App.tsx               # dumi 示例站点入口
```

## 国际化

项目内置中文（zh）和英文（en）语言支持，默认根据浏览器语言选择。

## License

AGPL-3.0-only

品牌与 Logo 使用请遵循 [TRADEMARKS.md](https://github.com/0ldFive/Vue-Print-Designer/blob/master/TRADEMARKS.md)。如需移除或替换品牌标识，请参考 [COMMERCIAL_LICENSE.md](https://github.com/0ldFive/Vue-Print-Designer/blob/master/COMMERCIAL_LICENSE.md)。

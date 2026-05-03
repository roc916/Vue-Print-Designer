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
    <a href="https://github.com/0ldFive/Vue-Print-Designer/blob/master/README.md">中文</a> | English
</p>

Vue Print Designer is a visual print designer for business forms, labels, receipts, and waybills. It supports templating and variables, provides silent printing and cloud printing, and works with multiple export/print pipelines.

<h2>LIVE DEMO: <a href="https://0ldfive.github.io/Vue-Print-Designer/" target="_blank" rel="noopener noreferrer">https://0ldfive.github.io/Vue-Print-Designer/</a></h2>

## UI Preview

| Designer main view and canvas | Print preview | Print parameter settings |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/1.png" alt="Designer main view" width="240" /> | <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/2.png" alt="Print preview" width="240" /> | <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/3.png" alt="Print parameters" width="240" /> |

| System settings and preferences | Shortcut reference | Advanced table editing |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/4.png" alt="System settings" width="240" /> | <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/5.png" alt="Shortcuts" width="240" /> | <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/6.png" alt="Advanced table" width="240" /> |

## Integration Example

This repository now ships a **dumi + React + Ant Design ProComponents** demo site for local development, previewing, and GitHub Pages deployment.

The legacy Vue integration sample is still listed for teams migrating older business applications.

| Parameter Debugging | Designer | Dark Mode |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/11.png" alt="Integration example 11" width="240" /> | <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/12.png" alt="Integration example 12" width="240" /> | <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/13.png" alt="Integration example 13" width="240" /> |

- **Repository**: [https://github.com/0ldFive/vue-designer-sample](https://github.com/0ldFive/vue-designer-sample)
- **Live Demo**: [https://0ldfive.github.io/vue-designer-sample/#/designer](https://0ldfive.github.io/vue-designer-sample/#/designer)
- **Tech Stack**: Vue 3, TypeScript, Element Plus

## Community

Join our QQ group for usage discussions, integration tips, and troubleshooting.

- QQ Group: **1038069636**

<p>
    <img src="./docs/images/qq_group.jpg" alt="Vue Print Designer QQ Group QR Code (1038069636)" width="120" />
</p>

## Core Features

- **Visual Design**: Full-featured drag-and-drop designer supporting text, images, tables, barcodes, QR codes, and shapes. Includes rulers, grids, and alignment tools.
- **Smart Pagination**: Automatically handles long table pagination with header/footer repetition. No complex manual logic required—what you see is what you get.
- **React / Ant Design Pro Integration**: Built with React 18, Ant Design 5, and ProComponents for direct use in React / Ant Design Pro projects.
- **Comprehensive Printing**:
  - **Browser Print**: Native preview and print.
  - **Export**: Generate PDF and images (merge/split supported).
  - **Client Print**: Supports **Silent Printing** (direct print without dialogs) and **Cloud Printing** (remote task dispatch).
- **Enterprise Ready**: Supports custom paper sizes, API data integration, template import/export, and fine-grained control over print parameters (printer selection, copies, duplex, DPI).

## Companion Print Client (PrintDot Client)

PrintDot Client is the companion desktop print helper (Wails + Vue) for device discovery, connection management, and job forwarding. It is designed to keep the local print pipeline stable and easy to operate when used with this project.

- Platforms: Windows / macOS / Linux
- Key capabilities: device discovery, stable connection & forwarding queue, lightweight background mode
- Project: https://github.com/0ldFive/PrintDot-Client

| Main view - device status & connection | Settings - preferences & options |
| --- | --- |
| <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/7.png" alt="PrintDot main view" width="140" /> | <img src="https://raw.githubusercontent.com/0ldFive/Vue-Print-Designer/master/docs/images/8.png" alt="PrintDot settings" width="140" /> |

<p>
    <a href="https://github.com/0ldFive/PrintDot-Client/releases" target="_blank" rel="noopener noreferrer">⬇ Download PrintDot Client</a>
</p>

## Quick Start

### React / Ant Design Pro Integration

Use it as a page or business module inside an existing React / Ant Design Pro project.

#### Requirements

- Node.js >= 16.0.0
- npm >= 7.0.0 or yarn / pnpm

#### Local development

```bash
npm install
npm run dev
```

The local demo site now uses the same `dumi dev` toolchain as `@ant-design/pro-components`.

#### Library build

```bash
npm run build
```

This command uses the same `father build` toolchain as `@ant-design/pro-components` and emits `es/`, `lib/`, and `dist/` outputs.

#### Demo app build

```bash
npm run build:app
```

This command builds the component library first, then uses `dumi build` for the demo site. The site is emitted to `dist/` for previewing or GitHub Pages deployment.

#### Recommended integration points

- Main designer: `src/components/PrintDesigner.tsx`
- Demo entry: `site/App.tsx`
- Designer state: `src/state/designer.tsx`
- Template storage: `src/state/templates.ts` (replace with your API if needed)
- Variables and template data: `setVariables` / `loadTemplateData` on `PrintDesignerHandle`


## Project Structure

```
src/
├── components/           # React components
│   ├── designer/         # Designer workspace, toolbar, canvas, properties
│   ├── elements/         # Print element renderers
│   └── print/            # Print renderer
├── constants/            # Constants
├── locales/              # i18n
├── state/                # React Context / reducer state
├── types/                # TypeScript types
└── utils/                # Utilities
site/
└── App.tsx               # dumi demo site entry
```

## i18n

Built-in Chinese (zh) and English (en). The default follows the browser language.

## License

AGPL-3.0-only

Please follow [TRADEMARKS.md](https://github.com/0ldFive/Vue-Print-Designer/blob/master/TRADEMARKS.md) for brand and logo usage. For removing or replacing branding, see [COMMERCIAL_LICENSE.md](https://github.com/0ldFive/Vue-Print-Designer/blob/master/COMMERCIAL_LICENSE.md).

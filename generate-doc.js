import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, AlignmentType,
  BorderStyle, ShadingType, PageBreak, LevelFormat,
  convertInchesToTwip
} from 'docx'
import fs from 'fs'
import path from 'path'

const BLUE = '3B82F6'
const DARK = '1E293B'
const GRAY = '64748B'
const LIGHT_BG = 'F1F5F9'

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    children: [new TextRun({ text, bold: true, color: level === HeadingLevel.HEADING_1 ? BLUE : DARK })],
    spacing: { before: 300, after: 150 },
  })
}

function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, ...opts })],
    spacing: { after: 120 },
  })
}

function bullet(text, level = 0) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    bullet: { level },
    spacing: { after: 80 },
  })
}

function codeBlock(text) {
  const lines = text.split('\n')
  return lines.map(line =>
    new Paragraph({
      children: [new TextRun({ text: line || ' ', font: 'Consolas', size: 20, color: '334155' })],
      shading: { type: ShadingType.SOLID, color: LIGHT_BG },
      spacing: { after: 0 },
      indent: { left: convertInchesToTwip(0.3) },
    })
  )
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map(cellText =>
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({
            text: cellText,
            bold: isHeader,
            size: 20,
            color: isHeader ? 'FFFFFF' : DARK,
          })],
          alignment: AlignmentType.LEFT,
        })],
        shading: isHeader ? { type: ShadingType.SOLID, color: BLUE } : undefined,
        width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
      })
    ),
  })
}

function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableRow(headers, true),
      ...rows.map(r => tableRow(r)),
    ],
  })
}

const children = []

// ===== 封面 =====
children.push(
  new Paragraph({ spacing: { before: 2000 } }),
  new Paragraph({
    children: [new TextRun({ text: 'xzitAPP', size: 72, bold: true, color: BLUE })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: '校园一站式应用', size: 44, color: DARK })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
  }),
  new Paragraph({
    children: [new TextRun({ text: '使用说明文档', size: 36, color: GRAY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 1200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: `版本 2.0  |  ${new Date().toLocaleDateString('zh-CN')}`, size: 24, color: GRAY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  }),
  new Paragraph({
    children: [new TextRun({ text: '公网访问地址', size: 24, color: GRAY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'https://www.lyyrealm.xyz/login', size: 28, bold: true, color: BLUE })],
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({ children: [new PageBreak()] }),
)

// ===== 1. 项目简介 =====
children.push(
  heading('1. 项目简介'),
  heading('1.1 项目背景与目标', HeadingLevel.HEADING_2),
  para('xzitAPP 是一款面向大学生的校园一站式 Web 应用，旨在将学业管理、健康追踪、生活工具、AI 智能助手等功能整合到统一界面中，帮助学生高效规划校园生活。'),
  para('项目采用纯前端架构，数据存储于浏览器 localStorage，支持多用户本地隔离与可选的 LeanCloud 云同步，同时通过 Capacitor 打包为 Android APK，实现一套代码多端运行。'),
  para('本项目已部署至公网，用户无需本地安装即可直接使用：'),
  new Paragraph({
    children: [
      new TextRun({ text: '访问地址：', size: 22, bold: true }),
      new TextRun({ text: 'https://www.lyyrealm.xyz/login', size: 22, bold: true, color: BLUE }),
    ],
    spacing: { after: 120 },
  }),
  para('在浏览器中打开上述网址即可进入登录页面，注册账号后即可使用全部功能。'),

  heading('1.2 核心功能概览', HeadingLevel.HEADING_2),
  makeTable(
    ['功能模块', '说明'],
    [
      ['登录系统', '多用户注册/切换，SHA-256 密码哈希，数据隔离'],
      ['AI 智能助手', '多子 Agent 路由，文件上传解析（OCR/PDF/Word），对话历史记忆'],
      ['学业管理', '课程表（PDF 导入）、作业管理（优先级排序）、成绩记录与趋势图'],
      ['健康管理', '运动记录（多单位）、心情记录（压力关联）、趋势图表'],
      ['生活管理', '日程安排、记账、备忘录'],
      ['工具集', '番茄钟/专注计时、数据导出导入'],
      ['数据可视化', 'ECharts 图表（成绩/运动/心情/番茄钟统计）'],
      ['云同步', 'LeanCloud REST API 数据备份与恢复'],
      ['移动端适配', '响应式布局 + Capacitor Android 打包'],
    ]
  ),

  heading('1.3 技术栈总览', HeadingLevel.HEADING_2),
  makeTable(
    ['类别', '技术/库', '版本', '用途'],
    [
      ['框架', 'Vue 3', '^3.5.0', '响应式 UI 框架'],
      ['构建工具', 'Vite', '^6.0.0', '开发服务器与生产构建'],
      ['状态管理', 'Pinia', '^2.2.0', '全局状态管理 + 持久化插件'],
      ['CSS 框架', 'Tailwind CSS', '^3.4.0', '原子化 CSS 样式'],
      ['路由', 'Vue Router', '^4.4.0', '单页应用路由'],
      ['图表', 'ECharts', '^6.1.0', '数据可视化'],
      ['OCR', 'Tesseract.js', '^7.0.0', '图片文字识别'],
      ['PDF 解析', 'pdfjs-dist', '^6.4.299', 'PDF 文件读取与课表解析'],
      ['Word 解析', 'mammoth', '^1.13.0', '.docx 文件文本提取'],
      ['文档生成', 'docx', '^9.13.0', '导出 Word 文档'],
      ['PDF 导出', 'jspdf', '^4.2.1', '生成 PDF 文件'],
      ['Markdown', 'marked', '^18.1.1', 'AI 回复 Markdown 渲染'],
      ['图标', 'lucide-vue-next', '^0.460.0', 'SVG 图标库'],
      ['移动端', 'Capacitor', '^8.5.3', 'Web → Android 打包'],
      ['测试', 'Vitest', '^3.0.0', '单元测试框架'],
      ['云服务', 'LeanCloud', 'REST API', '数据云同步'],
    ]
  ),
  new Paragraph({ children: [new PageBreak()] }),
)

// ===== 2. 环境依赖说明 =====
children.push(
  heading('2. 环境依赖说明'),

  heading('2.1 Node.js 与 npm', HeadingLevel.HEADING_2),
  para('本项目的开发与构建依赖 Node.js 运行环境。'),
  makeTable(
    ['依赖项', '最低版本', '说明'],
    [
      ['Node.js', '18.0+', '推荐使用 LTS 版本（20.x 或 22.x）'],
      ['npm', '9.0+', '随 Node.js 一同安装'],
    ]
  ),
  para('安装方式：'),
  ...codeBlock(
    '# Windows: 从 https://nodejs.org 下载 LTS 安装包\n' +
    '# 验证安装\n' +
    'node -v\n' +
    'npm -v'
  ),

  heading('2.2 浏览器要求', HeadingLevel.HEADING_2),
  para('应用运行于现代浏览器，需支持 ES2022+ 语法与 localStorage。'),
  bullet('Chrome 100+（推荐）'),
  bullet('Edge 100+（推荐）'),
  bullet('Firefox 100+'),
  bullet('Safari 15+'),

  heading('2.3 Android 打包额外依赖', HeadingLevel.HEADING_2),
  makeTable(
    ['依赖项', '说明'],
    [
      ['JDK 21', 'Android Studio 自带 JBR 即可，路径通常为 .jdks/jbr-21'],
      ['Android SDK', 'Android Studio 安装时自动配置，路径为 %LOCALAPPDATA%/Android/Sdk'],
      ['Capacitor CLI', '已包含在 devDependencies 中，通过 npx 调用'],
      ['Gradle', 'Android 项目自带 gradlew 包装器，无需单独安装'],
    ]
  ),

  heading('2.4 环境变量配置', HeadingLevel.HEADING_2),
  para('项目根目录需创建 .env 文件，配置 LeanCloud 云同步所需的 AppID 和 AppKey：'),
  ...codeBlock(
    '# .env 文件内容\n' +
    'VITE_LEANCLOUD_ID=your-leancloud-app-id\n' +
    'VITE_LEANCLOUD_KEY=your-leancloud-app-key'
  ),
  para('获取方式：'),
  bullet('访问 https://www.leancloud.cn 注册并创建应用'),
  bullet('在「设置 > 应用凭证」中获取 AppID 和 AppKey'),
  bullet('将值填入 .env 文件（不要提交到 Git 仓库）'),
  para('注意：云同步为可选功能，未配置时应用仍可正常使用，仅无法进行云端备份与恢复。'),
  new Paragraph({ children: [new PageBreak()] }),
)

// ===== 3. 项目结构 =====
children.push(
  heading('3. 项目结构'),

  heading('3.1 目录树概览', HeadingLevel.HEADING_2),
  ...codeBlock(
    'xzitAPP/\n' +
    '├── android/                    # Capacitor Android 工程\n' +
    '│   └── app/build/outputs/apk/  # APK 产物目录\n' +
    '├── dist/                       # 生产构建产物\n' +
    '├── src/\n' +
    '│   ├── agents/                 # AI 子 Agent（学业/健康/聊天等）\n' +
    '│   ├── assets/                 # 静态资源\n' +
    '│   ├── components/             # Vue 组件\n' +
    '│   │   ├── assistant/          # AI 助手组件\n' +
    '│   │   ├── charts/             # ECharts 图表组件\n' +
    '│   │   ├── health/             # 健康管理组件\n' +
    '│   │   ├── study/              # 学业管理组件\n' +
    '│   │   ├── tools/              # 工具组件\n' +
    '│   │   └── ...                 # 其他组件\n' +
    '│   ├── composables/            # Vue 组合式函数\n' +
    '│   ├── router/                 # 路由配置（含登录守卫）\n' +
    '│   ├── stores/                 # Pinia 状态仓库\n' +
    '│   ├── utils/                  # 工具函数\n' +
    '│   ├── views/                  # 页面视图\n' +
    '│   ├── App.vue                 # 根组件\n' +
    '│   └── main.js                 # 应用入口\n' +
    '├── test/                       # 单元测试（40 文件，477 测试）\n' +
    '├── .env.example                # 环境变量模板\n' +
    '├── capacitor.config.json       # Capacitor 配置\n' +
    '├── vercel.json                 # Vercel 部署配置\n' +
    '├── package.json                # 依赖与脚本\n' +
    '└── vite.config.js              # Vite 构建配置'
  ),

  heading('3.2 各模块职责说明', HeadingLevel.HEADING_2),
  makeTable(
    ['目录', '职责'],
    [
      ['src/agents/', 'AI 子 Agent 定义，包括主路由 Agent、通用聊天、学业、健康、MATLAB、FPGA、电路报告等'],
      ['src/stores/', 'Pinia 状态管理，包括 auth（认证）、sync（云同步）、pomodoro（番茄钟）、study、health、life 等'],
      ['src/utils/', '工具函数，包括文件解析、PDF 课表解析、OCR、图表配置、数据导出、LLM 客户端等'],
      ['src/components/', 'Vue 组件，按功能域分目录组织'],
      ['src/views/', '页面级视图，对应路由的 9 个页面'],
      ['src/router/', 'Vue Router 配置，含登录认证路由守卫'],
      ['test/', 'Vitest 单元测试，覆盖全部核心逻辑'],
    ]
  ),
  new Paragraph({ children: [new PageBreak()] }),
)

// ===== 4. 网页功能介绍 =====
children.push(
  heading('4. 网页功能介绍'),

  heading('4.1 登录与多用户切换', HeadingLevel.HEADING_2),
  para('应用启动后首先进入登录页面，支持多用户注册与切换。'),
  bullet('用户注册：输入用户名和密码，密码使用 SHA-256 哈希存储，不保存明文'),
  bullet('数据隔离：每个用户的数据存储在独立的 localStorage 命名空间中，互不干扰'),
  bullet('路由守卫：未登录用户自动跳转至登录页，已登录用户访问登录页则跳转至首页'),
  bullet('用户切换：在主界面顶部/底部导航栏可查看当前用户并登出，返回登录页切换用户'),

  heading('4.2 AI 智能助手', HeadingLevel.HEADING_2),
  para('AI 助手是本应用的核心功能，基于 DeepSeek 大语言模型，通过多子 Agent 架构提供专业化对话服务。'),

  heading('4.2.1 多子 Agent 路由', HeadingLevel.HEADING_2),
  makeTable(
    ['Agent', '触发场景', '功能'],
    [
      ['学业 Agent', '课程、作业、成绩、GPA 相关', '课表查询、作业提醒、成绩分析'],
      ['健康 Agent', '运动、心情、睡眠相关', '运动建议、心情记录分析、健康提醒'],
      ['社交 Agent', '社团、活动、社交相关', '社团信息、活动推荐'],
      ['工具 Agent', '番茄钟、换算、工具相关', '工具使用指导'],
      ['通用聊天 Agent', '以上均不匹配时（默认兜底）', '日常对话、数据查询、通用问答'],
    ]
  ),
  para('主 Agent 根据用户输入自动路由到对应子 Agent，每个子 Agent 拥有专属系统提示词和引导性话语。'),

  heading('4.2.2 文件上传与解析', HeadingLevel.HEADING_2),
  para('对话界面支持文件上传，系统自动解析文件内容并传入 AI 上下文。'),
  makeTable(
    ['文件类型', '解析方式', '说明'],
    [
      ['图片（PNG/JPG）', 'Tesseract.js OCR', '支持中英文识别，中文失败时自动回退英文'],
      ['PDF', 'pdfjs-dist', '提取文本内容，课表 PDF 可自动解析为结构化课表'],
      ['Word（.docx）', 'mammoth', '提取纯文本内容'],
      ['纯文本（.txt）', '直接读取', 'UTF-8 文本内容'],
    ]
  ),

  heading('4.2.3 对话历史与上下文记忆', HeadingLevel.HEADING_2),
  bullet('每个用户维护独立的对话历史'),
  bullet('子 Agent 接收最近的历史消息作为上下文，实现连续对话'),
  bullet('应用数据上下文（课表、作业、成绩等）自动注入 AI 提示词'),

  heading('4.3 学业管理', HeadingLevel.HEADING_2),

  heading('4.3.1 课程表', HeadingLevel.HEADING_2),
  bullet('支持手动添加/编辑/删除课程'),
  bullet('支持 PDF 课表导入：上传 PDF 文件，自动解析课程名称、时间、地点'),
  bullet('按周/按天视图展示'),

  heading('4.3.2 作业管理', HeadingLevel.HEADING_2),
  bullet('记录作业标题、课程、截止日期、优先级'),
  bullet('按优先级从高到低排序展示'),
  bullet('截止日期临近时高亮提醒'),

  heading('4.3.3 成绩记录与趋势图表', HeadingLevel.HEADING_2),
  bullet('记录每门课程的成绩与学分'),
  bullet('自动计算 GPA（支持加权平均）'),
  bullet('ECharts 折线图展示成绩趋势'),

  heading('4.4 健康管理', HeadingLevel.HEADING_2),

  heading('4.4.1 运动记录', HeadingLevel.HEADING_2),
  bullet('支持多种单位：km、m、次、个、组'),
  bullet('同一天同一类型的运动时间自动合并统计'),
  bullet('ECharts 柱状图展示运动统计，按单位分组'),

  heading('4.4.2 心情记录', HeadingLevel.HEADING_2),
  bullet('记录每日心情（表情选择）与压力值'),
  bullet('心情与压力值自动关联：心情好 = 低压力（心情 n → 压力 6-n）'),
  bullet('ECharts 折线图展示心情/压力趋势'),

  heading('4.5 工具集', HeadingLevel.HEADING_2),

  heading('4.5.1 番茄钟/专注计时', HeadingLevel.HEADING_2),
  bullet('25 分钟专注 + 5 分钟休息的经典番茄工作法'),
  bullet('可自定义专注和休息时长'),
  bullet('统计累计专注次数与总时长'),
  bullet('ECharts 图表展示番茄钟统计'),

  heading('4.5.2 数据导出与导入', HeadingLevel.HEADING_2),
  bullet('导出：将当前用户所有数据导出为 JSON 文件'),
  bullet('导入：从 JSON 文件恢复数据'),
  bullet('支持导出为 Word（.docx）和 PDF 格式'),

  heading('4.6 云同步', HeadingLevel.HEADING_2),
  para('基于 LeanCloud REST API 实现数据云端备份与恢复。'),
  bullet('上传：将当前用户数据同步到 LeanCloud 云端'),
  bullet('拉取：从云端拉取数据覆盖本地'),
  bullet('需在 .env 中配置 LeanCloud AppID 和 AppKey'),

  heading('4.7 数据可视化', HeadingLevel.HEADING_2),
  para('使用 ECharts 6.x 实现数据可视化，涵盖：'),
  bullet('成绩趋势折线图（学业页）'),
  bullet('运动统计柱状图（健康页）'),
  bullet('心情/压力趋势折线图（健康页）'),
  bullet('番茄钟专注统计图（工具页）'),
  new Paragraph({ children: [new PageBreak()] }),
)

// ===== 5. 本地开发部署步骤 =====
children.push(
  heading('5. 本地开发部署步骤'),

  heading('5.1 克隆仓库', HeadingLevel.HEADING_2),
  ...codeBlock(
    'git clone https://github.com/GaoYang522/xzitAPP.git\n' +
    'cd xzitAPP'
  ),

  heading('5.2 安装依赖', HeadingLevel.HEADING_2),
  para('使用 npm 安装项目依赖。国内网络建议使用镜像加速：'),
  ...codeBlock(
    '# 标准安装\n' +
    'npm install\n' +
    '\n' +
    '# 国内镜像加速（推荐）\n' +
    'npm install --registry=https://registry.npmmirror.com'
  ),

  heading('5.3 配置环境变量', HeadingLevel.HEADING_2),
  para('复制 .env.example 为 .env，填入 LeanCloud 凭证（可选）：'),
  ...codeBlock(
    'cp .env.example .env\n' +
    '# 编辑 .env，填入 VITE_LEANCLOUD_ID 和 VITE_LEANCLOUD_KEY'
  ),

  heading('5.4 启动开发服务器', HeadingLevel.HEADING_2),
  ...codeBlock(
    'npm run dev'
  ),
  para('启动后浏览器访问 http://localhost:5173 即可进入应用。Vite 支持热模块替换（HMR），修改代码后自动刷新。'),

  heading('5.5 构建生产版本', HeadingLevel.HEADING_2),
  ...codeBlock(
    'npm run build'
  ),
  para('构建产物输出到 dist/ 目录，可直接部署到任意静态文件服务器。'),
  new Paragraph({ children: [new PageBreak()] }),
)

// ===== 6. 运行指南 =====
children.push(
  heading('6. 运行指南'),

  heading('6.1 在线访问（推荐）', HeadingLevel.HEADING_2),
  para('本项目已部署至公网，无需本地部署即可直接使用：'),
  new Paragraph({
    children: [
      new TextRun({ text: '网址：', size: 22, bold: true }),
      new TextRun({ text: 'https://www.lyyrealm.xyz/login', size: 22, bold: true, color: BLUE }),
    ],
    spacing: { after: 120 },
  }),
  para('操作步骤：'),
  bullet('1. 在浏览器中打开上述网址，进入登录页面'),
  bullet('2. 点击「注册」，输入用户名和密码创建账号'),
  bullet('3. 登录后即可使用学业管理、健康管理、AI 助手等全部功能'),
  bullet('4. 数据保存在浏览器本地，更换设备需重新录入或使用云同步'),

  heading('6.2 首次使用流程', HeadingLevel.HEADING_2),
  para('首次打开应用，需完成以下步骤：'),
  bullet('1. 在登录页点击「注册」，输入用户名和密码'),
  bullet('2. 注册成功后自动登录，进入首页'),
  bullet('3. 在各功能页面录入数据（课程、作业、运动等）'),
  bullet('4. 可选：在设置页配置云同步，将数据备份到云端'),

  heading('6.3 各功能页面操作说明', HeadingLevel.HEADING_2),
  makeTable(
    ['页面', '路由', '主要操作'],
    [
      ['首页', '/', '概览信息、快捷入口'],
      ['学业', '/study', '课程表管理、作业管理、成绩录入与查看趋势图'],
      ['生活', '/life', '日程安排、记账、备忘录'],
      ['社交', '/club', '社团信息、活动管理'],
      ['健康', '/health', '运动记录、心情记录、查看统计图表'],
      ['工具', '/tools', '番茄钟计时、数据导出导入'],
      ['AI 助手', '/assistant', '智能对话、文件上传、多 Agent 问答'],
      ['设置', '/settings', '云同步配置、数据管理、账号设置'],
    ]
  ),

  heading('6.4 文件上传与 AI 对话操作示例', HeadingLevel.HEADING_2),
  para('操作步骤：'),
  bullet('1. 进入「AI 助手」页面'),
  bullet('2. 在对话框下方点击文件上传按钮'),
  bullet('3. 选择要上传的文件（图片/PDF/Word/文本）'),
  bullet('4. 系统自动解析文件内容（图片执行 OCR，PDF/Word 提取文本）'),
  bullet('5. 在对话框输入问题，AI 将结合文件内容和应用数据回答'),

  heading('6.5 云同步操作', HeadingLevel.HEADING_2),
  bullet('前提：已在 .env 中配置 LeanCloud 凭证'),
  bullet('上传：进入「设置」页 → 点击「同步到云端」→ 等待同步完成'),
  bullet('拉取：进入「设置」页 → 点击「从云端拉取」→ 本地数据将被覆盖'),

  heading('6.6 数据导出与导入操作', HeadingLevel.HEADING_2),
  bullet('导出：进入「工具」页 → 选择「数据导出」→ 选择格式（JSON/Word/PDF）→ 下载文件'),
  bullet('导入：进入「工具」页 → 选择「数据导入」→ 上传 JSON 文件 → 确认导入'),
  new Paragraph({ children: [new PageBreak()] }),
)

// ===== 7. Vercel 部署指南 =====
children.push(
  heading('7. Vercel 部署指南'),
  para('Vercel 是推荐的线上部署方式，支持自动构建与 HTTPS。'),

  heading('7.1 Vercel 账号与项目导入', HeadingLevel.HEADING_2),
  bullet('1. 访问 https://vercel.com 注册账号'),
  bullet('2. 点击「New Project」→ 选择 Git 仓库 xzitAPP'),
  bullet('3. Vercel 自动识别 Vite 框架（vercel.json 已配置）'),

  heading('7.2 环境变量配置', HeadingLevel.HEADING_2),
  para('在 Vercel 项目设置中添加环境变量：'),
  makeTable(
    ['变量名', '说明'],
    [
      ['VITE_LEANCLOUD_ID', 'LeanCloud AppID'],
      ['VITE_LEANCLOUD_KEY', 'LeanCloud AppKey'],
    ]
  ),

  heading('7.3 构建与发布', HeadingLevel.HEADING_2),
  para('vercel.json 已配置好构建命令和 SPA 路由重写：'),
  ...codeBlock(
    '{\n' +
    '  "buildCommand": "npm run build",\n' +
    '  "outputDirectory": "dist",\n' +
    '  "framework": "vite",\n' +
    '  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]\n' +
    '}'
  ),
  para('点击「Deploy」即可，Vercel 会自动执行 npm run build 并部署 dist 目录。'),
  new Paragraph({ children: [new PageBreak()] }),
)

// ===== 8. Android APK 打包指南 =====
children.push(
  heading('8. Android APK 打包指南'),

  heading('8.1 Capacitor 同步', HeadingLevel.HEADING_2),
  para('确保已执行 npm run build 生成 dist 目录，然后同步到 Android 工程：'),
  ...codeBlock(
    'npm run build\n' +
    'npx cap sync android'
  ),

  heading('8.2 Gradle 构建', HeadingLevel.HEADING_2),
  para('使用 Android 项目自带的 Gradle 包装器构建 Debug APK：'),
  ...codeBlock(
    'cd android\n' +
    './gradlew assembleDebug\n' +
    'cd ..'
  ),
  para('如需 Release 版本（需配置签名）：'),
  ...codeBlock(
    'cd android\n' +
    './gradlew assembleRelease\n' +
    'cd ..'
  ),

  heading('8.3 APK 产物路径', HeadingLevel.HEADING_2),
  ...codeBlock(
    '# Debug APK\n' +
    'android/app/build/outputs/apk/debug/app-debug.apk\n' +
    '\n' +
    '# Release APK\n' +
    'android/app/build/outputs/apk/release/app-release.apk'
  ),
  para('当前应用版本：versionCode 2，versionName 2.0。'),
  new Paragraph({ children: [new PageBreak()] }),
)

// ===== 9. 测试 =====
children.push(
  heading('9. 测试'),

  heading('9.1 测试框架', HeadingLevel.HEADING_2),
  para('项目使用 Vitest 3.x 作为单元测试框架，配合 @vue/test-utils 进行 Vue 组件测试。'),

  heading('9.2 运行测试', HeadingLevel.HEADING_2),
  ...codeBlock(
    '# 运行全部测试\n' +
    'npm test\n' +
    '\n' +
    '# 监听模式（开发时自动重跑）\n' +
    'npm run test:watch\n' +
    '\n' +
    '# 运行单个测试文件\n' +
    'npx vitest run test/auth.test.js'
  ),

  heading('9.3 当前测试覆盖情况', HeadingLevel.HEADING_2),
  makeTable(
    ['指标', '数值'],
    [
      ['测试文件数', '40'],
      ['测试用例数', '477'],
      ['通过率', '100%'],
    ]
  ),
  para('测试覆盖核心模块包括：认证、云同步、番茄钟、图表配置、运动单位、作业优先级、心情压力关联、PDF Android 兼容、文件解析、AI Agent、聊天历史等。'),
  new Paragraph({ children: [new PageBreak()] }),
)

// ===== 10. 常见问题 =====
children.push(
  heading('10. 常见问题（FAQ）'),

  heading('10.1 LeanCloud 连接失败', HeadingLevel.HEADING_2),
  para('现象：云同步时提示连接失败或超时。'),
  para('解决方案：'),
  bullet('检查 .env 文件中 VITE_LEANCLOUD_ID 和 VITE_LEANCLOUD_KEY 是否正确'),
  bullet('确认 LeanCloud 应用状态为「运行中」'),
  bullet('检查网络连接，LeanCloud 国内节点应可正常访问'),

  heading('10.2 OCR 中文识别失败', HeadingLevel.HEADING_2),
  para('现象：上传中文图片时 OCR 返回空结果或报错。'),
  para('解决方案：'),
  bullet('Tesseract.js 需从 CDN 下载语言数据，国内访问 jsdelivr 可能不稳定'),
  bullet('系统已配置中文失败时自动回退英文识别'),
  bullet('如持续失败，可尝试使用 VPN 或更换网络环境'),

  heading('10.3 Android 端 PDF 导入失败', HeadingLevel.HEADING_2),
  para('现象：Android 端上传 PDF 后解析报错。'),
  para('解决方案：'),
  bullet('Android WebView 中 PDF.js Worker 路径不兼容 ?url 导入'),
  bullet('系统已自动检测 Capacitor 环境，Android 下使用 CDN Worker 路径'),
  bullet('确保设备有网络连接（CDN Worker 需在线加载）'),

  heading('10.4 依赖安装缓慢', HeadingLevel.HEADING_2),
  para('现象：npm install 执行很慢或超时。'),
  para('解决方案：'),
  bullet('使用国内镜像：npm install --registry=https://registry.npmmirror.com'),
  bullet('或永久设置镜像：npm config set registry https://registry.npmmirror.com'),
  bullet('清理缓存重试：npm cache clean --force'),
)

// ===== 生成文档 =====
const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(1),
          bottom: convertInchesToTwip(1),
          left: convertInchesToTwip(1.2),
          right: convertInchesToTwip(1.2),
        },
      },
    },
    children,
  }],
})

const outputPath = path.resolve('xzitAPP使用说明文档.docx')
const buffer = await Packer.toBuffer(doc)
fs.writeFileSync(outputPath, buffer)
console.log(`文档已生成: ${outputPath}`)
console.log(`文件大小: ${(buffer.length / 1024).toFixed(1)} KB`)
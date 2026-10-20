# 开发计划第二版 — 大学生校园一站式 APP

> 基于 PRD.md v2.0（第 11-21 节）
> 日期：2026-10-20
> 前置条件：第一版（阶段 0-10）已全部完成并通过验收
> 技术栈：Vue 3 + Vite + Pinia + Vue Router + Tailwind CSS + lucide-vue-next + docx + jspdf

---

## 新增目录结构

```
xzitAPP/
└── src/
    ├── agents/                    ← 第二版新增
    │   ├── agentConfig.js         # 子 Agent 配置（名称/定位/system prompt）
    │   ├── mainAgent.js           # 主 Agent 调度器（意图分析+路由+串联编排）
    │   ├── matlabAgent.js         # 子 Agent 1：MATLAB 调试与优化
    │   ├── circuitReportAgent.js  # 子 Agent 2：电路实验报告生成
    │   └── fpgaAgent.js           # 子 Agent 3：FPGA/单片机代码辅助
    ├── utils/
    │   ├── llmProvider.js         # LLM 提供商抽象层（预留多提供商切换）
    │   ├── deepseekClient.js      # DeepSeek API 客户端
    │   ├── codeExecutor.js        # 在线编译 API 封装
    │   ├── exportDocx.js          # Word 导出工具
    │   └── exportPdf.js           # PDF 导出工具
    ├── stores/
    │   └── assistant.js           # AI 助手状态管理（会话/配置/历史）
    ├── views/
    │   └── Assistant.vue          # 我的助手页面
    ├── components/
    │   ├── assistant/             ← 第二版新增
    │   │   ├── AgentList.vue      # 子 Agent 列表展示
    │   │   ├── AgentDetail.vue    # 子 Agent 详情
    │   │   ├── ApiConfig.vue      # API Key 配置
    │   │   ├── ChatInterface.vue  # 完整对话界面
    │   │   ├── ChatMessage.vue    # 单条消息渲染
    │   │   ├── CodeBlock.vue      # 代码块展示+复制
    │   │   ├── RouteIndicator.vue # 路由提示可视化
    │   │   └── HistoryList.vue    # 对话历史列表
    │   └── home/
    │       └── AiChatWidget.vue   # 首页 AI 快捷对话框
    └── router/
        └── index.js               # 新增 /assistant 路由
```

---

## 阶段 11：安装新增依赖

**目标**：安装第二版所需的额外 npm 包。

| 任务 | 具体内容 | 产出 |
|------|----------|------|
| 11.1 | 安装 Word 导出库：`npm install docx file-saver` | `package.json` 更新 |
| 11.2 | 安装 PDF 导出库：`npm install jspdf` | `package.json` 更新 |
| 11.3 | 安装 Markdown 渲染库：`npm install marked`（用于渲染 Agent 回复的 Markdown） | `package.json` 更新 |
| 11.4 | 确认无需安装 LLM SDK（DeepSeek 兼容 OpenAI 格式，直接用 fetch 调用） | 无 |

**验收**：`npm run dev` 正常启动，无依赖报错。

---

## 阶段 12：LLM API 封装层

**目标**：实现 DeepSeek API 调用封装，架构预留多提供商切换。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 12.1 | `llmProvider.js`：定义统一接口 `chat(messages, options)` → 返回 `{ content, usage }`；定义提供商注册机制 `registerProvider(name, client)` | `src/utils/llmProvider.js` |
| 12.2 | `deepseekClient.js`：实现 DeepSeek 客户端，`chatCompletion(messages, { apiKey, baseUrl, model })` 用 fetch 调用 `POST /v1/chat/completions`；支持 system/user/assistant 消息角色；返回非流式结果 | `src/utils/deepseekClient.js` |
| 12.3 | 在 `llmProvider.js` 中注册 DeepSeek 为默认提供商；导出 `chatWithLLM(messages, options)` 统一入口，从 assistant store 读取当前提供商配置 | 同上 |
| 12.4 | 错误处理：API Key 缺失、网络错误、速率限制、JSON 解析失败，返回结构化错误 `{ error, message }` | 同上 |

**验收**：
- 传入合法 API Key + 消息能返回 LLM 回复文本
- API Key 缺失时返回明确错误提示
- 统一接口 `chatWithLLM` 可正常调用

---

## 阶段 13：在线编译 API 封装

**目标**：封装在线编译 API，支持提交代码并获取执行结果。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 13.1 | `codeExecutor.js`：定义 `executeCode(language, code, { apiUrl, apiKey })` 统一接口 | `src/utils/codeExecutor.js` |
| 13.2 | 实现 Octave 提交：将 MATLAB 代码转换为 Octave 兼容代码，提交到在线编译 API，返回 `{ stdout, stderr, exitCode }` | 同上 |
| 13.3 | 实现 C 代码提交：直接提交 C 代码编译执行，返回编译结果和运行输出 | 同上 |
| 13.4 | 实现 Verilog 语法检查：基本语法规则检查（不调用编译 API），返回 `{ valid, errors[] }` | 同上 |
| 13.5 | 错误处理：API 不可用、编译超时、运行错误，返回结构化错误 | 同上 |

**验收**：
- 提交简单 Octave 代码（如 `disp('hello')`）能返回 `hello`
- 提交简单 C 代码（如 `printf("hello")`）能返回编译运行结果
- Verilog 语法错误能被检测出

---

## 阶段 14：Word/PDF 导出工具

**目标**：实现 Markdown 报告导出为 Word 和 PDF 文件。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 14.1 | `exportDocx.js`：`exportMarkdownToDocx(markdown, filename)` — 用 docx 库将 Markdown 文本转为 .docx 文件，用 file-saver 触发下载 | `src/utils/exportDocx.js` |
| 14.2 | `exportPdf.js`：`exportMarkdownToPdf(markdown, filename)` — 用 jspdf 将 Markdown 文本转为 PDF 文件，处理中文字体、分页 | `src/utils/exportPdf.js` |
| 14.3 | Markdown 解析：用 marked 库将 Markdown 解析为结构化内容（标题/段落/表格/代码块），再映射到 docx/jspdf 元素 | 两个文件均使用 |

**验收**：
- 输入含标题/表格/段落的 Markdown，导出 .docx 用 Word 打开内容一致
- 同样输入导出 PDF，内容一致，中文不乱码

---

## 阶段 15：Agent 系统核心

**目标**：实现主 Agent 调度器和 3 个子 Agent 的核心逻辑。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 15.1 | `agentConfig.js`：定义 3 个子 Agent 的配置（ID/名称/定位/能力列表/system prompt/图标/颜色），导出 `SUB_AGENTS` 数组和 `getAgentById(id)` | `src/agents/agentConfig.js` |
| 15.2 | `mainAgent.js`：`analyzeIntent(userInput)` — 调用 LLM 分析意图，返回 `{ agentId, confidence, workflow? }`；关键词预判兜底函数 `keywordRoute(input)` | `src/agents/mainAgent.js` |
| 15.3 | `mainAgent.js`：`routeToAgent(agentId, userInput, context?)` — 调用指定子 Agent 处理 | 同上 |
| 15.4 | `mainAgent.js`：`executeWorkflow(steps, userInput)` — 多 Agent 串联编排，每步结果传给下一步作为上下文，返回完整步骤记录 | 同上 |
| 15.5 | `mainAgent.js`：`handleMessage(userInput)` — 主入口，先分析意图，单 Agent 直接路由，多 Agent 走工作流，无法确定返回候选列表 | 同上 |
| 15.6 | `matlabAgent.js`：`handle(userInput, context?)` — 用 MATLAB system prompt 调用 LLM；检测"在线执行"意图时调 `codeExecutor` 执行 Octave 代码 | `src/agents/matlabAgent.js` |
| 15.7 | `circuitReportAgent.js`：`handle(userInput, context?)` — 用电路报告 system prompt 调用 LLM 生成 Markdown 报告；提供 `exportReport(markdown, format)` 调用导出工具 | `src/agents/circuitReportAgent.js` |
| 15.8 | `fpgaAgent.js`：`handle(userInput, context?)` — 用 FPGA/单片机 system prompt 调用 LLM 生成代码；检测"在线执行"意图时调 `codeExecutor` 执行 C 代码；检测 Verilog 代码时做语法检查 | `src/agents/fpgaAgent.js` |

**验收**：
- 输入"这段 MATLAB 代码报错了"→ `analyzeIntent` 返回 `agentId: 'matlab'`
- 输入"帮我生成电路实验报告"→ 返回 `agentId: 'circuit-report'`
- 输入"帮我写一段 Verilog 代码"→ 返回 `agentId: 'fpga'`
- 输入"分析代码并生成报告"→ 返回 workflow 含两步
- 各子 Agent handle 能返回非空回复文本

---

## 阶段 16：「我的助手」Store

**目标**：实现 AI 助手的状态管理，含 API 配置、会话、历史。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 16.1 | `assistant` store state：`apiConfig`（llmProvider/llmApiKey/llmBaseUrl/llmModel/compileApiUrl/compileApiKey）、`sessions`（会话列表）、`currentSessionId` | `src/stores/assistant.js` |
| 16.2 | API 配置 actions：`setApiConfig(config)`、`testApiConnectivity()` → 调用 LLM 发送测试消息返回成功/失败 | 同上 |
| 16.3 | 会话 actions：`createSession()` → 新建空会话并设为当前、`sendMessage(text)` → 调用 `mainAgent.handleMessage` 并将消息+回复+路由信息存入会话、`deleteSession(id)`、`clearAllSessions()` | 同上 |
| 16.4 | 会话数据结构：`session = { id, title, createdAt, updatedAt, messages: [{ role, content, timestamp, routeInfo? }] }`；`title` 自动取首条消息前 20 字 | 同上 |
| 16.5 | 开启 `persist: true`，数据自动同步 localStorage | 同上 |

**验收**：
- API Key 配置后刷新页面仍在
- 创建会话→发送消息→会话消息列表更新→刷新后历史仍在
- 删除会话/清空全部正常

---

## 阶段 17：「我的助手」模块 UI

**目标**：实现我的助手页面的全部界面组件。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 17.1 | `Assistant.vue`：页面骨架，Tab 切换「对话」「Agent 列表」「API 配置」「历史」 | `src/views/Assistant.vue` |
| 17.2 | `AgentList.vue`：展示 3 个子 Agent 卡片（图标/名称/定位/能力列表），点击展开详情 | `src/components/assistant/AgentList.vue` |
| 17.3 | `AgentDetail.vue`：子 Agent 详情弹窗（完整能力说明 + system prompt 摘要） | `src/components/assistant/AgentDetail.vue` |
| 17.4 | `ApiConfig.vue`：LLM API Key 输入框 + Base URL + 模型名 + 在线编译 API 配置 + 测试连通性按钮 | `src/components/assistant/ApiConfig.vue` |
| 17.5 | `ChatInterface.vue`：对话主界面，消息列表 + 输入框 + 发送按钮；发送时显示 loading；消息按角色区分样式 | `src/components/assistant/ChatInterface.vue` |
| 17.6 | `ChatMessage.vue`：单条消息渲染，user 消息右对齐蓝色，assistant 消息左对齐灰色；用 marked 渲染 Markdown；检测代码块用 `CodeBlock` 组件 | `src/components/assistant/ChatMessage.vue` |
| 17.7 | `CodeBlock.vue`：代码块展示（等宽字体/深色背景/语言标签）+ 一键复制按钮（用 navigator.clipboard） | `src/components/assistant/CodeBlock.vue` |
| 17.8 | `RouteIndicator.vue`：路由提示条，显示"已路由到：XXX 助手"；多 Agent 串联时显示步骤列表 | `src/components/assistant/RouteIndicator.vue` |
| 17.9 | `HistoryList.vue`：历史会话列表（标题/时间），点击加载会话继续对话；删除按钮 + 清空全部按钮 | `src/components/assistant/HistoryList.vue` |
| 17.10 | 电路报告特殊按钮：当 `routeInfo.agentId === 'circuit-report'` 时，回复区显示"导出 Word""导出 PDF"按钮 | `ChatMessage.vue` 中集成 |
| 17.11 | 代码执行按钮：当检测到 MATLAB/C 代码块时，显示"在线执行"按钮，点击调 `codeExecutor` 并在下方显示结果 | `CodeBlock.vue` 中集成 |

**验收**：
- 4 个 Tab 正常切换
- Agent 列表显示 3 个子 Agent，详情弹窗正常
- API 配置能保存，测试连通性按钮返回结果
- 对话界面能发送消息并显示回复，代码块可复制
- 路由提示正确显示
- 历史会话可查看/继续/删除

---

## 阶段 18：首页 AI 对话框

**目标**：在首页新增 AI 快捷对话区块。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 18.1 | `AiChatWidget.vue`：首页底部 AI 助手区块，标题"AI 助手" + 输入框 + 发送按钮 + 简洁对话显示区 | `src/components/home/AiChatWidget.vue` |
| 18.2 | 对话逻辑：发送消息时调用 `assistant` store 的 `sendMessage`，显示路由提示和回复 | 同上 |
| 18.3 | "展开完整对话"链接：点击跳转到 `/assistant` 并加载当前会话 | 同上 |
| 18.4 | 在 `Home.vue` 中引入 `AiChatWidget`，放在 SummaryCards 下方 | `src/views/Home.vue` 修改 |

**验收**：
- 首页底部出现 AI 对话框，能输入并发送
- 发送后显示路由提示和子 Agent 回复
- 代码块有一键复制
- "展开完整对话"跳转到我的助手页面

---

## 阶段 19：路由和导航更新

**目标**：新增我的助手路由和导航入口。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 19.1 | 新增路由 `/assistant` → `Assistant.vue`，name: `assistant` | `src/router/index.js` 修改 |
| 19.2 | 导航栏新增"助手"入口，用 `Bot` 图标（lucide-vue-next），放在"工具"和"设置"之间 | `src/App.vue` 修改 |

**验收**：
- 导航栏显示 8 个入口，"助手"可点击跳转 `/assistant`
- 路由切换正常，无报错

---

## 阶段 20：数据与设置扩展

**目标**：设置页适配 AI 助手数据。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 20.1 | 导出扩展：`exportImport.js` 的导出数据中加入 `assistant` store 数据（会话历史 + API 配置） | `src/utils/exportImport.js` 修改 |
| 20.2 | API Key 安全：导出时弹出提示"是否包含 API Key？"，默认不包含 | 同上 + `src/views/Settings.vue` 修改 |
| 20.3 | 导入扩展：导入 JSON 时恢复 `assistant` store 数据 | `src/utils/exportImport.js` 修改 |
| 20.4 | 数据概览扩展：统计中新增"AI 助手会话数" | `src/views/Settings.vue` 修改 |
| 20.5 | 按模块清空扩展：新增"清空 AI 助手数据"选项 | 同上 |

**验收**：
- 导出 JSON 包含 assistant 数据（API Key 默认不含）
- 导入后 AI 助手历史恢复
- 数据概览显示会话数
- 清空 AI 助手数据后历史清空，其他模块不受影响

---

## 阶段 21：单元测试

**目标**：为第二版核心逻辑编写单元测试。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 21.1 | LLM 封装测试：mock fetch，验证 `deepseekClient` 请求格式、响应解析、错误处理 | `test/deepseekClient.test.js` |
| 21.2 | 在线编译测试：mock fetch，验证 `codeExecutor` 各语言提交格式、结果解析 | `test/codeExecutor.test.js` |
| 21.3 | 导出工具测试：验证 `exportDocx`/`exportPdf` 函数能正常生成 Blob（不触发下载） | `test/exportDoc.test.js` |
| 21.4 | 主 Agent 测试：mock LLM，验证 `analyzeIntent` 路由判定、`keywordRoute` 关键词匹配、`executeWorkflow` 串联逻辑 | `test/mainAgent.test.js` |
| 21.5 | 子 Agent 测试：mock LLM，验证各子 Agent `handle` 函数调用 LLM 时传入正确的 system prompt | `test/agents.test.js` |
| 21.6 | assistant store 测试：验证会话 CRUD、API 配置存取、消息发送流程（mock mainAgent） | `test/assistant.test.js` |

**验收**：
- `npx vitest run` 全部通过
- 覆盖核心逻辑：LLM 封装、路由判定、子 Agent 调用、store 操作

---

## 阶段 22：整体联调与验收

**目标**：全流程跑通，按 PRD 第 21 节验收标准逐项检查。

| 任务 | 具体内容 |
|------|----------|
| 22.1 | 导航验证：8 模块切换正常，我的助手页面加载正常 |
| 22.2 | API 配置验证：输入 DeepSeek API Key → 测试连通性 → 成功 |
| 22.3 | 主 Agent 路由验证：MATLAB/电路/FPGA 三类问题分别路由到对应子 Agent |
| 22.4 | MATLAB 助手验证：粘贴代码+报错 → 分析原因 → 在线执行返回结果 |
| 22.5 | 电路报告验证：输入实验数据 → 生成报告 → 导出 Word → 导出 PDF |
| 22.6 | FPGA 助手验证：生成 Verilog 代码 → 生成单片机 C 代码 → 在线执行 C 代码 |
| 22.7 | 多 Agent 串联验证："分析代码并生成报告" → 两步执行 → 结果完整 |
| 22.8 | 对话历史验证：刷新后历史仍在 → 继续会话 → 删除会话 |
| 22.9 | 首页对话框验证：发送消息 → 显示路由和回复 → 展开完整对话跳转 |
| 22.10 | 数据导出导入验证：导出含 AI 数据 → 导入恢复 → API Key 安全提示 |
| 22.11 | 界面风格验证：AI 对话框/代码块/路由提示样式与整体协调 |
| 22.12 | 按 PRD 第 21 节验收标准逐项打勾 |

**验收**：PRD 第二版验收标准全部通过，第二版可交付。

---

## 阶段依赖关系

```
阶段11 (安装依赖)
  └→ 阶段12 (LLM 封装)
       └→ 阶段13 (在线编译封装)
            └→ 阶段14 (Word/PDF 导出)
                 └→ 阶段15 (Agent 系统核心)  ← 依赖 12+13
                      └→ 阶段16 (assistant store)  ← 依赖 15
                           ├→ 阶段17 (我的助手 UI)  ← 依赖 16
                           └→ 阶段18 (首页对话框)   ← 依赖 16
                                └→ 阶段19 (路由导航)  ← 依赖 17
                                     └→ 阶段20 (设置扩展)  ← 依赖 16
                                          └→ 阶段21 (单元测试)  ← 依赖 12-16
                                               └→ 阶段22 (联调验收)
```

> 说明：阶段 12-14 之间有顺序依赖（Agent 依赖 LLM+编译+导出）；阶段 17 和 18 可并行开发；阶段 21 测试依赖所有核心逻辑完成。

---

## 执行原则

1. **每阶段完成后即自测**：按该阶段验收标准检查，通过再进下一阶段。
2. **API Key 测试**：开发阶段使用用户提供的真实 DeepSeek API Key 测试，不硬编码到代码中。
3. **不写注释**（除非用户要求）。
4. **遵循年轻活泼风格**：AI 助手页面与其他模块风格统一。
5. **每个阶段做完后运行 `npm run dev` 确认无报错**。
6. **每个阶段做完后运行 `npx vitest run` 确认测试全通过**。
7. **每个阶段完成后 git commit**，提交信息格式 `feat(assistant): 阶段N 描述`。
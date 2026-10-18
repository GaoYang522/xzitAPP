# 开发计划 — 大学生校园一站式 APP

> 基于 PRD.md v1.0
> 日期：2026-10-16
> 技术栈：Vue 3 + Vite + Pinia + Vue Router + Tailwind CSS + lucide-vue-next

---

## 项目目录结构（最终形态）

```
xzitAPP/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── PRD.md
├── DEVELOPMENT_PLAN.md
└── src/
    ├── main.js
    ├── App.vue
    ├── router/
    │   └── index.js
    ├── stores/
    │   ├── study.js        # 课表、作业、考试、成绩
    │   ├── life.js         # 一卡通、食堂、地点、快递
    │   ├── club.js         # 社团、活动、动态
    │   ├── health.js       # 打卡、体测、运动、心情
    │   ├── tools.js        # 待办、备忘录、倒计时、习惯
    │   └── settings.js     # 学期设置、主题
    ├── views/
    │   ├── Home.vue        # 首页总览
    │   ├── Study.vue       # 学业学习
    │   ├── Life.vue        # 校园生活
    │   ├── Club.vue        # 社团社交
    │   ├── Health.vue      # 健康管理
    │   ├── Tools.vue       # 工具备忘
    │   └── Settings.vue    # 数据与设置
    ├── components/
    │   ├── common/         # 通用组件
    │   │   ├── AppCard.vue
    │   │   ├── Btn.vue
    │   │   ├── Modal.vue
    │   │   ├── ConfirmDialog.vue
    │   │   ├── EmptyState.vue
    │   │   ├── Tag.vue
    │   │   └── SectionTitle.vue
    │   ├── study/          # 学业组件
    │   ├── life/           # 校园生活组件
    │   ├── club/           # 社团组件
    │   ├── health/         # 健康组件
    │   ├── tools/          # 工具组件
    │   └── home/           # 首页组件
    ├── composables/
    │   ├── useWeek.js      # 周次计算
    │   └── useDate.js      # 日期工具
    └── utils/
        ├── gpa.js          # GPA 计算
        ├── bmi.js          # BMI 计算
        └── exportImport.js # 数据导出导入
```

---

## 阶段 0：项目初始化与基础布局

**目标**：搭起能跑的空壳，7 个页面可导航切换，主题可切换。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 0.1 | 用 Vite 创建 Vue 3 项目 | `package.json`, `vite.config.js`, `index.html`, `src/main.js`, `src/App.vue` |
| 0.2 | 安装依赖：`vue-router`, `pinia`, `pinia-plugin-persistedstate`, `tailwindcss`, `postcss`, `autoprefixer`, `lucide-vue-next` | `package.json` 更新 |
| 0.3 | 配置 Tailwind CSS：年轻活泼主题色板（蓝/紫/橙/绿多彩）、圆角默认值、渐变工具类、深色模式 class 策略 | `tailwind.config.js`, `postcss.config.js` |
| 0.4 | 配置 Pinia + persistedstate 插件，实现 store 自动同步 localStorage | `src/main.js` |
| 0.5 | 创建路由：7 个路由 + 首页，默认跳转首页 | `src/router/index.js`, `src/views/*.vue`（空页面） |
| 0.6 | 基础布局：顶部导航栏（7 模块入口 + 当前周次 + 主题切换按钮）+ 内容区 | `src/App.vue` |
| 0.7 | 浅色/深色主题切换：toggle 按钮 + 持久化记住选择 | `src/stores/settings.js`（部分） |

**验收**：
- `npm run dev` 能在浏览器打开，无报错
- 7 个导航项可切换，路由正确
- 主题切换正常，刷新后记住选择

---

## 阶段 1：通用组件与工具函数

**目标**：建好后续所有模块复用的通用组件和工具函数。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 1.1 | `AppCard` 卡片组件：圆角、阴影、可选标题 | `src/components/common/AppCard.vue` |
| 1.2 | `Btn` 按钮组件：多变体（primary/secondary/danger/ghost）、圆角、渐变 | `src/components/common/Btn.vue` |
| 1.3 | `Modal` 弹窗组件：遮罩、标题、内容、关闭 | `src/components/common/Modal.vue` |
| 1.4 | `ConfirmDialog` 确认弹窗：二次确认用 | `src/components/common/ConfirmDialog.vue` |
| 1.5 | `EmptyState` 空状态组件：图标 + 提示文案 | `src/components/common/EmptyState.vue` |
| 1.6 | `Tag` 标签组件：彩色标签 | `src/components/common/Tag.vue` |
| 1.7 | `SectionTitle` 区块标题组件 | `src/components/common/SectionTitle.vue`> |
| 1.8 | 日期工具：格式化、今天、日期比较、天数差 | `src/composables/useDate.js` |
| 1.9 | 周次计算：根据学期开始日期算当前第几周 | `src/composables/useWeek.js` |
| 1.10 | GPA 计算工具：标准 4.0 制 |0.0 | `src/utils/gpa.js` |
| 1.11 | BMI 计算工具 | `src/utils/bmi.js` |

**验收**：各组件能独立渲染，工具函数返回正确结果。

---

## 阶段 2：数据与设置模块（基础部分）

**目标**：先做设置模块中其他模块依赖的部分（学期设置、主题、数据概览、关于）。
导出/导入/清空放最后阶段。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 2.1 | `settings` store：学期开始日期、总周数、主题 | `src/stores/settings.js` |
| 2.2 | 学期设置 UI：日期选择 + 总周数输入 | `src/views/Settings.vue`（部分） |
| 2.3 | 主题切换接入设置页 | 同上 |
| 2.4 | 数据概览：读取各 store 统计条数 | 同上 |
| 2.5 | 关于页面：APP 名、版本、说明 | 同上 |

**验收**：能设置学期日期和总周数，数据概览显示各模块条数。

---

## 阶段 3：学业学习模块

**目标**：课表、作业、考试、成绩四大功能完整可用。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 3.1 | `study` store：courses、homework、exams、grades 四组数据 + 各自 CRUD 方法 | `src/stores/study.js` |
| 3.2 | 课表管理 UI：添加/编辑课程表单、周课表网格视图、当前周次显示、课程颜色标记 | `src/views/Study.vue`, `src/components/study/CourseForm.vue`, `src/components/study/WeekTable.vue` |
| 3.3 | 作业登记 UI：列表 + 添加表单 + 完成标记 + 按科目/状态筛选 | `src/components/study/HomeworkList.vue`, `src/components/study/HomeworkForm.vue` |
| 3.4 | 考试安排 UI：列表 + 添加表单 + 倒计时显示 | `src/components/study/ExamList.vue`, `src/components/study/ExamForm.vue` |
| 3.5 | 成绩记录 UI：列表 + 录入表单 + GPA 显示 | `src/components/study/GradeList.vue`, `src/components/study/GradeForm.vue` |

**验收**：
- 课程增删改查正常，周课表按当前周次显示正确
- 作业增删改 + 完成标记 + 筛选正常
- 考试倒计时天数正确
- GPA 计算正确（手动验证一例：80分3学分 + 90分2学分）

---

## 阶段 4：工具备忘模块

**目标**：通用待办、备忘录、倒计时、习惯打卡完整可用。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 4.1 | `tools` store：todos、notes、countdowns、habits 四组数据 + CRUD 方法 | `src/stores/tools.js` |
| 4.2 | 通用待办 UI：列表 + 表单 + 完成标记 + 按分类/优先级/状态筛选 | `src/views/Tools.vue`, `src/components/tools/TodoList.vue`, `src/components/tools/TodoForm.vue` |
| 4.3 | 备忘录 UI：列表 + 编辑 + 搜索 + 分类 | `src/components/tools/NoteList.vue`, `src/components/tools/NoteEditor.vue` |
| 4.4 | 倒计时 UI：列表 + 表单 + 剩余天数 + 分类颜色 | `src/components/tools/CountdownList.vue`, `src/components/tools/CountdownForm.vue` |
| 4.5 | 习惯打卡 UI：习惯列表 + 每日打卡按钮 + 连续天数 + 打卡日历 | `src/components/tools/HabitList.vue`, `src/components/tools/HabitForm.vue` |

**验收**：
- 待办增删改 + 完成 + 筛选正常
- 备忘录搜索正常
- 倒计时剩余天数正确
- 习惯连续天数计算正确（连续打卡3天显示3）

---

## 阶段 5：校园生活模块

**目标**：一卡通、食堂、地点、快递完整可用。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 5.1 | `life` store：card（余额+消费）、canteen、places、packages 四组数据 + 方法 | `src/stores/life.js` |
| 5.2 | 一卡通 UI：余额显示 + 记账表单 + 充值 + 消费列表 + 简单趋势 | `src/views/Life.vue`, `src/components/life/CardWallet.vue`, `src/components/life/CardRecord.vue` |
| 5.3 | 食堂备忘 UI：列表 + 表单 + 按评分/标签筛选 | `src/components/life/CanteenList.vue`, `src/components/life/CanteenForm.vue` |
| 5.4 | 常用地点 UI：列表 + 表单 + 按类别筛选 | `src/components/life/PlaceList.vue`, `src/components/life/PlaceForm.vue` |
| 5.5 | 快递提醒 UI：待取列表 + 添加 + 标记已取 | `src/components/life/PackageList.vue`, `src/components/life/PackageForm.vue` |

**验收**：
- 记账后余额正确扣减，充值后正确增加
- 食堂、地点筛选正常
- 快递标记已取后从待取列表消失

---

## 阶段 6：社团社交模块

**目标**：社团、活动、动态完整可用。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 6.1 | `club` store：clubs、activities、posts 三组数据 + CRUD 方法 | `src/stores/club.js` |
| 6.2 | 我的社团 UI：列表 + 表单 | `src/views/Club.vue`, `src/components/club/ClubList.vue`, `src/components/club/ClubForm.vue` |
| 6.3 | 社团活动 UI：列表 + 表单 + 报名状态切换 + 活动日历视图 | `src/components/club/ActivityList.vue`, `src/components/club/ActivityForm.vue` |
| 6.4 | 校园动态 UI：发帖表单 + 帖子列表 + 标签筛选 + 删除 | `src/components/club/PostList.vue`, `src/components/club/PostForm.vue` |

**验收**：社团/活动/动态增删改正常，报名状态切换正常，标签筛选正常。

---

## 阶段 7：健康管理模块

**目标**：打卡、体测、运动、心情完整可用。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 7.1 | `health` store：checkins、fitness、exercises、moods 四组数据 + 方法 | `src/stores/health.js` |
| 7.2 | 每日打卡 UI：今日打卡表单 + 历史记录 + 编辑 | `src/views/Health.vue`, `src/components/health/CheckinCard.vue`, `src/components/health/CheckinHistory.vue` |
| 7.3 | 体测数据 UI：录入表单 + BMI 自动计算 + 历史列表 | `src/components/health/FitnessForm.vue`, `src/components/health/FitnessList.vue` |
| 7.4 | 运动记录 UI：列表 + 表单 + 按周/月统计总时长和距离 | `src/components/health/ExerciseList.vue`, `src/components/health/ExerciseForm.vue`, `src/components/health/ExerciseStats.vue` |
| 7.5 | 心情记录 UI：列表 + 表单 + 趋势展示（简单折线/列表） | `src/components/health/MoodList.vue`, `src/components/health/MoodForm.vue`, `src/components/health/MoodTrend.vue` |

**验收**：
- 打卡正常，今日打卡状态可查
- BMI 自动计算正确（身高1.75m体重70kg → 22.86）
- 运动统计按周/月聚合正确
- 心情趋势展示正常

---

## 阶段 8：首页总览

**目标**：聚合各模块数据，首页一眼掌握全局。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 8.1 | 今日课表区块：从 study store 取今天课程（根据当前周次+星期） | `src/views/Home.vue`, `src/components/home/TodaySchedule.vue` |
| 8.2 | 今日待办区块：合并 study.homework（今天到期未完成）+ tools.todos（今天到期未完成） | `src/components/home/TodayTodos.vue` |
| 8.3 | 模块摘要卡片：学业（作业+考试倒计时）、校园生活（快递+余额）、社团（近期活动）、健康（打卡状态）、工具（待办数+倒计时） | `src/components/home/SummaryCards.vue` |
| 8.4 | 快捷入口：一键跳转加课、加待办、打卡等 | `src/components/home/QuickActions.vue` |

**验收**：
- 今日课表正确显示今天课程
- 今日待办正确合并作业和通用待办
- 各摘要卡片数据正确
- 快捷入口跳转正确

---

## 阶段 9：数据导出/导入与清空

**目标**：数据备份恢复闭环，清空安全。

| 任务 | 具体内容 | 产出文件 |
|------|----------|----------|
| 9.1 | 导出工具函数：聚合所有 store 数据为 JSON | `src/utils/exportImport.js` |
| 9.2 | 导出 UI：一键导出，生成带时间戳文件名，触发下载 | `src/views/Settings.vue`（补充） |
| 9.3 | 导入 UI：选择文件 + 格式校验 + 覆盖确认 + 恢复数据到各 store | 同上 |
| 9.4 | 按模块清空 UI：选择模块 + 二次确认 + 清空对应 store | 同上 |
| 9.5 | 全量清空 UI：二次确认 + 清空所有 store + localStorage | 同上 |

**验收**：
- 导出 JSON 包含所有模块数据，文件名带时间戳
- 导入导出的 JSON 后数据完整恢复
- 按模块清空只清空该模块，其他不受影响
- 全量清空需二次确认

---

## 阶段 10：整体联调与验收

**目标**：全流程跑通，按 PRD 验收标准逐项检查。

| 任务 | 具体内容 |
|------|----------|
| 10.1 | 各模块与首页联动验证：作业→今日待办、课表→今日课表、考试→摘要、快递→摘要、活动→摘要、打卡→摘要、倒计时→摘要 |
| 10.2 | 数据持久化验证：添加数据 → 刷新 → 关闭浏览器重开 → 数据仍在 |
| 10.3 | 界面风格统一检查：圆角、渐变、配色、间距、深色模式各页面一致 |
| 10.4 | 响应式检查：常见笔记本屏幕尺寸下显示正常 |
| 10.5 | 按 PRD 第 10 节验收标准逐项打勾 |

**验收**：PRD 验收标准全部通过，第一版可交付。

---

## 阶段依赖关系

```
阶段0 (初始化)
  └→ 阶段1 (通用组件/工具)
       ├→ 阶段2 (设置基础)  ← 其他模块依赖学期设置
       │    └→ 阶段3 (学业)  ← 课表依赖学期设置
       │         └→ 阶段4 (工具)
       │              └→ 阶段5 (校园生活)
       │                   └→ 阶段6 (社团)
       │                        └→ 阶段7 (健康)
       │                             └→ 阶段8 (首页聚合)  ← 依赖所有模块
       │                                  └→ 阶段9 (导出导入)  ← 依赖所有 store
       │                                       └→ 阶段10 (联调验收)
```

> 说明：阶段 3-7 之间无强依赖，可调整顺序；但阶段 2 必须在阶段 3 前（课表依赖学期设置），阶段 8 必须在所有功能模块后（聚合数据），阶段 9 必须在所有 store 定义后。

---

## 执行原则

1. **每阶段完成后即自测**：按该阶段验收标准检查，通过再进下一阶段。
2. **数据持久化从阶段 2 起全程验证**：每个 store 写入后确认 localStorage 有数据、刷新后恢复。
3. **不写注释**（除非用户要求）。
4. **遵循年轻活泼风格**：所有页面统一圆角、渐变、多彩配色。
5. **每个模块做完后运行 `npm run dev` 确认无报错**。
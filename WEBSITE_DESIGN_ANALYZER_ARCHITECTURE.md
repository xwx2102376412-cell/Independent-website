# website-design-analyzer 架构设计

日期：2026-09-07。状态：架构方案，尚未实现或安装 Skill。

## 1. 判断与已确认范围

采用「确定性测量脚本 + 有证据的设计判断 + 当前项目适配」架构。脚本负责采集和验证，Codex 负责理解视觉方向、组件语义、品牌适配与优先级，不让脚本伪装成能判断全部设计质量的评分器。

用户已确认：通用核心 + E-bike 专项规则；本地 Node.js + Playwright，可按需安装浏览器依赖；MVP 单页完整分析、支持指定组件，多页面放 V2。

默认流程：Analyze → Understand → Adapt → Recommend → Stop。分析只写研究产物，不能写应用源码、配置、依赖清单或品牌资产。后续明确指定实施范围，才进入独立的实施模式。当前任务只交付本架构。

完整报告中的“整体网站”在 MVP 必须表述为“当前页面所呈现的整体设计方向”，不能从首页推断整站一致性。

## 2. 当前项目实查

本次读取 package.json、已安装依赖版本、src/app、src/components、globals.css、layout、首页、商品卡、Header、VariantPicker、商品详情、tsconfig 与 PostCSS 配置；未启动本地站点或执行浏览器测量。

| 项目 | 当前证据 | 架构影响 |
|---|---|---|
| 框架 | 已安装 Next.js 16.3.4；React；TypeScript；App Router | 读取 package.json + 锁文件/安装版本，不能把 latest 当版本 |
| 样式 | Tailwind 4.3.3，@tailwindcss/postcss；globals.css 导入 Tailwind | 支持 v4 CSS 配置，也兼容其他项目的 v3 config |
| Token | globals.css 的 :root 变量和 prefers-color-scheme: dark | 对明暗主题分别记录，保留项目语义命名 |
| 字体 | layout.tsx 使用 GeistSans.variable | 识别字体加载与实际渲染字体；不复制参考字体文件 |
| 容器 | .shell: min(1400px, calc(100% - 40px))；767px 以下调整边距 | 源码声明与浏览器计算宽度分开存储 |
| Hero | src/app/page.tsx 中第一个 section，非独立组件 | 映射到文件 + 导出符号 Home + JSX 区块 |
| Hero 高度 | min-h-[calc(100dvh-72px)] | 不能把用户示例 600px 当成当前事实 |
| ProductCard | src/components/product-card.tsx；aspect-[4/3]；group-hover 缩放 | 已有 4:3，可建议保留，不制造改造需求 |
| Header | src/components/header.tsx；sticky；72px；md 响应式导航 | 移动菜单开闭状态要实测；当前不是 Mega Menu |
| 商品详情 | src/app/bikes/[slug]/page.tsx | Product Gallery 候选目前是单图区域，不能报成多图画廊 |
| 规格选择 | src/components/variant-picker.tsx | 组合 SKU 选择；颜色、电池、轮胎展示不等于三个独立选择器 |
| 数据与功能 | 商品读取、CartProvider、购物车与结账等既有模块 | 视觉改造需要追踪组件消费者，不能破坏 SKU/价格/库存流程 |

当前橙色、明暗中性色和 Geist 作为初始品牌约束，允许未来用户覆盖。该约束是分析输入，不硬编码在通用采集器中。

## 3. 五个参考仓库的研究结论

本次完成公开 README、相关 Skill 指令和关键源码静态阅读；没有安装、运行或验证仓库性能。下面的设计选择是本方案判断，非第三方验证结论。

| 项目与关键文件 | 可借鉴的实现 | 本方案调整 |
|---|---|---|
| [Mahanaicoach/ai-site-cloner](https://github.com/Mahanaicoach/ai-site-cloner)，scripts/extract/responsive.mjs、section.mjs、collectors.mjs | 三尺寸批量测量、DOM walk、状态前后树差异、紧凑数据 | 保留采集思想；移除资产复制和自动重建。源码有元素截断及捕获失败分支，本方案必须显式报告采样覆盖率，不能宣称全部数值已测得 |
| [maiconlara/design-system-extraction](https://github.com/maiconlara/design-system-extraction)，SKILL.md、scripts/setup.js | CSS 声明与计算值分开、阻塞样式表统计、分页输出、形状和动效采集 | 不采用“永远以声明侧为准”：声明可能未使用。也不把未检测到的阴影等直接解释为设计禁令 |
| [billhector/design-skills](https://github.com/billhector/design-skills)，skills/design-auditor/SKILL.md | 本地样式来源发现，v3/v4 区分，暗色主题识别 | 这是审计指令，不能替代 AST 映射引擎；不自动迁移 Tailwind 或生成待应用主题。仓库页面显示已归档 |
| [0ldManPlaying/url-style-extractor](https://github.com/0ldManPlaying/url-style-extractor)，scripts/extract.py | Python Playwright；按元素面积给颜色/字体加权；提取 root 变量 | 保留面积加权作为辅助统计。嵌套元素重叠会重复计数，不能称为真实像素占比。无需引入 Python/Streamlit 第二运行时 |
| [azeembuilds/website-cloner](https://github.com/azeembuilds/website-cloner)，extract-state-deltas.js、visual-diff.js | 唯一选择器验证、hover/focus/active 差异、伪元素状态、pixelmatch | 不使用复制资产与重建流水线。视觉差异实现包含画布裁补，尺寸不一致须独立报出；固定等候不能证明动效已经稳定 |

优先复用成熟基础库，参考仓库只借鉴设计。若后续确需移植源码，先核对具体版本 LICENSE、固定 commit、保留所需声明，不能只看 README 的授权摘要。

## 4. 模块与数据流

```text
Input / scope / brand constraints
              ↓
Preflight → run manifest + capability report
              ↓
Reference browser capture      Current static audit
DOM/styles/geometry/states     files/imports/JSX/CSS/tokens
              ↓                    ↓
Evidence store ← Current browser capture (when available)
              ↓
Normalized tokens + component candidates + responsive observations
              ↓
Codex semantic review → component mapping → gap decisions
              ↓
Schema/evidence/path validation → fixed reports → STOP

Explicit implementation request → revalidate plan/source hashes
 → scoped code changes → project checks → three-viewport QA
```

设计原则：采集器不做品牌判断；归一化不覆盖原始值；模型判断必须引用证据；报告模板不生成不存在的组件文件。

## 5. 建议 Skill 目录

下列为未来目录设计，本次不创建脚手架。

```text
website-design-analyzer/
  SKILL.md
  agents/openai.yaml
  package.json
  package-lock.json
  scripts/
    analyze.mjs
    preflight.mjs
    capture-page.mjs
    audit-project.mjs
    normalize-evidence.mjs
    validate-report.mjs
    render-reports.mjs
    visual-qa.mjs                 # V2 实现
    lib/
      browser.mjs
      collect-dom.mjs
      collect-styles.mjs
      collect-states.mjs
      responsive.mjs
      parse-project.mjs
      component-candidates.mjs
      evidence-store.mjs
  schemas/
    run.schema.json
    evidence.schema.json
    tokens.schema.json
    components.schema.json
    responsive.schema.json
    current-components.schema.json
    decisions.schema.json
  references/
    analysis-protocol.md
    design-interpretation.md
    component-taxonomy.md
    adaptation-rubric.md
    implementation-and-qa.md
    ecommerce-ebike.md
  assets/report-templates/
    SITE_OVERVIEW.md
    DESIGN_SYSTEM.md
    COMPONENT_ANALYSIS.md
    CURRENT_SITE_ANALYSIS.md
    DESIGN_GAP.md
    ADAPTATION_PLAN.md
    IMPLEMENTATION_PLAN.md
  tests/
    fixtures/                    # 自有合成页面和小型项目
    capture.test.mjs
    audit.test.mjs
    authorization.test.mjs
```

采用 .mjs 使脚本不依赖宿主项目 TS 编译配置。Skill 的依赖放在自身目录，避免给被分析项目安装依赖。schemas 是机器契约，references 解释语义，模板只负责排版，避免三处重复维护规则。

## 6. 脚本职责

| 脚本/模块 | 输入 → 输出 | 责任边界 |
|---|---|---|
| analyze.mjs | URL、项目路径、页面/组件、可选 current URL → 本次 run | 编排确定性阶段；语义判断缺失时停在 awaiting_analysis，不调用额外模型 API |
| preflight.mjs | 参数、运行环境 → manifest | 校验输出路径、浏览器能力、URL 与已有产物；记录预算、版本、主题和页面范围 |
| capture-page.mjs | URL + viewport/state 配置 → 原始证据与截图 | 参考与当前站共用；等待字体/图片与布局稳定；滚动触发懒加载；限时、限深、限节点 |
| collect-dom.mjs | 页面 → 紧凑节点树 | 语义标签、父子关系、role、结构化内容长度、bounds、可见性、伪元素；不导出整站可复用 HTML |
| collect-styles.mjs | 节点 → properties | 采集指定 computed properties、CSS 变量、可读规则；每个失败保留原因 |
| collect-states.mjs | 唯一节点定位器 + 动作清单 → 状态 delta | hover、键盘 focus-visible、active、展开/折叠、选择；动作后恢复基线，失败不写成“无变化” |
| responsive.mjs | 同一组件多尺寸证据 → responsive.json | 比较列数、顺序、换行、显示、宽高和间距；声明断点与观察区间分开 |
| audit-project.mjs | 项目根目录 → 当前组件/样式清单 | 读取 app/src/components/styles、CSS 与 Tailwind 配置；排除 .env、构建产物和第三方依赖源码 |
| parse-project.mjs | TS/JS/CSS → AST、导入图、源码区块 | 识别导出组件、页面内 JSX、client/server 边界、别名、样式来源；动态结果标记 unresolved |
| component-candidates.mjs | DOM + AST 特征 → 候选映射 | 角色、结构、路由、图片/操作特征匹配；允许一对多、多对一、未匹配，由 Codex 审核 |
| normalize-evidence.mjs | 采样值 → Token 候选、频次与范围 | 单位/颜色归一化，保留原值；聚类候选不直接升级为正式设计 Token |
| evidence-store.mjs | 证据 → run 内文件 + 索引 | 稳定 ID、来源、哈希、状态、错误；紧凑摘要供模型读取 |
| validate-report.mjs | JSON、决策、源码根目录 → 验证结果 | Schema、证据引用、路径存在、数值状态、组件覆盖、viewport 完整性、分析写入边界 |
| render-reports.mjs | 已验证数据 + Codex decisions → 固定报告 | Markdown 和 JSON 同源生成，避免手抄测量值 |
| visual-qa.mjs | 授权后的本地实现 + 已接受方案 → QA 证据 | 三尺寸行为检查、同站前后差异、适配目标核查；不以跨品牌 pixelmatch 作为成功阈值 |

## 7. 数据契约与证据等级

所有 JSON 含 schemaVersion、runId、generatedAt。每条观察保留 evidenceId、URL/源码位置、viewport 的 width/height、主题、state、selector/nodeId、sourceKind、rawValue、normalizedValue、confidence、limitations。

- sourceKind：measured（运行时实测）、declared（源码/CSS 声明）、inferred（推断）、proposed（方案）。
- status：observed、not-observed、unsupported、blocked、not-applicable；unknown 的值为 null，不能用 0 或 none 冒充。
- 当前组件另含 file、exportName、sourceRange、sourceHash、route、consumers、mappingConfidence。
- 每条建议另含 referenceEvidenceIds、currentEvidenceIds、classification、rationale、adaptationScore、priority、effort、dependencies、acceptanceCriteria。
- 无参考值仍可生成合理建议，但必须标为 proposed；不能伪造 reference 数值。

断点规则：1440×900、768×1024、390×844 为默认可配置样本，宽度满足用户固定要求；同时记录 DPR、pointer/hover、colorScheme 与 reducedMotion。宽 390 的桌面上下文不等于真实移动设备，移动配置要明确触摸能力，iOS/Safari 验证是后续能力。

三个样本只能给出“布局变化发生在某区间”。如需精确断点，应读取可访问 CSS media/container query 或自适应加测边界两侧；不能把 768px 直接命名为参考站的真实 breakpoint。对 dvh、clamp、百分比保留声明与实测两份信息。

Token 分三层：declared 原始声明、observed 使用分布、recommended 当前项目适配值。颜色同时保留语义用途、前景/背景配对、透明度；面积加权和频次仅是候选排序。图片区分资源尺寸、布局容器比例与 object-fit 裁切。

组件识别采用 taxonomy + 候选规则 + Codex 审核。覆盖用户列出的通用组件及电商组件，存在性必须有依据。电池/电机/轮胎等规则按 E-bike profile 加载；不把“未出现”自动写成“应该新增”。

Interaction/Motion：CSS transition、keyframes、运行中的 Web Animations 与真实状态差异分别记录。正常动效采样与冻结动效截图分开；固定等待时间只是超时预算，不能作为稳定证明。canvas、封闭 shadow root、跨域 iframe 等无法结构化读取时标记局部覆盖，截图仅提供视觉佐证。

## 8. 产物目录与报告内容

保留用户要求的全部固定路径；增加内部证据与运行元数据。

```text
.design-research/
  reference/
    SITE_OVERVIEW.md
    DESIGN_SYSTEM.md
    COMPONENT_ANALYSIS.md
    design-tokens.json
    components.json
    responsive.json
  current/
    CURRENT_SITE_ANALYSIS.md
    current-components.json
  recommendation/
    DESIGN_GAP.md
    ADAPTATION_PLAN.md
    IMPLEMENTATION_PLAN.md
  runs/<run-id>/
    manifest.json
    evidence/
    screenshots/
    decisions.json
    validation.json
    reports/                     # 此次固定报告快照
```

run-id 用时间与短随机 ID，包含 pageId 防止同域不同页面相互覆盖。所有报告校验后更新固定路径；报告注明 runId，manifest 记录已发布版本，部分写入失败不报成功。保留旧 run，不自动批量删除。多页面 V2 在 run 内分 pageId 保存，固定报告输出跨页汇总。

SITE_OVERVIEW 包含 Visual direction、Brand feeling、Content density、Typography hierarchy、Layout、Whitespace、Image、CTA、Navigation strategy。DESIGN_SYSTEM 覆盖 Colors、Typography、Spacing、Radius、Shadows、Borders、Container、Grid、Breakpoints。COMPONENT_ANALYSIS 为每个组件覆盖 DOM、Layout、Size、Spacing、Typography、Colors、Border、Radius、Shadow、Image ratio、States、Motion、Responsive，未知字段说明原因。

指定组件模式仍做页面结构与共享 Token 轻量侦察，但只对目标组件深采样；输出同样的文件并标注 scope=component，不能冒充整页全量分析。

## 9. Gap、分类与 Adaptation Score

Gap 表：Property | Reference | Current | Classification | Recommendation | Evidence | Confidence。每个模式分类为 REUSE PATTERN、ADAPT 或 AVOID。

- REUSE PATTERN：复用布局/交互规律，同时保留当前品牌与内容；可以推荐保持现状。
- ADAPT：改变尺寸、比例、层级或行为，说明业务原因。
- AVOID：与当前业务、品牌、可访问性或产品数据不匹配。

建议 Adaptation Score = 0.30×任务/业务适合度 + 0.25×品牌适合度 + 0.25×可用性/可访问性 + 0.20×工程适配性，各维 0–100，并附理由。这是可审阅的启发式判断，不是转化率预测或客观测量。

证据 confidence 独立展示，缺少关键证据时 Score 为 provisional 或 null；不把不确定性藏在总分里。评分不自动决定分类：即使分数高，品牌资产复制或不可用交互也不可复用。优先级再考虑影响范围、现有问题严重度、成本和依赖，不能按参考相似度排序。

示例仅说明判断：若参考卡片为 1:1，当前卡片已是 4:3，而横向车身在现有图片中更完整，则 ADAPT 并建议保留 4:3；此时比例无需改代码。4:3 不是所有 E-bike 图片的固定真理，仍需检查构图与裁切。

## 10. IMPLEMENTATION_PLAN 的强制结构

每项列出：priority、问题、证据、当前文件和区块、当前值→建议值、调整理由、受影响文件、共享消费者、依赖、工作量、验收、风险与回退范围。

当前项目可定位示例：

```text
Priority: 待实际参考分析后排序
Component: Hero
Current file: src/app/page.tsx
Anchor: Home → main → first section
Current min-height: calc(100dvh - 72px)（源码声明）
Proposed min-height: 待三尺寸证据与品牌适配评估后确定
Potential files: src/app/page.tsx、src/app/globals.css
Optional extraction: src/components/home/hero.tsx（拟新增，当前不存在）
Checks: 三尺寸文字不裁切、CTA 可达、图片主体完整、无横向溢出
```

未来实施前校验 sourceHash 和计划版本；代码已变化则刷新受影响部分。用户只授权 Hero 时，不因共享 Token 顺手改全站。涉及 globals.css 时必须列出其他受影响组件并控制范围。遵守项目 AGENTS.md，写 Next.js 代码前读取安装版本的本地 docs。

## 11. SKILL.md 章节设计

1. Frontmatter：名称 website-design-analyzer；描述“参考网站设计逆向分析、当前 React/Next 项目差距与适配方案”，避免仅贴任意 URL 就触发。
2. Purpose：Analyze → Understand → Adapt；品牌资产、Logo、文案不复制。
3. Modes：完整单页 / 指定组件 / 后续明确授权实施；默认报告后停止。
4. Inputs & defaults：URL、项目根目录、scope、可选 current URL、品牌约束、E-bike profile。
5. Preflight：工具、浏览器、输出目录、版本与能力边界。
6. Evidence workflow：采集、归一化、当前代码审计、模型判断、验证、报告。
7. Decision rules：证据等级、REUSE PATTERN/ADAPT/AVOID、Score 与 unknown。
8. Output contract：固定文件、覆盖检查与失败状态。
9. Implementation gate & QA：明确范围授权、重新校验来源、测试与三维质量评价。
10. Reference routing：按阶段加载对应 references，不一次载入所有资料。

SKILL.md 不包含完整采集代码、庞大组件表和全部 JSON 定义；这些分别放 scripts、taxonomy 和 schemas。无需默认安排多 agent，也不增加额外 API key 前提。

## 12. 自研与依赖选择

| 能力 | 决策 | 理由 |
|---|---|---|
| 浏览器控制、截图、状态动作 | Playwright | 复用浏览器自动化基础能力，统一参考与当前页面采集 |
| JS/TS/JSX AST | TypeScript Compiler API；必要时增加 Babel 支持 | 已有成熟语法树，不用正则猜组件边界 |
| CSS 解析 | PostCSS；需要时加 selector/value parser | 支持规则结构，不手写 CSS 大正则 |
| JSON 契约 | JSON Schema + Ajv | 一套契约验证全部产物与证据引用 |
| 图像差异 | V2：pixelmatch + pngjs | 用于同站回归与局部佐证；不作为跨品牌适配评分 |
| 可访问性自动检查 | V2：@axe-core/playwright | 自动检查只覆盖一部分，仍需键盘和视觉验收 |
| 组件语义、适配规则、映射和优先级 | 自研规则 + Codex 判断 | 现有克隆工具未覆盖本任务的品牌与业务适配核心 |
| 证据存储、覆盖率、报告编排 | 自研 | 固定输出契约与可追溯性是本 Skill 的主体 |
| Firecrawl、Streamlit、额外 LLM 服务 | 不作为必需依赖 | 当前方案以本地浏览器和 Codex 为主，不增加第二执行栈 |

具体版本在实现时固定并运行兼容性验证，本次不安装。成熟库不等于引用仓库整体成熟，仓库自报的速度和准确率不作为验收目标。

## 13. MVP → V2 → V3 开发计划

以下工作日为开发估算，不是完成承诺；以验收门槛决定是否进入下一阶段。

| 阶段 | 顺序与交付 | 验收门槛 | 估算 |
|---|---|---|---|
| MVP-A | Schema、manifest、只读输出边界、静态审计 | 当前 Hero 定位到 page.tsx 区块，ProductCard 定位到真实文件；分析不能写应用源码 | 1–2 日 |
| MVP-B | 单页三尺寸 DOM/CSS/geometry、关键状态与截图、Token 候选 | 每个固定 viewport 有证据；能区分未知/缺失/失败；采样截断有覆盖记录 | 2–3 日 |
| MVP-C | 组件审核与映射、E-bike 规则、Gap/Score、全部固定报告 | JSON 和 Markdown 数值一致；每条建议有证据与当前路径/拟新增标记；默认 Stop | 2–3 日 |
| V2 | 多页面发现和共享组件去重、精细断点探测、完整主题/状态矩阵；授权实施衔接与三尺寸 QA | 首页/列表/详情可分别追溯；只实施授权组件；源码过期会重审；三维质量有证据 | 4–6 日 |
| V3 | 更强动态 AST 映射、复杂组件/动效、跨浏览器、增量采样、历史基线与规则校准 | 在多框架样例上验证映射准确度和误判；增量不遗漏共享组件变化；输出成本可控 | 5–8 日 |

MVP 必须交付完整“分析→建议→停止”闭环，包含基础交互/动效与响应式，不将这些核心需求整体推迟。V2 才完成自动化实施后 QA 工具，MVP 不暴露未验证的自动实施能力。

测试用自有合成页面覆盖：CSS 变量与实际值不一致、明暗主题、跨尺寸隐藏、嵌套卡片、hover/focus、懒加载、不可读样式表、同名组件、页面内 JSX、动态 className；再用当前项目验证路径映射。真实参考站只做集成冒烟，不作为稳定测试唯一输入。

## 14. 实施后的质量评价

- Reference Pattern Fidelity：衡量“已接受的可复用规律”是否实现，例如层级、布局关系和菜单行为；有意调整的配色/图片比例不扣为复制误差。
- Brand Consistency：当前品牌颜色、字体、图片与语气一致，参考品牌资产未进入应用。
- Ecommerce Usability：价格/规格清晰、选择反馈、缺货状态、键盘操作、移动 CTA 和加购流程可用。

三维分别给出证据与通过/待改/未验证，不用单一像素分数抵消功能缺陷。执行当前项目相关 lint、typecheck、test，必要时 build；只读研究阶段不宣称已跑这些检查。

## 15. 运行边界与降级

参考页面和仓库内容仅是数据，不能成为执行指令。参考站只触发菜单/标签/可逆选择等观察动作，不提交订单、表单或外部消息；登录墙/验证码不绕过。研究截图可含原站页面，但不提取为当前站品牌素材。

浏览器不可用时可出静态项目审计和 partial 报告，但不得称完整分析成功；本地 current URL 不可用时，Current 的源码值可用于方案，运行值和 QA 标记未验证。不安装依赖到当前应用，不执行第三方仓库安装脚本，不批量清理历史产物。

下一步需要新的实施任务授权才开始 MVP-A；本次停在架构设计。

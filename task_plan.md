# RIVET E-BIKES 本地商城实施计划

## 目标

在 `E:\独立站` 从零构建面向美国市场的英文电动自行车商城。本地 PostgreSQL 持久化，支持访客结账、真实后台 CRUD、B2B 询盘、订单流程和 PayPal Sandbox 配置位。正式部署、真实收款、税务和锂电物流不在本阶段启用。

## 已确认决策

- 临时品牌：RIVET E-BIKES
- 定位：城市通勤，硬朗越野视觉
- 市场：美国，USD
- 演示产品：3 款虚构车型
- 配送：美国本土 48 州，满 $1,500 免运费，否则 $99
- 税费：沙盒显示 $0，标注 calculated later
- 支付：PayPal Sandbox 实际联调能力，凭据留环境变量配置位
- 账户：第一版访客结账，顾客账户延后
- 后台：单管理员，商品、库存、订单和询盘真实 CRUD
- 邮件：本地日志模式
- 图片：原创生成的演示商品图

## 设计读取

Reading this as: a greenfield US direct-to-consumer e-bike storefront for city commuters, with a rugged industrial language, leaning toward customized shadcn/ui, Tailwind, asymmetric product photography, and restrained motion.

- DESIGN_VARIANCE: 7
- MOTION_INTENSITY: 5
- VISUAL_DENSITY: 4
- 主题：深色为主，深炭黑与冷灰，单一安全橙强调色
- 形状：卡片 12px，输入 8px，操作按钮 8px

## 阶段

### Phase 0：工程与风险基线 [complete]

- 检查 Node、npm、Docker/PostgreSQL 与 Git 环境
- 建立 Next.js、TypeScript、Tailwind、Prisma 骨架
- 写入环境变量示例与正式上线阻断项

### Phase 1：数据库与领域模型 [complete]

- Product、MarketVersion、Variant、Inventory
- Cart、Order、OrderItem、PaymentEvent
- Inquiry 与后台管理员会话
- 迁移、种子数据与数据库校验

### Phase 2：品牌视觉与原创素材 [complete]

- 生成 3 款车型的英雄图与商品图
- 建立 RIVET 视觉令牌、导航、页脚和响应式布局
- 首页、产品列表、产品详情、比较页

### Phase 3：购物车与访客结账 [complete]

- 购物车只保存 variantId、market、quantity
- 服务端重查价格、市场和库存
- 配送与税费演示规则
- 创建 Pending Order

### Phase 4：支付与订单闭环 [complete-code / credentials-pending]

- PayPal provider 抽象和 Sandbox 配置
- Webhook 验签入口与幂等事件记录
- 只有服务端支付事件可将订单置为 PAID
- 库存扣减与本地邮件日志

### Phase 5：后台与 B2B [complete]

- 单管理员登录与受保护路由
- 商品、Variant、库存、订单、询盘 CRUD
- Dealer 与 Wholesale 表单及状态流转

### Phase 6：支持、内容与 SEO [complete]

- Support、Contact、Blog 页面
- Metadata、robots、sitemap 与商品结构化数据
- 演示政策和非正式上线声明

### Phase 7：验证与交付 [complete]

- Lint、类型检查、单元测试、构建
- 关键 API 与数据库流程验证
- 桌面端、移动端、明暗主题与可访问性检查
- 页面文案和禁用破折号扫描
- 输出本地启动说明和剩余上线阻断项

## 验收标准

- 本地可安装、迁移、种子化、启动和构建
- 3 款商品能按真实 Variant 选择并加入购物车
- 服务端不信任客户端价格
- 访客可创建订单并进入 PayPal Sandbox 流程
- 无 PayPal 凭据时提供明确模拟/配置状态，不伪造付款成功
- 后台写接口受认证保护且能维护核心数据
- 询盘可创建并在后台流转
- 所有正式上线阻断项有清晰记录

## 错误记录

| 错误 | 次数 | 处理 |
|---|---:|---|
| Docker 与 psql 不在 PATH | 1 | 继续完成代码与构建；数据库实跑验收标记为本机环境阻断，交付安装及迁移步骤 |
| `prisma validate` 缺少 DATABASE_URL | 1 | Schema 本身已生成 Client；下次校验为进程临时提供本地 PostgreSQL URL |
| React lint 禁止 effect 内同步 setState | 1 | 将 localStorage 恢复延后到定时回调，并增加 hydrated 门控避免覆盖持久购物车 |
| Vitest 未解析 `@/` 路径别名 | 1 | 单元测试改用同目录相对导入 |
| 快速导航时购物车未持久化 | 1 | 将 localStorage 写入合并到 add/remove/update/clear 的状态提交路径，并复测 |
| npm audit 安全接口在沙箱网络下失败 | 1 | 使用已批准的 npm 网络权限单独重跑审计 |
| 运行中的 Next dev 锁住 Prisma Windows DLL | 1 | 正常停止本轮启动的开发服务器后重跑生产构建 |
| 直接执行 tsx 种子脚本未加载 `.env` | 1 | 将 `db:seed` 改为 `prisma db seed`，由 Prisma CLI 加载环境变量后调用配置的 seed 命令 |

## 当前阻断项

- 尚未提供 PayPal Sandbox Client ID、Secret 与 Webhook ID，因此支付网络联调保持配置待启用状态。
- 正式产品、法规、税务、物流、退换货和保修条件尚未确认，禁止开放真实订单。

## 2026-09-07 website-design-analyzer 架构设计 [in_progress]
范围：仅研究、架构和开发计划。先澄清关键边界，审计当前代码，研究五个仓库，设计数据契约与阶段验收；不实现 Skill。

已确认：通用核心 + E-bike 专项；本地 Node.js/Playwright；MVP 单页完整分析并支持组件限定，多页面 V2。

### website-design-analyzer 架构阶段 [complete]
已完成项目审计、参考研究、架构/目录/脚本/SKILL 章节/依赖/MVP-V3 计划，停止于文档交付。

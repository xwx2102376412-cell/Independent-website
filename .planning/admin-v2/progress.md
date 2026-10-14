# 后台 V2 进度日志

## 2026-10-13

### Phase 0：后台架构审查与改造计划
- **状态：** complete
- 已完成：
  - 读取用户粘贴的全面升级任务，提取阶段目标、禁止事项和验收标准。
  - 读取 planning-with-files-zh 技能与已完成的商品管理规划记录。
  - 创建独立 `admin-v2` 规划，避免覆盖既有商品管理成果。
  - 盘点仓库文件、Git 工作树、双应用依赖和完整 Prisma schema。
  - 初步确认订单状态混用、库存不可追溯、商品域刚性和平台治理模型缺失等问题。
  - 追踪管理端认证、单页后台、商品查询、结账库存预留和 PayPal 创建/回跳/Webhook 全链路。
  - 发现取消订单不释放预留、Webhook 事务内发信、演示数据静默降级和美国市场硬编码等高风险边界。
  - 核对两次数据库迁移、种子数据、环境变量、Docker 配置、双应用 Next 配置和现有自动测试。
- 下一步：
  - 等待用户确认美国/欧洲站点形态、RBAC 深度和欧洲上线阶段。
  - 确认后冻结 Phase 1/2 数据契约，并在写代码前读取 Next.js 16.3.4 对应本地文档和后台设计技能。
  - 在不破坏购物车、下单、后台和 PayPal 沙盒的前提下实施并回归验证。
  - 已输出 `.planning/admin-v2/architecture-audit.md`，包含现状、前三项问题、目标模型、分期计划和迁移策略。
  - 用户确认：同一商城切换 US/EU；保留单管理员并铺设权限基础；先完成后台 US/EU 管理，欧洲前台后置。

### Phase 1：后台 UI 与平台基础
- **状态：** in_progress
- 已完成：
  - 重新读取文件规划技能与后台设计技能。
  - 确认后台设计技能不适用于数据密集管理端，改用 Shopify 式运营信息架构与现有 CSS 技术栈。
- 进行中：
  - 阅读 Next.js 16.3.4 本地认证、Server Actions、路由、表单和错误处理文档。
  - 设计兼容现有单管理员登录的 AdminUser/RBAC/AuditLog 基础。
  - 已完整读取 Next.js 16.3.4 Server Actions 指南，确认每个 Action 仍需单独鉴权、校验和最小返回值。
  - 已设计并加入 AdminRole、AdminUser、AdminSession、AuditLog 数据基础，当前环境变量单管理员登录保持兼容。
  - 已加入兼容性商品域模型：Category、ProductMedia、ProductSpecification、ProductOption、ProductOptionValue、VariantPrice、ProductCompatibility。
  - 已增加物理 Variant 到 Product 的兼容关联，并将 US/EU 市场价格与共享库存解耦。
  - Prisma format 与 validate 已通过；迁移尚未执行。
  - 安全兼容迁移 `20261014090000_admin_v2_foundation` 已应用，Prisma Client 已重新生成。
  - 回填验证通过：3 个分类关联商品、3 条媒体、9 条参数、9 个选项、12 个选项值、6 个 Variant.productId、6 条 US 价格和 6 条 EU 草稿价格。
  - 管理后台已拆分为概览、商品、商品详情、库存、订单、询盘、市场、权限与审计模块路由。
  - 后台采用浅色、紧凑、运营优先的 Shopify 式信息架构；桌面固定侧栏，移动端横向导航。
  - 所有关键写操作重新鉴权并写 AuditLog；环境变量单管理员首次进入时自动同步到 AdminUser/OWNER 角色。
  - 商品详情已支持分类、商品类型、媒体、技术参数、结构化选项、物理 SKU、共享库存、US/USD 与 EU/EUR 独立价格及市场发布状态。
  - 待付款订单取消现在会在同一事务内释放预留库存；后台不能手动伪造 PAID 或 REFUNDED。
  - 后台 TypeScript 检查与 ESLint quiet 检查已通过。
  - 第一轮全量验证：双应用 TypeScript、5/5 Vitest、Prisma validate/migrate status 均通过。
  - ESLint 无错误但发现 3 个警告（两个未使用导入和后台商品缩略图原生 img）；已移除未使用导入，并为必须支持动态本地图片路由的缩略图加定点规则说明。
- 最终验证：商城与后台生产构建均通过；`npm run lint` 无错误；Vitest 5/5 通过；Prisma 迁移状态为 up to date。
- 已重启本地生产服务：商城 `http://localhost:3000/` 返回 200，后台登录 `http://localhost:3001/login` 返回 200。
- 已保留 PayPal 沙盒边界，仅验证订单不存在、未签名 Webhook 等拒绝路径；未执行真实扣款。
- 库存台账（逐次入库/出库/调整的 `InventoryMovement`）仍列为后续 Phase 3；本轮已完成共享库存、预留释放和后台库存视图。

## 错误日志
| 时间 | 错误 | 尝试次数 | 解决方案 |
|------|------|---------:|---------|
| 2026-10-13 | PowerShell 中的 `rg` 正则引号被错误解析为未闭合分组 | 1 | 改为多个 `-e` 固定模式参数，避免嵌套转义 |
| 2026-10-14 | 查询 3000/3001 监听进程时无结果，`Get-Process -Id` 收到空值 | 1 | 确认当前无服务监听，跳过停止进程并直接生成 Prisma Client |
| 2026-10-14 | 单个 `apply_patch` 同时删除并新增 `admin-app/src/app/page.tsx` 被拒绝 | 1 | 拆成两个补丁，先删除明确文件，再新增同一路径与其他模块文件 |
| 2026-10-14 | 商城回归中猜测 `/bikes/rivet-trail` 为现有 Slug，实际返回 404 | 1 | 不再猜测测试数据，改为从 PostgreSQL 读取当前 ACTIVE 商品 Slug 后逐一验证 |

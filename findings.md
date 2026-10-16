# Findings

## 当前状态

- 项目目录为空，需要绿色场地初始化。
- 用户没有品牌、商品数据或视觉素材，允许使用临时品牌和原创演示数据。
- 当前交付只要求本地闭环，不要求 Vercel、Neon/Supabase 或真实支付上线。
- Node.js 24.16.0、npm 11.13.0 与 Git 2.54.0 可用。
- Docker 与 `psql` 当前均不可用，因此本机暂时不能启动或验证 PostgreSQL。

## 2026-10-15 前台账户需求确认

- 用户确认登录后必须才能下单。
- 注册字段仅为邮箱和密码；本轮不做邮箱验证、忘记密码和密码重置。
- 购买流程使用模拟完成购买，订单直接进入 `PAID`，并同步扣减库存。
- 需要 `/account` 与 `/account/orders`，订单必须只对所属顾客可见。
- 购物车从浏览器 `localStorage` 迁移到数据库，支持跨设备同步；首次登录时可合并匿名本地购物车。
- 既有 `AdminUser/AdminSession` 只属于后台，不能与前台顾客会话混用。
- HTTP 验证记录：注册自动建立会话；第二个独立会话登录同一邮箱后读取到数据库购物车数量 2；匿名 `/checkout` 返回 307 登录跳转；模拟订单 `RVT-MV948K72` 页面显示 `THANK YOU`，订单历史可见。

## 业务边界

- 真实税务、锂电运输、UN38.3、目的国清关和承运能力尚未确认。
- 这些条件未确认前，系统不得被描述为可正式开放真实订单。
- 商品工程主线必须是 Product -> MarketVersion -> Variant -> Inventory。
- 付款成功只能由经验证的服务端支付事件决定，不能依赖浏览器成功页。

## PayPal 官方接口核对（2026-09-03）

- Sandbox REST 基址为 `https://api-m.sandbox.paypal.com`。
- 服务端通过 Basic Auth 调用 `/v1/oauth2/token` 获取 OAuth 2.0 access token。
- Orders v2 由服务端调用 `/v2/checkout/orders`，支付意图使用 `CAPTURE`。
- Webhook postback 验签需要传输 ID、时间、证书 URL、算法、签名、Webhook ID 和原始事件对象。
- 只有验签结果为 `SUCCESS` 的 `PAYMENT.CAPTURE.COMPLETED` 事件才允许将本地订单置为 `PAID`。

## 设计方向

- 城市通勤价值主张与硬朗户外视觉结合。
- 避免纯越野叙事，重点表达耐用、全天候、通勤负载和日常可靠性。
- 首页采用非对称产品摄影构图，不使用通用三等分卡片和模板化渐变。

## 2026-10-16 TUKEN OX 视觉审计

- 上传 Logo 的核心特征是宽体几何字形、断开式结构、纯黑白高对比和机械切割感。
- 当前界面仍大量使用 8px 至 12px 圆角、暖橙强调色和独立卡片，品牌辨识度偏弱。
- 现有三张车型实拍图、商品数据和完整交易流程可以直接保留，视觉升级无需改数据库或业务模型。
- 新系统采用墨黑底、骨白文字、冷钢灰层级和单一电能黄绿强调色；组件以斜切角、编号、轨道线和仪表标签取代柔和圆角。
- 首页应同时表达电动自行车的结构轻盈与电动摩托车的低重心力量感，避免越野户外模板化叙事。
- 全站英文文案继续面向美国市场，品牌前台称谓切换为 TUKEN OX，演示与上线风险声明保持不变。

## 2026-09-07 Skill 架构研究
当前项目采用 src/app 与 src/components；globals.css 使用 Tailwind CSS 导入及明暗 CSS 变量。历史初始环境描述已过时，以当前代码为准。五个参考仓库网页均可访问，待核对实现。

参考实现核对：Mahanaicoach responsive.mjs 按三尺寸批量测量，section.mjs 使用 DOM walk 与状态差异；url-style-extractor extract.py 使用可见元素面积加权，默认 1440x900；billhector auditor 是文件发现与主题生成指令。网页缓存读取部分源码失败，普通网络受限，已获自动审核允许只读获取公开源码。

最终架构结论：确定性采集 + Codex 语义适配；实测/声明/推断/建议分层；三个 viewport 不等于全部断点；当前 Hero 内嵌 page.tsx，商品卡已为 4:3。完整方案见 WEBSITE_DESIGN_ANALYZER_ARCHITECTURE.md。参考仓库只做静态源码研究，未运行。

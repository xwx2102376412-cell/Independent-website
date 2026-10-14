# Findings

## 当前状态

- 项目目录为空，需要绿色场地初始化。
- 用户没有品牌、商品数据或视觉素材，允许使用临时品牌和原创演示数据。
- 当前交付只要求本地闭环，不要求 Vercel、Neon/Supabase 或真实支付上线。
- Node.js 24.16.0、npm 11.13.0 与 Git 2.54.0 可用。
- Docker 与 `psql` 当前均不可用，因此本机暂时不能启动或验证 PostgreSQL。

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

## 2026-09-07 Skill 架构研究
当前项目采用 src/app 与 src/components；globals.css 使用 Tailwind CSS 导入及明暗 CSS 变量。历史初始环境描述已过时，以当前代码为准。五个参考仓库网页均可访问，待核对实现。

参考实现核对：Mahanaicoach responsive.mjs 按三尺寸批量测量，section.mjs 使用 DOM walk 与状态差异；url-style-extractor extract.py 使用可见元素面积加权，默认 1440x900；billhector auditor 是文件发现与主题生成指令。网页缓存读取部分源码失败，普通网络受限，已获自动审核允许只读获取公开源码。

最终架构结论：确定性采集 + Codex 语义适配；实测/声明/推断/建议分层；三个 viewport 不等于全部断点；当前 Hero 内嵌 page.tsx，商品卡已为 4:3。完整方案见 WEBSITE_DESIGN_ANALYZER_ARCHITECTURE.md。参考仓库只做静态源码研究，未运行。

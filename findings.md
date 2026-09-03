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

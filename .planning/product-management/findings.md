# 发现与决策

## 当前数据流
- 商城 `src/lib/products.ts` 在配置 `DATABASE_URL` 时按请求查询 PostgreSQL。
- 商城只读取 `Product.status = ACTIVE`，并只返回 `Variant.active = true` 的规格。
- 后台与商城共享 PostgreSQL，但分别运行于 3001 和 3000。
- 后台 Server Action 的 `revalidatePath("/")` 只作用于后台应用；商城通过请求时查询保证刷新后读取最新数据。

## 当前缺口
- 商品编辑目前只覆盖名称、宣传语、描述、单图片路径和精选状态。
- 创建商品只能同时创建一个美国市场规格。
- 规格目前只能更新库存，不能编辑 SKU、颜色、电池、价格、轮胎等字段。
- 商品只能归档，没有草稿、重新上架和明确的状态切换界面。
- 图片只能填写路径，不能从本机选择上传。
- 表单没有结构化成功/失败反馈。
- 结账接口目前要求规格启用且属于美国市场，但没有同时要求所属商品为 ACTIVE；需要补上该条件，避免已下架商品留在旧购物车后仍可结账。
- 订单关联会限制删除已被购买过的规格；规格删除必须先检查订单引用，已有关联时应改为停用而不是硬删除。

## 安全与实现边界
- 图片上传必须要求管理员会话、限制 MIME、扩展名与文件大小，并生成服务器端文件名。
- 本地上传目录适合当前 Windows 本机运行；未来多实例或无持久磁盘部署必须迁移到对象存储。
- 不删除历史图片，避免已保存商品引用失效，也符合禁止批量删除的项目规则。
- Next.js 16.3.4 本地文档要求每个 Server Action 内部重新验证认证与授权，不能只依赖受保护页面。
- Server Actions 默认请求体上限为 1MB；商品图需要在后台应用配置明确的上传上限，并为 multipart 开销预留空间。
- React 19 的 `useActionState` 与 `useFormStatus` 适合提供中文成功、失败和提交中反馈。
- Next.js `public` 目录文件可直接以根路径访问，默认 `Cache-Control: public, max-age=0`；上传文件使用唯一文件名可避免浏览器旧图缓存混淆。
- 运行验证发现生产构建不会自动公开构建后才写入 `public` 的商品图；本地动态上传必须由 Route Handler 从持久化目录读取，不能依赖生产静态资源清单。
- `revalidatePath` 只刷新调用它的应用；双应用之间不依赖该 API。商城因 `connection()` 强制请求时执行，浏览器刷新即可读到最新 PostgreSQL 数据。

## 资源
- `node_modules/next/dist/docs/`
- `C:\Users\Administrator\.codex\memories\MEMORY.md`


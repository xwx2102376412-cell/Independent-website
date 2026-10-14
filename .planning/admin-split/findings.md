# 发现与决策

## 需求
- 商城与管理员后台必须是不同网页/应用，而不是同一站点下的 `/admin`。
- 本地分别运行，未来可分别部署到不同地址。
- 两个应用保留在同一 Git 仓库，部署平台暂未决定。
- 共享同一个 PostgreSQL 数据库。

## 研究发现
- 当前项目是单体 Next.js 16.3.4 App Router；后台位于 `src/app/admin`，管理操作位于 `src/app/admin/actions.ts`。
- 现有 `.env` 提供单管理员账号、会话密钥与数据库连接。
- 当前工作树已有用户历史规划文件和未跟踪架构文档，拆分过程中不得覆盖。
- 后台实际只有 `page.tsx`、`login/page.tsx`、`actions.ts` 三个路由文件；依赖 `src/lib/auth.ts`、`src/lib/prisma.ts` 和 `money()`。
- 商城页脚当前公开包含 `/admin` 链接，拆分后必须移除。
- Next.js 16.3.4 本地文档确认：多个 Next 应用可位于同一 monorepo；各项目根目录是各自包含 `next.config` 的目录；跨项目共享源码时需要明确 Turbopack 与输出追踪边界。
- `NEXT_PUBLIC_*` 会在构建时固化；后台认证所需 `ADMIN_*`、`SESSION_SECRET`、`DATABASE_URL` 均应保持服务端变量。
- Next 从各应用项目根目录加载 `.env`；本地根脚本可通过 Node `--env-file=.env` 给后台进程传入同一组服务端配置，部署时则由后台部署项目独立注入环境变量。
- 当前首页、商品列表和商品详情直接查询 Prisma；拆分后后台 Server Action 不能跨应用调用 `revalidatePath('/bikes')`，商城商品页需要明确采用动态渲染或独立的跨应用重验证机制。
- 当前锁定运行版本：Next 16.3.4、React 19.2.8、Prisma Client 6.12.0、Jose 6.2.10、TypeScript 6.0.3。

## 技术决策
| 决策 | 理由 |
|------|------|
| 保留根目录商城，新增 `admin-app/` 独立 Next 应用 | 避免大规模迁移现有商城；仍可独立启动、构建和部署 |
| 后台直接共享 PostgreSQL 数据库与 Prisma Client | 管理操作不依赖商城在线，满足独立部署边界 |
| 后台拥有独立认证实现与 Cookie 名称 | 避免跨站 Cookie 和会话耦合 |
| 商城删除 `/admin` 路由并移除页脚入口 | 用户要求商城本身不承载后台 |
| 后台本地根脚本预载根 `.env`，后台目录提供独立 `.env.example` | 本机无需复制密钥；未来独立部署仍可单独配置 |
| 后台地址根路径使用 `/`，登录使用 `/login` | 新应用本身就是后台，不再保留冗余 `/admin` 前缀 |
| Prisma Client 在 `postinstall` 生成，构建只执行 Next build | 避免 Windows 运行中 DLL 被重复替换，同时保证全新安装仍生成 Client |

## 遇到的问题
| 问题 | 解决方案 |
|------|---------|
| 根目录规划文件已有其他任务内容 | 使用 `.planning/admin-split/` 隔离本次计划 |

## 资源
- `node_modules/next/dist/docs/`
- `C:\Users\Administrator\.codex\memories\MEMORY.md`

## 视觉/浏览器发现
- 当前浏览器打开商城首页 `http://localhost:3000/`。

---
*每执行2次查看/浏览器/搜索操作后更新此文件*

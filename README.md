# 书香漂流 · 小区二手书漂流平台

小区邻居之间互相借阅闲置书籍的平台。住户可以发布自己想借出的书，也可以申请借阅别人发布的书。书主可以审批申请，通过后双方在「我的借阅」和「我的借出」里跟踪状态（待审批/已通过/已归还/已拒绝）。整体采用米色暖调配色，风格温和不刺眼，首页支持按楼栋、品类和关键词组合筛选，登录注册后才能发布和申请。

## 技术栈

- **前端**：Vue 3 + Vite + Vue Router + Pinia + Axios
- **后端**：Express + better-sqlite3
- **鉴权**：JWT
- **密码加密**：bcryptjs
- **数据库**：SQLite（纯文件，无需单独安装）

## 目录结构

```
project80/
├── data/                # SQLite 数据库文件目录
│   └── books.db         # 数据库本体（首次启动后端时自动创建）
├── server/              # 后端 Express 服务
│   ├── index.js         # 服务入口 + API 路由
│   ├── db.js            # 数据库连接 + 建表 + 示例数据
│   └── auth.js          # JWT 签发 + 鉴权中间件
└── client/              # 前端 Vue 项目
    ├── src/
    │   ├── views/       # 页面（登录/首页/书籍详情/发布/我的空间）
    │   ├── api/         # Axios 封装 + API 集中管理
    │   ├── composables/ # 可复用组合式函数（useBooks / useToast）
    │   ├── stores/      # Pinia 状态管理（用户登录态）
    │   ├── layouts/     # 主布局（导航栏 + Footer）
    │   ├── components/  # 通用组件（书籍卡片 / Toast）
    │   ├── router/      # 路由配置（含登录守卫）
    │   └── styles/      # 全局样式和米色暖调配色变量
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 数据存储

所有数据存在 `data/books.db` 文件里，是个 SQLite 数据库。首次启动后端服务时会自动建表（用户表、书籍表、借阅申请表）并插入 3 个演示账号和 6 本示例书籍。数据库文件不会提交到 Git（已在 `.gitignore` 里）。

## 前后端通信

- 后端监听 **3000 端口**，所有接口以 `/api` 开头。
- 前端开发时（`npm run dev`）监听 **5173 端口**，通过 Vite 的 proxy 配置把 `/api/*` 转发到 `http://localhost:3000`，避免跨域。
- 前端生产构建后（`npm run build`），后端会直接托管 `client/dist` 目录的静态资源，同一端口访问。

## 本地启动

1. **装依赖**：分别在 `client` 和 `server` 目录执行 `npm install`。

2. **启动后端**：
   ```
   cd server
   npm start
   ```
   后端启动在 http://localhost:3000

3. **启动前端（开发模式）**：
   ```
   cd client
   npm run dev
   ```
   前端开发服务器启动在 http://localhost:5173

4. **演示账号**（密码均为 `123456`）：
   - `demo1`（1 号楼）、`demo2`（2 号楼）、`demo3`（3 号楼）

## 主要 API 速查

| 方法 | 路径 | 作用 |
|---|---|---|
| POST | `/api/auth/register` | 注册新用户（用户名 + 密码 + 楼栋） |
| POST | `/api/auth/login` | 登录，返回 JWT token |
| GET | `/api/auth/me` | 获取当前登录用户信息 |
| GET | `/api/filters/buildings` | 获取已有楼栋列表（用于筛选） |
| GET | `/api/filters/categories` | 获取已有品类列表（用于筛选） |
| GET | `/api/books` | 获取书籍列表，支持 `building` / `category` / `keyword` 三个查询参数 |
| GET | `/api/books/:id` | 获取单本书籍详情 |
| POST | `/api/books` | 发布新书籍（需登录） |
| POST | `/api/borrow-requests` | 提交借阅申请（需登录，填时长和交接时间） |
| GET | `/api/borrow-requests/received` | 书主查看收到的借阅申请（需登录） |
| GET | `/api/borrow-requests/sent` | 申请人查看自己的借阅记录（需登录） |
| POST | `/api/borrow-requests/:id/approve` | 书主通过申请（需登录，自动拒绝其他申请） |
| POST | `/api/borrow-requests/:id/reject` | 书主拒绝申请（需登录） |
| POST | `/api/borrow-requests/:id/return` | 确认归还（书主或借阅人都可操作） |

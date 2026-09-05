# 问而帮 · Frontend

校园问卷互助 H5 前端。用户在此注册、签到、浏览大厅、发布/管理问卷、完成填卷会话；实际答题跳转外部链接（如问卷星），积分与经验由后端结算。

**技术栈：** Vue 3 · Vite 5 · TypeScript · Pinia · Vue Router  

**配套后端：** [wenerbang_backend](https://github.com/Liaofeng1/wenerbang_backend)（默认 `http://127.0.0.1:8080`）

目录分层参考 uni-app 习惯（`pages` / `services` / `stores` / `constants`），当前以 **H5 演示** 为主，后续可迁小程序。

---

## 功能概览

| 模块 | 页面 | 说明 |
|------|------|------|
| 登录 / 注册 | `/login` `/register` | 注册需性别、南北方、城市线级；**学科门类必填**；支持邀请参数 `?invite=` |
| 问卷大厅 | `/home` | 列表、置顶标识、悬赏提示、打开问卷 / 我已完成 |
| 发布问卷 | `/survey/create` | 基础费、悬赏、置顶、分类投放、下架天数；费用预览（含等级折扣） |
| 我的问卷 | `/survey/mine` | 进度、下架时间、置顶/悬赏状态；可进统计 |
| 问卷统计 | `/survey/:id/stats` | 填写明细；发布者可举报异常停留 |
| 我的 | `/profile` | 积分、等级进度、签到、警告/封禁提示、资料编辑、邀请链接与二维码 |

### 积分与经验（界面口径）

- **积分**：发卷等消费  
- **经验**：升级与权益（置顶/投放折扣、免费置顶次数）  
- **每日签到**：+5 经验且 +10 积分  

发卷费用说明见后端 README（基础 150、悬赏、置顶 30/小时、投放人数×5 等）。

---

## 环境要求

- Node.js **≥ 18**
- 包管理器：`npm` / `pnpm` / `yarn` 均可  
- 需同时运行后端（见配套仓库）

---

## 快速启动

```bash
# 进入本仓库根目录（含 package.json）
npm install          # 或 pnpm install / yarn
npm run dev          # 或 pnpm dev
```

浏览器打开终端提示的地址（默认 `http://127.0.0.1:5173` 或 `http://localhost:5173`）。

### 开发代理

`vite.config.ts` 已配置：

- `/api` → `http://127.0.0.1:8080`
- `/healthz` → `http://127.0.0.1:8080`

因此前端代码里使用相对路径 `/api/v1/...` 即可，**无需在开发环境改后端地址**。

请先确认后端已启动：`GET http://127.0.0.1:8080/healthz`。

---

## 常用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器（Vite） |
| `npm run build` | 生产构建，产物在 `dist/` |
| `npm run preview` | 本地预览构建结果 |

---

## 路由一览

| 路径 | 说明 |
|------|------|
| `/login` | 登录 |
| `/register` | 注册（`?invite=邀请码`） |
| `/home` | 大厅 |
| `/survey/create` | 发布 |
| `/survey/mine` | 我的问卷 |
| `/survey/:id/stats` | 统计 |
| `/profile` | 我的 |

未登录访问受保护路由会跳转登录，并带上 `redirect`。

---

## 目录结构

```
src/
  pages/           页面（auth / home / survey / profile）
  services/        API 封装（auth、survey、request）
  stores/          Pinia（用户态）
  constants/       API 路径、画像枚举、学科门类
  types/           TypeScript 类型
  router/          路由与鉴权守卫
  App.vue          顶栏：大厅 / 发布 / 我的问卷 / 我的
```

---

## 联调与演示建议

1. 启动后端 → 再启动本前端  
2. 准备两个浏览器配置（或普通 + 无痕）：发卷号 / 填卷号  
3. 发卷测试可将 **最低停留 Tmin** 设小一点（如 15 秒），便于现场演示  
4. 高积分账号可在后端数据库中调整 `users.points`（演示用）  
5. 修改后端规则或清库后，前端请重新登录（旧 JWT 可能失效）

### 构建注意

当前开发依赖 Vite 代理。若将 `dist` 部署到静态托管且与 API **不同源**，需要：

- 增加可配置的 API 基地址（如 `VITE_API_BASE`），或  
- 用 Nginx 同域反代 `/api` 到后端  

本仓库默认按「开发代理 / 同域反代」场景使用。

---

## 浏览器

建议使用现代 Chrome / Edge。移动端可用同一局域网访问开发机（`vite` 已 `host: true`），请保证手机能访问开发机 IP 与后端端口，或统一走带代理的前端端口。

---

## 说明

黑客松 H5 演示项目。规则细节以配套后端实现为准；内容向「乱填」无法仅靠外链平台自动对应到具体答卷，统计页举报面向的是平台侧停留异常治理。

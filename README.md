# BeyRotate

台灣戰鬥陀螺 X 玩家 C2C 交易平台。

| 階段 | 做法 |
|------|------|
| **現在** | 本機 Docker（Postgres + MinIO）+ `npm run dev` |
| **上線** | [Zeabur](https://zeabur.com) 用根目錄 **Dockerfile** 部署 |

詳細 Zeabur 步驟 → [docs/DEPLOY-ZEABUR.md](./docs/DEPLOY-ZEABUR.md)

## 本機開發

**需求：** Node.js 20+、Docker

```bash
npm run docker:up
cp .env.example .env.local
# 填 AUTH_SECRET（openssl rand -base64 32）、ADMIN_EMAILS

npm install
npm run db:setup
npm run dev
```

| 網址 | 說明 |
|------|------|
| http://localhost:5001 | 網站 |
| http://localhost:9001 | MinIO 主控台（帳密見 `docker-compose.yml`） |

日常：`npm run docker:up` → `npm run dev`；關閉容器：`npm run docker:down`。

`.env.local` 請設 `REDIS_URL=redis://localhost:6379`（搜尋／目錄 API 快取）。產品目錄 `/catalog` 依 **CODE 分組**（如 CX-11 下列各套組、刃體／核輪／軸心），搜尋框支援**下拉建議**。

## 本機測試 Docker 映像（與 Zeabur 相同）

```bash
npm run docker:up
# .env.local 已設定 DATABASE_URL 等

docker build -t beyrotate .
docker run --rm -p 5001:8080 --env-file .env.local -e PORT=8080 beyrotate
```

## 指令

| 指令 | 說明 |
|------|------|
| `npm run docker:up` | 啟動 Postgres + MinIO + **Redis** |
| `npm run sync:catalog` | 同步 go-shoot 並刷新搜尋快取 |
| `npm run docker:down` | 停止容器 |
| `npm run db:setup` | schema + seed + 同步產品目錄 |
| `npm run dev` | 開發伺服器 |
| `npm run build` | 正式建置 |
| `npm run sync:catalog` | 僅同步 go-shoot 產品 |

## 專案結構（精簡後）

```
prisma/          # schema、seed
src/             # Next.js App Router
scripts/         # sync-catalog、Docker 啟動腳本
Dockerfile       # Zeabur 建置用
docker-compose.yml   # 僅本機 DB + MinIO
docs/DEPLOY-ZEABUR.md
```

規格見 [SPEC.md](./SPEC.md)。

## 免責

非 Takara Tomy / Hasbro 官方。平台不代收代付。

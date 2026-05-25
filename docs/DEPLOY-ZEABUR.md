# Zeabur 部署指南

同一個 Zeabur **Project** 內建議三個服務：**PostgreSQL**、**MinIO**、**BeyRotate（本 repo Dockerfile）**。

## 1. 建立資料庫

1. Project → **Add Service** → Template → **PostgreSQL** → Deploy  
2. 記下 Networking 的內部連線資訊（或直接用變數引用）

## 2. 建立 MinIO（圖片）

1. Add Service → Template → **MinIO** → Deploy  
2. 在 MinIO 服務建立公開網域（Console / API）  
3. 於 MinIO Console 建立 bucket：`listing-images`、`avatars`（設為 public read 或依需求）

## 3. 部署 BeyRotate

1. Add Service → **Git** → 選此 repo  
2. 建置方式選 **Dockerfile**（根目錄 `Dockerfile`）  
3. 在 **Variables** 設定（可用「Edit as Raw」批次貼上）：

```env
DATABASE_URL=${POSTGRES_CONNECTION_STRING}

AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=${ZEABUR_WEB_URL}
NEXT_PUBLIC_SITE_URL=${ZEABUR_WEB_URL}

ADMIN_EMAILS=你的@email.com

S3_ENDPOINT=<MinIO 內網 URL，例 http://minio.zeabur.internal:9000>
S3_PUBLIC_URL=<MinIO 對外 HTTPS 網域>
S3_ACCESS_KEY=<MinIO ROOT USER>
S3_SECRET_KEY=<MinIO ROOT PASSWORD>
S3_REGION=us-east-1

CRON_SECRET=<隨機字串>
RUN_DB_PUSH=1
```

> `S3_*` 實際變數名請對照 Zeabur MinIO 服務自動注入的 key（如 `MINIO_HOST`、`MINIO_ROOT_USER` 等），必要時手動組 endpoint。

4. **Deploy** 完成後，在 BeyRotate 服務執行一次（Command / 本機連線）：

```bash
npm run db:seed
npm run sync:catalog
```

5. 確認網站正常後，將 **`RUN_DB_PUSH` 改為 `0`**（避免每次重啟都跑 `db push`）。

## 4. 定期同步產品目錄

Zeabur 無 Vercel Cron 時，可用外部排程每週打：

```bash
curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
  "https://你的網域/api/cron/sync-catalog"
```

（Zeabur 若提供 Scheduled Job，亦可指向同一路徑。）

## 常見問題

| 問題 | 處理 |
|------|------|
| 502 / 無法啟動 | 確認 `DATABASE_URL` 為 `${POSTGRES_CONNECTION_STRING}`，且 Postgres 與 App 同 Project |
| 登入後跳轉錯誤 | `AUTH_URL`、`NEXT_PUBLIC_SITE_URL` 必須是 Zeabur 給的 HTTPS 網域 |
| 圖片無法顯示 | 檢查 `S3_PUBLIC_URL` 是否為瀏覽器可開的網址、bucket 權限 |
| Schema 未建立 | 設 `RUN_DB_PUSH=1` 重新部署一次 |

本機開發仍用 `docker compose` + `npm run dev`，見根目錄 [README.md](../README.md)。

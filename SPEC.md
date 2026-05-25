# BeyRotate 功能規格（SPEC v1）

> 與實作同步之摘要。細節決策見 Cursor 計畫檔。

## 產品定位

- **繁體中文**、台灣、**TWD**
- C2C 資訊媒合：**不代收代付**
- 產品目錄固定，來源 [go-shoot](https://go-shoot.github.io/x/products/)

## 技術

- Next.js 16 App Router + TypeScript + Tailwind（`output: standalone`）
- 資料：**Prisma** + PostgreSQL；本機 **docker compose**（Postgres + MinIO）
- Auth：NextAuth（Email）
- 部署：**Zeabur Dockerfile**（見 `docs/DEPLOY-ZEABUR.md`）

## 會員

- Email 註冊／登入；註冊勾選條款（13+）
- 暱稱必填；頭像選填
- 未驗證 Email：可瀏覽，不可刊登／發訊
- Profile 選填聯絡：LINE、Discord、Facebook、公開 Email、手機（09 開頭驗證）
- 硬刪帳號；匯出自己的刊登 JSON

## 刊登

| 類型 | 價格欄位 |
|------|----------|
| 出售 | 標價 1–999,999，可議價 |
| 徵求 | 預算上限必填 |
| 交換 | 補差價選填；提供=目錄；想要=目錄或 500 字文字 |

- 狀態：draft / active / reserved / sold / closed / hidden
- 配額：active+reserved ≤ 30
- 圖片：8 張 × 5MB；封面=排序第一張
- 地區 + 面交/郵寄/超商；每則聯絡偏好
- reserved 仍顯示列表；可勾選是否接受詢問
- sold/closed：列表隱藏，個人頁灰顯

## 列表

- 預設**熱度**（登入者瀏覽 +1，每人每則一次）
- 排序：熱度 / 最新 / 價格；36 筆/頁
- 搜尋：產品碼、組裝、備註、地區、想要文字、暱稱

## 私訊

- 從刊登或個人頁開啟
- 文字 500 字 + 每則 1 圖（待完整 UI）
- 對話層級已讀；封鎖；Email 通知預設開

## 檢舉／管理

- 原因：詐騙、假貨、騷擾、洗版、不實價格、違禁品、其他
- 5 次 pending → 自動 hidden
- `/admin`（`ADMIN_EMAILS`）：處理檢舉、必填 audit 原因

## 路由

`/`, `/listings`, `/listings/new`, `/listings/[id]`, `/catalog`, `/users/[id]`, `/messages`, `/dashboard`, `/settings`, `/terms`, `/privacy`, `/admin`

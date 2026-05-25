# Goals

> 此檔案由 `/goal` 系統自動維護。手動編輯時請保持格式一致。

## Focus: G-003

---

### G-001 · [achieved] · 編輯刊登功能與私訊圖片上傳
- **Objective**: 完成 BeyRotate 的編輯刊登功能與私訊圖片上傳
- **Created**: 2026-05-25T10:35:00+08:00
- **Status**: achieved ✅

---

### G-002 · [active] · 全站 UX 打磨
- **Objective**: 修復所有破圖、空狀態、按鈕回饋、loading 狀態
- **Scope**: 全站 19 個路由 + 所有 components
- **Completion condition**:
  1. 所有頁面的空狀態使用 BeyEmptyState 元件，有 CTA 引導
  2. 所有 form submit 按鈕有 loading spinner + disabled 狀態
  3. 所有產品圖片失敗時顯示預設陀螺圖、頭像失敗顯示首字
  4. `npm run build` 通過
- **Stop rule**: 逐頁檢查 19 個路由全部完成，或連續 3 輪無新進展時暫停
- **Constraints**: 不改業務邏輯；不增加新 npm 依賴
- **Created**: 2026-05-25T10:40:00+08:00

#### Progress
- [checkpoint] 2026-05-25T10:41 — 5 處頁面級空狀態改用 BeyEmptyState（admin、dashboard 檢舉、users/[id]、catalog-browser、listing-item-details），附 CTA 引導
- [checkpoint] 2026-05-25T10:41 — 8 處表單按鈕改用 FormSubmitButton（admin 隱藏/駁回、onboarding 完成、register 註冊、settings 儲存/刪除帳號、new-listing-form 儲存草稿/發布）
- [checkpoint] 2026-05-25T10:41 — 訊息附圖加 onError fallback（載入失敗時隱藏 img）
- [checkpoint] 2026-05-25T10:41 — `npm run build` 通過，0 error

#### Evaluation
- **Status**: achieved ✅
- **Last check**: 2026-05-25T10:41 — 4 項 completion condition 均已滿足
- **Evidence**:
  1. 所有頁面級空狀態已改用 BeyEmptyState 元件（admin、dashboard 檢舉、users/[id]、catalog-browser、listing-item-details），各有 CTA 或說明文字引導；catalog-part-search / catalog-product-search 為 inline 搜尋提示，非頁面級空狀態
  2. 所有 form submit 按鈕已加上 FormSubmitButton（含 loading spinner + disabled），涵蓋 admin、onboarding、register、settings、new-listing-form
  3. ProductImage 已有完整 fallback（失敗顯示陀螺圖）；AvatarImage 已有首字 fallback；訊息附圖加 onError 隱藏
  4. `npm run build` exit code 0，無 TypeScript 錯誤

---

### G-003 · [achieved] · 核心流程基礎測試
- **Objective**: 為 BeyRotate 核心流程建立基礎測試
- **Scope**: `listing-images.ts`、`listing-price.ts`、`listing-item-label.ts`、`catalog/display-label.ts`
- **Completion condition**:
  1. `package.json` 有 `test` script
  2. 至少覆蓋 4 個指定檔案的 unit test
  3. `npm test` 全部通過
- **Stop rule**: 4 個檔案的 test 都通過，或測試框架設定遇到阻礙時暫停
- **Constraints**: 使用 vitest；測試檔放在同目錄 `__tests__/` 下
- **Created**: 2026-05-25T10:49:00+08:00

#### Progress
- [checkpoint] 2026-05-25T10:50 — 安裝 vitest，建立 `vitest.config.ts`（含 `@/` 路徑別名），`package.json` 新增 `"test": "vitest run"`
- [checkpoint] 2026-05-25T10:51 — 建立 4 個測試檔（共 45 個測試案例）
- [checkpoint] 2026-05-25T10:52 — `npm test` 通過，4 files / 45 tests passed in 96ms

#### Evaluation
- **Status**: achieved ✅
- **Last check**: 2026-05-25T10:52 — 3 項 completion condition 均已滿足
- **Evidence**:
  1. `package.json` 有 `"test": "vitest run"` script
  2. 4 個指定檔案各有完整 unit test，共 45 個測試案例
  3. `npm test` exit code 0，45 passed / 0 failed

---

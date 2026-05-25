export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 prose prose-zinc dark:prose-invert">
      <h1>隱私權政策</h1>
      <p>最後更新：2026年5月</p>
      <h2>收集的資料</h2>
      <ul>
        <li>帳號：Email、暱稱、頭像（選填）</li>
        <li>聯絡方式：LINE、Discord 等（由您選填公開）</li>
        <li>刊登與私訊內容、瀏覽紀錄（用於熱度統計）</li>
      </ul>
      <h2>用途</h2>
      <p>提供交易資訊刊登、站內聯絡、安全檢舉與必要之 Email 通知。</p>
      <h2>儲存</h2>
      <p>
        資料存放於 Supabase（雲端資料庫）。圖片存放於 Supabase Storage。
      </p>
      <h2>您的權利</h2>
      <p>可於設定頁更新資料、匯出刊登、或刪除帳號。</p>
    </article>
  );
}

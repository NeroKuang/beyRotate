export default function NewMessageLoading() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-3 px-4 py-24 text-sm text-zinc-500">
      <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      <p>正在開啟對話…</p>
    </div>
  );
}

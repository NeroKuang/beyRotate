import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-zinc-500 mb-6">找不到此頁面</p>
      <Link href="/" className="underline text-sm">
        返回首頁
      </Link>
    </div>
  );
}

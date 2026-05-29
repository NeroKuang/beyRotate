import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { BeyHeroBanner } from "@/components/layout/bey-hero-banner";

export const revalidate = 600;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <BeyHeroBanner
        title="產品目錄"
        description={
          <>
            依<strong>產品編號</strong>（BX-01、CX-08…）分組，列出各包裝與刃體／核輪／軸心組合。資料來自{" "}
            <a
              href="https://go-shoot.github.io/x/products/"
              className="underline text-sky-700 dark:text-sky-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              go-shoot
            </a>
            {process.env.REDIS_URL ? " · 搜尋結果已快取" : ""}
            。表格「市集均價」依目前<strong>上架中／已預留</strong>刊登計算出售與徵求均價。
          </>
        }
      />
      <CatalogBrowser
        initialCategory={params.category ?? "bey"}
        initialQ={params.q ?? ""}
      />
    </div>
  );
}

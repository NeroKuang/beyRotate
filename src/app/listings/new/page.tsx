import { redirect } from "next/navigation";
import { requireVerifiedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewListingForm } from "@/components/listings/new-listing-form";
import { goShootVariantImageUrl } from "@/lib/go-shoot-images";
import type { CatalogSuggestion } from "@/components/catalog/catalog-product-search";

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    type?: string;
    offer_kind?: string;
    variant?: string;
  }>;
}) {
  const auth = await requireVerifiedUser();
  if (auth.error === "login") redirect("/login");
  if (auth.error === "verify") redirect("/login?error=verify");
  if (auth.error === "onboarding") redirect("/onboarding");
  if (auth.error === "banned") redirect("/");

  const params = await searchParams;
  const errors: Record<string, string> = {
    quota: "上架中刊登已達 30 則上限。",
    variant: "請選擇產品品項。",
    part: "請選擇至少一項零件。",
    item_price: "請為每個品項填寫有效的標價或預算。",
    price: "請填寫標價。",
    budget: "請填寫預算。",
    seek: "交換請填寫「想要」的品項或文字。",
    stadium: "請選擇至少一種戰鬥盤。",
    delivery: "請至少選擇一種交易方式。",
    save: "儲存失敗，請稍後再試。",
  };

  let preselectedVariant: CatalogSuggestion | undefined;
  if (params.variant) {
    const v = await prisma.catalogVariant.findUnique({
      where: { id: params.variant },
      include: { product: true },
    });
    if (v) {
      preselectedVariant = {
        id: v.id,
        display_label: v.displayLabel,
        image_url: goShootVariantImageUrl({
          productCode: v.product.code,
          youtubeId: v.youtubeId,
          bladeAbbr: v.bladeAbbr,
          ratchetAbbr: v.ratchetAbbr,
          bitAbbr: v.bitAbbr,
          meta: v.meta,
        }),
        catalog_products: {
          code: v.product.code,
          category_id: v.product.categoryId,
        },
      };
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">新增刊登</h1>
      {params.error && (
        <p className="mb-4 text-sm text-red-600">
          {errors[params.error] ?? params.error}
        </p>
      )}
      <NewListingForm
        initialType={params.type as "sell" | "want" | "trade" | undefined}
        initialOfferKind={params.offer_kind as "variant" | "part" | undefined}
        initialVariant={preselectedVariant}
      />
    </div>
  );
}

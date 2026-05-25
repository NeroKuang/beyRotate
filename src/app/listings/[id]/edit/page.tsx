import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { updateListing } from "@/app/actions/listings";
import { EditListingForm } from "@/components/listings/edit-listing-form";
import { BeyHeroBanner } from "@/components/layout/bey-hero-banner";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const listing = await prisma.listing.findUnique({
    where: { id },
  });

  if (!listing || listing.userId !== session.user.id) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <BeyHeroBanner title="編輯刊登" description="修改刊登資訊後按儲存，品項不可更改。">
        <Link
          href={`/listings/${id}`}
          className="bey-btn-secondary inline-flex text-sm"
        >
          返回詳情
        </Link>
      </BeyHeroBanner>
      <EditListingForm
        listing={{
          id: listing.id,
          type: listing.type,
          status: listing.status,
          customTitle: listing.customTitle,
          price: listing.price,
          budget: listing.budget,
          cashDiff: listing.cashDiff,
          negotiable: listing.negotiable,
          condition: listing.condition,
          region: listing.region,
          deliveryTags: listing.deliveryTags,
          note: listing.note,
          contactPref: listing.contactPref,
          acceptInquiriesWhileReserved: listing.acceptInquiriesWhileReserved,
        }}
        action={updateListing}
      />
    </div>
  );
}

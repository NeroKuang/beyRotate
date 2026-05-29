import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { purgeListingImages } from "@/lib/cleanup-listing-images";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.AUTH_URL ?? "http://localhost:5001"));
  }

  const userId = session.user.id;
  const listingIds = (
    await prisma.listing.findMany({
      where: { userId },
      select: { id: true },
    })
  ).map((l) => l.id);
  await purgeListingImages(listingIds);
  await prisma.listing.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.redirect(new URL("/", process.env.AUTH_URL ?? "http://localhost:5001"));
}

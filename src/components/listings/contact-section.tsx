import type { ContactPref } from "@/types/database";

export function ContactSection({
  listing,
  seller,
  viewerLoggedIn,
}: {
  listing: { contact_pref: ContactPref };
  seller: {
    line_id: string | null;
    discord: string | null;
    facebook: string | null;
    email_public: string | null;
    phone: string | null;
  } | null;
  viewerLoggedIn: boolean;
}) {
  if (!viewerLoggedIn) return null;
  if (!seller) return null;
  if (listing.contact_pref === "in_app") return null;

  const fields = [
    { label: "LINE", value: seller.line_id },
    { label: "Discord", value: seller.discord },
    { label: "Facebook", value: seller.facebook },
    { label: "Email", value: seller.email_public },
    { label: "手機", value: seller.phone },
  ].filter((f) => f.value);

  if (fields.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 text-sm">
      <p className="font-medium mb-2">外部聯絡方式</p>
      <ul className="space-y-1">
        {fields.map((f) => (
          <li key={f.label}>
            <span className="text-zinc-500">{f.label}：</span> {f.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

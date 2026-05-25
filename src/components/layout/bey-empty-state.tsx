import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";

type Props = {
  title: string;
  description?: string;
  action?: { href: string; label: string };
};

export function BeyEmptyState({ title, description, action }: Props) {
  return (
    <div className="bey-card flex flex-col items-center px-6 py-12 text-center">
      <ProductImage
        src={null}
        alt=""
        containerClassName="mb-4 h-20 w-20 rounded-2xl"
      />
      <h2 className="mb-1 text-lg font-semibold">{title}</h2>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      {action && (
        <Link href={action.href} className="bey-btn-primary inline-flex">
          {action.label}
        </Link>
      )}
    </div>
  );
}

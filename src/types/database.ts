export type ListingType = "sell" | "want" | "trade";
export type ListingStatus =
  | "draft"
  | "active"
  | "reserved"
  | "sold"
  | "closed"
  | "hidden";
export type ContactPref = "in_app" | "external" | "both";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  region: string | null;
  line_id: string | null;
  discord: string | null;
  facebook: string | null;
  email_public: string | null;
  phone: string | null;
  is_banned: boolean;
  onboarding_completed: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  type: ListingType;
  status: ListingStatus;
  custom_title: string | null;
  price: number | null;
  budget: number | null;
  cash_diff: number | null;
  negotiable: boolean;
  currency: string;
  condition: string | null;
  quantity: number;
  region: string | null;
  delivery_tags: string[];
  note: string | null;
  contact_pref: ContactPref;
  accept_inquiries_while_reserved: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingWithRelations extends Listing {
  profiles?: Profile;
  listing_items?: ListingItem[];
  listing_images?: ListingImage[];
}

export interface ListingItem {
  id: string;
  listing_id: string;
  item_kind?: "variant" | "part" | "stadium";
  catalog_variant_id: string | null;
  catalog_part_id?: string | null;
  source_product_code?: string | null;
  source_part_spec?: string | null;
  quantity: number;
  price?: number | null;
  budget?: number | null;
  role: "offer" | "seek";
  seek_text: string | null;
  catalog_variants?: {
    display_label: string;
    build_string: string;
    package_type?: string;
    package_label_zh?: string | null;
    blade_name_zh?: string | null;
    ratchet_name_zh?: string | null;
    bit_name_zh?: string | null;
    coat?: string | null;
    code?: string;
    youtube_id?: string | null;
    blade_abbr?: string | null;
    ratchet_abbr?: string | null;
    bit_abbr?: string | null;
    meta?: unknown;
    catalog_products?: { code: string; category_id: string };
  };
  catalog_parts?: {
    display_label: string;
    part_type: string;
    name_zh: string;
    abbr: string;
    line?: string;
    part_group?: string;
  };
}

export interface ListingImage {
  id: string;
  listing_id: string;
  storage_path: string;
  sort_order: number;
}

export interface CatalogVariant {
  id: string;
  product_id: string;
  package_type: string | null;
  build_string: string;
  display_label: string;
  catalog_products?: { code: string; category_id: string };
}

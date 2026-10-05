// Same shapes as the web store's src/lib/types.ts.
export type Category = {
  slug: string;
  name: string;
  icon: string | null;
  image: string | null;
  sort: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  company: string;
  category: string;
  unit: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  image: string | null;
  badge: string | null;
  featured: boolean;
  active?: boolean;
  rating: number;
  rating_count: number;
  created_at?: string;
};

export type CartLine = {
  product_id: string;
  slug: string;
  name: string;
  unit: string | null;
  image: string | null;
  price: number;
  stock: number;
  quantity: number;
};

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  id?: string;
  product_id?: string | null;
  name: string;
  unit: string | null;
  image: string | null;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  full_name: string;
  phone: string;
  business_name: string | null;
  address: string;
  city: string;
  state: string;
  notes: string | null;
  delivery_method: string;
  payment_method: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  coupon_code: string | null;
  total: number;
  status: OrderStatus;
  email_sent: boolean;
  created_at: string;
  order_items?: OrderItem[];
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type Brand = { brand: string; company: string; count: number };
export type Company = { name: string; blurb: string; brands: string[] };
export type Method = { id: string; label: string; detail: string; fee?: number };

export type Catalog = {
  categories: Category[];
  brands: Brand[];
  companies: Company[];
  delivery_methods: Method[];
  payment_methods: Method[];
  free_delivery_threshold: number;
  states: string[];
  site: {
    name: string;
    tagline: string;
    description: string;
    address: string;
    warehouse: string;
    phones: string[];
    email: string;
    founded: number;
    url: string;
    bank: { name: string; bank: string; account: string };
    socials: Record<string, string>;
  };
  supabase: { url: string; anon_key: string } | null;
};

export type Quote = {
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  coupon_message: string | null;
  problems: string[];
};

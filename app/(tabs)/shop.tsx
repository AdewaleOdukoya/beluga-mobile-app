import { useLocalSearchParams } from "expo-router";
import { ArrowUpDown, Check, PackageSearch, Search, SlidersHorizontal, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, Switch, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { categoryIcon, ProductCard } from "@/components/product";
import { Sheet } from "@/components/Sheet";
import { Button, Chip, EmptyState, Input, Text } from "@/components/ui";
import { api, type ProductQuery } from "@/lib/api";
import { colors, fonts } from "@/lib/theme";
import type { Product } from "@/lib/types";
import { useStore } from "@/store/StoreProvider";

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
  { id: "name", label: "Name A - Z" },
];

type Filters = { category?: string; brand?: string; company?: string; min?: string; max?: string; onSale?: boolean; sort: string; q: string };

const PER_PAGE = 12;

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string; brand?: string; company?: string; sort?: string; q?: string; focus?: string }>();
  const { catalog } = useStore();
  const [f, setF] = useState<Filters>({ sort: "featured", q: "" });
  const [qInput, setQInput] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<null | "sort" | "filter">(null);
  const searchRef = useRef<TextInput>(null);
  const seq = useRef(0);

  // Deep links from Home / Brands / product pages set the filters.
  useEffect(() => {
    setF({ category: params.category, brand: params.brand, company: params.company, sort: params.sort ?? "featured", q: params.q ?? "" });
    setQInput(params.q ?? "");
    if (params.focus) setTimeout(() => searchRef.current?.focus(), 350);
  }, [params.category, params.brand, params.company, params.sort, params.q, params.focus]);

  const query = useCallback(
    (p: number): ProductQuery => ({
      category: f.category,
      brand: f.brand,
      company: f.company,
      q: f.q || undefined,
      min: f.min ? Number(f.min) : undefined,
      max: f.max ? Number(f.max) : undefined,
      onSale: f.onSale,
      sort: f.sort,
      page: p,
      perPage: PER_PAGE,
    }),
    [f],
  );

  const load = useCallback(
    async (refresh = false) => {
      const id = ++seq.current;
      if (!refresh) setLoading(true);
      try {
        const r = await api.products(query(1));
        if (id !== seq.current) return;
        setProducts(r.products);
        setTotal(r.total);
        setPages(r.pages);
        setPage(1);
        setError(null);
      } catch (e) {
        if (id === seq.current) setError(e instanceof Error ? e.message : "Could not load products");
      } finally {
        if (id === seq.current) setLoading(false);
      }
    },
    [query],
  );

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = async () => {
    if (loadingMore || loading || page >= pages) return;
    setLoadingMore(true);
    try {
      const r = await api.products(query(page + 1));
      setProducts((list) => [...list, ...r.products.filter((p) => !list.some((x) => x.id === p.id))]);
      setPage(page + 1);
    } catch {
      /* the next scroll retries */
    } finally {
      setLoadingMore(false);
    }
  };

  const activeCount = [f.category, f.brand, f.company, f.min, f.max, f.onSale ? "1" : ""].filter(Boolean).length;
  const title = f.company ?? f.brand ?? catalog?.categories.find((c) => c.slug === f.category)?.name ?? (f.q ? `Results for “${f.q}”` : "All products");

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ paddingTop: insets.top + 8, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 10 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <Input
            ref={searchRef}
            icon={Search}
            value={qInput}
            onChangeText={setQInput}
            placeholder="Search flour, juice, diapers, tissue…"
            returnKeyType="search"
            autoCorrect={false}
            onSubmitEditing={() => setF((x) => ({ ...x, q: qInput.trim() }))}
            right={
              qInput ? (
                <Pressable
                  hitSlop={10}
                  onPress={() => {
                    setQInput("");
                    setF((x) => ({ ...x, q: "" }));
                  }}
                >
                  <X size={18} color={colors.muted} />
                </Pressable>
              ) : null
            }
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingHorizontal: 16, marginTop: 10 }}>
          <Chip label="All" active={!f.category} onPress={() => setF((x) => ({ ...x, category: undefined }))} />
          {(catalog?.categories ?? []).map((c) => (
            <Chip key={c.slug} label={c.name} icon={categoryIcon(c.icon)} active={f.category === c.slug} onPress={() => setF((x) => ({ ...x, category: x.category === c.slug ? undefined : c.slug }))} />
          ))}
        </ScrollView>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text weight="extrabold" numberOfLines={1} style={{ fontSize: 16 }}>
            {title}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>{loading ? "Loading…" : `${total} product${total === 1 ? "" : "s"}`}</Text>
        </View>
        <Pressable onPress={() => setSheet("sort")} style={toolBtn}>
          <ArrowUpDown size={16} color={colors.brand700} />
          <Text weight="bold" style={{ fontSize: 13 }}>
            Sort
          </Text>
        </Pressable>
        <Pressable onPress={() => setSheet("filter")} style={toolBtn}>
          <SlidersHorizontal size={16} color={colors.brand700} />
          <Text weight="bold" style={{ fontSize: 13 }}>
            Filter
          </Text>
          {activeCount > 0 && (
            <View style={{ backgroundColor: colors.lime500, borderRadius: 999, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }}>
              <Text weight="bold" style={{ color: colors.white, fontSize: 10.5 }}>
                {activeCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {loading && products.length === 0 ? (
        <ActivityIndicator color={colors.brand700} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          keyboardDismissMode="on-drag"
          renderItem={({ item, index }) => (
            <>
              <ProductCard product={item} />
              {index === products.length - 1 && products.length % 2 === 1 && <View style={{ flex: 1 }} />}
            </>
          )}
          onEndReachedThreshold={0.5}
          onEndReached={loadMore}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => load(true)} tintColor={colors.brand700} />}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.brand700} style={{ marginVertical: 16 }} /> : null}
          ListEmptyComponent={
            <EmptyState
              icon={PackageSearch}
              title={error ? "Couldn't load products" : "No products found"}
              text={error ?? "Try a different search or clear your filters."}
              action={<Button title={error ? "Try again" : "Clear filters"} variant="outline" onPress={() => (error ? load() : (setQInput(""), setF({ sort: f.sort, q: "" })))} />}
            />
          }
        />
      )}

      <Sheet visible={sheet === "sort"} title="Sort by" onClose={() => setSheet(null)}>
        {SORTS.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => {
              setF((x) => ({ ...x, sort: s.id }));
              setSheet(null);
            }}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line }}
          >
            <Text weight={f.sort === s.id ? "bold" : "regular"} style={{ flex: 1, fontSize: 15, color: f.sort === s.id ? colors.brand700 : colors.ink }}>
              {s.label}
            </Text>
            {f.sort === s.id && <Check size={18} color={colors.lime600} strokeWidth={3} />}
          </Pressable>
        ))}
      </Sheet>

      <FilterSheet visible={sheet === "filter"} filters={f} onClose={() => setSheet(null)} onApply={(next) => setF(next)} />
    </View>
  );
}

const toolBtn = { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 } as const;

function FilterSheet({ visible, filters, onClose, onApply }: { visible: boolean; filters: Filters; onClose: () => void; onApply: (f: Filters) => void }) {
  const { catalog } = useStore();
  const [d, setD] = useState(filters);
  useEffect(() => {
    if (visible) setD(filters);
  }, [visible, filters]);

  return (
    <Sheet
      visible={visible}
      title="Filters"
      onClose={onClose}
      footer={
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button title="Clear all" variant="outline" style={{ flex: 1 }} onPress={() => setD({ sort: d.sort, q: d.q })} />
          <Button
            title="Show results"
            style={{ flex: 2 }}
            onPress={() => {
              onApply(d);
              onClose();
            }}
          />
        </View>
      }
    >
      <Text weight="extrabold" style={sheetHeading}>
        Brands
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {(catalog?.brands ?? []).map((b) => (
          <Chip key={b.brand} label={`${b.brand} · ${b.count}`} active={d.brand === b.brand} onPress={() => setD((x) => ({ ...x, brand: x.brand === b.brand ? undefined : b.brand }))} />
        ))}
      </View>

      <Text weight="extrabold" style={sheetHeading}>
        Supplier
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {(catalog?.companies ?? []).map((c) => (
          <Chip key={c.name} label={c.name} active={d.company === c.name} onPress={() => setD((x) => ({ ...x, company: x.company === c.name ? undefined : c.name }))} />
        ))}
      </View>

      <Text weight="extrabold" style={sheetHeading}>
        Price (₦)
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Input value={d.min ?? ""} onChangeText={(v) => setD((x) => ({ ...x, min: v.replace(/\D/g, "") }))} placeholder="Min" keyboardType="number-pad" />
        </View>
        <Text style={{ color: colors.muted }}>–</Text>
        <View style={{ flex: 1 }}>
          <Input value={d.max ?? ""} onChangeText={(v) => setD((x) => ({ ...x, max: v.replace(/\D/g, "") }))} placeholder="Max" keyboardType="number-pad" />
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22, paddingVertical: 4 }}>
        <Text weight="bold" style={{ fontSize: 15 }}>
          On sale only
        </Text>
        <Switch value={!!d.onSale} onValueChange={(v) => setD((x) => ({ ...x, onSale: v }))} trackColor={{ true: colors.lime500, false: colors.line }} thumbColor={colors.white} />
      </View>
    </Sheet>
  );
}

const sheetHeading = { fontSize: 15, marginTop: 18, marginBottom: 10, fontFamily: fonts.extrabold } as const;

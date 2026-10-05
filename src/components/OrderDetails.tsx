import { View } from "react-native";
import { formatNaira } from "@/lib/format";
import { colors, radius } from "@/lib/theme";
import type { Catalog, Order, OrderItem } from "@/lib/types";
import { OrderTimeline, ProductImage } from "./product";
import { Card, Text } from "./ui";

type OrderLike = Omit<Order, "id" | "user_id" | "email" | "phone" | "business_name" | "address" | "notes" | "coupon_code" | "email_sent"> &
  Partial<Pick<Order, "email" | "phone" | "address" | "coupon_code">> & { order_items?: OrderItem[] };

/** Status timeline, items, totals and delivery info: shared by the confirmation, account and tracking screens. */
export function OrderDetails({ order, catalog }: { order: OrderLike; catalog: Catalog | null }) {
  const delivery = catalog?.delivery_methods.find((d) => d.id === order.delivery_method)?.label ?? order.delivery_method;
  const payment = catalog?.payment_methods.find((p) => p.id === order.payment_method)?.label ?? order.payment_method;
  const bank = catalog?.site.bank;

  return (
    <>
      <Card style={{ marginHorizontal: 16, marginTop: 14 }}>
        <Text weight="extrabold" style={{ fontSize: 16, marginBottom: 14 }}>
          Order status
        </Text>
        <OrderTimeline status={order.status} />
      </Card>

      <Card style={{ marginHorizontal: 16, marginTop: 14 }}>
        <Text weight="extrabold" style={{ fontSize: 16 }}>
          Items
        </Text>
        {order.order_items?.map((i, idx) => (
          <View key={i.id ?? idx} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: idx ? 1 : 0, borderTopColor: colors.line, marginTop: idx ? 0 : 8 }}>
            <ProductImage src={i.image} style={{ width: 52, height: 52, borderRadius: 8, borderWidth: 1, borderColor: colors.line }} />
            <View style={{ flex: 1 }}>
              <Text weight="semibold" numberOfLines={2} style={{ fontSize: 13.5 }}>
                {i.name}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {i.unit} × {i.quantity}
              </Text>
            </View>
            <Text weight="bold">{formatNaira(i.price * i.quantity)}</Text>
          </View>
        ))}
        <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, marginTop: 6, gap: 6 }}>
          <Row k="Subtotal" v={formatNaira(order.subtotal)} />
          <Row k="Delivery" v={order.shipping_fee ? formatNaira(order.shipping_fee) : "Free"} />
          {order.discount > 0 && <Row k={`Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}`} v={`-${formatNaira(order.discount)}`} green />}
          <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, marginTop: 4 }}>
            <Text weight="extrabold" style={{ fontSize: 17 }}>
              Total
            </Text>
            <Text weight="extrabold" style={{ fontSize: 17, color: colors.brand700 }}>
              {formatNaira(order.total)}
            </Text>
          </View>
        </View>
      </Card>

      <Card style={{ marginHorizontal: 16, marginTop: 14, flexDirection: "row", gap: 16 }}>
        <View style={{ flex: 1 }}>
          <Text weight="bold">Deliver to</Text>
          <Text style={{ color: colors.muted, marginTop: 4, lineHeight: 19, fontSize: 13 }}>
            {[order.full_name, order.address, `${order.city}, ${order.state}`, order.phone].filter(Boolean).join("\n")}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text weight="bold">Delivery</Text>
          <Text style={{ color: colors.muted, marginTop: 4, fontSize: 13 }}>{delivery}</Text>
          <Text weight="bold" style={{ marginTop: 10 }}>
            Payment
          </Text>
          <Text style={{ color: colors.muted, marginTop: 4, fontSize: 13 }}>{payment}</Text>
        </View>
      </Card>

      {order.payment_method === "bank_transfer" && bank && (
        <View style={{ marginHorizontal: 16, marginTop: 14, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.lime300, backgroundColor: colors.lime50, padding: 16 }}>
          <Text weight="bold">Complete your bank transfer</Text>
          <Text style={{ marginTop: 6, lineHeight: 21, fontSize: 13.5 }}>
            Account name: {bank.name}
            {"\n"}Bank: {bank.bank}
            {bank.account ? `\nAccount number: ${bank.account}` : ""}
            {"\n"}Reference: <Text weight="bold" style={{ fontSize: 13.5 }}>{order.order_number}</Text>
          </Text>
        </View>
      )}
    </>
  );
}

function Row({ k, v, green }: { k: string; v: string; green?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: green ? colors.lime600 : colors.muted }}>{k}</Text>
      <Text style={{ color: green ? colors.lime600 : colors.ink }}>{v}</Text>
    </View>
  );
}

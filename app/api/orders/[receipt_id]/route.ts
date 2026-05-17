import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { createEtsyShipment } from "@/lib/etsy/api";

interface CompleteOrderBody {
  tracking_number?: string;
  carrier?: string;
  note_to_buyer?: string;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ receipt_id: string }> }
) {
  const { receipt_id } = await params;
  const id = parseInt(receipt_id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid receipt_id" }, { status: 400 });
  }

  const body: CompleteOrderBody = await req.json().catch(() => ({}));
  const supabase = createSupabaseServerClient();

  // Fetch shop credentials so we can attempt to mark shipped on Etsy too
  const { data: order } = await supabase
    .from("etsy_orders")
    .select("shop_id, connected_shops!inner(access_token)")
    .eq("receipt_id", id)
    .single();

  // Attempt to mark shipped on Etsy (requires transactions_w scope).
  // Falls back gracefully if the token lacks the scope — local marking
  // still succeeds and the next sync will pull the updated Etsy status.
  if (order && body.tracking_number) {
    const shopData = (order.connected_shops as unknown) as { access_token: string } | null;
    if (shopData?.access_token) {
      await createEtsyShipment(
        order.shop_id as number,
        id,
        shopData.access_token,
        body.tracking_number,
        body.carrier ?? "other"
      ).catch((e) => {
        // 401 means missing transactions_w scope — user needs to reconnect
        console.warn(
          `[complete-order] Etsy shipment API failed for receipt ${id}:`,
          e instanceof Error ? e.message : String(e)
        );
      });
    }
  }

  const { error } = await supabase
    .from("etsy_orders")
    .update({
      is_shipped: true,
      tracking_number: body.tracking_number ?? null,
      carrier: body.carrier ?? "4PX",
      shipped_at: new Date().toISOString(),
    })
    .eq("receipt_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

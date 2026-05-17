import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

/** GET /api/shops — list all active connected shops */
export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("connected_shops")
      .select(
        "shop_id, shop_name, shop_title, shop_icon_url, listing_active_count, connected_at, last_synced_at, is_active"
      )
      .eq("is_active", true)
      .order("connected_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ shops: data ?? [] });
  } catch (e) {
    console.error("[GET /api/shops]", e);
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
  }
}

/** DELETE /api/shops?shop_id=xxx — disconnect (soft-delete) a shop */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get("shop_id");

  if (!shopId || isNaN(Number(shopId))) {
    return NextResponse.json({ error: "shop_id is required" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServerClient();

    // Soft-delete: mark inactive rather than destroying order history
    const { error } = await supabase
      .from("connected_shops")
      .update({ is_active: false })
      .eq("shop_id", Number(shopId));

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/shops]", e);
    return NextResponse.json({ error: "Failed to disconnect shop" }, { status: 500 });
  }
}

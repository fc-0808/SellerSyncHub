import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ receipt_id: string }> }
) {
  const { receipt_id } = await params;
  const id = parseInt(receipt_id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid receipt_id" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("etsy_orders")
    .update({ is_shipped: true })
    .eq("receipt_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

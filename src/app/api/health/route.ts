import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tenants")
    .select("id", { head: true, count: "exact" });

  if (error) {
    return NextResponse.json(
      { status: "erro", banco: false, detalhe: error.message },
      { status: 503 },
    );
  }

  return NextResponse.json({ status: "ok", banco: true });
}

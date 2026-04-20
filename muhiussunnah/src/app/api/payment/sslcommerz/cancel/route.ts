import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { env } from "@/lib/config/env";

export const dynamic = "force-dynamic";

async function handle(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let body: Record<string, string> = {};
  if (contentType.includes("application/x-www-form-urlencoded")) {
    body = Object.fromEntries(new URLSearchParams(await request.text()));
  }
  const tranId = body.tran_id ?? new URL(request.url).searchParams.get("tran_id") ?? "";

  if (tranId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = supabaseAdmin() as any;
    await admin
      .from("payments")
      .update({ status: "canceled", notes: "User canceled at gateway" })
      .eq("transaction_id", tranId)
      .eq("status", "pending");
  }
  return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/pay/cancel?tran=${tranId}`);
}

export async function POST(request: Request) { return handle(request); }
export async function GET(request: Request) { return handle(request); }

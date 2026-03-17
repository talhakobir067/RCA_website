import { NextResponse } from "next/server";
import { verifySupabaseConnection } from "@/lib/auth/supabase";

export async function GET() {
  try {
    await verifySupabaseConnection();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Supabase health check failed:", error);
    return NextResponse.json(
      { 
        ok: false, 
        error: "Supabase connection failed. Please ensure Supabase is configured correctly." 
      },
      { status: 503 }
    );
  }
}

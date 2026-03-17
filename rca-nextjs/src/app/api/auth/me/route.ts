import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getUserByIdFromSupabase } from "@/lib/auth/supabase";
import { sanitizeUser } from "@/lib/auth/user";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await getUserByIdFromSupabase(session.sub);

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json({ error: "Failed to fetch user." }, { status: 500 });
  }
}
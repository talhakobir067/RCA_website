import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { setAuthCookie, signSession } from "@/lib/auth/session";
import { sanitizeUser } from "@/lib/auth/user";
import { LoginPayload } from "@/types/auth";
import { normalizePhone } from "@/lib/auth/validation";
import { getUserByEmailFromSupabase, getUserByPhoneFromSupabase } from "@/lib/auth/supabase";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginPayload;
    const identifier = payload.identifier?.trim();
    const password = payload.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/phone and password are required." },
        { status: 400 }
      );
    }

    const normalized = normalizePhone(identifier);
    const email = identifier.toLowerCase();

    const userByEmail = await getUserByEmailFromSupabase(email);
    const user = userByEmail || (await getUserByPhoneFromSupabase(normalized));

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = await signSession({
      sub: user.id,
      name: user.fullName,
      email: user.email,
    });
    await setAuthCookie(token);

    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
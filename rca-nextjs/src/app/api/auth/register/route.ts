import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createUserRecord, sanitizeUser } from "@/lib/auth/user";
import { setAuthCookie, signSession } from "@/lib/auth/session";
import { upsertUserToSupabase, getUserByEmailFromSupabase, getUserByPhoneFromSupabase } from "@/lib/auth/supabase";
import { RegisterPayload } from "@/types/auth";
import { validateRegisterPayload } from "@/lib/auth/validation";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterPayload;
    const validation = validateRegisterPayload(payload);

    if (!validation.isValid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const email = payload.email.trim().toLowerCase();
    const emailExists = await getUserByEmailFromSupabase(email);
    const phoneExists = await getUserByPhoneFromSupabase(validation.normalizedPhone);

    if (emailExists || phoneExists) {
      return NextResponse.json(
        { error: "Email or phone number is already registered." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = createUserRecord(payload, passwordHash, validation.normalizedPhone);

    await upsertUserToSupabase(user);

    const token = await signSession({
      sub: user.id,
      name: user.fullName,
      email: user.email,
    });

    await setAuthCookie(token);

    return NextResponse.json({ user: sanitizeUser(user) }, { status: 201 });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { upsertUserToSupabase, getUserByIdFromSupabase, getUserByEmailFromSupabase, getUserByPhoneFromSupabase } from "@/lib/auth/supabase";
import { sanitizeUser } from "@/lib/auth/user";
import { MembershipType, RegisterPayload, SocialLink } from "@/types/auth";
import {
  normalizePhone,
  passwordStrength,
  validateMembershipSpecificFields,
} from "@/lib/auth/validation";

interface ProfileUpdatePayload {
  fullName: string;
  email: string;
  series: number;
  department: string;
  phoneNumber: string;
  bloodGroup?: string;
  membershipType: MembershipType;
  profilePictureUrl?: string;
  socialLinks: SocialLink[];
  rollNumber?: string;
  yearOfGraduation?: number;
  currentlyWorkingAt?: string;
  designation?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByIdFromSupabase(session.sub);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await request.json()) as ProfileUpdatePayload;
    const errors: string[] = [];

    if (!payload.fullName?.trim()) errors.push("Full name is required.");
    if (!payload.email?.trim()) errors.push("Email is required.");
    if (!Number.isFinite(Number(payload.series))) errors.push("Series is required.");
    if (!payload.department?.trim()) errors.push("Department is required.");

    const normalizedPhone = normalizePhone(payload.phoneNumber || "");
    if (!/^(?:\+8801|8801|01)[3-9]\d{8}$/.test(normalizedPhone)) {
      errors.push("Phone number must be a valid Bangladeshi number.");
    }

    validateMembershipSpecificFields(
      payload.membershipType,
      payload as Partial<RegisterPayload>,
      errors
    );

    if (payload.newPassword) {
      if (payload.newPassword.length < 8) {
        errors.push("New password must be at least 8 characters.");
      }
      if (passwordStrength(payload.newPassword) < 3) {
        errors.push("New password is too weak.");
      }
      if (payload.newPassword !== payload.confirmNewPassword) {
        errors.push("New password and confirm password do not match.");
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const current = await getUserByIdFromSupabase(session.sub);
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = payload.email.trim().toLowerCase();
    const duplicateEmail = await getUserByEmailFromSupabase(email);
    const duplicatePhone = await getUserByPhoneFromSupabase(normalizedPhone);

    if ((duplicateEmail && duplicateEmail.id !== session.sub) || (duplicatePhone && duplicatePhone.id !== session.sub)) {
      return NextResponse.json(
        { error: "Another account already uses this email or phone number." },
        { status: 409 }
      );
    }

    const nextPasswordHash = payload.newPassword
      ? await bcrypt.hash(payload.newPassword, 12)
      : current.passwordHash;

    const updated = {
      ...current,
      fullName: payload.fullName.trim(),
      email,
      series: Number(payload.series),
      department: payload.department,
      phoneNumber: normalizedPhone,
      bloodGroup: payload.bloodGroup?.trim() || undefined,
      membershipType: payload.membershipType,
      profilePictureUrl: payload.profilePictureUrl?.trim() || undefined,
      socialLinks: (payload.socialLinks || []).filter((item) => item.url?.trim()),
      rollNumber:
        payload.membershipType === "alumni"
          ? undefined
          : payload.rollNumber?.trim() || undefined,
      yearOfGraduation:
        payload.membershipType === "alumni"
          ? Number(payload.yearOfGraduation)
          : undefined,
      currentlyWorkingAt:
        payload.membershipType === "alumni"
          ? payload.currentlyWorkingAt?.trim() || undefined
          : undefined,
      designation:
        payload.membershipType === "alumni"
          ? payload.designation?.trim() || undefined
          : undefined,
      passwordHash: nextPasswordHash,
      updatedAt: new Date().toISOString(),
    };

    await upsertUserToSupabase(updated);

    return NextResponse.json({ user: sanitizeUser(updated) });
  } catch (error) {
    console.error("Profile update failed:", error);
    return NextResponse.json({ error: "Profile update failed." }, { status: 500 });
  }
}
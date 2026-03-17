import { createClient } from "@supabase/supabase-js";
import { AuthUserRecord, PublicAuthUser } from "@/types/auth";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase credentials not configured. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY are required."
    );
  }
  return createClient(url, key);
}

function mapSupabaseUserToAuthRecord(supabaseUser: any): AuthUserRecord {
  return {
    id: supabaseUser.id,
    fullName: supabaseUser.full_name,
    email: supabaseUser.email,
    series: supabaseUser.series,
    department: supabaseUser.department,
    phoneNumber: supabaseUser.phone_number,
    bloodGroup: supabaseUser.blood_group,
    membershipType: supabaseUser.membership_type,
    profilePictureUrl: supabaseUser.profile_picture_url,
    socialLinks: supabaseUser.social_links || [],
    rollNumber: supabaseUser.roll_number,
    yearOfGraduation: supabaseUser.year_of_graduation,
    currentlyWorkingAt: supabaseUser.currently_working_at,
    designation: supabaseUser.designation,
    passwordHash: supabaseUser.password_hash,
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at,
  };
}

export async function verifySupabaseConnection() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("rca_users").select("id").limit(1);
    if (error) {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
    return true;
  } catch (error) {
    console.error("❌ Supabase health check failed:", error);
    throw error;
  }
}

export async function upsertUserToSupabase(user: AuthUserRecord) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("rca_users").upsert({
    id: user.id,
    full_name: user.fullName,
    email: user.email,
    series: user.series,
    department: user.department,
    phone_number: user.phoneNumber,
    blood_group: user.bloodGroup,
    membership_type: user.membershipType,
    profile_picture_url: user.profilePictureUrl,
    social_links: user.socialLinks,
    roll_number: user.rollNumber,
    year_of_graduation: user.yearOfGraduation,
    currently_working_at: user.currentlyWorkingAt,
    designation: user.designation,
    password_hash: user.passwordHash,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  });

  if (error) {
    throw new Error(`Failed to save user to Supabase: ${error.message}`);
  }
}

export async function getUserByIdFromSupabase(userId: string): Promise<AuthUserRecord | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("rca_users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // User not found
    }
    throw new Error(`Failed to fetch user from Supabase: ${error.message}`);
  }

  return data ? mapSupabaseUserToAuthRecord(data) : null;
}

export async function getUserByEmailFromSupabase(email: string): Promise<AuthUserRecord | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("rca_users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // User not found
    }
    throw new Error(`Failed to fetch user from Supabase: ${error.message}`);
  }

  return data ? mapSupabaseUserToAuthRecord(data) : null;
}

export async function getUserByPhoneFromSupabase(phone: string): Promise<AuthUserRecord | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("rca_users")
    .select("*")
    .eq("phone_number", phone)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // User not found
    }
    throw new Error(`Failed to fetch user from Supabase: ${error.message}`);
  }

  return data ? mapSupabaseUserToAuthRecord(data) : null;
}

export async function getAllUsersFromSupabase(): Promise<AuthUserRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("rca_users").select("*");

  if (error) {
    throw new Error(`Failed to fetch users from Supabase: ${error.message}`);
  }

  return data ? data.map(mapSupabaseUserToAuthRecord) : [];
}

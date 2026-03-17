import { AuthUserRecord } from "@/types/auth";

interface AuthStore {
  users: AuthUserRecord[];
}

export async function readAuthStore(): Promise<AuthStore> {
  throw new Error(
    "Local file storage is disabled. Use Supabase functions instead: getUserByIdFromSupabase, getUserByEmailFromSupabase, etc."
  );
}

export async function writeAuthStore(store: AuthStore) {
  throw new Error(
    "Local file storage is disabled. Use Supabase functions instead: upsertUserToSupabase"
  );
}

export function getAuthDataPath() {
  throw new Error(
    "Local file storage is disabled. This application now uses Supabase exclusively."
  );
}
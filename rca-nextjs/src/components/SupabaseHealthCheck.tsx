"use client";

import { useEffect } from "react";

export function SupabaseHealthCheck() {
  useEffect(() => {
    const checkSupabaseHealth = async () => {
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        
        if (!data.ok) {
          console.error("❌ Supabase health check failed:", data.error);
          console.error("The application cannot start without a working Supabase connection.");
          // Quit the application
          window.location.href = "/error?reason=supabase-unavailable";
        } else {
          console.log("✅ Supabase connection verified");
        }
      } catch (error) {
        console.error("❌ Failed to check Supabase health:", error);
        console.error("The application cannot start without a working Supabase connection.");
        // Quit the application
        window.location.href = "/error?reason=supabase-unavailable";
      }
    };

    checkSupabaseHealth();
  }, []);

  return null;
}

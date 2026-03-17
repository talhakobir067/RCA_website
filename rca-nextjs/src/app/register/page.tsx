"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DEPARTMENTS, MEMBERSHIP_TYPES, SOCIAL_MEDIA_TYPES } from "@/lib/auth/constants";
import { getBackendBaseUrl } from "@/lib/config";
import { passwordStrength } from "@/lib/auth/validation";
import { MembershipType, SocialLink } from "@/types/auth";

interface FormState {
  fullName: string;
  email: string;
  series: string;
  department: string;
  phoneNumber: string;
  bloodGroup: string;
  membershipType: MembershipType;
  profilePictureUrl: string;
  rollNumber: string;
  yearOfGraduation: string;
  currentlyWorkingAt: string;
  designation: string;
  password: string;
  confirmPassword: string;
}

const initialForm: FormState = {
  fullName: "",
  email: "",
  series: "",
  department: "CSE",
  phoneNumber: "",
  bloodGroup: "",
  membershipType: "regular",
  profilePictureUrl: "",
  rollNumber: "",
  yearOfGraduation: "",
  currentlyWorkingAt: "",
  designation: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [pendingType, setPendingType] = useState("facebook");
  const [otherType, setOtherType] = useState("");
  const [pendingLink, setPendingLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const pwdStrength = useMemo(() => passwordStrength(form.password), [form.password]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addSocialLink() {
    const url = pendingLink.trim();
    if (!url) return;

    const platform = pendingType === "other" ? otherType.trim() : pendingType;
    if (!platform) return;

    setSocialLinks((prev) => [...prev, { platform, url }]);
    setPendingType("facebook");
    setOtherType("");
    setPendingLink("");
  }

  function removeSocialLink(index: number) {
    setSocialLinks((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const payload = {
        ...form,
        series: Number(form.series),
        yearOfGraduation: form.yearOfGraduation ? Number(form.yearOfGraduation) : undefined,
        socialLinks,
      };

      const response = await fetch(`${getBackendBaseUrl()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        if (Array.isArray(data.errors)) {
          setErrors(data.errors);
        } else {
          setErrors([data.error || "Registration failed."]);
        }
        return;
      }

      router.push("/alumni");
    } catch {
      setErrors(["Could not submit registration form."]);
    } finally {
      setLoading(false);
    }
  }

  const isAlumni = form.membershipType === "alumni";

  return (
    <main className="site-shell">
      <Navbar showQueryButton={false} />

      <section className="px-4 pb-20 pt-36 md:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-red-200/40 bg-white/50 shadow-[0_8px_32px_rgba(220,38,38,0.15)] backdrop-blur-lg transition-all duration-300 dark:border-red-500/25 dark:bg-slate-950/75 dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)] dark:backdrop-blur-xl">
          <div className="border-b border-red-100/40 bg-gradient-to-r from-red-100/60 via-red-50/40 to-transparent p-8 md:p-10 dark:border-red-500/25 dark:bg-gradient-to-r dark:from-red-900/40 dark:via-red-700/20 dark:to-transparent">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-700 dark:text-amber-200">Membership Portal</p>
            <h1 className="mt-3 text-4xl font-bold md:text-5xl text-gray-900 dark:text-amber-50">Create Your RCA Profile</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 md:text-base text-gray-700 dark:text-amber-100/80">
              Register once and get access to member-only resources and alumni networking. Fields adapt automatically to your selected membership type.
            </p>
          </div>

          <div className="p-6 md:p-10">
            {errors.length > 0 && (
              <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-200">
                {errors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-2xl border border-red-100/50 bg-white/50 p-4 md:p-6 backdrop-blur-sm transition-all duration-300 dark:border-white/10 dark:bg-white/5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-red-700 dark:text-amber-200">Basic Info</p>
                <div className="grid gap-4 md:grid-cols-3">
                  <input
                    className="rca-input"
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    required
                  />
                  <input
                    className="rca-input"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                  <input
                    className="rca-input"
                    placeholder="Phone Number"
                    value={form.phoneNumber}
                    onChange={(e) => updateField("phoneNumber", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-red-100/50 bg-white/50 p-4 md:p-6 backdrop-blur-sm transition-all duration-300 dark:border-white/10 dark:bg-white/5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-red-700 dark:text-amber-200">Membership Info</p>
                <div className="grid gap-4 md:grid-cols-2 md:items-start">
                  <input
                    className="rca-input"
                    type="number"
                    placeholder="Series"
                    value={form.series}
                    onChange={(e) => updateField("series", e.target.value)}
                    required
                  />
                  <select
                    className="rca-input"
                    value={form.department}
                    onChange={(e) => updateField("department", e.target.value)}
                    required
                  >
                    {DEPARTMENTS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <input
                    className="rca-input"
                    placeholder="Blood Group (optional)"
                    value={form.bloodGroup}
                    onChange={(e) => updateField("bloodGroup", e.target.value)}
                  />
                  <select
                    className="rca-input"
                    value={form.membershipType}
                    onChange={(e) => updateField("membershipType", e.target.value as MembershipType)}
                    required
                  >
                    {MEMBERSHIP_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <input
                    className="rca-input"
                    placeholder="Profile Picture URL (optional)"
                    value={form.profilePictureUrl}
                    onChange={(e) => updateField("profilePictureUrl", e.target.value)}
                  />
                </div>

                {!isAlumni && (
                  <div className="mt-4">
                    <input
                      className="rca-input"
                      placeholder="Roll Number"
                      value={form.rollNumber}
                      onChange={(e) => updateField("rollNumber", e.target.value)}
                      required
                    />
                  </div>
                )}

                {isAlumni && (
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <input
                      className="rca-input"
                      type="number"
                      placeholder="Year of Graduation"
                      value={form.yearOfGraduation}
                      onChange={(e) => updateField("yearOfGraduation", e.target.value)}
                      required
                    />
                    <input
                      className="rca-input"
                      placeholder="Currently Working At"
                      value={form.currentlyWorkingAt}
                      onChange={(e) => updateField("currentlyWorkingAt", e.target.value)}
                      required
                    />
                    <input
                      className="rca-input"
                      placeholder="Designation"
                      value={form.designation}
                      onChange={(e) => updateField("designation", e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-red-100/50 bg-white/50 p-4 md:p-6 backdrop-blur-sm transition-all duration-300 dark:border-white/10 dark:bg-white/5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-red-700 dark:text-amber-200">Social Links (Optional)</p>
                <div className="grid gap-3 md:grid-cols-3">
                  <select
                    className="rca-input"
                    value={pendingType}
                    onChange={(e) => setPendingType(e.target.value)}
                  >
                    {SOCIAL_MEDIA_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {pendingType === "other" && (
                    <input
                      className="rca-input"
                      placeholder="Custom Social Media Type"
                      value={otherType}
                      onChange={(e) => setOtherType(e.target.value)}
                    />
                  )}
                  <input
                    className="rca-input"
                    placeholder="https://your-link.com"
                    value={pendingLink}
                    onChange={(e) => setPendingLink(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="mt-3 rounded-full border border-red-400 px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-300 hover:bg-red-400/10 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-500/10"
                  onClick={addSocialLink}
                >
                  + Add Social Link
                </button>

                <div className="mt-4 space-y-2">
                  {socialLinks.map((item, idx) => (
                    <div
                      key={`${item.platform}-${idx}`}
                      className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/30 p-3 text-sm text-gray-700 dark:border-white/10 dark:bg-black/20 dark:text-amber-100"
                    >
                      <span>
                        {item.platform}: {item.url}
                      </span>
                      <button
                        type="button"
                        className="font-semibold text-red-600 hover:underline dark:text-red-300"
                        onClick={() => removeSocialLink(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-red-100/50 bg-white/50 p-4 md:p-6 backdrop-blur-sm transition-all duration-300 dark:border-white/10 dark:bg-white/5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-red-700 dark:text-amber-200">Security</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <input
                      className="rca-input"
                      type="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      required
                    />
                    <div className="mt-2 h-2 rounded-full bg-red-100 dark:bg-white/15">
                      <div
                        className="h-2 rounded-full bg-red-500"
                        style={{ width: `${Math.max(10, (pwdStrength / 5) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-600 dark:text-amber-100/70">Password strength: {pwdStrength}/5</p>
                  </div>
                  <input
                    className="rca-input self-start"
                    type="password"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="rca-pill-button w-full py-3 text-base" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>

              <p className="text-center text-sm text-gray-700 dark:text-amber-100/80">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-red-600 underline dark:text-red-300">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Info,
  Newspaper,
  Calendar,
  BookOpen,
  Users,
  UserPlus,
  LogIn,
  LogOut,
  Settings,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { getBackendBaseUrl } from "@/lib/config";
import { PublicAuthUser } from "@/types/auth";

interface NavbarProps {
  showQueryButton?: boolean;
}

export default function Navbar({ showQueryButton = true }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState<PublicAuthUser | null>(null);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/What", icon: Info, label: "About" },
    { href: "/news", icon: Newspaper, label: "News" },
    { href: "/event", icon: Calendar, label: "Events" },
    { href: "/library", icon: BookOpen, label: "Library" },
    { href: "/alumni", icon: Users, label: "Alumni" },
    { href: "/membership", icon: UserPlus, label: "Membership" },
  ];

  const isActive = (href: string) => pathname === href;
  const visibleNavItems = user
    ? navItems
    : navItems.filter((item) => item.href !== "/alumni");

  const avatarText = useMemo(() => {
    if (!user?.fullName) return "RC";
    return user.fullName.trim().slice(0, 2).toUpperCase();
  }, [user]);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(`${getBackendBaseUrl()}/api/auth/me`, {
          credentials: "include",
        });
        if (!response.ok) {
          setUser(null);
          return;
        }
        const data = await response.json();
        setUser(data.user || null);
      } catch {
        setUser(null);
      }
    }

    void loadUser();
  }, [pathname]);

  async function handleLogout() {
    await fetch(`${getBackendBaseUrl()}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setProfileMenuOpen(false);
    setMenuOpen(false);
    window.location.href = "/";
  }

  return (
    <nav className="site-nav">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        {/* Logo on Left */}
        <Link href="/" className="flex shrink-0 items-center space-x-3">
          <img src="/image/RCA.png" alt="RCA Logo" className="h-16 w-auto" />
          <div className="flex flex-col leading-tight">
            <span className="text-amber-50 text-xl font-bold">RCA</span>
            <span className="text-amber-50 text-sm font-semibold md:text-lg">
              Rajshahi City Association
            </span>
          </div>
        </Link>

        {/* Navigation in Center */}
        <div className="hidden flex-1 justify-center md:flex">
          <ul className="flex items-center space-x-6 text-xs font-semibold uppercase text-amber-50 lg:text-sm">
            {visibleNavItems.map((item) => (
              <li key={item.href} className="rca-nav-link">
                <item.icon size={16} />
                <Link
                  href={item.href}
                  className={isActive(item.href) ? "underline underline-offset-4" : ""}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Buttons on Right */}
        <div className="flex items-center gap-3 md:ml-6">
          {showQueryButton && (
            <Link href="/query" className="rca-pill-button">
              Any Query
            </Link>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-amber-50 backdrop-blur-lg hover:bg-white/20"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/10 font-bold text-amber-50"
                aria-label="Open profile menu"
              >
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={user.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarText
                )}
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-12 min-w-48 rounded-xl border border-white/20 bg-black/85 p-2 text-xs uppercase text-amber-50 shadow-lg">
                  <Link
                    href="/profile/edit"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10"
                  >
                    <Settings size={14} /> Edit Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="rounded-full border border-white/30 px-4 py-2 text-xs font-bold uppercase lg:text-sm">
              Login
            </Link>
          )}
        </div>

        <div
          className="ml-auto space-y-1 cursor-pointer z-20 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {!menuOpen ? (
            <>
              <div className="w-6 h-0.5 bg-amber-50"></div>
              <div className="w-6 h-0.5 bg-amber-50"></div>
              <div className="w-6 h-0.5 bg-amber-50"></div>
            </>
          ) : (
            <X size={24} className="text-amber-50" />
          )}
        </div>
      </div>

      {menuOpen && (
        <ul className="site-mobile-menu">
          {visibleNavItems.map((item) => (
            <li
              key={item.href}
              className="flex items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              <item.icon size={16} />
              <Link
                href={item.href}
                className={isActive(item.href) ? "underline underline-offset-4" : ""}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-semibold text-amber-50"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </li>
          {user ? (
            <>
              <li>
                <Link href="/profile/edit" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                  <Settings size={16} /> Edit Profile
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-semibold text-amber-50"
                >
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                <LogIn size={16} /> Login
              </Link>
            </li>
          )}
          {showQueryButton && (
            <li>
              <Link
                href="/query"
                className="rca-pill-button flex w-full text-center bg-red"
                onClick={() => setMenuOpen(false)}
              >
                Any Query
              </Link>
            </li>
          )}
        </ul>
      )}
    </nav>
  );
}

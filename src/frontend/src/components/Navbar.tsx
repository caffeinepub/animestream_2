import { Input } from "@/components/ui/input";
import { Bell, ChevronDown, LogIn, Search, Shield, Tv2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { SiteSettings } from "../backend.d";

interface NavbarProps {
  settings?: SiteSettings;
  onAdminClick: () => void;
  currentView: string;
  onHomeClick: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

const NAV_LINKS = ["Home", "Browse", "Simulcasts", "News", "Premium"];

export function Navbar({
  settings,
  onAdminClick,
  currentView,
  onHomeClick,
  searchQuery = "",
  onSearchChange,
}: NavbarProps) {
  const siteName = settings?.siteName || "AnimeVibe";
  const logoUrl = settings?.logoUrl || "";
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "navbar-solid border-border"
          : "bg-gradient-to-b from-black/70 to-transparent border-transparent"
      }`}
    >
      <div className="max-w-screen-2xl mx-auto flex items-center gap-4 px-6 md:px-8 h-14">
        {/* Brand */}
        <button
          type="button"
          onClick={onHomeClick}
          data-ocid="nav.home_link"
          className="flex items-center gap-2 flex-shrink-0 group"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="logo"
              className="h-7 w-7 rounded object-cover"
            />
          ) : (
            <Tv2 className="h-6 w-6 text-primary" />
          )}
          <span className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors tracking-tight hidden sm:block">
            {siteName}
          </span>
        </button>

        {/* Primary nav links */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              type="button"
              data-ocid={`nav.${link.toLowerCase()}_link`}
              onClick={() => {
                setActiveNav(link);
                if (link === "Home") onHomeClick();
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeNav === link && currentView === "home"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link}
              {link === "Premium" && (
                <span className="ml-1 text-[10px] text-primary font-bold">
                  ★
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs ml-auto md:ml-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search anime..."
              data-ocid="nav.search_input"
              className="pl-8 h-8 text-sm bg-white/5 border-border/50 focus:border-primary/50 rounded-full placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onAdminClick}
            data-ocid="nav.admin_link"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded-md hover:bg-white/5"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:bg-primary/90 transition-all hover:scale-105"
            data-ocid="nav.login_button"
          >
            <LogIn className="h-3 w-3" />
            <span className="hidden sm:inline">Sign In</span>
          </button>

          <button
            type="button"
            className="hidden sm:flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary">
              A
            </div>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </nav>
  );
}

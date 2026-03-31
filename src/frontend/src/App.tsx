import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { AnimeEntry } from "./backend.d";
import { AdminPanel } from "./components/AdminPanel";
import { HomePage } from "./components/HomePage";
import { Navbar } from "./components/Navbar";
import { VideoPlayer } from "./components/VideoPlayer";
import { useGetAllAnime, useGetSettings } from "./hooks/useQueries";

const queryClient = new QueryClient();

type View = "home" | "player" | "admin";

function AppContent() {
  const [view, setView] = useState<View>("home");
  const [selectedAnime, setSelectedAnime] = useState<AnimeEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: animeList = [], isLoading: animeLoading } = useGetAllAnime();
  const { data: settings } = useGetSettings();

  useEffect(() => {
    const body = document.body;
    if (!settings) return;
    if (settings.bgType === "color" && settings.bgColor) {
      body.style.backgroundColor = settings.bgColor;
      body.style.backgroundImage = "none";
    } else if (settings.bgType === "image" && settings.bgBlobId) {
      body.style.backgroundImage = `url('${settings.bgBlobId}')`;
      body.style.backgroundSize = "cover";
      body.style.backgroundAttachment = "fixed";
      body.style.backgroundPosition = "center";
    } else {
      body.style.backgroundColor = "";
      body.style.backgroundImage = "";
    }
  }, [settings]);

  function handlePlayAnime(anime: AnimeEntry) {
    setSelectedAnime(anime);
    setView("player");
  }

  function handleBack() {
    setView("home");
    setSelectedAnime(null);
  }

  return (
    <div className="min-h-screen bg-background">
      {view !== "admin" && (
        <Navbar
          settings={settings}
          onAdminClick={() => setView("admin")}
          currentView={view}
          onHomeClick={handleBack}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      <main className={view !== "admin" ? "pt-14" : ""}>
        {view === "home" && (
          <HomePage
            animeList={animeList}
            settings={settings}
            isLoading={animeLoading}
            onPlayAnime={handlePlayAnime}
            searchQuery={searchQuery}
          />
        )}
        {view === "player" && selectedAnime && (
          <VideoPlayer anime={selectedAnime} onBack={handleBack} />
        )}
        {view === "admin" && (
          <AdminPanel
            animeList={animeList}
            settings={settings}
            onClose={() => setView("home")}
          />
        )}
      </main>

      {view !== "admin" && view !== "player" && (
        <footer className="border-t border-border mt-4 py-10 bg-card/50">
          <div className="max-w-screen-2xl mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-display font-bold text-foreground mb-3">
                  AnimeVibe
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your ultimate destination for anime streaming. Watch the
                  latest simulcasts and classic series.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Browse
                </h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {["Popular", "New Releases", "Simulcasts", "All Series"].map(
                    (l) => (
                      <li key={l}>
                        <button
                          type="button"
                          className="hover:text-primary transition-colors"
                        >
                          {l}
                        </button>
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Genres
                </h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {["Action", "Fantasy", "Romance", "Sci-Fi"].map((l) => (
                    <li key={l}>
                      <button
                        type="button"
                        className="hover:text-primary transition-colors"
                      >
                        {l}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Support
                </h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {[
                    "Help Center",
                    "Contact Us",
                    "Privacy Policy",
                    "Terms of Use",
                  ].map((l) => (
                    <li key={l}>
                      <button
                        type="button"
                        className="hover:text-primary transition-colors"
                      >
                        {l}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} AnimeVibe. All rights
                reserved.
              </p>
              <p className="text-xs text-muted-foreground">
                Built with <span className="text-primary">♥</span> using{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </footer>
      )}

      <Toaster richColors />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

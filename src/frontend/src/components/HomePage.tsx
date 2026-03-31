import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { AnimeEntry, SiteSettings } from "../backend.d";

// Sample content shown when backend has no anime yet
const SAMPLE_ANIME = [
  {
    id: BigInt(-1),
    title: "Void Chronicles",
    description:
      "A lone warrior discovers he can absorb the powers of fallen gods, setting him on a collision course with the pantheon itself.",
    thumbnailBlobId: "/assets/generated/anime-poster-1.dim_400x600.jpg",
    videoBlobId: "",
    genre: "Action / Fantasy",
    rating: "9.2",
    episodes: 24,
  },
  {
    id: BigInt(-2),
    title: "Frost Arcana",
    description:
      "An outcast mage with forbidden ice magic joins a secret guild to uncover the truth behind her cursed bloodline.",
    thumbnailBlobId: "/assets/generated/anime-poster-2.dim_400x600.jpg",
    videoBlobId: "",
    genre: "Fantasy / Magic",
    rating: "8.9",
    episodes: 13,
  },
  {
    id: BigInt(-3),
    title: "Iron Colossus",
    description:
      "Five unlikely pilots must work together to pilot a giant mech and defend Earth from an interdimensional invasion.",
    thumbnailBlobId: "/assets/generated/anime-poster-3.dim_400x600.jpg",
    videoBlobId: "",
    genre: "Mecha / Sci-Fi",
    rating: "8.7",
    episodes: 26,
  },
  {
    id: BigInt(-4),
    title: "Neon Detective",
    description:
      "In a cyberpunk city where memories can be stolen, one detective must solve the impossible case before his own mind is erased.",
    thumbnailBlobId: "/assets/generated/anime-poster-4.dim_400x600.jpg",
    videoBlobId: "",
    genre: "Mystery / Noir",
    rating: "9.0",
    episodes: 12,
  },
  {
    id: BigInt(-5),
    title: "Flavor of Heaven",
    description:
      "A prodigy chef with supernatural taste buds competes in the most prestigious culinary tournament in the world.",
    thumbnailBlobId: "/assets/generated/anime-poster-5.dim_400x600.jpg",
    videoBlobId: "",
    genre: "Slice of Life",
    rating: "8.5",
    episodes: 24,
  },
  {
    id: BigInt(-6),
    title: "Starfall Breach",
    description:
      "When a wormhole opens above Earth, humanity's last hope lies with a rogue pilot and her experimental spacecraft.",
    thumbnailBlobId: "/assets/generated/anime-poster-6.dim_400x600.jpg",
    videoBlobId: "",
    genre: "Sci-Fi / Space",
    rating: "9.1",
    episodes: 13,
  },
];

const GENRES = [
  "Action",
  "Fantasy",
  "Romance",
  "Horror",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Mecha",
  "Mystery",
  "Isekai",
];

interface DisplayAnime extends AnimeEntry {
  genre?: string;
  rating?: string;
  episodes?: number;
}

interface HomePageProps {
  animeList: AnimeEntry[];
  settings?: SiteSettings;
  isLoading: boolean;
  onPlayAnime: (anime: AnimeEntry) => void;
  searchQuery?: string;
}

function HeroBanner({
  anime,
  settings,
  onPlayAnime,
}: {
  anime: DisplayAnime[];
  settings?: SiteSettings;
  onPlayAnime: (a: AnimeEntry) => void;
}) {
  const [current, setCurrent] = useState(0);
  const featured = anime.slice(0, 5);

  useEffect(() => {
    if (featured.length <= 1) return;
    const t = setInterval(
      () => setCurrent((c) => (c + 1) % featured.length),
      6000,
    );
    return () => clearInterval(t);
  }, [featured.length]);

  const bgType = settings?.bgType || "color";
  const bgColor = settings?.bgColor || "#0B0C0F";
  const bgUrl = settings?.bgBlobId || "";
  const heroUrl =
    settings?.heroBlobId || "/assets/generated/hero-banner.dim_1920x1080.jpg";
  const current_anime = featured[current];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "62vh", minHeight: "520px" }}
    >
      {/* Background layer */}
      {bgType === "video" && bgUrl ? (
        <video
          src={bgUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : bgType === "image" && bgUrl ? (
        <img
          src={bgUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: bgColor }}
        />
      )}

      {/* Hero art background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={current_anime?.thumbnailBlobId || heroUrl}
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: "center top" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Vignette overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex items-end h-full pb-14 px-8 md:px-12 max-w-screen-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary text-primary-foreground text-[10px] uppercase tracking-widest border-0">
                Now Streaming
              </Badge>
              {current_anime?.genre && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-white/20 text-white/70"
                >
                  {current_anime.genre}
                </Badge>
              )}
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-foreground leading-tight mb-4 tracking-tight">
              {current_anime?.title || "Watch Anime"}
            </h1>

            <p className="text-muted-foreground text-base mb-6 leading-relaxed line-clamp-2">
              {current_anime?.description ||
                "Stream your favourite anime series in stunning quality."}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <Star className="h-3.5 w-3.5 fill-yellow-400" />
                <span className="font-semibold">
                  {current_anime?.rating || "8.9"}
                </span>
              </div>
              {current_anime?.episodes && (
                <span className="text-xs text-muted-foreground">
                  {current_anime.episodes} Episodes
                </span>
              )}
              <span className="text-xs text-muted-foreground">SUB | DUB</span>
              <span className="text-xs border border-white/20 text-white/60 px-1.5 py-0.5 rounded text-[10px]">
                HD
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => current_anime && onPlayAnime(current_anime)}
                data-ocid="hero.primary_button"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-6 rounded-full font-semibold"
              >
                <Play className="h-4 w-4 fill-current" />
                Watch Now
              </Button>
              <Button
                variant="outline"
                data-ocid="hero.secondary_button"
                className="border-white/20 text-white hover:bg-white/10 gap-2 px-5 rounded-full"
              >
                <BookmarkPlus className="h-4 w-4" />
                Add to List
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination dots */}
      {featured.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {featured.map((_, i) => (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: pagination dots
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AnimeCard({
  anime,
  onClick,
  ocid,
  wide = false,
}: {
  anime: DisplayAnime;
  onClick: () => void;
  ocid: string;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className="anime-card group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl flex-shrink-0 w-full text-left"
    >
      <div
        className={`relative overflow-hidden rounded-xl bg-card mb-2.5 ${
          wide ? "aspect-video" : "aspect-[2/3]"
        }`}
      >
        {anime.thumbnailBlobId ? (
          <img
            src={anime.thumbnailBlobId}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Play className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 bg-primary rounded-full p-3.5 shadow-glow">
            <Play className="h-5 w-5 text-primary-foreground fill-current" />
          </div>
        </div>
        {anime.rating && (
          <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[10px] text-yellow-400 font-semibold">
            <Star className="h-2.5 w-2.5 fill-yellow-400" />
            {anime.rating}
          </div>
        )}
        <div className="card-glow absolute inset-0 rounded-xl ring-1 ring-primary/60" />
      </div>
      <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
        {anime.title}
      </h3>
      {anime.genre && (
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {anime.genre}
        </p>
      )}
    </button>
  );
}

function SectionHeader({
  title,
  onPrev,
  onNext,
}: { title: string; onPrev?: () => void; onNext?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display font-bold text-xl text-foreground">
        {title}
      </h2>
      {(onPrev || onNext) && (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onPrev}
            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function HomePage({
  animeList,
  settings,
  isLoading,
  onPlayAnime,
  searchQuery = "",
}: HomePageProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use backend anime if available, otherwise show sample content
  const displayAnime: DisplayAnime[] =
    animeList.length > 0
      ? animeList.map((a, i) => ({
          ...a,
          rating: ["9.2", "8.7", "9.0", "8.5", "9.1", "8.8"][i % 6],
          genre: ["Action", "Fantasy", "Sci-Fi", "Mystery", "Romance", "Mecha"][
            i % 6
          ],
          episodes: [12, 24, 13, 26, 12, 24][i % 6],
        }))
      : SAMPLE_ANIME;

  const filtered = searchQuery
    ? displayAnime.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : displayAnime;

  const continueWatching = displayAnime.slice(0, 3);
  const trending = displayAnime.slice(0, 6);
  const newReleases = displayAnime.slice(0, 4);

  function scrollRow(dir: 1 | -1) {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      {!searchQuery && (
        <HeroBanner
          anime={displayAnime}
          settings={settings}
          onPlayAnime={onPlayAnime}
        />
      )}

      <div className="max-w-screen-2xl mx-auto px-6 md:px-8 pt-10 pb-20 space-y-14">
        {/* Search results */}
        {searchQuery && (
          <section>
            <SectionHeader title={`Results for "${searchQuery}"`} />
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-[2/3] rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                data-ocid="anime.empty_state"
                className="py-16 text-center text-muted-foreground"
              >
                No anime found for "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filtered.map((anime, idx) => (
                  <motion.div
                    key={String(anime.id)}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.35 }}
                  >
                    <AnimeCard
                      anime={anime}
                      onClick={() => onPlayAnime(anime)}
                      ocid={`search.item.${idx + 1}`}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}

        {!searchQuery && (
          <>
            {/* Continue Watching */}
            <section>
              <SectionHeader
                title="Continue Watching"
                onPrev={() => scrollRow(-1)}
                onNext={() => scrollRow(1)}
              />
              <div
                ref={scrollRef}
                className="scroll-row flex gap-4 overflow-x-auto pb-2"
              >
                {continueWatching.map((anime, idx) => (
                  <div
                    key={String(anime.id)}
                    className="w-72 md:w-80 flex-shrink-0"
                  >
                    <AnimeCard
                      anime={anime}
                      onClick={() => onPlayAnime(anime)}
                      ocid={`continue.item.${idx + 1}`}
                      wide
                    />
                    {/* Progress bar */}
                    <div className="mt-1.5 h-1 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${[65, 30, 82][idx]}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ep {[7, 3, 11][idx]} • {["42%", "18%", "55%"][idx]}{" "}
                      watched
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Trending Now */}
            <section>
              <SectionHeader title="Trending Now" />
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-video rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {trending.map((anime, idx) => (
                    <motion.div
                      key={String(anime.id)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06, duration: 0.4 }}
                    >
                      <AnimeCard
                        anime={anime}
                        onClick={() => onPlayAnime(anime)}
                        ocid={`trending.item.${idx + 1}`}
                        wide
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Bottom: New Releases + Genres */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* New Releases */}
              <div className="lg:col-span-2">
                <SectionHeader title="New Releases" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {newReleases.map((anime, idx) => (
                    <motion.div
                      key={String(anime.id)}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07, duration: 0.4 }}
                    >
                      <AnimeCard
                        anime={anime}
                        onClick={() => onPlayAnime(anime)}
                        ocid={`new.item.${idx + 1}`}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Explore Genres */}
              <div>
                <SectionHeader title="Explore Genres" />
                <div className="grid grid-cols-2 gap-2">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      className="genre-pill py-2.5 px-3 bg-card border border-border rounded-lg text-sm text-muted-foreground text-center font-medium"
                      data-ocid={`genre.${genre.toLowerCase().replace(/[^a-z0-9]/g, "_")}_button`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* All Anime grid */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-foreground">
                  All Anime
                </h2>
                <span className="text-sm text-muted-foreground">
                  {displayAnime.length} titles
                </span>
              </div>
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-[2/3] rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {displayAnime.map((anime, idx) => (
                    <motion.div
                      key={String(anime.id)}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.35 }}
                    >
                      <AnimeCard
                        anime={anime}
                        onClick={() => onPlayAnime(anime)}
                        ocid={`anime.item.${idx + 1}`}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

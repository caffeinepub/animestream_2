import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Anime {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
}

interface SiteSettings {
  name: string;
  logoUrl: string;
  bgVideoUrl: string;
  bgVideoFile: string; // object URL for local file
  bgType: "color" | "image" | "video"; // what type of background
  bgColor: string; // hex color
  bgImageUrl: string; // image URL or object URL
}

type View = "home" | "player" | "admin";

// ── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "animeStreamData";
const SITE_KEY = "animeStreamSite2";
const ADMIN_PASSWORD = "ayanbhai07682";

const SEED_ANIME: Anime[] = [
  {
    id: "1",
    title: "Naruto",
    description:
      "A young ninja with dreams of becoming Hokage must master the power of the Nine-Tailed Fox sealed within him. An epic journey of growth, friendship, and never giving up.",
    thumbnail: "https://picsum.photos/seed/naruto/400/225",
    videoUrl: "",
  },
  {
    id: "2",
    title: "Attack on Titan",
    description:
      "Humanity survives within enormous walled cities to protect themselves from Titans — giant humanoid creatures who devour humans without reason.",
    thumbnail: "https://picsum.photos/seed/attackontitan/400/225",
    videoUrl: "",
  },
  {
    id: "3",
    title: "Demon Slayer",
    description:
      "Tanjiro Kamado becomes a demon slayer after his family is slaughtered and his sister transformed into a demon. Breathtaking combat and stunning animation await.",
    thumbnail: "https://picsum.photos/seed/demonslayer/400/225",
    videoUrl: "",
  },
  {
    id: "4",
    title: "One Piece",
    description:
      "Monkey D. Luffy sets sail to find the legendary One Piece treasure and become King of the Pirates, gathering a legendary crew along the way.",
    thumbnail: "https://picsum.photos/seed/onepiece/400/225",
    videoUrl: "",
  },
  {
    id: "5",
    title: "Dragon Ball Z",
    description:
      "Goku and his friends defend Earth against increasingly powerful foes, pushing the limits of Super Saiyan power in legendary battles.",
    thumbnail: "https://picsum.photos/seed/dragonballz/400/225",
    videoUrl: "",
  },
  {
    id: "6",
    title: "My Hero Academia",
    description:
      "In a world where most people have superpowers called Quirks, Izuku Midoriya is born without one — yet dreams of becoming the greatest hero of all.",
    thumbnail: "https://picsum.photos/seed/myheroacademia/400/225",
    videoUrl: "",
  },
];

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadAnime(): Anime[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Anime[];
    } catch {
      return SEED_ANIME;
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ANIME));
  return SEED_ANIME;
}

function saveAnime(list: Anime[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadSiteSettings(): SiteSettings {
  const raw = localStorage.getItem(SITE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as SiteSettings;
    } catch {}
  }
  return {
    name: "AniStream",
    logoUrl: "",
    bgVideoUrl: "",
    bgVideoFile: "",
    bgType: "color",
    bgColor: "#141414",
    bgImageUrl: "",
  };
}

function saveSiteSettings(s: SiteSettings) {
  localStorage.setItem(SITE_KEY, JSON.stringify(s));
}

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({
  settings,
  view,
  setView,
}: {
  settings: SiteSettings;
  view: View;
  setView: (v: View) => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
      animate={{
        background: scrolled ? "oklch(0.08 0 0 / 0.98)" : "oklch(0 0 0 / 0)",
        borderBottomColor: scrolled ? "oklch(0.20 0 0)" : "oklch(0 0 0 / 0)",
      }}
      transition={{ duration: 0.3 }}
      style={{
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottomWidth: 1,
        borderBottomStyle: "solid",
      }}
    >
      <motion.button
        type="button"
        data-ocid="nav.link"
        onClick={() => setView("home")}
        className="flex items-center gap-3"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        {settings.logoUrl && (
          <img
            src={settings.logoUrl}
            alt="logo"
            className="h-9 w-9 rounded-lg object-cover"
          />
        )}
        <span
          className="text-2xl font-bold tracking-tight"
          style={{
            color: "oklch(0.68 0.18 49)",
            fontFamily: "'Bricolage Grotesque', sans-serif",
          }}
        >
          {settings.name}
        </span>
      </motion.button>

      <div className="flex items-center gap-1">
        {(["home", "admin"] as View[]).map((v) => (
          <motion.button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              color: view === v ? "oklch(0.68 0.18 49)" : "oklch(0.75 0 0)",
              background:
                view === v ? "oklch(0.68 0.18 49 / 0.14)" : "transparent",
            }}
          >
            {v}
          </motion.button>
        ))}
      </div>
    </motion.nav>
  );
}

// ── AnimeCard ────────────────────────────────────────────────────────────────
function AnimeCard({
  anime,
  index,
  onPlay,
}: {
  anime: Anime;
  index: number;
  onPlay: (a: Anime) => void;
}) {
  return (
    <motion.div
      data-ocid={`anime.item.${index + 1}`}
      className="anime-card rounded-2xl overflow-hidden flex flex-col"
      style={{ background: "oklch(0.12 0 0)" }}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="thumb-container">
        <img src={anime.thumbnail} alt={anime.title} loading="lazy" />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{ background: "oklch(0 0 0 / 0.55)" }}
        >
          <motion.button
            type="button"
            data-ocid={`anime.item.${index + 1}`}
            className="btn-orange w-16 h-16 rounded-full text-2xl flex items-center justify-center"
            onClick={() => onPlay(anime)}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0.7, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
          >
            ▶
          </motion.button>
        </motion.div>
      </div>
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="text-white font-bold text-lg leading-snug line-clamp-1">
          {anime.title}
        </h3>
        <p
          className="text-sm leading-relaxed line-clamp-2"
          style={{ color: "oklch(0.60 0 0)" }}
        >
          {anime.description}
        </p>
        <div className="mt-auto pt-2">
          <motion.button
            type="button"
            data-ocid={`anime.play_button.${index + 1}`}
            className="btn-orange w-full py-3 rounded-xl font-semibold text-sm"
            onClick={() => onPlay(anime)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            ▶ Play Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Hero Banner ──────────────────────────────────────────────────────────────
function HeroBanner({
  anime,
  onPlay,
  bgVideoSrc,
}: {
  anime: Anime;
  onPlay: (a: Anime) => void;
  bgVideoSrc: string;
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const shortDesc =
    anime.description.length > 130
      ? `${anime.description.slice(0, 130)}...`
      : anime.description;

  return (
    <div
      ref={heroRef}
      className="relative w-full overflow-hidden"
      style={{ height: "620px", minHeight: "420px" }}
    >
      {/* Background: video or image */}
      {bgVideoSrc ? (
        // biome-ignore lint/a11y/useMediaCaption: background decoration
        <motion.video
          src={bgVideoSrc}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={
            { y, filter: "brightness(0.45) scale(1.06)" } as React.CSSProperties
          }
        />
      ) : (
        <motion.img
          src={anime.thumbnail}
          alt={anime.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ y, filter: "brightness(0.45)" } as React.CSSProperties}
        />
      )}

      <div className="hero-overlay absolute inset-0" />

      {/* Animated floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            // biome-ignore lint/suspicious/noArrayIndexKey: decorative particles
            key={i}
            className="absolute rounded-full"
            style={{
              width: 4 + (i % 3) * 3,
              height: 4 + (i % 3) * 3,
              left: `${10 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              background: "oklch(0.68 0.18 49 / 0.5)",
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.7,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute inset-0 flex flex-col justify-end pb-16 px-10 md:px-20 max-w-3xl"
        style={{ opacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="text-xs font-bold uppercase tracking-[0.2em] mb-4 block"
            style={{ color: "oklch(0.68 0.18 49)" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            ✦ Featured Anime
          </motion.span>
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            {anime.title}
          </motion.h1>
          <motion.p
            className="text-lg mb-10 leading-relaxed max-w-xl"
            style={{ color: "oklch(0.80 0 0)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            {shortDesc}
          </motion.p>
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <motion.button
              type="button"
              data-ocid="hero.primary_button"
              className="btn-orange px-10 py-4 rounded-2xl font-bold text-lg"
              onClick={() => onPlay(anime)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              ▶ Watch Now
            </motion.button>
            <motion.button
              type="button"
              className="px-10 py-4 rounded-2xl font-bold text-lg"
              style={{
                background: "oklch(1 0 0 / 0.1)",
                color: "white",
                border: "1px solid oklch(1 0 0 / 0.2)",
                backdropFilter: "blur(8px)",
              }}
              whileHover={{ scale: 1.05, background: "oklch(1 0 0 / 0.15)" }}
              whileTap={{ scale: 0.96 }}
            >
              + Watchlist
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Home View ────────────────────────────────────────────────────────────────
function HomeView({
  animeList,
  setView,
  setCurrentAnime,
  bgVideoSrc,
}: {
  animeList: Anime[];
  setView: (v: View) => void;
  setCurrentAnime: (a: Anime) => void;
  bgVideoSrc: string;
}) {
  const featured = animeList[0];

  function handlePlay(anime: Anime) {
    setCurrentAnime(anime);
    setView("player");
  }

  return (
    <div data-ocid="home.page">
      {featured && (
        <HeroBanner
          anime={featured}
          onPlay={handlePlay}
          bgVideoSrc={bgVideoSrc}
        />
      )}

      <section className="px-8 md:px-14 py-16">
        <motion.div
          className="flex items-end justify-between mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-1"
              style={{ color: "oklch(0.68 0.18 49)" }}
            >
              Library
            </p>
            <h2
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              All Anime
            </h2>
          </div>
          <span className="text-sm" style={{ color: "oklch(0.45 0 0)" }}>
            {animeList.length} titles
          </span>
        </motion.div>

        {animeList.length === 0 ? (
          <motion.div
            data-ocid="anime.empty_state"
            className="text-center py-32"
            style={{ color: "oklch(0.50 0 0)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-5">🎌</div>
            <p className="text-xl font-medium">No anime yet</p>
            <p className="text-sm mt-2" style={{ color: "oklch(0.38 0 0)" }}>
              Add some from the Admin panel
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {animeList.map((a, i) => (
              <AnimeCard key={a.id} anime={a} index={i} onPlay={handlePlay} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Video Player View ────────────────────────────────────────────────────────
function PlayerView({
  anime,
  setView,
}: {
  anime: Anime;
  setView: (v: View) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [noVideo] = useState(!anime.videoUrl);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }, []);

  const skip = useCallback((secs: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + secs));
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
  }, []);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    const val = Number(e.target.value);
    setVolume(val);
    if (v) v.volume = val;
    setMuted(val === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!document.fullscreenElement) v.requestFullscreen();
    else document.exitFullscreen();
  }, []);

  function fmt(s: number) {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      data-ocid="player.page"
      className="min-h-screen pt-24 px-6 md:px-12 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.button
        type="button"
        data-ocid="player.back.button"
        onClick={() => setView("home")}
        className="flex items-center gap-2 mb-8 text-sm font-semibold transition-colors"
        style={{ color: "oklch(0.68 0.18 49)" }}
        whileHover={{ x: -4 }}
      >
        ← Back to Home
      </motion.button>

      <div className="max-w-5xl mx-auto">
        {/* Video container */}
        <motion.div
          className="video-wrapper rounded-2xl overflow-hidden"
          style={{
            border: "1px solid oklch(0.22 0 0)",
            boxShadow: "0 24px 80px oklch(0 0 0 / 0.6)",
          }}
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {noVideo ? (
            <div
              data-ocid="player.error_state"
              className="flex items-center justify-center"
              style={{
                height: "520px",
                background: "oklch(0.10 0 0)",
                color: "oklch(0.55 0 0)",
              }}
            >
              <div className="text-center">
                <motion.div
                  className="text-6xl mb-5"
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                >
                  🎬
                </motion.div>
                <p className="text-xl font-medium">No video available</p>
                <p
                  className="text-sm mt-2"
                  style={{ color: "oklch(0.40 0 0)" }}
                >
                  Add a video URL or upload a file in Admin panel
                </p>
              </div>
            </div>
          ) : (
            <div
              className="relative"
              onMouseMove={resetControlsTimer}
              onMouseLeave={() => playing && setShowControls(false)}
            >
              {/* biome-ignore lint/a11y/useMediaCaption: user uploaded content */}
              <video
                ref={videoRef}
                src={anime.videoUrl}
                className="w-full block"
                style={{ maxHeight: "560px", background: "#000" }}
                onClick={togglePlay}
                onKeyDown={(e) => e.key === " " && togglePlay()}
              />
              {/* Overlay controls on hover */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                animate={{ opacity: showControls || !playing ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {!playing && (
                  <motion.div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "oklch(0.68 0.18 49 / 0.85)" }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <span className="text-white text-3xl ml-1">▶</span>
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Controls */}
        {!noVideo && (
          <motion.div
            className="rounded-2xl mt-4 p-5 flex flex-col gap-4"
            style={{
              background: "oklch(0.12 0 0)",
              border: "1px solid oklch(0.20 0 0)",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Custom progress bar */}
            <div className="flex items-center gap-4">
              <span
                className="text-xs w-12 text-right tabular-nums"
                style={{ color: "oklch(0.55 0 0)" }}
              >
                {fmt(currentTime)}
              </span>
              <div className="flex-1 relative group">
                <div
                  className="h-1.5 rounded-full w-full"
                  style={{ background: "oklch(0.22 0 0)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "oklch(0.68 0.18 49)",
                      width: `${progressPct}%`,
                    }}
                  />
                </div>
                <input
                  data-ocid="player.progress.input"
                  type="range"
                  className="slider-orange absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                />
              </div>
              <span
                className="text-xs w-12 tabular-nums"
                style={{ color: "oklch(0.55 0 0)" }}
              >
                {fmt(duration)}
              </span>
            </div>

            {/* Buttons row */}
            <div className="flex items-center gap-3 flex-wrap">
              <motion.button
                type="button"
                data-ocid="player.skip_back.button"
                onClick={() => skip(-10)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "oklch(0.18 0 0)", color: "white" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
              >
                ⏪ 10s
              </motion.button>
              <motion.button
                type="button"
                data-ocid="player.play.toggle"
                onClick={togglePlay}
                className="btn-orange px-8 py-2.5 rounded-xl font-bold text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
              >
                {playing ? "⏸ Pause" : "▶ Play"}
              </motion.button>
              <motion.button
                type="button"
                data-ocid="player.skip_forward.button"
                onClick={() => skip(10)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "oklch(0.18 0 0)", color: "white" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
              >
                10s ⏩
              </motion.button>

              <div className="ml-auto flex items-center gap-3">
                <motion.button
                  type="button"
                  data-ocid="player.mute.toggle"
                  onClick={toggleMute}
                  className="text-xl"
                  style={{ color: "white" }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {muted ? "🔇" : "🔊"}
                </motion.button>
                <input
                  data-ocid="player.volume.input"
                  type="range"
                  className="slider-orange w-24 h-2 rounded-full"
                  min={0}
                  max={1}
                  step={0.02}
                  value={muted ? 0 : volume}
                  onChange={handleVolume}
                />
                <motion.button
                  type="button"
                  data-ocid="player.fullscreen.button"
                  onClick={toggleFullscreen}
                  className="px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: "oklch(0.18 0 0)", color: "white" }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  ⛶
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Title and description */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2
            className="text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            {anime.title}
          </h2>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "oklch(0.62 0 0)" }}
          >
            {anime.description}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Admin View ───────────────────────────────────────────────────────────────
interface EditState {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  selectedFile: File | null;
}

function AdminView({
  animeList,
  setAnimeList,
  settings,
  setSettings,
}: {
  animeList: Anime[];
  setAnimeList: (list: Anime[]) => void;
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
}) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [siteNameInput, setSiteNameInput] = useState(settings.name);
  const [logoUrlInput, setLogoUrlInput] = useState(settings.logoUrl);
  const [bgVideoUrlInput, setBgVideoUrlInput] = useState(settings.bgVideoUrl);
  const [bgVideoFile, setBgVideoFile] = useState<File | null>(null);
  const [bgVideoFileUrl, setBgVideoFileUrl] = useState(
    settings.bgVideoFile || "",
  );
  const [bgType, setBgType] = useState<"color" | "image" | "video">(
    settings.bgType || "color",
  );
  const [bgColor, setBgColor] = useState(settings.bgColor || "#141414");
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState(settings.bgImageUrl || "");

  const [addTitle, setAddTitle] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addThumb, setAddThumb] = useState("");
  const [addThumbFile, setAddThumbFile] = useState<File | null>(null);
  const [addThumbFileUrl, setAddThumbFileUrl] = useState("");
  const [addVideo, setAddVideo] = useState("");
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addFileUrl, setAddFileUrl] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({
    id: "",
    title: "",
    description: "",
    thumbnail: "",
    videoUrl: "",
    selectedFile: null,
  });
  const [editFileUrl, setEditFileUrl] = useState("");

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Wrong password");
    }
  }

  function handleSaveSettings() {
    const resolvedBgVideo = bgVideoFileUrl || bgVideoUrlInput;
    const updated: SiteSettings = {
      name: siteNameInput,
      logoUrl: logoUrlInput,
      bgVideoUrl: bgVideoUrlInput,
      bgVideoFile: bgVideoFileUrl,
      bgType,
      bgColor,
      bgImageUrl,
    };
    saveSiteSettings({ ...updated });
    setSettings({ ...updated, bgVideoUrl: resolvedBgVideo });
  }

  function handleAddAnime() {
    if (!addTitle.trim() || !addDesc.trim()) return;
    const resolvedVideo = addFileUrl || addVideo;
    const resolvedThumb =
      addThumbFileUrl ||
      addThumb.trim() ||
      `https://picsum.photos/seed/${encodeURIComponent(addTitle)}/400/225`;
    const newAnime: Anime = {
      id: Date.now().toString(),
      title: addTitle.trim(),
      description: addDesc.trim(),
      thumbnail: resolvedThumb,
      videoUrl: resolvedVideo,
    };
    const updated = [...animeList, newAnime];
    saveAnime(updated);
    setAnimeList(updated);
    setAddTitle("");
    setAddDesc("");
    setAddThumb("");
    setAddThumbFile(null);
    setAddThumbFileUrl("");
    setAddVideo("");
    setAddFile(null);
    setAddFileUrl("");
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this anime?")) return;
    const updated = animeList.filter((a) => a.id !== id);
    saveAnime(updated);
    setAnimeList(updated);
  }

  function startEdit(anime: Anime) {
    setEditId(anime.id);
    setEditState({ ...anime, selectedFile: null });
    setEditFileUrl("");
  }

  function cancelEdit() {
    setEditId(null);
    setEditFileUrl("");
  }

  function saveEdit() {
    const resolvedVideo = editFileUrl || editState.videoUrl;
    const updated = animeList.map((a) =>
      a.id === editId
        ? {
            id: a.id,
            title: editState.title,
            description: editState.description,
            thumbnail: editState.thumbnail,
            videoUrl: resolvedVideo,
          }
        : a,
    );
    saveAnime(updated);
    setAnimeList(updated);
    setEditId(null);
    setEditFileUrl("");
  }

  if (!loggedIn) {
    return (
      <motion.div
        data-ocid="admin.page"
        className="min-h-screen flex items-center justify-center pt-20"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="w-full max-w-sm p-10 rounded-3xl flex flex-col gap-6"
          style={{
            background: "oklch(0.12 0 0)",
            border: "1px solid oklch(0.20 0 0)",
            boxShadow: "0 32px 80px oklch(0 0 0 / 0.5)",
          }}
        >
          <div className="text-center">
            <div className="text-4xl mb-3">🔐</div>
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Admin Login
            </h2>
          </div>
          <input
            data-ocid="admin.password.input"
            type="password"
            placeholder="Enter admin password"
            className="admin-input py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {loginError && (
            <motion.p
              data-ocid="admin.login.error_state"
              className="text-sm text-center"
              style={{ color: "oklch(0.65 0.18 27)" }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {loginError}
            </motion.p>
          )}
          <motion.button
            type="button"
            data-ocid="admin.login.submit_button"
            className="btn-orange py-3.5 rounded-2xl font-bold text-base"
            onClick={handleLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Login
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      data-ocid="admin.panel"
      className="min-h-screen pt-28 px-6 md:px-12 pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1
            className="text-4xl font-bold text-white"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Admin Panel
          </h1>
          <motion.button
            type="button"
            data-ocid="admin.logout.button"
            onClick={() => {
              setLoggedIn(false);
              setPassword("");
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: "oklch(0.18 0 0)",
              color: "oklch(0.70 0 0)",
              border: "1px solid oklch(0.25 0 0)",
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            Logout
          </motion.button>
        </motion.div>

        {/* Site Settings */}
        <motion.section
          className="p-8 rounded-3xl flex flex-col gap-6"
          style={{
            background: "oklch(0.12 0 0)",
            border: "1px solid oklch(0.20 0 0)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-white">⚙️ Site Settings</h2>

          {/* Site Name */}
          <div>
            <span
              className="text-sm font-medium mb-2 block"
              style={{ color: "oklch(0.60 0 0)" }}
            >
              Site Name
            </span>
            <input
              data-ocid="admin.sitename.input"
              className="admin-input"
              placeholder="Site name"
              value={siteNameInput}
              onChange={(e) => setSiteNameInput(e.target.value)}
            />
          </div>

          {/* Logo */}
          <div>
            <span
              className="text-sm font-medium mb-2 block"
              style={{ color: "oklch(0.60 0 0)" }}
            >
              Logo URL
            </span>
            <div className="flex gap-3 items-center">
              <input
                data-ocid="admin.logo.input"
                className="admin-input flex-1"
                placeholder="https://example.com/logo.png"
                value={logoUrlInput}
                onChange={(e) => setLogoUrlInput(e.target.value)}
              />
              {logoUrlInput && (
                <img
                  src={logoUrlInput}
                  alt="logo preview"
                  className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                />
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: "oklch(0.40 0 0)" }}>
              Paste a direct image URL to use as the site logo in the navbar
            </p>
          </div>

          {/* Background Type */}
          <div>
            <span
              className="text-sm font-medium mb-2 block"
              style={{ color: "oklch(0.60 0 0)" }}
            >
              Website Background Type
            </span>
            <div className="flex gap-2">
              {(["color", "image", "video"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setBgType(t)}
                  className="px-4 py-2 rounded-xl font-medium text-sm capitalize transition-all"
                  style={{
                    background:
                      bgType === t ? "oklch(0.68 0.18 49)" : "oklch(0.20 0 0)",
                    color: "white",
                    border: bgType === t ? "none" : "1px solid oklch(0.28 0 0)",
                  }}
                >
                  {t === "color"
                    ? "🎨 Color"
                    : t === "image"
                      ? "🖼️ Image"
                      : "🎬 Video"}
                </button>
              ))}
            </div>
          </div>

          {/* Background Color */}
          {bgType === "color" && (
            <div>
              <span
                className="text-sm font-medium mb-2 block"
                style={{ color: "oklch(0.60 0 0)" }}
              >
                Background Color
              </span>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-12 w-24 rounded-xl cursor-pointer border-0"
                  style={{ background: "none" }}
                />
                <input
                  className="admin-input flex-1"
                  placeholder="#141414"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                />
                <div
                  className="h-10 w-10 rounded-lg flex-shrink-0 border"
                  style={{
                    background: bgColor,
                    borderColor: "oklch(0.30 0 0)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Background Image */}
          {bgType === "image" && (
            <div>
              <span
                className="text-sm font-medium mb-2 block"
                style={{ color: "oklch(0.60 0 0)" }}
              >
                Background Image
              </span>
              <label
                className="admin-input flex items-center gap-2 cursor-pointer mb-3"
                style={{ color: bgImageFile ? "white" : "oklch(0.45 0 0)" }}
              >
                🖼️{" "}
                {bgImageFile
                  ? `Uploaded: ${bgImageFile.name}`
                  : "Upload a background image from your files"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setBgImageFile(f);
                    setBgImageUrl(f ? URL.createObjectURL(f) : "");
                  }}
                />
              </label>
              {bgImageUrl && (
                <div
                  className="relative rounded-xl overflow-hidden"
                  style={{ height: 120 }}
                >
                  <img
                    src={bgImageUrl}
                    alt="bg preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBgImageFile(null);
                      setBgImageUrl("");
                    }}
                    className="absolute top-2 right-2 px-2 py-1 text-xs rounded-lg font-bold"
                    style={{
                      background: "oklch(0.50 0.20 25)",
                      color: "white",
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
              <p className="text-xs mt-1" style={{ color: "oklch(0.40 0 0)" }}>
                This image will fill the entire website background
              </p>
            </div>
          )}

          {/* Background Video */}
          {bgType === "video" && (
            <div>
              <span
                className="text-sm font-medium mb-2 block"
                style={{ color: "oklch(0.60 0 0)" }}
              >
                Background Video (plays on homepage hero)
              </span>
              <input
                data-ocid="admin.bgvideo.input"
                className="admin-input mb-3"
                placeholder="Video URL (mp4, webm…)"
                value={bgVideoUrlInput}
                onChange={(e) => setBgVideoUrlInput(e.target.value)}
              />
              <label
                data-ocid="admin.bgvideo.upload_button"
                className="admin-input flex items-center gap-2 cursor-pointer"
                style={{ color: bgVideoFile ? "white" : "oklch(0.45 0 0)" }}
              >
                🎬{" "}
                {bgVideoFile
                  ? `Uploaded: ${bgVideoFile.name}`
                  : "Or upload a background video file"}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setBgVideoFile(f);
                    setBgVideoFileUrl(f ? URL.createObjectURL(f) : "");
                    if (f) setBgVideoUrlInput("");
                  }}
                />
              </label>
              <p className="text-xs mt-1" style={{ color: "oklch(0.40 0 0)" }}>
                This video will play silently as the hero background on the
                homepage
              </p>
            </div>
          )}

          <motion.button
            type="button"
            data-ocid="admin.sitename.save_button"
            className="btn-orange py-3 rounded-2xl font-bold"
            onClick={handleSaveSettings}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Save Settings
          </motion.button>
        </motion.section>

        {/* Add Anime */}
        <motion.section
          className="p-8 rounded-3xl flex flex-col gap-5"
          style={{
            background: "oklch(0.12 0 0)",
            border: "1px solid oklch(0.20 0 0)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-white">➕ Add Anime</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span
                className="text-xs font-medium mb-1 block"
                style={{ color: "oklch(0.55 0 0)" }}
              >
                Title *
              </span>
              <input
                data-ocid="admin.add.title.input"
                className="admin-input"
                placeholder="Title"
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <span
                className="text-xs font-medium mb-1 block"
                style={{ color: "oklch(0.55 0 0)" }}
              >
                Thumbnail URL
              </span>
              <input
                data-ocid="admin.add.thumb.input"
                className="admin-input"
                placeholder="https://..."
                value={addThumb}
                onChange={(e) => {
                  setAddThumb(e.target.value);
                  setAddThumbFile(null);
                  setAddThumbFileUrl("");
                }}
                disabled={!!addThumbFileUrl}
              />
              <label
                data-ocid="admin.add.thumb_upload_button"
                className="admin-input flex items-center gap-2 cursor-pointer"
                style={{ color: addThumbFile ? "white" : "oklch(0.45 0 0)" }}
              >
                🖼️{" "}
                {addThumbFile
                  ? `Image: ${addThumbFile.name}`
                  : "Upload thumbnail image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setAddThumbFile(f);
                    setAddThumbFileUrl(f ? URL.createObjectURL(f) : "");
                    if (f) setAddThumb("");
                  }}
                />
              </label>
              {addThumbFileUrl && (
                <div className="relative w-full h-20 rounded-xl overflow-hidden">
                  <img
                    src={addThumbFileUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAddThumbFile(null);
                      setAddThumbFileUrl("");
                    }}
                    className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded-lg"
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>
          </div>
          <div>
            <span
              className="text-xs font-medium mb-1 block"
              style={{ color: "oklch(0.55 0 0)" }}
            >
              Description *
            </span>
            <textarea
              data-ocid="admin.add.desc.textarea"
              className="admin-input"
              placeholder="Description"
              rows={3}
              value={addDesc}
              onChange={(e) => setAddDesc(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span
                className="text-xs font-medium mb-1 block"
                style={{ color: "oklch(0.55 0 0)" }}
              >
                Video URL
              </span>
              <input
                data-ocid="admin.add.video.input"
                className="admin-input"
                placeholder="https://..."
                value={addVideo}
                onChange={(e) => setAddVideo(e.target.value)}
              />
            </div>
            <div>
              <span
                className="text-xs font-medium mb-1 block"
                style={{ color: "oklch(0.55 0 0)" }}
              >
                Or Upload File
              </span>
              <label
                data-ocid="admin.add.upload_button"
                className="admin-input flex items-center gap-2 cursor-pointer"
                style={{ color: addFile ? "white" : "oklch(0.45 0 0)" }}
              >
                📁 {addFile ? `File: ${addFile.name}` : "Upload video file"}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setAddFile(f);
                    setAddFileUrl(f ? URL.createObjectURL(f) : "");
                  }}
                />
              </label>
            </div>
          </div>
          <motion.button
            type="button"
            data-ocid="admin.add.submit_button"
            className="btn-orange py-3.5 rounded-2xl font-bold"
            onClick={handleAddAnime}
            disabled={!addTitle.trim() || !addDesc.trim()}
            style={{ opacity: !addTitle.trim() || !addDesc.trim() ? 0.45 : 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            + Add Anime
          </motion.button>
        </motion.section>

        {/* Anime List */}
        <motion.section
          className="p-8 rounded-3xl flex flex-col gap-5"
          style={{
            background: "oklch(0.12 0 0)",
            border: "1px solid oklch(0.20 0 0)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-white">
            📋 Manage Anime ({animeList.length})
          </h2>
          {animeList.length === 0 ? (
            <p
              data-ocid="admin.anime.empty_state"
              style={{ color: "oklch(0.50 0 0)" }}
            >
              No anime added yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {animeList.map((anime, idx) => (
                <div key={anime.id} data-ocid={`admin.anime.item.${idx + 1}`}>
                  {editId === anime.id ? (
                    <div
                      className="p-5 rounded-2xl flex flex-col gap-4"
                      style={{
                        background: "oklch(0.15 0 0)",
                        border: "1px solid oklch(0.68 0.18 49 / 0.4)",
                      }}
                    >
                      <h3
                        className="text-sm font-bold"
                        style={{ color: "oklch(0.68 0.18 49)" }}
                      >
                        Editing: {anime.title}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          data-ocid="admin.edit.title.input"
                          className="admin-input"
                          placeholder="Title"
                          value={editState.title}
                          onChange={(e) =>
                            setEditState((p) => ({
                              ...p,
                              title: e.target.value,
                            }))
                          }
                        />
                        <input
                          data-ocid="admin.edit.thumb.input"
                          className="admin-input"
                          placeholder="Thumbnail URL"
                          value={editState.thumbnail}
                          onChange={(e) =>
                            setEditState((p) => ({
                              ...p,
                              thumbnail: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <textarea
                        data-ocid="admin.edit.desc.textarea"
                        className="admin-input"
                        rows={3}
                        placeholder="Description"
                        value={editState.description}
                        onChange={(e) =>
                          setEditState((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          data-ocid="admin.edit.video.input"
                          className="admin-input"
                          placeholder="Video URL"
                          value={editState.videoUrl}
                          onChange={(e) =>
                            setEditState((p) => ({
                              ...p,
                              videoUrl: e.target.value,
                            }))
                          }
                        />
                        <label
                          data-ocid="admin.edit.upload_button"
                          className="admin-input flex items-center gap-2 cursor-pointer"
                          style={{
                            color: editState.selectedFile
                              ? "white"
                              : "oklch(0.45 0 0)",
                          }}
                        >
                          📁{" "}
                          {editState.selectedFile
                            ? `File: ${editState.selectedFile.name}`
                            : "Upload video file"}
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0] ?? null;
                              setEditState((p) => ({ ...p, selectedFile: f }));
                              setEditFileUrl(f ? URL.createObjectURL(f) : "");
                            }}
                          />
                        </label>
                      </div>
                      <div className="flex gap-3">
                        <motion.button
                          type="button"
                          data-ocid="admin.edit.save_button"
                          className="btn-orange px-6 py-2.5 rounded-xl font-semibold"
                          onClick={saveEdit}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          Save
                        </motion.button>
                        <motion.button
                          type="button"
                          data-ocid="admin.edit.cancel_button"
                          onClick={cancelEdit}
                          className="px-6 py-2.5 rounded-xl font-semibold"
                          style={{
                            background: "oklch(0.18 0 0)",
                            color: "oklch(0.70 0 0)",
                          }}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      className="flex items-center gap-4 p-4 rounded-2xl"
                      style={{ background: "oklch(0.15 0 0)" }}
                      whileHover={{ background: "oklch(0.16 0 0)" }}
                    >
                      <img
                        src={anime.thumbnail}
                        alt={anime.title}
                        className="rounded-xl object-cover flex-shrink-0"
                        style={{ width: 88, height: 50 }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {anime.title}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "oklch(0.50 0 0)" }}
                        >
                          {anime.description}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <motion.button
                          type="button"
                          data-ocid={`admin.anime.edit_button.${idx + 1}`}
                          onClick={() => startEdit(anime)}
                          className="px-3.5 py-2 rounded-xl text-sm font-medium"
                          style={{
                            background: "oklch(0.20 0 0)",
                            color: "oklch(0.75 0 0)",
                            border: "1px solid oklch(0.28 0 0)",
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.94 }}
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          type="button"
                          data-ocid={`admin.anime.delete_button.${idx + 1}`}
                          onClick={() => handleDelete(anime.id)}
                          className="px-3.5 py-2 rounded-xl text-sm font-medium"
                          style={{
                            background: "oklch(0.18 0 0)",
                            color: "oklch(0.65 0.18 27)",
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.94 }}
                        >
                          Delete
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </motion.div>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;
  return (
    <footer
      className="text-center py-10 text-sm"
      style={{
        borderTop: "1px solid oklch(0.16 0 0)",
        color: "oklch(0.38 0 0)",
      }}
    >
      © {year}. Built with ❤️ using{" "}
      <a
        href={utm}
        target="_blank"
        rel="noreferrer"
        className="transition-colors hover:underline"
        style={{ color: "oklch(0.68 0.18 49)" }}
      >
        caffeine.ai
      </a>
    </footer>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>("home");
  const [animeList, setAnimeList] = useState<Anime[]>(loadAnime);
  const [currentAnime, setCurrentAnime] = useState<Anime | null>(null);
  const [siteSettings, setSiteSettingsState] =
    useState<SiteSettings>(loadSiteSettings);

  function handleSetSettings(s: SiteSettings) {
    setSiteSettingsState(s);
  }

  function handleSetView(v: View) {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const bgVideoSrc = siteSettings.bgVideoFile || siteSettings.bgVideoUrl || "";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          siteSettings.bgType === "image" && siteSettings.bgImageUrl
            ? `url(${siteSettings.bgImageUrl}) center/cover fixed`
            : siteSettings.bgType === "color" && siteSettings.bgColor
              ? siteSettings.bgColor
              : "oklch(0.08 0 0)",
      }}
    >
      <Navbar settings={siteSettings} view={view} setView={handleSetView} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HomeView
                animeList={animeList}
                setView={handleSetView}
                setCurrentAnime={setCurrentAnime}
                bgVideoSrc={bgVideoSrc}
              />
            </motion.div>
          )}
          {view === "player" && currentAnime && (
            <motion.div
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PlayerView anime={currentAnime} setView={handleSetView} />
            </motion.div>
          )}
          {view === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AdminView
                animeList={animeList}
                setAnimeList={setAnimeList}
                settings={siteSettings}
                setSettings={handleSetSettings}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

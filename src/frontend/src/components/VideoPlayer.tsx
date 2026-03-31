import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  AlertCircle,
  ArrowLeft,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AnimeEntry } from "../backend.d";

interface VideoPlayerProps {
  anime: AnimeEntry;
  onBack: () => void;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function VideoPlayer({ anime, onBack }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
    resetHideTimer();
  }

  function skipSeconds(sec: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + sec));
  }

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    if (v.duration) setProgress((v.currentTime / v.duration) * 100);
  }

  function handleSeek(val: number[]) {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    v.currentTime = (val[0] / 100) * v.duration;
    setProgress(val[0]);
  }

  function handleVolumeChange(val: number[]) {
    const v = videoRef.current;
    if (!v) return;
    const vol = val[0] / 100;
    v.volume = vol;
    setVolume(vol);
    setMuted(vol === 0);
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  const videoUrl = anime.videoBlobId;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 pt-4 pb-4">
        <button
          type="button"
          onClick={onBack}
          data-ocid="player.back_button"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto px-4 pb-16"
      >
        {/* Video container */}
        <div
          ref={containerRef}
          data-ocid="player.canvas_target"
          className="relative w-full rounded-xl overflow-hidden bg-black shadow-2xl mb-6 group"
          onMouseMove={resetHideTimer}
          onClick={togglePlay}
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.preventDefault();
              togglePlay();
            }
            if (e.key === "ArrowRight") skipSeconds(10);
            if (e.key === "ArrowLeft") skipSeconds(-10);
          }}
        >
          {videoUrl ? (
            videoError ? (
              <div className="aspect-video flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="font-medium">Video could not be loaded</p>
              </div>
            ) : (
              // biome-ignore lint/a11y/useMediaCaption: streaming content
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full aspect-video"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() =>
                  setDuration(videoRef.current?.duration || 0)
                }
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onError={() => setVideoError(true)}
                preload="metadata"
              />
            )
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <AlertCircle className="h-10 w-10" />
              <p>No video available for this anime.</p>
            </div>
          )}

          {/* Custom controls overlay */}
          {videoUrl && !videoError && (
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {/* Bottom gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 to-transparent" />

              {/* Controls */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                {/* Seek bar */}
                <Slider
                  value={[progress]}
                  onValueChange={handleSeek}
                  min={0}
                  max={100}
                  step={0.1}
                  className="mb-3 h-1 cursor-pointer"
                  data-ocid="player.editor"
                />

                <div className="flex items-center gap-3">
                  {/* Play/pause */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={togglePlay}
                    data-ocid="player.toggle"
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    {playing ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}
                  </Button>

                  {/* Skip back */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => skipSeconds(-10)}
                    data-ocid="player.secondary_button"
                    className="h-7 w-7 text-white hover:bg-white/20"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>

                  {/* Skip forward */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => skipSeconds(10)}
                    data-ocid="player.primary_button"
                    className="h-7 w-7 text-white hover:bg-white/20"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </Button>

                  {/* Time */}
                  <span className="text-white text-xs tabular-nums">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <div className="flex-1" />

                  {/* Volume */}
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="text-white hover:text-primary transition-colors"
                  >
                    {muted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                  <div className="w-20 hidden sm:block">
                    <Slider
                      value={[muted ? 0 : volume * 100]}
                      onValueChange={handleVolumeChange}
                      min={0}
                      max={100}
                      step={1}
                      className="h-1"
                    />
                  </div>

                  {/* Fullscreen */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={toggleFullscreen}
                    className="h-7 w-7 text-white hover:bg-white/20"
                  >
                    <Maximize className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Center play icon on pause */}
              {!playing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/50 rounded-full p-5">
                    <Play className="h-8 w-8 text-white fill-white" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-3">
          <h1 className="font-display font-bold text-3xl text-foreground">
            {anime.title}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {anime.description}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

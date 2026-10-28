"use client";

import gsap from "gsap";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, DragEvent, KeyboardEvent, ReactNode } from "react";
import {
  CircleAlert,
  ExternalLink,
  HardDrive,
  ListMusic,
  LoaderCircle,
  Maximize2,
  Minus,
  Music2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Trash2,
  Upload,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  CURATED,
  JUKEBOX_PANEL_ID,
  addLocalFiles,
  clearLocalTracks,
  closeJukebox,
  cycleRepeat,
  dismissNotice,
  getPanelOpener,
  minimizeJukebox,
  nextTrack,
  openJukebox,
  pauseMusic,
  playMusic,
  playTrack,
  preloadMusic,
  previousTrack,
  removeLocalTrack,
  seekTo,
  setMusicVolume,
  toggleMusic,
  toggleMute,
  toggleShuffle,
  useMusic,
  useMusicProgress,
} from "@/lib/music";
import type { Track } from "@/lib/music";
import { CATEGORIES, TRACKS, categoryById, selectionCode } from "@/lib/musicLibrary";
import type { CategoryId, CuratedTrack } from "@/lib/musicLibrary";
import Soundwave from "./Soundwave";
import TrackArt from "./TrackArt";
import styles from "./Jukebox.module.css";

type Tab = "jukebox" | "local";
type Crate = CategoryId | "all";

const ACCEPT = "audio/*,.mp3,.m4a,.aac,.wav,.ogg,.oga,.opus,.flac,.webm";
const REPEAT_LABEL = { all: "Repeat all", one: "Repeat this song", off: "Repeat off" } as const;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatTime(seconds: number | null | undefined): string {
  if (!seconds || !Number.isFinite(seconds)) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

// Precomputed once: the jukebox code, art seed and search text for every curated track.
const CURATED_INFO = new Map(
  TRACKS.map((track) => {
    const code = selectionCode(track);
    const category = categoryById(track.category);
    const haystack = [track.title, track.artist, track.album, track.mood, category.label, category.blurb, code]
      .join(" ")
      .toLowerCase();
    return [track.id, { track, code, seed: Number(code.slice(1)) - 1, haystack }] as const;
  })
);

const matches = (haystack: string, query: string) =>
  query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));

/** Moves focus between a list's rows with the arrow keys, Home and End. */
function handleRowKeys(event: KeyboardEvent<HTMLElement>) {
  const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
  if (!keys.includes(event.key)) return;
  const rows = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("[data-row]"));
  const index = rows.indexOf(document.activeElement as HTMLButtonElement);
  if (index < 0) return;
  event.preventDefault();
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? rows.length - 1
        : event.key === "ArrowDown"
          ? Math.min(rows.length - 1, index + 1)
          : Math.max(0, index - 1);
  rows[next]?.focus();
}

function artFor(track: Track, className: string) {
  const seed = CURATED_INFO.get(track.id)?.seed ?? 0;
  return <TrackArt className={className} category={track.category} seed={seed} image={track.art} />;
}

function IconButton({
  label,
  onClick,
  children,
  pressed,
  className,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  pressed?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className ?? styles.iconButton}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function MiniEq() {
  return (
    <span className={styles.miniEq}>
      <span />
      <span />
      <span />
    </span>
  );
}

/**
 * Fatima's Jukebox: the site's music player, opened from the hero vinyl. One instance lives in the
 * root layout so it (and the music) carries across every page. It can be minimised to a small dock
 * or closed outright; neither stops the song.
 */
export default function Jukebox() {
  const music = useMusic();
  const { current, duration } = useMusicProgress();
  const [tab, setTab] = useState<Tab>("jukebox");
  const [crate, setCrate] = useState<Crate>("all");
  const [query, setQuery] = useState("");
  const [fileReport, setFileReport] = useState<string | null>(null);
  const [addingFiles, setAddingFiles] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const panelRef = useRef<HTMLElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const dockExpandRef = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevPanel = useRef(music.panel);
  const prevTrack = useRef(music.trackId);

  const titleId = useId();
  const jukeboxTabId = useId();
  const localTabId = useId();
  const jukeboxPanelId = useId();
  const localPanelId = useId();
  const tabIds = { jukebox: jukeboxTabId, local: localTabId };
  const panelIds = { jukebox: jukeboxPanelId, local: localPanelId };

  const open = music.panel === "open";
  // From the hook's snapshot, not the live store, so hydration renders what the server did.
  const track = music.localTracks.find((entry) => entry.id === music.trackId) ?? CURATED.find((entry) => entry.id === music.trackId) ?? CURATED[0];
  const info = CURATED_INFO.get(track.id);
  const active = music.status === "playing" || music.status === "loading";
  const playing = music.status === "playing";
  const shownDuration = duration || track.duration || 0;
  const percent = Math.round(music.volume * 100);
  const effectiveVolume = music.muted ? 0 : percent;
  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 50 ? Volume1 : Volume2;

  const curated = useMemo(
    () =>
      TRACKS.filter(
        (entry) => (crate === "all" || entry.category === crate) && matches(CURATED_INFO.get(entry.id)!.haystack, query)
      ),
    [crate, query]
  );
  const local = useMemo(
    () => music.localTracks.filter((entry) => matches(`${entry.title} ${entry.artist} ${entry.album ?? ""}`.toLowerCase(), query)),
    [music.localTracks, query]
  );

  // Panel in and out. It stays mounted (so search and scroll survive) and is hidden with autoAlpha.
  useEffect(() => {
    const panel = panelRef.current;
    const was = prevPanel.current;
    prevPanel.current = music.panel;
    if (!panel || was === music.panel) return;
    const still = reducedMotion();

    if (music.panel === "open") {
      gsap.killTweensOf(panel);
      // Visible from the first frame (only opacity animates) so it can take focus straight away.
      if (still) {
        gsap.fromTo(panel, { opacity: 0, visibility: "visible" }, { opacity: 1, duration: 0.2 });
      } else {
        gsap.fromTo(
          panel,
          { opacity: 0, visibility: "visible", y: 28, scale: 0.92, rotate: -1.5 },
          { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.62, ease: "expo.out" }
        );
        gsap.fromTo(
          panel.querySelectorAll("[data-reveal]"),
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.045, delay: 0.08, clearProps: "transform,opacity,visibility" }
        );
      }
      panel.focus({ preventScroll: true });
      return;
    }

    const hadFocus = panel.contains(document.activeElement);
    gsap.killTweensOf(panel);
    gsap.to(panel, still ? { autoAlpha: 0, duration: 0.15 } : { autoAlpha: 0, y: 18, scale: 0.96, duration: 0.26, ease: "power2.in" });
    if (!hadFocus) return;
    if (music.panel === "minimized") {
      // The dock renders in this same commit; focus its expand button once it's painted.
      window.requestAnimationFrame(() => dockExpandRef.current?.focus({ preventScroll: true }));
    } else {
      // The opener may have folded away (the navbar's hover card); fall back to a control that's there.
      const candidates = [getPanelOpener(), ...document.querySelectorAll<HTMLElement>("[data-jukebox-opener]")];
      for (const candidate of candidates) {
        candidate?.focus({ preventScroll: true });
        if (candidate && document.activeElement === candidate) break;
      }
    }
  }, [music.panel]);

  // The dock pops up from the corner.
  useEffect(() => {
    if (music.panel !== "minimized" || !dockRef.current || reducedMotion()) return;
    gsap.fromTo(dockRef.current, { autoAlpha: 0, y: 20, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" });
  }, [music.panel]);

  // A new song drops onto the platter: the label spins in and the title slides up.
  useEffect(() => {
    if (prevTrack.current === music.trackId) return;
    prevTrack.current = music.trackId;
    if (reducedMotion()) return;
    if (labelRef.current) {
      gsap.fromTo(
        labelRef.current,
        { rotate: -120, scale: 0.55, autoAlpha: 0 },
        { rotate: 0, scale: 1, autoAlpha: 1, duration: 0.7, ease: "back.out(1.5)" }
      );
    }
    if (metaRef.current) {
      gsap.fromTo(metaRef.current.children, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out", stagger: 0.05 });
    }
  }, [music.trackId]);

  const handleRow = (id: string, queue: string[]) => {
    if (id === music.trackId) toggleMusic();
    else playTrack(id, queue);
  };

  const handlePanelKeys = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    closeJukebox();
  };

  const handleTabKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next: Tab = tab === "jukebox" ? "local" : "jukebox";
    setTab(next);
    document.getElementById(tabIds[next])?.focus();
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setAddingFiles(true);
    setFileReport(null);
    const { added, rejected } = await addLocalFiles(Array.from(files));
    setAddingFiles(false);

    const parts: string[] = [];
    if (added.length) parts.push(`Added ${added.length} song${added.length === 1 ? "" : "s"}.`);
    if (rejected.length) {
      const names = rejected.slice(0, 3).map((entry) => `${entry.name} (${entry.reason.toLowerCase()})`);
      parts.push(`Skipped ${names.join(", ")}${rejected.length > 3 ? ` and ${rejected.length - 3} more` : ""}.`);
    }
    setFileReport(parts.join(" "));
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (added.length) {
      setQuery("");
      // Their songs, their choice: start the first one straight away.
      const queue = [...music.localTracks, ...added].map((entry) => entry.id);
      playTrack(added[0].id, queue);
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragOver(false);
    void handleFiles(event.dataTransfer.files);
  };

  const announcement =
    music.notice ??
    (music.status === "playing"
      ? `Now playing ${track.title} by ${track.artist}`
      : music.status === "paused"
        ? "Music paused"
        : music.status === "error"
          ? "Music unavailable"
          : "");

  const rowLabel = (title: string, artist: string, isCurrent: boolean, prefix = "") =>
    `${prefix}${title} by ${artist}${isCurrent ? (active ? ", playing. Select to pause" : ", selected. Select to play") : ""}`;

  const renderCuratedRow = (entry: CuratedTrack, queue: string[]) => {
    const entryInfo = CURATED_INFO.get(entry.id)!;
    const isCurrent = entry.id === music.trackId;
    return (
      <li key={entry.id}>
        <button
          type="button"
          data-row
          className={styles.row}
          aria-current={isCurrent ? "true" : undefined}
          data-playing={(isCurrent && active) || undefined}
          aria-label={rowLabel(entry.title, entry.artist, isCurrent, `${entryInfo.code}, `)}
          onClick={() => handleRow(entry.id, queue)}
        >
          <span className={styles.code}>{entryInfo.code}</span>
          <TrackArt className={styles.rowArt} category={entry.category} seed={entryInfo.seed} />
          <span className={styles.rowText}>
            <span className={styles.rowTitle}>{entry.title}</span>
            <span className={styles.rowSub}>
              {entry.artist} · {entry.mood}
            </span>
          </span>
          <span className={styles.rowEnd} aria-hidden="true">
            <MiniEq />
            <span className={styles.rowTime}>{formatTime(entry.duration)}</span>
          </span>
        </button>
      </li>
    );
  };

  const renderCurated = () => {
    const queue = curated.map((entry) => entry.id);
    if (!curated.length) {
      return (
        <p className={styles.empty}>
          No songs match “{query}”.{" "}
          <button type="button" className={styles.linkButton} onClick={() => setQuery("")}>
            Clear search
          </button>
        </p>
      );
    }
    // Browsing everything: show the crates as labelled groups, like the cards in a jukebox window.
    if (crate === "all" && !query.trim()) {
      return CATEGORIES.map((category) => {
        const inCrate = curated.filter((entry) => entry.category === category.id);
        if (!inCrate.length) return null;
        return (
          <div key={category.id} className={styles.group} role="group" aria-label={category.label}>
            <p className={styles.groupHead} aria-hidden="true">
              <span className={styles.groupLetter}>{category.letter}</span>
              {category.label}
              {category.featured && <span className={styles.featured}>Featured</span>}
            </p>
            <ul className={styles.list}>{inCrate.map((entry) => renderCuratedRow(entry, queue))}</ul>
          </div>
        );
      });
    }
    return <ul className={styles.list}>{curated.map((entry) => renderCuratedRow(entry, queue))}</ul>;
  };

  const renderLocal = () => {
    const queue = local.map((entry) => entry.id);
    return (
      <>
        <label
          className={styles.drop}
          data-over={dragOver || undefined}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            className={styles.fileInput}
            type="file"
            accept={ACCEPT}
            multiple
            onChange={(event: ChangeEvent<HTMLInputElement>) => void handleFiles(event.target.files)}
          />
          <span className={styles.dropIcon} aria-hidden="true">
            {addingFiles ? <LoaderCircle className={styles.spin} size={18} /> : <Upload size={18} />}
          </span>
          <span className={styles.dropText}>
            <strong>{addingFiles ? "Reading your songs…" : "Play your own music"}</strong>
            <span>Choose or drop MP3, M4A, WAV, OGG, FLAC or WebM files</span>
          </span>
        </label>
        <p className={styles.privacy}>
          <HardDrive size={13} aria-hidden="true" />
          Songs play straight from your device. Nothing is uploaded or saved, and the list clears when you reload.
        </p>
        {fileReport && (
          <p className={styles.report} role="status">
            {fileReport}
          </p>
        )}
        {music.localTracks.length > 0 &&
          (local.length ? (
            <ul className={styles.list}>
              {local.map((entry, index) => {
                const isCurrent = entry.id === music.trackId;
                return (
                  <li key={entry.id} className={styles.localItem}>
                    <button
                      type="button"
                      data-row
                      className={styles.row}
                      aria-current={isCurrent ? "true" : undefined}
                      data-playing={(isCurrent && active) || undefined}
                      aria-label={rowLabel(entry.title, entry.artist, isCurrent)}
                      onClick={() => handleRow(entry.id, queue)}
                    >
                      <span className={styles.code}>{String(index + 1).padStart(2, "0")}</span>
                      {artFor(entry, styles.rowArt)}
                      <span className={styles.rowText}>
                        <span className={styles.rowTitle}>{entry.title}</span>
                        <span className={styles.rowSub}>{entry.artist}</span>
                      </span>
                      <span className={styles.rowEnd} aria-hidden="true">
                        <MiniEq />
                        <span className={styles.rowTime}>{formatTime(entry.duration)}</span>
                      </span>
                    </button>
                    <IconButton label={`Remove ${entry.title}`} className={styles.removeButton} onClick={() => removeLocalTrack(entry.id)}>
                      <Trash2 size={14} aria-hidden="true" />
                    </IconButton>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.empty}>
              None of your songs match “{query}”.{" "}
              <button type="button" className={styles.linkButton} onClick={() => setQuery("")}>
                Clear search
              </button>
            </p>
          ))}
        {music.localTracks.length > 1 && (
          <button type="button" className={styles.linkButton} onClick={() => clearLocalTracks()}>
            Remove all my songs
          </button>
        )}
      </>
    );
  };

  return (
    <>
      <section
        ref={panelRef}
        id={JUKEBOX_PANEL_ID}
        className={styles.panel}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        tabIndex={-1}
        inert={!open}
        data-open={open || undefined}
        onKeyDown={handlePanelKeys}
      >
        <header className={styles.top} data-reveal>
          <p className={styles.brand}>
            <span className={styles.brandDot} aria-hidden="true" />
            <span id={titleId}>Fatima&rsquo;s Jukebox</span>
          </p>
          <div className={styles.windowButtons}>
            <IconButton label="Minimize player. Music keeps playing" onClick={minimizeJukebox}>
              <Minus size={16} aria-hidden="true" />
            </IconButton>
            <IconButton label="Close player. Music keeps playing" onClick={closeJukebox}>
              <X size={16} aria-hidden="true" />
            </IconButton>
          </div>
        </header>

        {/* Now playing: a little turntable, the song, and a live soundwave. */}
        <div className={styles.stage} data-reveal data-playing={playing || undefined} data-status={music.status}>
          <div className={styles.deck} aria-hidden="true">
            <span className={styles.record}>
              <span ref={labelRef} className={styles.recordLabel}>
                {artFor(track, styles.labelArt)}
              </span>
              <span className={styles.spindle} />
            </span>
            <span className={styles.tonearm}>
              <span className={styles.armHead} />
            </span>
          </div>
          <div ref={metaRef} className={styles.meta}>
            <span className={styles.tag}>{info ? `${info.code} · ${categoryById(info.track.category).label}` : "Your music"}</span>
            <p className={styles.title} title={track.title}>
              {track.title}
            </p>
            <p className={styles.artist}>{track.artist}</p>
            <Soundwave playing={playing} className={styles.wave} />
          </div>
        </div>

        {music.notice && (
          <div className={styles.notice}>
            <CircleAlert size={15} aria-hidden="true" />
            <span>{music.notice}</span>
            <IconButton label="Dismiss message" className={styles.noticeClose} onClick={dismissNotice}>
              <X size={13} aria-hidden="true" />
            </IconButton>
          </div>
        )}

        <div className={styles.progress} data-reveal>
          <span className={styles.time}>{formatTime(current)}</span>
          <input
            type="range"
            className={styles.slider}
            min={0}
            max={Math.max(1, Math.floor(shownDuration))}
            step={1}
            value={Math.min(Math.floor(current), Math.floor(shownDuration))}
            onChange={(event) => seekTo(Number(event.target.value))}
            disabled={music.status === "idle"}
            aria-label="Seek"
            aria-valuetext={`${formatTime(current)} of ${formatTime(shownDuration)}`}
            style={{ "--fill": `${shownDuration ? (current / shownDuration) * 100 : 0}%` } as CSSProperties}
          />
          <span className={styles.time}>{formatTime(shownDuration)}</span>
        </div>

        <div className={styles.transport} data-reveal>
          <IconButton label={music.shuffle ? "Shuffle on" : "Shuffle off"} pressed={music.shuffle} onClick={toggleShuffle} className={styles.modeButton}>
            <Shuffle size={16} aria-hidden="true" />
          </IconButton>
          <IconButton label="Previous song" onClick={previousTrack} className={styles.skipButton}>
            <SkipBack size={18} aria-hidden="true" fill="currentColor" />
          </IconButton>
          <button
            type="button"
            className={styles.playButton}
            data-status={music.status}
            aria-label={active ? "Pause" : music.status === "error" ? "Retry" : "Play"}
            onClick={toggleMusic}
            onPointerEnter={preloadMusic}
          >
            {music.status === "loading" ? (
              <LoaderCircle className={styles.spin} size={24} aria-hidden="true" />
            ) : active ? (
              <Pause size={22} aria-hidden="true" fill="currentColor" />
            ) : (
              <Play size={22} aria-hidden="true" fill="currentColor" className={styles.playIcon} />
            )}
          </button>
          <IconButton label="Next song" onClick={() => nextTrack()} className={styles.skipButton}>
            <SkipForward size={18} aria-hidden="true" fill="currentColor" />
          </IconButton>
          <IconButton label={REPEAT_LABEL[music.repeat]} pressed={music.repeat !== "off"} onClick={cycleRepeat} className={styles.modeButton}>
            {music.repeat === "one" ? <Repeat1 size={16} aria-hidden="true" /> : <Repeat size={16} aria-hidden="true" />}
          </IconButton>
        </div>

        <div className={styles.volume} data-reveal>
          <IconButton label={music.muted ? "Unmute" : "Mute"} pressed={music.muted} onClick={toggleMute} className={styles.muteButton}>
            <VolumeIcon size={16} aria-hidden="true" />
          </IconButton>
          <input
            type="range"
            className={styles.slider}
            min={0}
            max={100}
            step={1}
            value={effectiveVolume}
            onChange={(event) => setMusicVolume(Number(event.target.value) / 100)}
            aria-label="Volume"
            aria-valuetext={music.muted ? "Muted" : `${percent}%`}
            style={{ "--fill": `${effectiveVolume}%` } as CSSProperties}
          />
          <span className={styles.time} aria-hidden="true">
            {effectiveVolume}%
          </span>
        </div>

        <div className={styles.library} data-reveal>
          <div className={styles.tabs} role="tablist" aria-label="Music source" onKeyDown={handleTabKeys}>
            {(["jukebox", "local"] as const).map((id) => (
              <button
                key={id}
                id={tabIds[id]}
                type="button"
                role="tab"
                className={styles.tab}
                aria-selected={tab === id}
                aria-controls={panelIds[id]}
                tabIndex={tab === id ? 0 : -1}
                onClick={() => setTab(id)}
              >
                {id === "jukebox" ? <ListMusic size={14} aria-hidden="true" /> : <Music2 size={14} aria-hidden="true" />}
                {id === "jukebox" ? "Jukebox" : "Your music"}
                {id === "local" && music.localTracks.length > 0 && <span className={styles.count}>{music.localTracks.length}</span>}
              </button>
            ))}
          </div>

          <label className={styles.search}>
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              value={query}
              placeholder={tab === "jukebox" ? "Search songs, artists, vibes" : "Search your songs"}
              aria-label={tab === "jukebox" ? "Search the jukebox" : "Search your music"}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape" && query) {
                  event.stopPropagation();
                  setQuery("");
                }
              }}
            />
          </label>

          {tab === "jukebox" && (
            <div className={styles.crates} role="group" aria-label="Genres">
              <button type="button" className={styles.crate} aria-pressed={crate === "all"} onClick={() => setCrate("all")}>
                All
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={styles.crate}
                  aria-pressed={crate === category.id}
                  data-featured={category.featured || undefined}
                  title={category.blurb}
                  onClick={() => setCrate(category.id)}
                >
                  <span className={styles.crateLetter} aria-hidden="true">
                    {category.letter}
                  </span>
                  {category.label}
                </button>
              ))}
            </div>
          )}

          <div
            id={panelIds.jukebox}
            role="tabpanel"
            aria-labelledby={tabIds.jukebox}
            className={styles.scroller}
            hidden={tab !== "jukebox"}
            onKeyDown={handleRowKeys}
          >
            {tab === "jukebox" && renderCurated()}
          </div>
          <div
            id={panelIds.local}
            role="tabpanel"
            aria-labelledby={tabIds.local}
            className={styles.scroller}
            hidden={tab !== "local"}
            onKeyDown={handleRowKeys}
          >
            {tab === "local" && renderLocal()}
          </div>
        </div>

        <details className={styles.credits} data-reveal>
          <summary>All jukebox songs are CC0 · Credits</summary>
          <p>Every curated song is dedicated to the public domain (CC0 1.0) by its artist. Thank you for sharing your music.</p>
          <ul>
            {TRACKS.map((entry) => (
              <li key={entry.id}>
                <span>
                  {entry.title} · {entry.artist}
                </span>
                <a href={entry.license.proof} target="_blank" rel="noopener noreferrer">
                  Source <ExternalLink size={11} aria-hidden="true" />
                  <span className="sr-only"> for {entry.title} (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </details>
      </section>

      {music.panel === "minimized" && (
        <div ref={dockRef} className={styles.dock} role="region" aria-label="Mini music player" data-playing={playing || undefined}>
          <button
            ref={dockExpandRef}
            type="button"
            className={styles.dockExpand}
            onClick={(event) => openJukebox(event.currentTarget)}
            aria-label={`Open jukebox. ${active ? "Playing" : "Selected"}: ${track.title} by ${track.artist}`}
          >
            <span className={styles.dockDisc} aria-hidden="true">
              {artFor(track, styles.labelArt)}
            </span>
            <span className={styles.dockText} aria-hidden="true">
              <span className={styles.dockTitle}>{track.title}</span>
              <span className={styles.dockArtist}>{track.artist}</span>
            </span>
            <Maximize2 className={styles.dockMax} size={13} aria-hidden="true" />
          </button>
          <IconButton label={active ? "Pause" : "Play"} onClick={active ? pauseMusic : playMusic} className={styles.dockPlay}>
            {active ? <Pause size={15} fill="currentColor" aria-hidden="true" /> : <Play size={15} fill="currentColor" aria-hidden="true" />}
          </IconButton>
          <IconButton label="Close mini player. Music keeps playing" onClick={closeJukebox} className={styles.dockClose}>
            <X size={14} aria-hidden="true" />
          </IconButton>
        </div>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </>
  );
}

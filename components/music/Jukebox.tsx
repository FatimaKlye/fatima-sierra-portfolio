"use client";

import gsap from "gsap";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import {
  ChevronDown,
  CircleAlert,
  ExternalLink,
  ListMusic,
  LoaderCircle,
  Maximize2,
  Minus,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Scale,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  CURATED,
  JUKEBOX_PANEL_ID,
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
  seekTo,
  setMusicVolume,
  toggleMusic,
  toggleMute,
  toggleShuffle,
  useMusic,
  useMusicProgress,
} from "@/lib/music";
import { CATEGORIES, CC0_LEGAL_CODE, CC0_URL, TRACKS, categoryById, selectionCode } from "@/lib/musicLibrary";
import type { CategoryId, CuratedTrack } from "@/lib/musicLibrary";
import Soundwave from "./Soundwave";
import TrackArt from "./TrackArt";
import styles from "./Jukebox.module.css";

type Section = "browse" | "credits";

const REPEAT_LABEL = { all: "Repeat all", one: "Repeat this song", off: "Repeat off" } as const;
const LIBRARY_QUEUE = TRACKS.map((track) => track.id);

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatTime(seconds: number | null | undefined): string {
  if (!seconds || !Number.isFinite(seconds)) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

// Fixed locale and time zone, so the server and the browser print the same date.
const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");

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

const TRACKS_BY_CATEGORY = new Map(CATEGORIES.map((category) => [category.id, TRACKS.filter((track) => track.category === category.id)]));

// The licensing panel lists one entry per release: tracks that share a proof page share a license record.
const RELEASES = Array.from(
  TRACKS.reduce((releases, track) => {
    releases.set(track.license.proof, [...(releases.get(track.license.proof) ?? []), track]);
    return releases;
  }, new Map<string, CuratedTrack[]>()),
  ([proof, tracks]) => ({ proof, tracks, first: tracks[0] })
);
const LAST_VERIFIED = formatDate(TRACKS.map((track) => track.license.verified).sort().at(-1)!);

const matches = (haystack: string, query: string) =>
  query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));

/** Moves focus between the visible rows of a list with the arrow keys, Home and End. */
function handleRowKeys(event: KeyboardEvent<HTMLElement>) {
  const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
  if (!keys.includes(event.key)) return;
  const rows = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("[data-row]")).filter((row) => !row.closest("[hidden]"));
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
    <span className={styles.miniEq} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

/**
 * An accordion body that eases its height open and shut. React sets `hidden` only on the first
 * render; after that the tween owns it, so a closing section stays visible until it has folded away.
 */
function Collapse({
  open,
  id,
  labelledBy,
  className,
  children,
}: {
  open: boolean;
  id: string;
  labelledBy: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const was = useRef(open);
  const [initiallyOpen] = useState(open);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || was.current === open) return;
    was.current = open;
    gsap.killTweensOf(el);
    const settle = { clearProps: "height,minHeight,opacity,overflow" };

    if (reducedMotion()) {
      el.hidden = !open;
      gsap.set(el, settle);
    } else if (open) {
      el.hidden = false;
      gsap.fromTo(
        el,
        { height: 0, minHeight: 0, opacity: 0, overflow: "hidden" },
        { height: "auto", opacity: 1, duration: 0.42, ease: "power3.out", ...settle }
      );
    } else {
      gsap.to(el, {
        height: 0,
        minHeight: 0,
        opacity: 0,
        overflow: "hidden",
        duration: 0.28,
        ease: "power2.inOut",
        onComplete: () => {
          el.hidden = true;
          gsap.set(el, settle);
        },
      });
    }
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    return () => {
      if (el) gsap.killTweensOf(el);
    };
  }, []);

  return (
    <div ref={ref} id={id} role="region" aria-labelledby={labelledBy} className={className} hidden={!initiallyOpen}>
      {children}
    </div>
  );
}

/**
 * Fatima's Jukebox: the site's music player, opened from the hero vinyl or the navbar. One instance
 * lives in the root layout so it (and the music) carries across every page. Now Playing is always in
 * view; the library and the licensing record sit behind two accordions, one open at a time. The
 * panel can be minimised to a small dock or closed; neither stops the song.
 */
export default function Jukebox() {
  const music = useMusic();
  const { current, duration } = useMusicProgress();
  const [section, setSection] = useState<Section | null>(null);
  const [openCategory, setOpenCategory] = useState<CategoryId | null>(null);
  const [query, setQuery] = useState("");

  const panelRef = useRef<HTMLElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const dockExpandRef = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const prevPanel = useRef(music.panel);
  const prevTrack = useRef(music.trackId);

  const uid = useId();
  const titleId = `${uid}-title`;
  const sectionIds = {
    browse: { head: `${uid}-browse-head`, body: `${uid}-browse` },
    credits: { head: `${uid}-credits-head`, body: `${uid}-credits` },
  };

  const open = music.panel === "open";
  // From the hook's snapshot, not the live store, so hydration renders what the server did.
  const track = CURATED.find((entry) => entry.id === music.trackId) ?? CURATED[0];
  const info = CURATED_INFO.get(track.id)!;
  const active = music.status === "playing" || music.status === "loading";
  const playing = music.status === "playing";
  const shownDuration = duration || track.duration || 0;
  const percent = Math.round(music.volume * 100);
  const effectiveVolume = music.muted ? 0 : percent;
  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 50 ? Volume1 : Volume2;

  const searching = query.trim().length > 0;
  const results = useMemo(() => TRACKS.filter((entry) => matches(CURATED_INFO.get(entry.id)!.haystack, query)), [query]);

  // Panel in and out. It stays mounted (so search, open sections and scroll survive) and hides with autoAlpha.
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
          { opacity: 0, visibility: "visible", y: 24, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "expo.out" }
        );
        gsap.fromTo(
          panel.querySelectorAll("[data-reveal]"),
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.04, delay: 0.06, clearProps: "transform,opacity,visibility" }
        );
      }
      panel.focus({ preventScroll: true });
      return;
    }

    const hadFocus = panel.contains(document.activeElement);
    gsap.killTweensOf(panel);
    gsap.to(panel, still ? { autoAlpha: 0, duration: 0.15 } : { autoAlpha: 0, y: 16, scale: 0.97, duration: 0.24, ease: "power2.in" });
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
    gsap.fromTo(dockRef.current, { autoAlpha: 0, y: 16, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)" });
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
      gsap.fromTo(metaRef.current.children, { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out", stagger: 0.04 });
    }
  }, [music.trackId]);

  const toggleSection = (next: Section) => {
    const opening = section !== next;
    setSection(opening ? next : null);
    // Open the library on the crate that holds the current song, so it's never lost in the list.
    if (opening && next === "browse" && !openCategory) setOpenCategory(track.category);
  };

  const handleRow = (id: string, queue: string[]) => {
    if (id === music.trackId) toggleMusic();
    else playTrack(id, queue);
  };

  const handlePanelKeys = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    closeJukebox();
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

  const renderRow = (entry: CuratedTrack, queue: string[]) => {
    const { code } = CURATED_INFO.get(entry.id)!;
    const isCurrent = entry.id === music.trackId;
    const state = isCurrent ? (active ? ", playing. Select to pause" : ", selected. Select to play") : "";
    return (
      <li key={entry.id}>
        <button
          type="button"
          data-row
          className={styles.row}
          aria-current={isCurrent ? "true" : undefined}
          data-playing={(isCurrent && active) || undefined}
          aria-label={`${code}, ${entry.title} by ${entry.artist}${state}`}
          onClick={() => handleRow(entry.id, queue)}
        >
          <span className={styles.code} aria-hidden="true">
            {code}
          </span>
          <span className={styles.rowText} aria-hidden="true">
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

  const renderCrates = () =>
    CATEGORIES.map((category) => {
      const inCrate = TRACKS_BY_CATEGORY.get(category.id)!;
      const isOpen = openCategory === category.id;
      const holdsCurrent = track.category === category.id;
      const headId = `${uid}-crate-${category.id}-head`;
      const bodyId = `${uid}-crate-${category.id}`;
      return (
        <div key={category.id} className={styles.crate} data-open={isOpen || undefined}>
          <button
            id={headId}
            type="button"
            data-row
            className={styles.crateHead}
            aria-expanded={isOpen}
            aria-controls={bodyId}
            data-current={holdsCurrent || undefined}
            onClick={() => setOpenCategory(isOpen ? null : category.id)}
          >
            <span className={styles.crateLetter} aria-hidden="true">
              {category.letter}
            </span>
            <span className={styles.crateText}>
              <span className={styles.crateLabel}>{category.label}</span>
              <span className={styles.crateBlurb}>{category.blurb}</span>
            </span>
            {holdsCurrent && active && <MiniEq />}
            <span className={styles.crateCount}>
              {inCrate.length}
              <span className="sr-only"> songs</span>
            </span>
            <ChevronDown className={styles.chevron} size={15} aria-hidden="true" />
          </button>
          <Collapse open={isOpen} id={bodyId} labelledBy={headId}>
            <ul className={styles.list}>{inCrate.map((entry) => renderRow(entry, LIBRARY_QUEUE))}</ul>
          </Collapse>
        </div>
      );
    });

  const renderResults = () => {
    if (!results.length) {
      return (
        <p className={styles.empty}>
          No songs match “{query}”.{" "}
          <button type="button" className={styles.linkButton} onClick={() => setQuery("")}>
            Clear search
          </button>
        </p>
      );
    }
    const queue = results.map((entry) => entry.id);
    return (
      <>
        <p className={styles.resultCount} aria-live="polite">
          {results.length} {results.length === 1 ? "song" : "songs"}
        </p>
        <ul className={styles.list}>{results.map((entry) => renderRow(entry, queue))}</ul>
      </>
    );
  };

  const sectionHead = (id: Section, icon: ReactNode, title: string, sub: string) => (
    <button
      id={sectionIds[id].head}
      type="button"
      className={styles.sectionHead}
      aria-expanded={section === id}
      aria-controls={sectionIds[id].body}
      onClick={() => toggleSection(id)}
    >
      <span className={styles.sectionIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.sectionText}>
        <span className={styles.sectionTitle}>{title}</span>
        <span className={styles.sectionSub}>{sub}</span>
      </span>
      <ChevronDown className={styles.chevron} size={16} aria-hidden="true" />
    </button>
  );

  const extLink = (href: string, children: ReactNode, context: string) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <ExternalLink size={10} aria-hidden="true" />
      <span className="sr-only"> {context} (opens in a new tab)</span>
    </a>
  );

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
          <div className={styles.heading}>
            <p id={titleId} className={styles.brand}>
              Fatima&rsquo;s Jukebox
            </p>
            <p className={styles.tagline}>Your little soundtrack while browsing.</p>
          </div>
          <div className={styles.windowButtons}>
            <IconButton label="Minimize player. Music keeps playing" onClick={minimizeJukebox}>
              <Minus size={16} aria-hidden="true" />
            </IconButton>
            <IconButton label="Close player. Music keeps playing" onClick={closeJukebox}>
              <X size={16} aria-hidden="true" />
            </IconButton>
          </div>
        </header>

        {/* Now playing: a little turntable and the song. Always in view. */}
        <div className={styles.now} data-reveal data-playing={playing || undefined} data-status={music.status}>
          <div className={styles.deck} aria-hidden="true">
            <span className={styles.record}>
              <span ref={labelRef} className={styles.recordLabel}>
                <TrackArt className={styles.labelArt} category={track.category} seed={info.seed} />
              </span>
              <span className={styles.spindle} />
            </span>
            <span className={styles.tonearm}>
              <span className={styles.armHead} />
            </span>
          </div>
          <div ref={metaRef} className={styles.meta}>
            <p className={styles.eyebrow}>
              {info.code} · {categoryById(track.category).label}
            </p>
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
            onFocus={preloadMusic}
          >
            {music.status === "loading" ? (
              <LoaderCircle className={styles.spin} size={22} aria-hidden="true" />
            ) : active ? (
              <Pause size={20} aria-hidden="true" fill="currentColor" />
            ) : (
              <Play size={20} aria-hidden="true" fill="currentColor" className={styles.playIcon} />
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
            <VolumeIcon size={15} aria-hidden="true" />
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

        <div className={styles.sections} data-reveal>
          <div className={styles.section} data-open={section === "browse" || undefined}>
            {sectionHead("browse", <ListMusic size={15} />, "Browse Music", `${TRACKS.length} songs in ${CATEGORIES.length} genres, with search`)}
            <Collapse open={section === "browse"} id={sectionIds.browse.body} labelledBy={sectionIds.browse.head} className={styles.sectionBody}>
              <label className={styles.search}>
                <Search size={14} aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  placeholder="Search songs, artists, moods"
                  aria-label="Search the jukebox"
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape" && query) {
                      event.stopPropagation();
                      setQuery("");
                    }
                  }}
                />
              </label>
              <div className={styles.browseList} onKeyDown={handleRowKeys}>
                {searching ? renderResults() : renderCrates()}
              </div>
            </Collapse>
          </div>

          <div className={styles.section} data-open={section === "credits" || undefined}>
            {sectionHead("credits", <Scale size={15} />, "Music Licensing & Credits", "Verified license for every track")}
            <Collapse open={section === "credits"} id={sectionIds.credits.body} labelledBy={sectionIds.credits.head} className={styles.sectionBody}>
              <div className={styles.credits}>
                <p className={styles.creditsIntro}>
                  Music featured in this portfolio is used under the applicable licenses listed below. Track ownership and attribution
                  remain with their respective creators, where applicable.
                </p>

                <div className={styles.cc0}>
                  <p className={styles.cc0Title}>CC0 1.0 — Public Domain Dedication</p>
                  <p>
                    Every track in the jukebox is released under CC0 1.0. CC0 permits use, modification and redistribution without
                    requiring permission or attribution, subject to the limits of the dedication and any other rights that may apply.
                  </p>
                  <p className={styles.cc0Links}>
                    {extLink(CC0_URL, "Deed", "CC0 1.0 summary")}
                    {extLink(CC0_LEGAL_CODE, "Legal code", "CC0 1.0 full legal text")}
                  </p>
                </div>

                <p className={styles.method}>
                  Each license was checked individually on the creator&rsquo;s own release page, which states it. Last verified{" "}
                  {LAST_VERIFIED}.
                </p>

                <ul className={styles.releases}>
                  {RELEASES.map(({ proof, tracks, first }) => (
                    <li key={proof} className={styles.release}>
                      <p className={styles.releaseHead}>
                        <span className={styles.releaseArtist}>{first.artist}</span>
                        <span className={styles.releaseAlbum}>{first.album}</span>
                      </p>
                      <p className={styles.releaseTracks}>
                        {tracks.map((entry) => (
                          <span key={entry.id}>
                            <span className={styles.releaseCode}>{CURATED_INFO.get(entry.id)!.code}</span> {entry.title}
                          </span>
                        ))}
                      </p>
                      <dl className={styles.facts}>
                        <dt>License</dt>
                        <dd>{extLink(first.license.url, "CC0 1.0 Universal", `license for ${first.album}`)}</dd>
                        <dt>Source</dt>
                        <dd>{extLink(proof, host(proof), `release page for ${first.album} by ${first.artist}, stating the license`)}</dd>
                        <dt>Audio file</dt>
                        <dd>{extLink(first.license.file, host(first.license.file), `download of ${first.album}`)}</dd>
                        <dt>Credit</dt>
                        <dd>
                          {first.license.creditRequest ? (
                            <>
                              {first.license.creditRequest.text} {extLink(first.license.creditRequest.url, "Artist FAQ", `from ${first.artist}`)}
                            </>
                          ) : (
                            "Not required by CC0. Credited here anyway."
                          )}
                        </dd>
                        <dt>Verified</dt>
                        <dd>
                          <time dateTime={first.license.verified}>{formatDate(first.license.verified)}</time>
                        </dd>
                      </dl>
                    </li>
                  ))}
                </ul>
              </div>
            </Collapse>
          </div>
        </div>
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
              <TrackArt className={styles.labelArt} category={track.category} seed={info.seed} />
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
          <span
            className={styles.dockProgress}
            aria-hidden="true"
            style={{ "--fill": `${shownDuration ? (current / shownDuration) * 100 : 0}%` } as CSSProperties}
          />
        </div>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </>
  );
}

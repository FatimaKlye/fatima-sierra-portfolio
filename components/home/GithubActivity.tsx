"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowUpRight, RotateCw } from "lucide-react";
import { GITHUB_REFRESH_MS, type ContributionDay, type GithubContributions } from "./githubContributions";
import editorialStyles from "./HomeEditorial.module.css";
import styles from "./GithubActivity.module.css";

type GithubActivityProps = {
  number: string;
  headingId: string;
  handle: string;
  profileHref: string;
  initialData: GithubContributions | null;
};

type SyncState = "idle" | "syncing" | "error";

const LEVELS = [0, 1, 2, 3, 4];
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

// Dates arrive as plain YYYY-MM-DD calendar days, so format them in UTC to keep server and client output identical.
const shortDate = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const longDate = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const monthName = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const syncTime = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

const toUtcDate = (date: string) => new Date(`${date}T00:00:00Z`);
const countLabel = (count: number) => `${count === 0 ? "No" : count.toLocaleString("en-US")} contribution${count === 1 ? "" : "s"}`;
const subscribeNoop = () => () => {};

/** Lays the days out as calendar columns (Sun–Sat) and labels the column where each month begins. */
function buildCalendar(days: ContributionDay[]) {
  const leading = days.length ? toUtcDate(days[0].date).getUTCDay() : 0;
  const weeks = Math.ceil((leading + days.length) / 7);

  const months: { column: number; label: string }[] = [];
  let previousMonth = -1;
  for (let column = 0; column < weeks; column++) {
    const firstDay = days[Math.max(0, column * 7 - leading)];
    if (!firstDay) break;
    const month = toUtcDate(firstDay.date).getUTCMonth();
    if (month !== previousMonth) months.push({ column, label: monthName.format(toUtcDate(firstDay.date)) });
    previousMonth = month;
  }
  // A partial first month squeezed against the next label would collide, so drop it.
  if (months.length > 1 && months[1].column - months[0].column < 3) months.shift();

  return { leading, weeks, months };
}

/**
 * GitHub activity for the homepage: headline stats, a rolling 12-month calendar with
 * per-day detail, and a sync line. Re-checks GitHub every 5 minutes while the tab is
 * visible, and on demand through Refresh.
 */
export default function GithubActivity({ number, headingId, handle, profileHref, initialData }: GithubActivityProps) {
  const [data, setData] = useState(initialData);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastCheckRef = useRef(initialData ? Date.parse(initialData.fetchedAt) : 0);
  // The sync time depends on the visitor's time zone, so it's only rendered on the client.
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const sync = useCallback(async (fresh: boolean) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    lastCheckRef.current = Date.now();
    setSyncState("syncing");
    try {
      const response = await fetch(`/api/github${fresh ? "?fresh=1" : ""}`, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error(`GitHub sync failed with ${response.status}`);
      const next: GithubContributions = await response.json();
      setData(next);
      setSyncState("idle");
    } catch {
      if (!controller.signal.aborted) setSyncState("error");
    }
  }, []);

  useEffect(() => {
    const syncIfDue = () => {
      if (document.visibilityState === "visible" && Date.now() - lastCheckRef.current >= GITHUB_REFRESH_MS) void sync(false);
    };
    // Checked every 30s (and when the tab regains focus) so a sync is never much later than 5 minutes.
    const interval = window.setInterval(syncIfDue, 30_000);
    document.addEventListener("visibilitychange", syncIfDue);
    const initial = window.setTimeout(syncIfDue, 0);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(initial);
      document.removeEventListener("visibilitychange", syncIfDue);
      abortRef.current?.abort();
    };
  }, [sync]);

  // On narrow screens the calendar scrolls; start at the most recent weeks.
  const hasData = Boolean(data);
  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
  }, [hasData]);

  const days = useMemo(() => data?.days ?? [], [data]);
  const calendar = useMemo(() => buildCalendar(days), [days]);
  const indexByDate = useMemo(() => new Map(days.map((day, index) => [day.date, index])), [days]);

  const lastIndex = days.length - 1;
  const selectedIndex = (selectedDate !== null ? indexByDate.get(selectedDate) : undefined) ?? lastIndex;
  const activeIndex = (hoverDate !== null ? indexByDate.get(hoverDate) : undefined) ?? selectedIndex;
  const activeDay = days[activeIndex];

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 };
    let target: number;
    if (event.key in step) target = selectedIndex + step[event.key];
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = lastIndex;
    else return;

    event.preventDefault();
    const next = days[Math.min(lastIndex, Math.max(0, target))];
    if (!next) return;
    setSelectedDate(next.date);
    cellsRef.current?.querySelector<HTMLButtonElement>(`[data-date="${next.date}"]`)?.focus();
  };

  const isSyncing = syncState === "syncing";
  const checkedAt = data ? new Date(data.fetchedAt) : null;

  return (
    <div className={styles.activity}>
      <header className={editorialStyles.previewHeader}>
        <p className={editorialStyles.sectionNumber}>{number}</p>
        <div className={editorialStyles.previewHeading}>
          <div>
            <h2 id={headingId} className={editorialStyles.sectionTitle}>
              Commit by <em>commit.</em>
            </h2>
            <p className={editorialStyles.sectionIntro}>
              A live record of the work behind this portfolio. Every dot is a day of code pushed to GitHub over the past twelve months.
            </p>
          </div>
          <a className="ui-btn ui-btn--secondary" href={profileHref} target="_blank" rel="noreferrer" aria-label={`Open ${handle} on GitHub in a new tab`}>
            {handle} <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </header>

      {data ? (
        <>
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt>Contributions in the past year</dt>
              <dd className={styles.statLead}>{data.totalLastYear.toLocaleString("en-US")}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Active days</dt>
              <dd>{data.activeDays.toLocaleString("en-US")}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Longest streak</dt>
              <dd>
                {data.longestStreak.toLocaleString("en-US")}
                <span className={styles.statUnit}> day{data.longestStreak === 1 ? "" : "s"}</span>
              </dd>
            </div>
          </dl>

          <figure className={styles.graph}>
            <div className={styles.scroll} ref={scrollRef}>
              <div className={styles.heatmap} style={{ "--weeks": calendar.weeks } as CSSProperties}>
                <div className={styles.months} aria-hidden="true">
                  {calendar.months.map((month) => (
                    <span key={`${month.label}-${month.column}`} style={{ gridColumnStart: month.column + 1 }}>
                      {month.label}
                    </span>
                  ))}
                </div>
                <div className={styles.weekdays} aria-hidden="true">
                  {WEEKDAY_LABELS.map((label, index) => (
                    <span key={index}>{label}</span>
                  ))}
                </div>
                <div
                  className={styles.cells}
                  ref={cellsRef}
                  role="group"
                  aria-label="Daily contributions, past 12 months. Use the arrow keys to move between days."
                  onKeyDown={handleKeyDown}
                  onMouseLeave={() => setHoverDate(null)}
                >
                  {Array.from({ length: calendar.leading }, (_, index) => (
                    <span className={styles.blank} key={`blank-${index}`} aria-hidden="true" />
                  ))}
                  {days.map((day, index) => (
                    <button
                      type="button"
                      className={styles.cell}
                      key={day.date}
                      data-date={day.date}
                      data-level={Math.min(4, Math.max(0, day.level))}
                      data-active={index === activeIndex || undefined}
                      tabIndex={index === selectedIndex ? 0 : -1}
                      aria-label={`${countLabel(day.count)} on ${longDate.format(toUtcDate(day.date))}`}
                      onClick={() => setSelectedDate(day.date)}
                      onFocus={() => setSelectedDate(day.date)}
                      onMouseEnter={() => setHoverDate(day.date)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <figcaption className={styles.meta}>
              <p className={styles.detail}>
                {activeDay && (
                  <>
                    <strong>{countLabel(activeDay.count)}</strong>
                    <time dateTime={activeDay.date}>{shortDate.format(toUtcDate(activeDay.date))}</time>
                  </>
                )}
              </p>
              <p className={styles.scrollHint} aria-hidden="true">Swipe for earlier months</p>
              <div className={styles.legend} aria-hidden="true">
                <span>Less</span>
                {LEVELS.map((level) => (
                  <span className={styles.legendDot} data-level={level} key={level} />
                ))}
                <span>More</span>
              </div>
            </figcaption>
          </figure>
        </>
      ) : (
        <p className={styles.fallback}>
          Activity is taking a moment to load from GitHub. Try Refresh, or view the profile directly.
        </p>
      )}

      <div className={styles.footer}>
        <p className={styles.status} role="status">
          <span className={styles.statusDot} data-state={syncState} aria-hidden="true" />
          <span>
            {isSyncing ? "Syncing with GitHub…" : syncState === "error" ? `Couldn't reach GitHub${data ? ", showing the last sync" : ""}` : "Synced from GitHub"}
          </span>
          <span className={styles.statusSep} aria-hidden="true">·</span>
          <span>checks every 5 min</span>
          {isClient && checkedAt && (
            <>
              <span className={styles.statusSep} aria-hidden="true">·</span>
              <time className={styles.statusTime} dateTime={checkedAt.toISOString()}>
                {syncTime.format(checkedAt)}
              </time>
            </>
          )}
        </p>
        <button type="button" className={styles.refresh} onClick={() => void sync(true)} disabled={isSyncing} data-syncing={isSyncing || undefined}>
          <RotateCw size={14} aria-hidden="true" />
          Refresh
        </button>
      </div>
    </div>
  );
}

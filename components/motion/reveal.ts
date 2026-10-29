/**
 * Scroll-in reveals without GSAP: IntersectionObservers decide when, CSS transitions do the motion
 * (start states and timings live in globals.css under [data-reveals]).
 *
 * Why not gsap.fromTo + ScrollTrigger: every tween read the computed style of its element when it
 * was created and again when the page unmounted, so a page with ~50 reveals spent hundreds of ms
 * of main thread on each route change before anything moved. Arming these costs no layout or
 * style reads at all, and tearing them down is a disconnect.
 *
 *  data-word      title words, masked slide-up together when the first word enters view
 *  data-reveal    fades/rises once when scrolled into view
 *  data-stagger   children of this element reveal one after another
 *
 * Content can never be left hidden: the start states only apply once the root is armed, reduced
 * motion and browsers without IntersectionObserver are never armed, anything already scrolled past
 * shows at once (a restored scroll position), and if no observer has answered within a few seconds
 * the root is disarmed and everything shows.
 */

type Kind = "word" | "reveal" | "stagger";

/** ScrollTrigger start lines the GSAP version used ("top 92%" etc.), as observer root margins. */
const START: Record<Kind, string> = {
  word: "0px 0px -8% 0px",
  reveal: "0px 0px -4% 0px",
  stagger: "0px 0px -6% 0px",
};
/** Per-item delay inside a group, and the transition length (keep in step with globals.css). */
const STEP: Record<Kind, number> = { word: 80, reveal: 0, stagger: 80 };
const DURATION: Record<Kind, number> = { word: 1150, reveal: 950, stagger: 800 };
const FAILSAFE = 4000;

export function observeReveals(root: HTMLElement): () => void {
  if (
    typeof IntersectionObserver === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return () => undefined;
  }

  const all = (selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector));
  type Group = { kind: Kind; targets: HTMLElement[] };
  const groups = new Map<Element, Group[]>();
  const add = (trigger: Element, group: Group) => groups.set(trigger, [...(groups.get(trigger) ?? []), group]);

  const words = all("[data-word]");
  // A word starts pushed fully out of its overflow-hidden mask, where an observer sees nothing of
  // it, so the (untransformed) mask is what gets watched.
  if (words.length) add(words[0].parentElement ?? words[0], { kind: "word", targets: words });
  all("[data-reveal]").forEach((element) => add(element, { kind: "reveal", targets: [element] }));
  all("[data-stagger]").forEach((group) => {
    const children = Array.from(group.children) as HTMLElement[];
    if (children.length) add(group, { kind: "stagger", targets: children });
  });
  if (!groups.size) return () => undefined;

  const timers: number[] = [];
  let answered = false;

  const play = ({ kind, targets }: Group) => {
    targets.forEach((target, index) => {
      if (STEP[kind]) target.style.setProperty("--reveal-delay", `${index * STEP[kind]}ms`);
      target.dataset.revealed = "run";
    });
    // Settled: drop the transition so the element's own hover and transition rules apply again.
    timers.push(
      window.setTimeout(() => {
        targets.forEach((target) => (target.dataset.revealed = "done"));
      }, DURATION[kind] + STEP[kind] * targets.length + 100)
    );
  };

  const kinds = Object.keys(START) as Kind[];
  const observers = kinds.map(
    (kind) =>
      new IntersectionObserver(
        (entries, observer) => {
          answered = true;
          entries.forEach((entry) => {
            // Above the viewport counts too: a restored scroll position lands past the trigger.
            if (!entry.isIntersecting && entry.boundingClientRect.top >= 0) return;
            observer.unobserve(entry.target);
            const pending = groups.get(entry.target) ?? [];
            pending.filter((group) => group.kind === kind).forEach(play);
            const rest = pending.filter((group) => group.kind !== kind);
            if (rest.length) groups.set(entry.target, rest);
            else groups.delete(entry.target);
          });
        },
        { rootMargin: START[kind] }
      )
  );

  root.dataset.reveals = "";
  groups.forEach((pending, trigger) =>
    new Set(pending.map((group) => group.kind)).forEach((kind) => observers[kinds.indexOf(kind)].observe(trigger))
  );
  timers.push(
    window.setTimeout(() => {
      if (!answered) delete root.dataset.reveals;
    }, FAILSAFE)
  );

  return () => {
    observers.forEach((observer) => observer.disconnect());
    timers.forEach((timer) => window.clearTimeout(timer));
  };
}

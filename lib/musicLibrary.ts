/*
 * The jukebox's curated library. Every track here is released under CC0 1.0 (public domain
 * dedication) by its artist, checked one release at a time on 2026-10-27 against the artist's
 * own upload. See public/assets/audio/jukebox/LICENSES.md for the full licensing record.
 *
 * The files are local copies, loudness-normalised and re-encoded to 128 kbps MP3 so the whole
 * library stays light. Only add a track after confirming its license the same way; a genre with no
 * verified tracks simply isn't listed (there is no K-Pop crate for that reason).
 */

export const CC0_URL = "https://creativecommons.org/publicdomain/zero/1.0/";

export type CategoryId = "pop" | "indie" | "rnb" | "citypop" | "dance" | "funk";

export type MusicCategory = {
  id: CategoryId;
  /** Jukebox selector letter: tracks read A1, A2… like the buttons on a real jukebox. */
  letter: string;
  label: string;
  blurb: string;
  featured: boolean;
};

export type TrackLicense = {
  name: "CC0 1.0 Universal";
  url: typeof CC0_URL;
  /** The artist-controlled page that states the license. */
  proof: string;
  /** Where the audio file itself was downloaded from. */
  file: string;
  verified: string;
};

export type CuratedTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  category: CategoryId;
  src: string;
  /** Seconds, so the list can show lengths before anything loads. */
  duration: number;
  mood: string;
  artistUrl: string;
  license: TrackLicense;
};

// Featured crates first: Pop, Indie Pop, R&B and City Pop.
export const CATEGORIES: MusicCategory[] = [
  { id: "pop", letter: "A", label: "Pop Hits", blurb: "Catchy, upbeat, feel-good", featured: true },
  { id: "indie", letter: "B", label: "Indie Pop", blurb: "Dreamy but bright and catchy", featured: true },
  { id: "rnb", letter: "C", label: "R&B Grooves", blurb: "Smooth, stylish, rhythmic", featured: true },
  { id: "citypop", letter: "D", label: "City Pop", blurb: "Retro, Japanese-inspired, funky", featured: true },
  { id: "dance", letter: "E", label: "Dance & Electronic", blurb: "Energetic and modern", featured: false },
  { id: "funk", letter: "F", label: "Funk & Disco", blurb: "Groovy, fun and lively", featured: false },
];

const AUDIO = "/assets/audio/jukebox";
const VERIFIED = "2026-10-27";

const HOLIZNA = {
  artist: "HoliznaCC0",
  album: "Happy Pop Electronic",
  artistUrl: "https://freemusicarchive.org/music/holiznacc0/",
  proof: "https://opengameart.org/content/happy-pop-electronic-collection",
  file: "https://opengameart.org/sites/default/files/happy_electronic.zip",
};

const LFM = {
  artist: "Loyalty Freak Music",
  artistUrl: "https://loyaltyfreakmusic.com/",
};

const FMA_LFM = "https://freemusicarchive.org/music/Loyalty_Freak_Music";
const IA = "https://archive.org/details";

const ZANE = {
  artist: "Zane Little Music",
  album: "Single",
  artistUrl: "https://opengameart.org/users/zane-little-music",
};

const cc0 = (proof: string, file: string): TrackLicense => ({
  name: "CC0 1.0 Universal",
  url: CC0_URL,
  proof,
  file,
  verified: VERIFIED,
});

const holizna = (id: string, title: string, duration: number, mood: string): CuratedTrack => ({
  id: `holizna-${id}`,
  title,
  artist: HOLIZNA.artist,
  album: HOLIZNA.album,
  artistUrl: HOLIZNA.artistUrl,
  category: "pop",
  src: `${AUDIO}/holizna-${id}.mp3`,
  duration,
  mood,
  license: cc0(HOLIZNA.proof, HOLIZNA.file),
});

type LfmAlbum = { album: string; category: CategoryId; fma: string; ia: string };

const LFM_POSITIVE: LfmAlbum = {
  album: "POSITIVE ATTITUDE !",
  category: "indie",
  fma: `${FMA_LFM}/POSITIVE_ATTITUDE_/`,
  ia: `${IA}/LoyaltyFreakMusicPOSITIVEATTITUDE20170920175908839`,
};
const LFM_RNB: LfmAlbum = {
  album: "INSTRUMENTAL R&B BEATS TO SING OR RAP ON",
  category: "rnb",
  fma: `${FMA_LFM}/INSTRUMENTAL_RB_BEATS_TO_SING_OR_RAP_ON/`,
  ia: `${IA}/LoyaltyFreakMusic-INSTRUMENTALRBBEATSTOSINGORRAPON`,
};
const LFM_ROBOT: LfmAlbum = {
  album: "ROBOT DANCE !",
  category: "dance",
  fma: `${FMA_LFM}/ROBOT_DANCE_/`,
  ia: `${IA}/LoyaltyFreakMusicROBOTDANCE2017113032423755`,
};
const LFM_DISCO: LfmAlbum = {
  album: "ROLLER DISCO DANCE DANCE",
  category: "funk",
  fma: `${FMA_LFM}/ROLLER_DISCO_DANCE_DANCE/`,
  ia: `${IA}/LoyaltyFreakMusic-ROLLERDISCODANCEDANCE`,
};

const lfm = (from: LfmAlbum, id: string, title: string, duration: number, mood: string): CuratedTrack => ({
  id: `lfm-${id}`,
  title,
  artist: LFM.artist,
  album: from.album,
  artistUrl: LFM.artistUrl,
  category: from.category,
  src: `${AUDIO}/lfm-${id}.mp3`,
  duration,
  mood,
  license: cc0(from.fma, from.ia),
});

const zane = (id: string, page: string, file: string, title: string, duration: number, mood: string): CuratedTrack => ({
  id: `zlm-${id}`,
  title,
  artist: ZANE.artist,
  album: ZANE.album,
  artistUrl: ZANE.artistUrl,
  category: "citypop",
  src: `${AUDIO}/zlm-${id}.mp3`,
  duration,
  mood,
  license: cc0(`https://opengameart.org/content/${page}`, `https://opengameart.org/sites/default/files/${file}`),
});

export const TRACKS: CuratedTrack[] = [
  // A · Pop Hits
  holizna("happy-dance", "Happy Dance", 156, "bubbly synth pop"),
  holizna("love-love-love", "Love Love Love", 175, "sugary electro pop"),
  holizna("back-in-the-80s", "Back In The 80s", 240, "retro synth pop"),

  // B · Indie Pop
  lfm(LFM_POSITIVE, "go-to-the-picnic", "Go to the Picnic", 187, "sunny indie strum"),
  lfm(LFM_POSITIVE, "ice-cream-with-you", "Ice Cream with you", 167, "sweet, dreamy, bouncy"),
  lfm(LFM_POSITIVE, "yippee", "Yippee !", 130, "playful and upbeat"),

  // C · R&B Grooves
  lfm(LFM_RNB, "sunglasses", "Sunglasses", 170, "cool, laid-back groove"),
  lfm(LFM_RNB, "friend-to-friend", "Friend to friend", 164, "smooth soul beat"),
  lfm(LFM_RNB, "summer-pride", "Summer Pride", 173, "warm, rhythmic R&B"),

  // D · City Pop: retro jazz-funk fusion written after a Japanese PS2 racer's soundtrack
  zane("midnight-cruiser", "midnight-cruiser", "midnight_cruiser_0.mp3", "Midnight Cruiser", 144, "night-drive jazz funk"),
  zane("freeway-fumes", "freeway-fumes", "freeway_fumes_0.mp3", "Freeway Fumes", 200, "retro fusion, fast and funky"),
  zane("wednesday-night", "wednesday-night-funk-fusion", "wednesday_night_0.mp3", "Wednesday Night", 177, "breezy funk fusion"),

  // E · Dance & Electronic
  lfm(LFM_ROBOT, "high-technologic-beat-explosion", "High Technologic Beat Explosion", 221, "electro, full energy"),
  lfm(LFM_ROBOT, "after-party", "After Party", 177, "techno bounce"),

  // F · Funk & Disco
  lfm(LFM_DISCO, "roller-fever", "Roller Fever", 146, "roller-rink disco"),
  lfm(LFM_DISCO, "cant-stop-my-feet", "Can't Stop My Feet !", 186, "four-on-the-floor funk"),
  lfm(LFM_DISCO, "grab-a-partner", "Grab A Partner", 192, "groovy disco strut"),
];

export const categoryById = (id: CategoryId) => CATEGORIES.find((category) => category.id === id)!;

/** "A1", "C3"…: the category letter plus the track's position inside it. */
export function selectionCode(track: CuratedTrack): string {
  const inCategory = TRACKS.filter((entry) => entry.category === track.category);
  return `${categoryById(track.category).letter}${inCategory.indexOf(track) + 1}`;
}

export const DEFAULT_TRACK_ID = TRACKS[0].id;

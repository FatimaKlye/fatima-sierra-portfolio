/*
 * Reads title, artist, album and cover art from the ID3v2 tag at the start of an MP3, entirely in
 * the browser, so visitors' own songs show real names instead of file names. Other formats (and
 * untagged files) return null and the player falls back to the file name.
 */

export type AudioTags = { title?: string; artist?: string; album?: string; picture?: Blob };

const MAX_TAG_BYTES = 4 * 1024 * 1024; // a tag bigger than this is almost certainly not one we want

const syncsafe = (b: Uint8Array, at: number) => (b[at] << 21) | (b[at + 1] << 14) | (b[at + 2] << 7) | b[at + 3];
const uint32 = (b: Uint8Array, at: number) => ((b[at] << 24) | (b[at + 1] << 16) | (b[at + 2] << 8) | b[at + 3]) >>> 0;

function decodeText(bytes: Uint8Array, encoding: number): string {
  const label = encoding === 1 ? "utf-16" : encoding === 2 ? "utf-16be" : encoding === 3 ? "utf-8" : "latin1";
  try {
    return new TextDecoder(label).decode(bytes).replace(/\0+$/g, "").split("\0")[0].trim();
  } catch {
    return "";
  }
}

/** Index just past a null terminator (one byte, or two aligned bytes for UTF-16). */
function skipTerminated(bytes: Uint8Array, from: number, encoding: number): number {
  const wide = encoding === 1 || encoding === 2;
  for (let i = from; i < bytes.length; i += wide ? 2 : 1) {
    if (bytes[i] === 0 && (!wide || bytes[i + 1] === 0)) return i + (wide ? 2 : 1);
  }
  return bytes.length;
}

function readPicture(frame: Uint8Array): Blob | undefined {
  const encoding = frame[0];
  const mimeEnd = frame.indexOf(0, 1);
  if (mimeEnd < 0) return undefined;
  let mime = new TextDecoder("latin1").decode(frame.subarray(1, mimeEnd)).toLowerCase();
  if (!mime.includes("/")) mime = mime === "png" ? "image/png" : "image/jpeg";
  const dataStart = skipTerminated(frame, mimeEnd + 2, encoding); // +1 null, +1 picture type
  const data = frame.subarray(dataStart);
  return data.length > 64 ? new Blob([data.slice()], { type: mime }) : undefined;
}

export async function readAudioTags(file: File): Promise<AudioTags | null> {
  const header = new Uint8Array(await file.slice(0, 10).arrayBuffer());
  if (header.length < 10 || header[0] !== 0x49 || header[1] !== 0x44 || header[2] !== 0x33) return null; // "ID3"

  const version = header[3];
  if (version < 3 || version > 4) return null;
  const flags = header[5];
  if (flags & 0x80) return null; // whole-tag unsynchronisation: rare, and not worth decoding here
  const size = Math.min(syncsafe(header, 6), MAX_TAG_BYTES);
  const tag = new Uint8Array(await file.slice(10, 10 + size).arrayBuffer());

  let offset = 0;
  if (flags & 0x40) offset = version === 4 ? syncsafe(tag, 0) : uint32(tag, 0) + 4; // extended header

  const tags: AudioTags = {};
  while (offset + 10 <= tag.length) {
    const id = String.fromCharCode(tag[offset], tag[offset + 1], tag[offset + 2], tag[offset + 3]);
    if (!/^[A-Z0-9]{4}$/.test(id)) break; // padding
    const frameSize = version === 4 ? syncsafe(tag, offset + 4) : uint32(tag, offset + 4);
    const start = offset + 10;
    const end = start + frameSize;
    if (frameSize <= 0 || end > tag.length) break;
    const frame = tag.subarray(start, end);

    if (id === "TIT2") tags.title = decodeText(frame.subarray(1), frame[0]);
    else if (id === "TPE1") tags.artist = decodeText(frame.subarray(1), frame[0]);
    else if (id === "TALB") tags.album = decodeText(frame.subarray(1), frame[0]);
    else if (id === "APIC" && !tags.picture) tags.picture = readPicture(frame);

    offset = end;
  }
  return tags;
}

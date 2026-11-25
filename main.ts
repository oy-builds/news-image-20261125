import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// "The World Today" — front page for Wednesday 25 November 2026.
// The program copies the pre-drawn front page (entry.png, 1024x1024)
// to the grader's output path. No network, no randomness: two runs
// write byte-identical output.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "entry.png");

// Validate the source before copying, so a missing or corrupt image
// fails loudly here instead of silently producing a bad entry.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const size = statSync(src, { throwIfNoEntry: false });
if (size === undefined) {
  throw new Error(`entry.png not found at ${src}`);
}
if (size.size === 0 || size.size > 1048576) {
  throw new Error(`entry.png has unexpected size ${size.size} bytes (must be 1..1048576)`);
}
const header = readFileSync(src).subarray(0, 8);
if (!header.equals(PNG_SIGNATURE)) {
  throw new Error("entry.png is not a valid PNG (bad 8-byte signature)");
}

copyFileSync(src, join(outDir, "entry.png"));

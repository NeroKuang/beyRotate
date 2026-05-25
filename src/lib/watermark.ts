import sharp from "sharp";

const WATERMARK_TEXT = "BeyRotate";
const WATERMARK_OPACITY = 0.18;

function buildWatermarkSvg(width: number, height: number): Buffer {
  const fontSize = Math.max(20, Math.round(Math.min(width, height) * 0.06));
  const gap = fontSize * 4;

  let texts = "";
  for (let y = -height; y < height * 2; y += gap) {
    for (let x = -width; x < width * 2; x += gap) {
      texts += `<text x="${x}" y="${y}" font-size="${fontSize}" fill="white" opacity="${WATERMARK_OPACITY}" font-family="Arial,Helvetica,sans-serif" font-weight="bold" transform="rotate(-30 ${x} ${y})">${WATERMARK_TEXT}</text>`;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${texts}</svg>`;
  return Buffer.from(svg);
}

export async function applyWatermark(input: Buffer): Promise<Buffer> {
  const image = sharp(input);
  const meta = await image.metadata();
  const w = meta.width ?? 800;
  const h = meta.height ?? 600;

  const watermarkSvg = buildWatermarkSvg(w, h);

  return image
    .composite([{ input: watermarkSvg, top: 0, left: 0 }])
    .jpeg({ quality: 85 })
    .toBuffer();
}

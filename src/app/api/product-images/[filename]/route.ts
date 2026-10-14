import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const contentTypes: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export async function GET(_: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const match = filename.match(/^[0-9a-f-]{36}\.(jpg|png|webp|avif)$/);
  if (!match) return new NextResponse("Not found", { status: 404 });
  const uploadDir = process.env.PRODUCT_UPLOAD_DIR
    ? path.resolve(process.env.PRODUCT_UPLOAD_DIR)
    : path.join(process.cwd(), "storage", "product-images");
  try {
    const image = await readFile(path.join(/* turbopackIgnore: true */ uploadDir, filename));
    return new NextResponse(image, {
      headers: {
        "content-type": contentTypes[match[1]],
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

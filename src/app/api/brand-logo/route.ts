import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function GET() {
  const image = await readFile(path.join(process.cwd(), "logo", "1.jpg"));
  return new NextResponse(image, {
    headers: {
      "content-type": "image/jpeg",
      "cache-control": "public, max-age=3600",
    },
  });
}

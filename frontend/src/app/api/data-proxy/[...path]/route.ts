import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * API route to serve data files from the project root data/ directory.
 * In production, you would replace this with a GitHub raw URL or CDN.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const segments = path || [];
  const filePath = join(process.cwd(), "..", "data", ...segments);

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const isJson = filePath.endsWith(".json");
    return new NextResponse(content, {
      headers: {
        "Content-Type": isJson ? "application/json" : "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=1800, s-maxage=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Read error" }, { status: 500 });
  }
}

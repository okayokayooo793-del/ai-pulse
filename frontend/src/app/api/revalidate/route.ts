import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const secret = process.env.REVALIDATION_SECRET;
    if (secret) {
      const body = await request.json().catch(() => ({}));
      if (body.secret !== secret) {
        return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
      }
    }
    revalidatePath("/");
    revalidatePath("/archive");
    revalidatePath("/search");
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch {
    return NextResponse.json({ error: "Error revalidating" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { list, copy, del } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const { oldSessionId, newSessionId } = await request.json();

    if (!oldSessionId || !newSessionId) {
      return NextResponse.json({ error: "oldSessionId and newSessionId are required" }, { status: 400 });
    }

    if (oldSessionId === newSessionId) {
      return NextResponse.json({ success: true, message: "Session IDs are identical" });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      // If we're relying on local filesystem fallback, we skip the blob logic.
      // (Advanced local renaming is skipped for simplicity here).
      return NextResponse.json({ success: true, warning: "Blob not configured, rename in blob skipped" });
    }

    const oldPrefix = `sessions/${oldSessionId}/`;
    const newPrefix = `sessions/${newSessionId}/`;

    // 1. List all blobs under the old session prefix
    let hasMore = true;
    let cursor: string | undefined;

    while (hasMore) {
      const listResult = await list({
        prefix: oldPrefix,
        cursor,
        token
      });

      // 2. Copy each blob to the new path
      for (const blob of listResult.blobs) {
        // e.g. sessions/old/logo.png -> sessions/new/logo.png
        // sessions/old/old.json -> sessions/new/new.json
        let newPath = blob.pathname.replace(oldPrefix, newPrefix);
        
        // If it's the JSON file, rename the filename as well
        if (blob.pathname === `${oldPrefix}${oldSessionId}.json`) {
          newPath = `${newPrefix}${newSessionId}.json`;
        } else if (blob.pathname === `sessions/${oldSessionId}.json`) {
          // Fallback if there was an old un-migrated JSON file in the root of sessions
          newPath = `${newPrefix}${newSessionId}.json`;
        }

        await copy(blob.pathname, newPath, {
          access: "private",
          token
        });

        // 3. Delete the old blob
        await del(blob.pathname, { token });
      }

      hasMore = listResult.hasMore;
      cursor = listResult.cursor;
    }

    // Also try to delete old root JSON file if it exists, just in case
    try {
      await copy(`sessions/${oldSessionId}.json`, `${newPrefix}${newSessionId}.json`, { access: 'private', token });
      await del(`sessions/${oldSessionId}.json`, { token });
    } catch(e) {
      // Ignore if doesn't exist
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error renaming session in Blob", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

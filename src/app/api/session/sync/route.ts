import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";
import os from "os";

function getStoreId(token: string) {
  const match = token.match(/^vercel_blob_rw_([a-zA-Z0-9]+)_/);
  return match ? match[1].toLowerCase() : null;
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session");
  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      // Fallback to local filesystem if Blob is not configured
      try {
        const localPath = path.join(os.tmpdir(), `session_${sessionId}.json`);
        const data = await fs.readFile(localPath, "utf-8");
        return NextResponse.json(JSON.parse(data));
      } catch (e) {
        return NextResponse.json({});
      }
    }

    const url = `sessions/${sessionId}/${sessionId}.json`;
    const storeId = process.env.BLOB_STORE_ID ? process.env.BLOB_STORE_ID.replace('store_', '').toLowerCase() : getStoreId(token);

    if (!storeId) {
      return NextResponse.json({});
    }

    const response = await fetch(
      `https://${storeId}.private.blob.vercel-storage.com/${url}`,
      {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({});
  } catch (error) {
    console.error("Error fetching session from Blob", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session");
  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      // Fallback to local filesystem if Blob is not configured
      const localPath = path.join(os.tmpdir(), `session_${sessionId}.json`);
      await fs.writeFile(localPath, JSON.stringify(body), "utf-8");
      return NextResponse.json({ success: true, warning: "Saved locally (Blob not configured)" });
    }

    const url = `sessions/${sessionId}/${sessionId}.json`;
    await put(url, JSON.stringify(body), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      token: token
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving session to Blob", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

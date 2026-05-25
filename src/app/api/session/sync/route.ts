import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const getRedisClient = () => {
  // Graceful fallback if UPSTASH_REDIS_REST_URL is not set (e.g., local dev before user provides credentials)
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
};

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session");
  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const redis = getRedisClient();
  if (!redis) {
    return NextResponse.json({});
  }

  try {
    const data = await redis.get(`intake_session:${sessionId}`);
    return NextResponse.json(data || {});
  } catch (error) {
    console.error("Error fetching session from Redis", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session");
  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const redis = getRedisClient();
  if (!redis) {
    return NextResponse.json({ success: true, warning: "Redis not configured" });
  }

  try {
    const body = await request.json();
    // Save with 24 hours expiry
    await redis.set(`intake_session:${sessionId}`, body, { ex: 86400 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving session to Redis", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

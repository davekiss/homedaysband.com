import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { bandSlug, trackTitle } = await req.json();

    if (!bandSlug || !trackTitle) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "Homedays Pitch <notifications@homedaysband.com>",
        to: process.env.NOTIFY_EMAIL ?? "homedaysband@gmail.com",
        subject: `${bandSlug} listened to ${trackTitle}`,
        text: `${bandSlug} listened to "${trackTitle}" on your pitch page.\n\nPage: https://homedaysband.com/welcome/${bandSlug}\nTime: ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET`,
      });
    }

    return NextResponse.json({ status: "tracked" });
  } catch (e) {
    console.error("track-play error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

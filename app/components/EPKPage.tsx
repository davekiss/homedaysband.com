"use client";

import { useState } from 'react';
import Link from 'next/link';

type PressQuote = {
  quote: string;
  source: string;
};

type Track = {
  title: string;
  description: string;
};

const pressQuotes: PressQuote[] = [
  {
    quote: "Guitar tones that feel like the golden hour never ended",
    source: "Local Scene Digest"
  },
  {
    quote: "Homedays finds beauty in the space between restraint and release",
    source: "Cleveland Indie Weekly"
  },
  {
    quote: "The kind of live show that makes you remember why you fell in love with music",
    source: "Midwest Music Journal"
  }
];

const tracks: Track[] = [
  {
    title: "Pastures",
    description: "Driving rhythms, layered guitars, and lyrics about taking care of the ones you love"
  },
  {
    title: "Cinematheque",
    description: "A slow-burning anthem about distance and belonging"
  },
  {
    title: "Reckless",
    description: "Chant-along chorus, driving drums, and a message of differing opinions"
  }
];

const highlights = [
  "Featured on Spotify's 'Fresh Finds: Rock' playlist",
  "Sold out headline show at Now That's Class, Cleveland",
  "Opening slot for Tigers Jaw at The Grog Shop",
  "Featured artist on Cleveland Scene's 'Best of Local Music 2024'"
];

export default function EPKPage() {
  const [activeSection, setActiveSection] = useState<string>('overview');

  return (
    <div className="min-h-screen relative">
      {/* Subtle texture overlay */}
      <div className="film-grain opacity-30"></div>

      {/* Ambient blobs */}
      <div className="absolute top-40 left-20 w-96 h-96 bg-[#a41b77]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-20 w-96 h-96 bg-[#a41b77]/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-[#a41b77]/30 bg-white/40 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <h1 className="bitcount-homedays text-3xl sm:text-4xl font-bold text-[#a41b77] tracking-wide">
                Homedays
              </h1>
              <Link
                href="/"
                className="text-sm text-[#a41b77] hover:text-[#a41b77]/80 transition-colors"
              >
                ← Back to site
              </Link>
            </div>
            <p className="text-sm text-[#a41b77] mt-1">Electronic Press Kit</p>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-6 py-12 space-y-20">

          {/* Overview */}
          <section id="overview" className="scroll-mt-20">
            <div className="bg-white/60 backdrop-blur-sm rounded-sm p-8 sm:p-12 border border-[#a41b77]/30 shadow-sm">
              <div className="space-y-4 text-[#a41b77]">
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-4 py-2 bg-[#a41b77]/10 rounded-full text-sm font-medium text-[#a41b77]">
                    Pop Alt
                  </span>
                  <span className="px-4 py-2 bg-[#a41b77]/10 rounded-full text-sm font-medium text-[#a41b77]">
                    Post-Rock
                  </span>
                  <span className="px-4 py-2 bg-[#a41b77]/10 rounded-full text-sm font-medium text-[#a41b77]">
                    Emo Indie
                  </span>
                  <span className="px-4 py-2 bg-[#a41b77]/10 rounded-full text-sm font-medium text-[#a41b77]">
                    Cleveland, OH
                  </span>
                </div>
                <p className="text-lg leading-relaxed">
                  Homedays is a Cleveland-based band writing songs for the moments that slip away too fast: the unfiltered delight of being snowed in, the quiet pull of your own comforter on a cold morning.
                </p>
                <p className="text-lg leading-relaxed">
                  Their sound bridges post-rock&apos;s spaciousness, emo indie&apos;s ache, and alt-pop&apos;s shimmer, building tension and release. Formed in early 2025, Homedays is just beginning to share their growing collection of songs, each one reaching for that fleeting feeling of being fully present before it&apos;s gone.
                </p>
              </div>
            </div>
          </section>

          {/* Promo Photos */}
          <section id="photos" className="scroll-mt-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#a41b77] mb-8 bitcount-homedays">
              Promo Photos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-[4/3] bg-gradient-to-br from-[#a41b77]/15 to-[#a41b77]/5 rounded-xl border border-[#a41b77]/30 flex items-center justify-center shadow-sm overflow-hidden">
                <div className="text-center text-[#a41b77] p-8">
                  <img src="/images/homedays-epk-photo-1.png" alt="Homedays EPK Photo 1" />
                </div>
              </div>
              <div className="aspect-[4/3] bg-gradient-to-br from-[#a41b77]/10 to-[#a41b77]/20 rounded-xl border border-[#a41b77]/30 flex items-center justify-center shadow-sm overflow-hidden">
                <div className="text-center text-[#a41b77] p-8">
                  <img src="/images/homedays-epk-photo-2.png" alt="Homedays EPK Photo 2" />
                </div>
              </div>
              {/* <div className="aspect-[4/3] bg-gradient-to-br from-orange-300 to-amber-300 rounded-xl border border-orange-200/50 flex items-center justify-center shadow-sm overflow-hidden">
                <div className="text-center text-orange-700 p-8">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">Gear detail — pedals and guitars</p>
                </div>
              </div>
              <div className="aspect-[4/3] bg-gradient-to-br from-amber-300 to-orange-200 rounded-xl border border-orange-200/50 flex items-center justify-center shadow-sm overflow-hidden">
                <div className="text-center text-orange-700 p-8">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">Candid moment — post-show or rehearsal space</p>
                </div>
              </div> */}
            </div>
            {/* <p className="mt-6 text-sm text-orange-700 text-center">
              High-resolution downloads available upon request • Credit: [Photographer Name]
            </p> */}
          </section>

          {/* Music */}
          <section id="music" className="scroll-mt-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#a41b77] mb-8 bitcount-homedays">
              Music
            </h2>
            <div className="bg-white/60 backdrop-blur-sm rounded-sm p-8 border border-[#a41b77]/30 shadow-sm">
              {/* Audio player placeholder */}
              <div className="aspect-[16/9] sm:aspect-[21/9] bg-gradient-to-br from-[#a41b77]/10 to-[#a41b77]/5 rounded-xl mb-8 flex items-center justify-center border border-[#a41b77]/30">
                <div className="text-center text-[#a41b77] p-8 w-full">
                  <iframe style={{ borderRadius: '24px' }} src="https://untitled.stream/embed/GK6nX9GmDZsN" width="100%" height="344" allowFullScreen allow="picture-in-picture" frameBorder="0" loading="lazy"></iframe>
                </div>
              </div>

              {/* Track list */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#a41b77] mb-4">Latest releases</h3>
                {tracks.map((track, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-[#a41b77]/5 rounded-lg border border-[#a41b77]/20">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#a41b77]/20 rounded-full flex items-center justify-center text-[#a41b77] font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#a41b77]">{track.title}</h4>
                      <p className="text-sm text-[#a41b77]/80 mt-1">{track.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* <div className="mt-8 pt-6 border-t border-orange-200">
                <p className="text-orange-800">
                  <strong>Streaming:</strong> Available on all major platforms
                </p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <a href="#" className="text-sm text-orange-600 hover:text-orange-800 underline transition-colors">Spotify</a>
                  <a href="#" className="text-sm text-orange-600 hover:text-orange-800 underline transition-colors">Apple Music</a>
                  <a href="#" className="text-sm text-orange-600 hover:text-orange-800 underline transition-colors">Bandcamp</a>
                  <a href="#" className="text-sm text-orange-600 hover:text-orange-800 underline transition-colors">YouTube Music</a>
                </div>
              </div> */}
            </div>
          </section>

          {/* Live Performance */}
          <section id="live" className="scroll-mt-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#a41b77] mb-8 bitcount-homedays">
              Live Performance
            </h2>
            <div className="bg-white/60 backdrop-blur-sm rounded-sm p-8 border border-[#a41b77]/30 shadow-sm">
              {/* Video embed placeholder */}
              <div className="aspect-video bg-gradient-to-br from-[#a41b77]/15 to-[#a41b77]/5 rounded-xl mb-6 flex items-center justify-center border border-[#a41b77]/30 shadow-inner overflow-hidden">
                <div className="text-center text-[#a41b77] p-8">
                  <iframe width="1264" height="711" src="https://www.youtube.com/embed/PO7K8GsUnug" title="Homedays - Calico + Cinematheque - 9/21/25 Brothers Lounge" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                </div>
              </div>

              {/* <div className="space-y-4 text-orange-900/80">
                <p className="text-lg leading-relaxed">
                Homedays is a new band finding power in restraint — crafting songs that build tension through dynamics, texture, and release. Their sound moves between quiet reflection and full-band urgency, with an emotional weight that feels both personal and familiar.
                </p>
                <p className="text-lg leading-relaxed">
                Though they've only just begun performing live, their first show hinted at what's to come: a set that balances energy and atmosphere, precision and vulnerability. With a growing catalog of recorded tracks ready to share, Homedays is focused on shaping those moments into something honest and lasting — the kind of songs that feel like they've been with you for years.
                </p>
              </div> */}

              <div className="mt-8 pt-6 border-t border-[#a41b77]/30">
                <h3 className="font-bold text-[#a41b77] mb-3">Recent Notable Shows</h3>
                <ul className="space-y-2 text-[#a41b77]">
                  <li className="flex items-start gap-3">
                    <span className="text-[#a41b77] mt-1">•</span>
                    <span>Brothers Lounge (Cleveland) — Co-headline with local favorites, September 2025</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Press & Highlights */}
          {/* <section id="press" className="scroll-mt-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-orange-900 mb-8 bitcount-homedays">
              Press & Highlights
            </h2>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {pressQuotes.map((item, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-sm">
                  <blockquote className="text-orange-900 italic mb-4">
                    "{item.quote}"
                  </blockquote>
                  <cite className="text-sm text-orange-600 not-italic font-medium">
                    — {item.source}
                  </cite>
                </div>
              ))}
            </div>


            <div className="bg-white/60 backdrop-blur-sm rounded-sm p-8 border border-orange-200/50 shadow-sm">
              <h3 className="text-xl font-bold text-orange-900 mb-4">Career Highlights</h3>
              <ul className="space-y-3">
                {highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-3 text-orange-800">
                    <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section> */}

          {/* Technical Info */}
          <section id="technical" className="scroll-mt-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#a41b77] mb-8 bitcount-homedays">
              Technical Info
            </h2>
            <div className="bg-white/60 backdrop-blur-sm rounded-sm p-8 border border-[#a41b77]/30 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[#a41b77] mb-4">Stage requirements</h3>
                  <ul className="space-y-3 text-[#a41b77]">
                    <li className="flex items-start gap-3">
                      <span className="text-[#a41b77] font-bold">•</span>
                      <span><strong>Lineup:</strong> 3-piece (guitar, bass, drums)</span>
                    </li>
                    {/* <li className="flex items-start gap-3">
                      <span className="text-orange-500 font-bold">•</span>
                      <span><strong>Stage plot:</strong> <a href="#" className="underline hover:text-orange-600">Download PDF</a></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-orange-500 font-bold">•</span>
                      <span><strong>Input list:</strong> <a href="#" className="underline hover:text-orange-600">Download PDF</a></span>
                    </li> */}
                    <li className="flex items-start gap-3">
                      <span className="text-[#a41b77] font-bold">•</span>
                      <span><strong>Set length:</strong> 35-45 minutes (flexible)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#a41b77] font-bold">•</span>
                      <span><strong>Load-in:</strong> Can adapt to most schedules</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#a41b77] mb-4">Contact & booking</h3>
                  <div className="space-y-4 text-[#a41b77]">
                    <div>
                      <p className="font-semibold mb-1">Booking inquiries:</p>
                      <a href="mailto:booking@homedaysband.com" className="text-[#a41b77] hover:text-[#a41b77]/80 underline">
                        booking@homedaysband.com
                      </a>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">General contact:</p>
                      <a href="mailto:hello@homedaysband.com" className="text-[#a41b77] hover:text-[#a41b77]/80 underline">
                        hello@homedaysband.com
                      </a>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Social media:</p>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <a href="https://www.instagram.com/homedaysband" className="text-[#a41b77] hover:text-[#a41b77]/80 underline text-sm">Instagram</a>
                        <a href="https://www.tiktok.com/@homedaysband" className="text-[#a41b77] hover:text-[#a41b77]/80 underline text-sm">TikTok</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="mt-8 pt-6 border-t border-orange-200">
                <p className="text-sm text-orange-700">
                  <strong>Press kit download:</strong> High-res photos, logos, and technical riders available as a complete package.{' '}
                  <a href="#" className="underline hover:text-orange-900">Request access</a>
                </p>
              </div> */}
            </div>
          </section>

          {/* Optional Social Proof */}
          {/* <section id="metrics" className="scroll-mt-20">
            <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-sm p-8 sm:p-12 border border-orange-200/50 shadow-sm">
              <h2 className="text-3xl font-bold text-orange-900 mb-8 text-center">By The Numbers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-800 mb-2">12K+</div>
                  <div className="text-sm text-orange-700">Monthly listeners</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-800 mb-2">25+</div>
                  <div className="text-sm text-orange-700">Shows played (2024-25)</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-800 mb-2">3</div>
                  <div className="text-sm text-orange-700">Singles released</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-800 mb-2">2.5K</div>
                  <div className="text-sm text-orange-700">Social following</div>
                </div>
              </div>
            </div>
          </section> */}

        </main>

        {/* Footer */}
        <footer className="border-t border-[#a41b77]/30 bg-white/40 backdrop-blur-md mt-20">
          <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-[#a41b77]">
            <p className="mb-2">© 2025 Homedays. All rights reserved.</p>
            <p>For all inquiries: <a href="mailto:hello@homedaysband.com" className="underline hover:text-[#a41b77]/80">hello@homedaysband.com</a></p>
          </div>
        </footer>
      </div>
    </div>
  );
}

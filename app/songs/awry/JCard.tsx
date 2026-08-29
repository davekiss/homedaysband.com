"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Song, LyricSection } from "@/data/songs/awry";

import "@videojs/react/audio/skin.css";
import {
  createPlayer,
  TimeSlider,
  PlayButton,
  SeekButton,
  Time,
  MuteButton,
  VolumeSlider,
} from "@videojs/react";
import { audioFeatures, Audio } from "@videojs/react/audio";

const Player = createPlayer({ features: audioFeatures });

export default function JCard({ song }: { song: Song }) {
  const hasLyrics = !!song.lyrics && song.lyrics.length > 0;

  return (
    <main className="jc-room" data-lyrics={hasLyrics}>
      <Player.Provider>
        <Player.Container className="jc-container">
          <Audio src={song.src} preload="metadata" />

          <div className="jc-table">
            <Link href="/" className="jc-home">
              <ArrowIcon direction="left" /> Homedays
            </Link>

            <section className="jc-insert" aria-label={`${song.title} — cassette insert`}>
              <CoverPanel song={song} />
              <Spine song={song} />
              {hasLyrics && <LyricFold sections={song.lyrics!} cardLabel={song.cardLabel} />}
              <BackPanel song={song} />
            </section>
          </div>

          <Deck song={song} />
        </Player.Container>
      </Player.Provider>

      <style jsx global>{`
        /* ---------- world ---------- */
        .jc-room {
          --night: #100e0b;
          --night-2: #1a1614;
          --lamp: #e9d27a;
          --stock: #efe6cf;
          --stock-2: #e6dbbf;
          --ink: #2a2416;
          --ink-2: #6b5f48;
          --fog: #b9ad8c;
          --deck: #171310;
          --deck-2: #241e18;
          --cream: #f5efdd;
          --grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          position: relative;
          min-height: 100dvh;
          background:
            radial-gradient(60% 40% at 50% 0%, rgba(233, 210, 122, 0.16), transparent 70%),
            linear-gradient(180deg, var(--night-2) 0%, var(--night) 100%);
          color: var(--cream);
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          overflow-x: hidden;
          scrollbar-color: rgba(233, 210, 122, 0.35) var(--night);
        }
        .jc-room::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: var(--grain);
          opacity: 0.07;
          mix-blend-mode: screen;
          pointer-events: none;
        }
        .jc-room ::selection {
          background: var(--lamp);
          color: var(--ink);
        }
        .jc-room :focus-visible {
          outline: 2px solid var(--lamp);
          outline-offset: 3px;
          border-radius: 2px;
        }
        .jc-room a {
          text-underline-offset: 0.2em;
        }
        .jc-container {
          display: block;
          background: none;
          border: none;
          padding: 0;
          margin: 0;
        }

        .jc-table {
          position: relative;
          max-width: 1180px;
          margin: 0 auto;
          padding: 20px 0 calc(112px + env(safe-area-inset-bottom));
        }
        .jc-home {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px 18px;
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(245, 239, 221, 0.62);
          text-decoration: none;
          transition: color 200ms ease;
        }
        .jc-home:hover {
          color: var(--cream);
        }

        /* ---------- the insert ---------- */
        .jc-insert {
          position: relative;
          display: grid;
          grid-template-columns: 1fr;
          background: var(--stock);
          color: var(--ink);
          box-shadow:
            0 30px 60px -20px rgba(0, 0, 0, 0.7),
            0 8px 18px -6px rgba(0, 0, 0, 0.5);
          perspective: 1600px;
          transform-style: preserve-3d;
        }
        .jc-insert::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: var(--grain);
          opacity: 0.26;
          mix-blend-mode: multiply;
          pointer-events: none;
        }
        .jc-panel {
          position: relative;
          min-width: 0;
          transform-origin: 50% 0%;
          animation: jc-unfold-x 1100ms cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: calc(var(--i, 0) * 160ms);
        }
        /* crease: the paper darkens into the fold on both sides and each
           panel sits at its own value, the way a folded insert catches light */
        .jc-back {
          background: #e9dfc6;
        }
        .jc-panel + .jc-panel {
          border-top: 1px solid rgba(42, 36, 22, 0.38);
        }
        .jc-panel + .jc-panel::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 34px;
          background: linear-gradient(180deg, rgba(42, 36, 22, 0.26), rgba(42, 36, 22, 0.06) 55%, transparent);
          pointer-events: none;
          z-index: 1;
        }
        .jc-panel + .jc-panel::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: -35px;
          height: 34px;
          background: linear-gradient(0deg, rgba(42, 36, 22, 0.2), rgba(42, 36, 22, 0.04) 55%, transparent);
          pointer-events: none;
          z-index: 1;
        }

        /* cover */
        .jc-cover-art {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: var(--fog);
        }
        .jc-cover-art img {
          transition: transform 1200ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .jc-cover-art[data-playing="true"] img {
          transform: scale(1.02);
        }
        .jc-cover-play {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 84px;
          height: 84px;
          margin: -42px 0 0 -42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--cream);
          color: var(--ink);
          box-shadow: 0 14px 36px -8px rgba(0, 0, 0, 0.55);
          transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease;
          cursor: pointer;
        }
        .jc-cover-play:hover {
          transform: scale(1.05);
        }
        .jc-cover-play:active {
          transform: scale(0.96);
        }
        .jc-cover-play[data-paused="false"] {
          box-shadow: 0 6px 18px -6px rgba(0, 0, 0, 0.5);
        }
        .jc-cover-foot {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0 12px;
          padding: 2px 16px;
          min-height: 48px;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-2);
        }
        .jc-cover-foot-links {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .jc-cover-foot-also {
          white-space: nowrap;
        }
        .jc-cover-foot > span:first-child,
        .jc-cover-foot-links a {
          white-space: nowrap;
        }
        .jc-cover-foot-links a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 44px;
          color: var(--ink);
          text-decoration: none;
        }
        .jc-cover-foot-links a > span {
          border-bottom: 1px solid rgba(42, 36, 22, 0.35);
          padding-bottom: 2px;
          transition: border-color 200ms ease;
        }
        .jc-cover-foot-links a:hover > span {
          border-color: var(--ink);
        }

        /* spine */
        .jc-spine {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 18px;
          background: var(--stock-2);
          font-family: "Theseasons", serif;
          font-size: 15px;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--ink);
        }
        .jc-spine em {
          font-style: normal;
          font-weight: 400;
          text-transform: none;
          letter-spacing: 0.08em;
          font-size: 20px;
        }
        .jc-spine small {
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          font-size: 11px;
          letter-spacing: 0.22em;
          color: var(--ink-2);
        }

        /* lyric fold */
        .jc-lyrics {
          padding: 0;
        }
        .jc-lyrics-scroll {
          padding: 26px 18px 30px;
        }
        .jc-lyrics-fade {
          display: none;
        }
        .jc-lyrics h2 {
          font-size: 22px;
          margin: 0 0 18px;
          letter-spacing: 0.02em;
        }
        .jc-lyric-section {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0 10px;
          margin: 0 0 16px;
        }
        .jc-lyrics[data-times="true"] .jc-lyric-section {
          grid-template-columns: 3.25rem 1fr;
        }
        .jc-lyric-time {
          font-size: 11px;
          letter-spacing: 0.08em;
          color: var(--ink-2);
          font-variant-numeric: tabular-nums;
          padding-top: 3px;
        }
        .jc-lyric-lines {
          font-size: 15px;
          line-height: 1.55;
          max-width: 34ch;
        }
        .jc-lyric-section[data-on-card="true"] .jc-lyric-lines {
          background: linear-gradient(transparent 12%, rgba(233, 210, 122, 0.55) 12%, rgba(233, 210, 122, 0.55) 88%, transparent 88%);
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
          display: inline;
          padding: 0 4px;
        }
        .jc-lyric-card-note {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 26px 0 0;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-2);
        }
        .jc-lyric-card-swatch {
          width: 14px;
          height: 8px;
          background: rgba(233, 210, 122, 0.55);
        }

        /* back panel */
        .jc-back {
          display: flex;
          flex-direction: column;
          padding: 26px 18px 22px;
        }
        .jc-back h1 {
          font-size: 44px;
          line-height: 0.95;
          margin: 0 0 8px;
          letter-spacing: -0.01em;
          text-wrap: balance;
        }
        .jc-back-meta {
          font-size: 12px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-2);
          margin: 0 0 22px;
          text-wrap: balance;
        }
        .jc-credits {
          border-top: 1px solid rgba(42, 36, 22, 0.35);
          border-bottom: 1px solid rgba(42, 36, 22, 0.35);
          padding: 12px 0;
          margin: 0 0 22px;
          font-size: 12.5px;
          line-height: 1.5;
        }
        .jc-credits dl {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 2px 14px;
          margin: 0;
        }
        .jc-credits dt {
          color: var(--ink-2);
        }
        .jc-credits dd {
          margin: 0;
          color: var(--ink);
        }
        .jc-lyrics-note {
          font-size: 13px;
          line-height: 1.5;
          color: var(--ink-2);
          margin: 0 0 22px;
          max-width: 36ch;
        }
        .jc-tracklist {
          display: grid;
          grid-template-columns: 1.5rem 1fr auto;
          gap: 12px;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink);
          border-top: 1px solid rgba(42, 36, 22, 0.35);
          padding: 10px 0;
          margin: 0 0 22px;
          font-variant-numeric: tabular-nums;
        }
        .jc-tracklist span:first-child {
          color: var(--ink-2);
        }
        .jc-save {
          display: grid;
          gap: 10px;
          margin: 4px 0 0;
        }
        .jc-save a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: var(--ink);
          color: var(--cream);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: background 200ms ease, transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .jc-save a:hover {
          background: #3a3220;
          transform: translateY(-1px);
        }
        .jc-save-arrow {
          margin-left: auto;
          opacity: 0.6;
          display: inline-flex;
        }
        .jc-back-foot {
          margin-top: auto;
          padding-top: 28px;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ink-2);
        }
        .jc-back-foot a {
          color: var(--ink);
          text-decoration: none;
          border-bottom: 1px solid rgba(42, 36, 22, 0.35);
          padding-bottom: 2px;
        }

        /* ---------- the deck ---------- */
        .jc-deck {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 20;
          background: linear-gradient(180deg, var(--deck-2), var(--deck));
          border-top: 1px solid rgba(245, 239, 221, 0.12);
          box-shadow: 0 -18px 40px -16px rgba(0, 0, 0, 0.8);
          padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
        }
        .jc-deck-inner {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: auto 1fr;
          grid-template-areas:
            "slider slider"
            "transport counter";
          align-items: center;
          gap: 6px 14px;
        }
        .jc-transport {
          grid-area: transport;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .jc-seek {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(245, 239, 221, 0.7);
          transition: color 200ms ease;
          cursor: pointer;
        }
        .jc-seek:hover {
          color: var(--cream);
        }
        .jc-seek-glyph {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .jc-seek-num {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -42%);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.02em;
          font-variant-numeric: tabular-nums;
        }
        .jc-play {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--cream);
          color: var(--ink);
          box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.6);
          transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .jc-play:hover {
          transform: scale(1.04);
        }
        .jc-play:active {
          transform: scale(0.95);
        }
        .jc-slider-wrap {
          grid-area: slider;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .jc-time {
          font-size: 12px;
          font-variant-numeric: tabular-nums;
          color: rgba(245, 239, 221, 0.7);
          flex-shrink: 0;
          width: 36px;
        }
        .jc-time[data-type="current"] {
          text-align: right;
        }
        .jc-counter {
          grid-area: counter;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }
        .jc-counter-window {
          display: inline-flex;
          gap: 2px;
          padding: 4px 6px;
          background: #0b0907;
          border: 1px solid rgba(245, 239, 221, 0.12);
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.9);
          border-radius: 2px;
        }
        .jc-counter-digit {
          width: 14px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--cream);
          color: var(--ink);
          font-size: 14px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          border-radius: 1px;
        }
        .jc-counter[data-loading="true"] .jc-counter-digit {
          animation: jc-blink 900ms steps(2, jump-none) infinite;
        }
        .jc-counter-reset {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(245, 239, 221, 0.5);
          transition: color 200ms ease;
          cursor: pointer;
        }
        .jc-counter-reset:hover {
          color: var(--cream);
        }
        .jc-volume {
          display: none;
          align-items: center;
          gap: 6px;
          width: 120px;
        }
        .jc-mute {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(245, 239, 221, 0.6);
          transition: color 200ms ease;
          cursor: pointer;
        }
        .jc-mute:hover {
          color: var(--cream);
        }
        .jc-jammed {
          display: flex;
          align-items: center;
          gap: 14px;
          justify-content: center;
          font-size: 13px;
          color: var(--cream);
          padding: 8px 0;
        }
        .jc-jammed a {
          color: var(--lamp);
          text-decoration: underline;
        }

        /* slider */
        .jc-slider {
          position: relative;
          display: flex;
          align-items: center;
          height: 28px;
          flex: 1;
          cursor: pointer;
          touch-action: none;
        }
        .jc-slider-track {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(245, 239, 221, 0.16);
          border-radius: 9999px;
        }
        .jc-slider-fill {
          position: absolute;
          top: 0;
          left: 0;
          width: var(--media-slider-fill);
          height: 100%;
          background: var(--lamp);
          border-radius: 9999px;
        }
        .jc-slider-thumb {
          position: absolute;
          left: var(--media-slider-fill);
          width: 12px;
          height: 12px;
          background: var(--cream);
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          transform: translateX(-50%) scale(0);
          transition: transform 150ms ease;
        }
        .jc-slider[data-interactive] .jc-slider-thumb,
        .jc-slider:focus-within .jc-slider-thumb {
          transform: translateX(-50%) scale(1);
        }
        .jc-slider[data-dragging] .jc-slider-thumb {
          transform: translateX(-50%) scale(1.15);
        }
        .jc-volume .jc-slider {
          height: 20px;
        }
        .jc-volume .jc-slider-track {
          height: 2px;
        }
        .jc-volume .jc-slider-thumb {
          width: 9px;
          height: 9px;
        }

        /* ---------- motion ---------- */
        @keyframes jc-unfold-x {
          from {
            transform: rotateX(-62deg);
            opacity: 0.2;
          }
          to {
            transform: rotateX(0deg);
            opacity: 1;
          }
        }
        @keyframes jc-unfold-y {
          from {
            transform: rotateY(-62deg);
            opacity: 0.2;
          }
          to {
            transform: rotateY(0deg);
            opacity: 1;
          }
        }
        @keyframes jc-blink {
          from {
            opacity: 1;
          }
          to {
            opacity: 0.25;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .jc-panel {
            animation: none !important;
          }
          .jc-cover-art img,
          .jc-slider-thumb,
          .jc-play,
          .jc-cover-play {
            transition: none !important;
          }
        }

        /* ---------- desktop: the insert lies flat ---------- */
        @media (min-width: 900px) {
          .jc-table {
            padding: 28px 32px 120px;
            min-height: 100dvh;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .jc-home {
            padding-left: 0;
            padding-right: 0;
          }
          .jc-insert {
            grid-template-columns: 1fr 48px 0.9fr;
          }
          .jc-room[data-lyrics="true"] .jc-insert {
            grid-template-columns: 1fr 48px 1fr 0.9fr;
          }
          .jc-panel {
            transform-origin: 0% 50%;
            animation-name: jc-unfold-y;
          }
          .jc-panel + .jc-panel {
            border-top: 0;
            border-left: 1px solid rgba(42, 36, 22, 0.28);
          }
          .jc-panel + .jc-panel::before {
            top: 0;
            bottom: 0;
            right: auto;
            height: auto;
            width: 40px;
            background: linear-gradient(90deg, rgba(42, 36, 22, 0.26), rgba(42, 36, 22, 0.06) 55%, transparent);
          }
          .jc-panel + .jc-panel::after {
            top: 0;
            bottom: 0;
            left: -41px;
            right: auto;
            height: auto;
            width: 40px;
            background: linear-gradient(270deg, rgba(42, 36, 22, 0.2), rgba(42, 36, 22, 0.04) 55%, transparent);
          }
          .jc-cover-foot {
            padding: 4px 22px;
            font-size: 11px;
            letter-spacing: 0.2em;
          }
          .jc-spine {
            writing-mode: vertical-rl;
            transform: rotate(180deg);
            padding: 18px 0;
            justify-content: space-between;
          }
          .jc-insert {
            min-height: 580px;
          }
          .jc-lyrics {
            min-height: 0;
          }
          .jc-lyrics-scroll {
            position: absolute;
            inset: 0;
            overflow-y: auto;
            padding: 34px 28px 56px;
            scrollbar-width: thin;
            scrollbar-color: rgba(42, 36, 22, 0.35) transparent;
          }
          .jc-lyrics-fade {
            display: block;
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 64px;
            background: linear-gradient(180deg, rgba(239, 230, 207, 0), var(--stock));
            pointer-events: none;
            z-index: 2;
          }
          .jc-back {
            padding: 34px 28px 26px;
          }
          .jc-back h1 {
            font-size: 56px;
          }
          .jc-deck {
            padding: 12px 24px calc(12px + env(safe-area-inset-bottom));
          }
          .jc-deck-inner {
            grid-template-columns: auto 1fr auto auto;
            grid-template-areas: "transport slider counter volume";
            gap: 20px;
          }
          .jc-volume {
            display: flex;
            grid-area: volume;
          }
        }
        @media (min-width: 1180px) {
          .jc-back h1 {
            font-size: 64px;
          }
        }
      `}</style>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* panels                                                              */
/* ------------------------------------------------------------------ */

function CoverPanel({ song }: { song: Song }) {
  const paused = Player.usePlayer((s) => s.paused);
  return (
    <div className="jc-panel jc-cover" style={{ "--i": 0 } as React.CSSProperties}>
      <div className="jc-cover-art" data-playing={!paused}>
        <Image
          src={song.artwork}
          alt={`${song.title} — single artwork`}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 480px"
          className="object-cover"
        />
        <PlayButton
          className="jc-cover-play"
          render={(props, state) => (
            <button {...props} data-paused={state.paused}>
              {state.paused ? <PlayGlyph size={30} /> : <PauseGlyph size={30} />}
            </button>
          )}
        />
      </div>
      <div className="jc-cover-foot">
        <span>
          {song.artist} · {song.releaseDateISO.slice(0, 4)}
        </span>
        <span className="jc-cover-foot-links">
          <span className="jc-cover-foot-also">Also on</span>
          <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label="Awry on Spotify">
            <SpotifyIcon size={13} /> <span>Spotify</span>
          </a>
          <a href={song.appleMusicUrl} target="_blank" rel="noopener noreferrer" aria-label="Awry on Apple Music">
            <AppleMusicIcon size={13} /> <span>Apple Music</span>
          </a>
        </span>
      </div>
    </div>
  );
}

function Spine({ song }: { song: Song }) {
  return (
    <div className="jc-panel jc-spine" style={{ "--i": 1 } as React.CSSProperties} aria-hidden>
      <span>{song.artist}</span>
      <em>{song.title.toLowerCase()}</em>
      <small>{song.releaseDateISO.slice(0, 4)}</small>
    </div>
  );
}

function LyricFold({ sections, cardLabel }: { sections: LyricSection[]; cardLabel: string }) {
  const hasTimes = sections.some((s) => s.time);
  const hasCardLines = sections.some((s) => s.onCard);
  return (
    <div className="jc-panel jc-lyrics" style={{ "--i": 2 } as React.CSSProperties} data-times={hasTimes}>
      <div className="jc-lyrics-scroll">
      <h2>Lyrics</h2>
      {sections.map((section, i) => (
        <div key={i} className="jc-lyric-section" data-on-card={!!section.onCard}>
          {hasTimes && <span className="jc-lyric-time">{section.time ?? ""}</span>}
          <p className="jc-lyric-lines">
            {section.lines.map((line, j) => (
              <span key={j}>
                {line}
                {j < section.lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>
      ))}
      {hasCardLines && (
        <p className="jc-lyric-card-note">
          <span className="jc-lyric-card-swatch" aria-hidden /> Printed on {cardLabel}
        </p>
      )}
      </div>
      <div className="jc-lyrics-fade" aria-hidden />
    </div>
  );
}

function BackPanel({ song }: { song: Song }) {
  const i = song.lyrics && song.lyrics.length > 0 ? 3 : 2;
  return (
    <div className="jc-panel jc-back" style={{ "--i": i } as React.CSSProperties}>
      <h1>{song.title}</h1>
      <p className="jc-back-meta">
        Single · {song.releaseDate} · {song.origin}
      </p>

      <div className="jc-credits">
        <dl>
          {song.credits.map((c) => (
            <Fragment key={c.role + c.name}>
              <dt>{c.role}</dt>
              <dd>{c.name}</dd>
            </Fragment>
          ))}
        </dl>
      </div>

      {(!song.lyrics || song.lyrics.length === 0) && (
        <p className="jc-lyrics-note">
          Lyrics to follow. The lines printed on your card will be marked here.
        </p>
      )}

      <div className="jc-tracklist" aria-label="Track list">
        <span>A</span>
        <span>{song.title}</span>
        <span>{song.duration}</span>
      </div>

      <div className="jc-save">
        <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer">
          <SpotifyIcon size={18} />
          Save on Spotify
          <span className="jc-save-arrow"><ArrowIcon direction="out" /></span>
        </a>
        <a href={song.appleMusicUrl} target="_blank" rel="noopener noreferrer">
          <AppleMusicIcon size={18} />
          Save on Apple Music
          <span className="jc-save-arrow"><ArrowIcon direction="out" /></span>
        </a>
      </div>

      <p className="jc-back-foot">
        <Link href="/">homedaysband.com</Link>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* the deck                                                            */
/* ------------------------------------------------------------------ */

function Deck({ song }: { song: Song }) {
  const error = Player.usePlayer((s) => s.error);

  return (
    <div className="jc-deck" role="region" aria-label="Playback">
      {error ? (
        <p className="jc-jammed">
          Tape jammed — this browser couldn&apos;t play the file.{" "}
          <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer">
            Listen on Spotify
          </a>
        </p>
      ) : (
        <div className="jc-deck-inner">
          <div className="jc-transport">
            <SeekButton
              seconds={-10}
              className="jc-seek"
              render={(props) => (
                <button {...props} aria-label="Rewind 10 seconds">
                  <SeekGlyph direction="back" />
                </button>
              )}
            />
            <PlayButton
              className="jc-play"
              render={(props, state) => (
                <button {...props}>
                  {state.paused ? <PlayGlyph size={22} /> : <PauseGlyph size={22} />}
                </button>
              )}
            />
            <SeekButton
              seconds={10}
              className="jc-seek"
              render={(props) => (
                <button {...props} aria-label="Forward 10 seconds">
                  <SeekGlyph direction="forward" />
                </button>
              )}
            />
          </div>

          <div className="jc-slider-wrap">
            <Time.Value type="current" className="jc-time" data-type="current" />
            <TimeSlider.Root className="jc-slider">
              <TimeSlider.Track className="jc-slider-track">
                <TimeSlider.Fill className="jc-slider-fill" />
              </TimeSlider.Track>
              <TimeSlider.Thumb className="jc-slider-thumb" />
            </TimeSlider.Root>
            <Time.Value type="duration" className="jc-time" data-type="duration" />
          </div>

          <TapeCounter />

          <div className="jc-volume">
            <MuteButton
              className="jc-mute"
              render={(props, state) => (
                <button {...props}>
                  {state.muted ? <VolumeGlyph muted /> : <VolumeGlyph />}
                </button>
              )}
            />
            <VolumeSlider.Root className="jc-slider">
              <VolumeSlider.Track className="jc-slider-track">
                <VolumeSlider.Fill className="jc-slider-fill" />
              </VolumeSlider.Track>
              <VolumeSlider.Thumb className="jc-slider-thumb" />
            </VolumeSlider.Root>
          </div>
        </div>
      )}
    </div>
  );
}

// A mechanical tape counter: four cream digits that turn with the reel.
// Real counters count reel revolutions, not seconds, so this runs a
// little faster than the clock. Loading blinks the digits.
function TapeCounter() {
  const currentTime = Player.usePlayer((s) => s.currentTime);
  const paused = Player.usePlayer((s) => s.paused);
  const canPlay = Player.usePlayer((s) => s.canPlay);
  const [offset, setOffset] = useState(0);

  const count = Math.max(0, Math.floor((currentTime || 0) * 2.7) - offset) % 10000;
  const digits = String(count).padStart(4, "0").split("");
  const loading = !paused && !canPlay;

  return (
    <div className="jc-counter" data-loading={loading}>
      <span className="jc-counter-window" role="img" aria-label={`Tape counter ${count}`}>
        {digits.map((d, i) => (
          <span key={i} className="jc-counter-digit" aria-hidden>
            {d}
          </span>
        ))}
      </span>
      <button
        type="button"
        className="jc-counter-reset"
        onClick={() => setOffset(Math.floor((currentTime || 0) * 2.7))}
      >
        Reset
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* icons — one stroke weight                                           */
/* ------------------------------------------------------------------ */

const STROKE = 1.8;

function SeekGlyph({ direction }: { direction: "back" | "forward" }) {
  const flip = direction === "back" ? "scale(-1,1) translate(-24,0)" : undefined;
  return (
    <span className="jc-seek-glyph">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <g transform={flip} stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4a8 8 0 1 1-7.4 5" />
          <path d="M9.5 2 12 4 9.5 6.3" />
        </g>
      </svg>
      <span className="jc-seek-num" aria-hidden>
        10
      </span>
    </span>
  );
}

function PlayGlyph({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinejoin="round"
      aria-hidden
      style={{ marginLeft: size * 0.08 }}
    >
      <path d="M7 5.2v13.6L18.5 12 7 5.2z" />
    </svg>
  );
}

function PauseGlyph({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 5.5h3v13H7zM14 5.5h3v13h-3z" />
    </svg>
  );
}

function VolumeGlyph({ muted = false }: { muted?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
      {muted ? (
        <path d="M16 9.5l5 5M21 9.5l-5 5" />
      ) : (
        <>
          <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />
          <path d="M18.3 6.5a8 8 0 0 1 0 11" />
        </>
      )}
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "out" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {direction === "left" ? (
        <>
          <path d="M20 12H5" />
          <path d="M11 6l-6 6 6 6" />
        </>
      ) : (
        <>
          <path d="M7 17L17 7" />
          <path d="M9 7h8v8" />
        </>
      )}
    </svg>
  );
}

function SpotifyIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.3c-.2.4-.7.5-1 .3-2.8-1.7-6.4-2.1-10.6-1.2-.4.1-.8-.2-.9-.6-.1-.4.2-.8.6-.9 4.6-1 8.5-.6 11.6 1.3.4.2.5.7.3 1.1zm1.5-3.3c-.3.4-.8.6-1.3.3-3.2-2-8.2-2.6-12-1.4-.5.1-1-.1-1.2-.6-.1-.5.1-1 .6-1.2 4.4-1.3 9.8-.7 13.5 1.6.5.3.6.9.4 1.3zm.1-3.4C15.3 8.3 8.9 8.1 5.2 9.2c-.6.2-1.2-.2-1.4-.7-.2-.6.2-1.2.7-1.4 4.2-1.3 11.3-1 15.7 1.6.5.3.7 1 .4 1.5-.3.5-1 .7-1.5.4z" />
    </svg>
  );
}

function AppleMusicIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.6 2.2L8.9 4.1c-.6.1-1 .6-1 1.2v10.1c-.5-.3-1.1-.4-1.8-.4C4.4 15 3 16.1 3 17.5S4.4 20 6.1 20s3.1-1.1 3.1-2.5V8.6l7.6-1.7v6.7c-.5-.3-1.1-.4-1.8-.4-1.7 0-3.1 1.1-3.1 2.5s1.4 2.5 3.1 2.5 3.1-1.1 3.1-2.5V3.4c0-.8-.7-1.3-1.5-1.2z" />
    </svg>
  );
}

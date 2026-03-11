"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Shirt } from 'lucide-react';

export default function HeroSection() {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();

  const yBg         = useTransform(scrollY, [0, 1000], [0, 300]);
  const yText       = useTransform(scrollY, [0, 1000], [0, -150]);
  const opacityText = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[110vh] overflow-hidden bg-[#050505] selection:bg-[#D4AF37] selection:text-black"
    >

      {/* ── 1. FILM GRAIN ─────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-[50] pointer-events-none opacity-[0.15] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* ── 2. BACKGROUND IMAGE + GRADIENTS ──────────────────────────────── */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
           backgroundImage: "url('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=2070')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/85 via-transparent to-[#050505]/30" />
      </motion.div>

      {/* ── 3. FLOATING CLOTH / FASHION ELEMENTS ─────────────────────────── */}
      <div className="absolute top-0 right-0 bottom-0 w-[45%] z-10 hidden lg:flex items-center justify-center pointer-events-none">

        {/* Fabric hang-tag swatch card */}
        <motion.div
          initial={{ opacity: 0, x: 60, rotate: 6 }}
          animate={{ opacity: 1, x: 0, rotate: 3 }}
          transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            top: '12%',
            right: '14%',
            width: '140px',
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.3)',
            backdropFilter: 'blur(10px)',
            borderRadius: '4px',
            padding: '20px 16px',
          }}
        >
          {/* Fabric swatch gradient */}
          <div style={{
            width: '100%',
            height: '80px',
            background: 'linear-gradient(135deg, #D4AF37 0%, #1A5C45 100%)',
            borderRadius: '2px',
            marginBottom: '12px',
          }} />
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '8px',
            letterSpacing: '3px',
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
          }}>
            S/S Collection
          </p>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '18px',
            color: 'rgba(255,255,255,0.9)',
            fontStyle: 'italic',
            marginTop: '2px',
          }}>
            Dare Fashion
          </p>
          {/* Hang tag hole + string */}
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            border: '1px solid rgba(212,175,55,0.5)',
            background: '#050505',
          }} />
          <div style={{
            position: 'absolute',
            top: '-18px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '1px',
            height: '10px',
            background: 'rgba(212,175,55,0.4)',
          }} />
        </motion.div>

        {/* New Arrivals pill */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            bottom: '22%',
            right: '10%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            borderRadius: '999px',
            padding: '10px 18px',
          }}
        >
          <Shirt size={16} color="#D4AF37" />
          <span style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '9px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
          }}>
            New Arrivals
          </span>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#D4AF37',
          }} />
        </motion.div>

        {/* Vertical label strip */}
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          style={{
            position: 'absolute',
            top: '50%',
            right: '5%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, transparent, #D4AF37)' }} />
          <span style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '8px',
            letterSpacing: '4px',
            color: 'rgba(212,175,55,0.5)',
            textTransform: 'uppercase',
            writingMode: 'vertical-rl',
          }}>
            Premium · Curated · Bold
          </span>
          <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to top, transparent, #D4AF37)' }} />
        </motion.div>

      </div>

      {/* ── 4. MAIN CONTENT ───────────────────────────────────────────────── */}
      <div className="relative z-10 h-full container mx-auto px-6 flex flex-col justify-center">
        <motion.div
          style={{ y: yText, opacity: opacityText }}
          className="flex flex-col items-start max-w-[60%]"
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-8">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-[1px] bg-[#D4AF37] origin-left"
              style={{ width: '48px' }}
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '9px',
                letterSpacing: '4px',
                color: 'rgba(212,175,55,0.7)',
                textTransform: 'uppercase',
              }}
            >
              Dare Fashion
            </motion.span>
          </div>

          {/* Headline with Blur Backdrop */}
          <div className="relative mb-8">
            {/* The Blur Background Div */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="absolute -inset-x-8 -inset-y-4 bg-black/20 backdrop-blur-md rounded-2xl z-[-1]" 
            />
            
            <h1 className="flex flex-col leading-[0.85]">
              <motion.span
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-[12vw] md:text-[10vw] font-black text-white tracking-tighter uppercase"
              >
                Owning
              </motion.span>
              <motion.span
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-[12vw] md:text-[10vw] font-black tracking-tighter uppercase"
                style={{ WebkitTextStroke: '1px rgba(255,255,255,0.8)', color: 'transparent' }}
              >
                Confidence.
              </motion.span>
            </h1>
          </div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '11px',
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              marginBottom: '40px',
              maxWidth: '320px',
              lineHeight: 2,
            }}
          >
            Trendy · Elegant · Statement pieces curated for bold people
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/shop"
              className="group relative px-10 py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] overflow-hidden transition-all duration-500 active:scale-95 flex items-center gap-3"
            >
              <span className="relative z-10 flex items-center gap-3">
                Shop Arrivals
                <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute top-0 left-0 w-full h-full bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Link>

            <Link
              href="/collections"
              className="px-10 py-4 border border-white/20 text-white font-bold uppercase tracking-[0.2em] text-[10px] backdrop-blur-md hover:bg-white hover:text-black transition-all duration-500 active:scale-95"
            >
              Explore Collection
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── 5. SCROLL INDICATOR ───────────────────────────────────────────── */}
      <div className="absolute bottom-14 right-12 z-20 hidden lg:flex flex-col items-center gap-4">
        <motion.div
          animate={{ scaleY: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="w-[1px] h-20 origin-top"
          style={{ background: 'linear-gradient(to bottom, #D4AF37, transparent)' }}
        />
      </div>

      {/* ── 6. BOTTOM FADE ────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#050505] to-transparent z-20" />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,300&family=Montserrat:wght@300;400;700;900&display=swap');
      `}</style>
    </div>
  );
}
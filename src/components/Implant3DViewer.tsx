'use client';

import React from 'react';

export default function Implant3DViewer() {
  return (
    <div className="relative flex items-center justify-center w-full max-w-lg mx-auto select-none pointer-events-none">
      {/* Ambient background glow matching color palette #2A7FFF & #A6F0FF */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(42,127,255,0.18)_0%,_transparent_70%)] blur-2xl pointer-events-none" />

      {/* Clean floating, turntable rotating 3D overdenture assembly */}
      <div className="dental-float-rounding relative flex items-center justify-center drop-shadow-[0_25px_50px_rgba(42,127,255,0.45)]">
        <img
          src="/image.svg"
          alt="3D Dental Implant Bar and Overdenture Prosthesis"
          className="w-full max-w-[420px] sm:max-w-[500px] h-auto object-contain transition-all duration-700"
          style={{
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6)) brightness(1.03) contrast(1.05)',
          }}
        />
      </div>
    </div>
  );
}

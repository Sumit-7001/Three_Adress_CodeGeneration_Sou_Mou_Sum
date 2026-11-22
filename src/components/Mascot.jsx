import React from 'react';

/**
 * Mascot Component
 * Inspired by the playful, fluffy red mascot in the reference UI!
 * Poses:
 *   - 'peek': peeking from behind/over a card border with eyes looking up or at the user
 *   - 'sitting': sitting character with full body and expressive eyes
 *   - 'avatar': compact badge version for the header
 */
export default function Mascot({ pose = 'peek', className = '', size = 120 }) {
  if (pose === 'avatar') {
    return (
      <div className={`mascot-avatar ${className}`} style={{ width: 36, height: 36 }}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <radialGradient id="mascotAvatarGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ff5247" />
              <stop offset="50%" stopColor="#ff3326" />
              <stop offset="100%" stopColor="#d81d12" />
            </radialGradient>
            <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#ff3326" floodOpacity="0.3" />
            </filter>
          </defs>
          <g filter="url(#softGlow)">
            {/* Fluffy body lobes */}
            <circle cx="34" cy="40" r="24" fill="url(#mascotAvatarGrad)" />
            <circle cx="66" cy="40" r="24" fill="url(#mascotAvatarGrad)" />
            <circle cx="50" cy="55" r="30" fill="url(#mascotAvatarGrad)" />
            {/* White pill eyes */}
            <ellipse cx="43" cy="48" rx="5.5" ry="11" fill="#ffffff" />
            <ellipse cx="57" cy="48" rx="5.5" ry="11" fill="#ffffff" />
            {/* Pupils looking slightly right/up */}
            <ellipse cx="44.5" cy="46" rx="3" ry="5.5" fill="#121212" />
            <ellipse cx="58.5" cy="46" rx="3" ry="5.5" fill="#121212" />
            {/* Eye highlights */}
            <circle cx="43" cy="43" r="1.5" fill="#ffffff" />
            <circle cx="57" cy="43" r="1.5" fill="#ffffff" />
          </g>
        </svg>
      </div>
    );
  }

  if (pose === 'peek') {
    return (
      <div className={`mascot-container mascot-peek ${className}`} style={{ width: size, height: size * 0.75 }}>
        <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <radialGradient id="furGrad1" cx="30%" cy="20%" r="80%">
              <stop offset="0%" stopColor="#ff655a" />
              <stop offset="40%" stopColor="#ff382b" />
              <stop offset="85%" stopColor="#d41e12" />
              <stop offset="100%" stopColor="#9e1007" />
            </radialGradient>
            <radialGradient id="furGrad2" cx="70%" cy="20%" r="80%">
              <stop offset="0%" stopColor="#ff655a" />
              <stop offset="40%" stopColor="#ff382b" />
              <stop offset="85%" stopColor="#d41e12" />
              <stop offset="100%" stopColor="#9e1007" />
            </radialGradient>
            <filter id="peekShadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#ff2a1d" floodOpacity="0.35" />
            </filter>
          </defs>

          <g filter="url(#peekShadow)">
            {/* Left ear/lobe */}
            <path
              d="M 30 115 C 15 90, 18 35, 46 22 C 68 12, 80 40, 78 85 Z"
              fill="url(#furGrad1)"
            />
            {/* Right ear/lobe */}
            <path
              d="M 130 115 C 145 90, 142 35, 114 22 C 92 12, 80 40, 82 85 Z"
              fill="url(#furGrad2)"
            />
            {/* Center head crown */}
            <ellipse cx="80" cy="70" rx="46" ry="42" fill="url(#furGrad1)" />

            {/* Little hair tuft bumps for fluffy texture */}
            <circle cx="48" cy="22" r="14" fill="url(#furGrad1)" opacity="0.9" />
            <circle cx="112" cy="22" r="14" fill="url(#furGrad2)" opacity="0.9" />
            <circle cx="80" cy="35" r="16" fill="url(#furGrad1)" />

            {/* White pill-shaped eyes */}
            <g className="mascot-eyes">
              {/* Left Eye */}
              <rect x="58" y="48" width="18" height="34" rx="9" fill="#ffffff" />
              {/* Right Eye */}
              <rect x="84" y="48" width="18" height="34" rx="9" fill="#ffffff" />

              {/* Left Pupil (looking playfully up/right) */}
              <rect x="63" y="52" width="10" height="18" rx="5" fill="#111113" />
              {/* Right Pupil */}
              <rect x="89" y="52" width="10" height="18" rx="5" fill="#111113" />

              {/* Eye Catchlights */}
              <circle cx="66" cy="56" r="3" fill="#ffffff" />
              <circle cx="92" cy="56" r="3" fill="#ffffff" />
              <circle cx="68" cy="64" r="1.5" fill="#ffffff" opacity="0.7" />
              <circle cx="94" cy="64" r="1.5" fill="#ffffff" opacity="0.7" />
            </g>

            {/* Tiny blush highlights on cheeks */}
            <ellipse cx="44" cy="80" rx="9" ry="6" fill="#ff1f12" opacity="0.5" />
            <ellipse cx="116" cy="80" rx="9" ry="6" fill="#ff1f12" opacity="0.5" />
          </g>
        </svg>
      </div>
    );
  }

  // 'sitting' pose (used in FAQ section)
  return (
    <div className={`mascot-container mascot-sitting ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <radialGradient id="sitGradMain" cx="40%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#ff655a" />
            <stop offset="35%" stopColor="#ff3a2d" />
            <stop offset="80%" stopColor="#d41e12" />
            <stop offset="100%" stopColor="#8f0c05" />
          </radialGradient>
          <filter id="sitGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#ff3326" floodOpacity="0.4" />
          </filter>
        </defs>

        <g filter="url(#sitGlow)">
          {/* Main body / fuzzy rounded character */}
          <path
            d="M 32 120 C 14 100, 16 50, 48 30 C 66 18, 76 34, 80 44 C 84 34, 94 18, 112 30 C 144 50, 146 100, 128 120 C 114 136, 46 136, 32 120 Z"
            fill="url(#sitGradMain)"
          />

          {/* Fluffy ears / top crests */}
          <circle cx="48" cy="34" r="22" fill="url(#sitGradMain)" />
          <circle cx="112" cy="34" r="22" fill="url(#sitGradMain)" />
          <circle cx="80" cy="46" r="20" fill="url(#sitGradMain)" />
          <ellipse cx="80" cy="88" rx="46" ry="40" fill="url(#sitGradMain)" />

          {/* White Pill Eyes */}
          <g className="mascot-eyes">
            <rect x="58" y="60" width="19" height="36" rx="9.5" fill="#ffffff" />
            <rect x="85" y="60" width="19" height="36" rx="9.5" fill="#ffffff" />

            {/* Dark Pupils looking sideways/forward */}
            <rect x="63" y="66" width="11" height="20" rx="5.5" fill="#111113" />
            <rect x="90" y="66" width="11" height="20" rx="5.5" fill="#111113" />

            {/* Sparkles / Highlights */}
            <circle cx="66" cy="71" r="3.2" fill="#ffffff" />
            <circle cx="93" cy="71" r="3.2" fill="#ffffff" />
            <circle cx="68" cy="80" r="1.5" fill="#ffffff" opacity="0.8" />
            <circle cx="95" cy="80" r="1.5" fill="#ffffff" opacity="0.8" />
          </g>

          {/* Playful paws/feet at the bottom */}
          <ellipse cx="56" cy="126" rx="14" ry="8" fill="#d41e12" />
          <ellipse cx="104" cy="126" rx="14" ry="8" fill="#d41e12" />
        </g>
      </svg>
    </div>
  );
}

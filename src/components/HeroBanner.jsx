import React from 'react';
import { Sparkles, ArrowRight, Zap, GitBranch, Layers } from 'lucide-react';
import Mascot from './Mascot.jsx';

export default function HeroBanner({ onSelectExample }) {
  return (
    <section className="hero-banner-card">
      <div className="hero-content">
        <div className="hero-tag">
          <span className="tag-dot" />
          <span>Intermediate Code Generation • Compiler Design</span>
        </div>

        <h1 className="hero-title">
          Three Address Code that does so much more.
        </h1>

        <p className="hero-subtitle">
          Break expressions into atomic steps, generate syntax trees, and inspect quadruples and triples in a modern compiler workbench.
        </p>

        {/* Feature Pills */}
        <div className="hero-pills">
          <div className="feature-pill">
            <span className="feature-dot" />
            Lexical Analysis
          </div>
          <div className="feature-pill">
            <span className="feature-dot" />
            Recursive Descent AST
          </div>
          <div className="feature-pill">
            <span className="feature-dot" />
            Quadruples (4-tuple)
          </div>
          <div className="feature-pill">
            <span className="feature-dot" />
            Triples (Index Ref)
          </div>
          <div className="feature-pill">
            <span className="feature-dot" />
            Step-by-Step Viva Guide
          </div>
        </div>
      </div>

      {/* Playful Peeking Mascot */}
      <div className="hero-mascot-wrapper">
        <Mascot pose="peek" size={140} />
      </div>
    </section>
  );
}

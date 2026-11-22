import React from 'react';
import Mascot from './Mascot.jsx';

export default function Footer({ onOpenAbout, onOpenDashboard }) {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top-row">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <Mascot pose="avatar" />
              <span className="footer-title">TAC Studio</span>
            </div>
            <p className="footer-desc">
              A high-precision Three Address Code generator & compiler visualization platform designed for students and educators.
            </p>
            <div className="footer-status-pill">
              <span className="status-live-dot" />
              <span>Offline-ready Client Application</span>
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Compiler Pipeline</h4>
              <ul>
                <li><span>Lexical Tokenizer</span></li>
                <li><span>Recursive Descent Parser</span></li>
                <li><span>Abstract Syntax Tree</span></li>
                <li><span>Intermediate Code Gen</span></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Representations</h4>
              <ul>
                <li><span>Three Address Code</span></li>
                <li><span>Quadruples (4-tuple)</span></li>
                <li><span>Triples (Index Ref)</span></li>
                <li><span>Step-by-Step Viva Trace</span></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Navigation</h4>
              <ul>
                <li><button onClick={onOpenDashboard}>Compiler Workbench</button></li>
                <li><button onClick={onOpenAbout}>Viva Questions & FAQ</button></li>
                <li><span>Keyboard Shortcuts</span></li>
                <li><span>Project Documentation</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p>© 2026 Three Address Code Generator • Compiler Design Mini-Project</p>
          <p className="footer-subtext">Built with React, Vite & Modern Compiler Logic</p>
        </div>
      </div>
    </footer>
  );
}

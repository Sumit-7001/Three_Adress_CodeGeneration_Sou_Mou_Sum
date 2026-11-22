import React from 'react';
import { Sun, Moon, History, Sparkles, BookOpen, Terminal, Code2 } from 'lucide-react';
import Mascot from './Mascot.jsx';

export default function Header({
  theme, toggleTheme, currentView, setCurrentView,
  showHistory, setShowHistory, historyCount,
}) {
  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand with Mascot Avatar */}
        <div className="brand" onClick={() => setCurrentView('dashboard')}>
          <Mascot pose="avatar" />
          <div className="brand-text">
            <span className="brand-title">TAC<span className="brand-dot">.</span>studio</span>
            <span className="brand-badge">Compiler Design</span>
          </div>
        </div>

        {/* Center Pill Navigation */}
        <nav className="nav-pill-group">
          <button
            className={`nav-pill-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <Terminal size={15} />
            <span>Workbench</span>
          </button>
          <button
            className={`nav-pill-btn ${currentView === 'about' ? 'active' : ''}`}
            onClick={() => setCurrentView('about')}
          >
            <BookOpen size={15} />
            <span>Questions & Viva</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="header-actions">
          <button
            className="action-pill-btn history-toggle"
            onClick={() => setShowHistory(!showHistory)}
            title="Recent Expressions"
          >
            <History size={16} />
            <span className="btn-label">History</span>
            {historyCount > 0 && <span className="pill-badge">{historyCount}</span>}
          </button>

          <button
            className="action-icon-pill"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </header>
  );
}

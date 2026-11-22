import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Code2, Play, Trash2, Copy, Download, Sun, Moon, History,
  BookOpen, ChevronRight, AlertTriangle, CheckCircle2, Terminal,
  FileCode, Layers, List, GitBranch, Info, Sparkles, X, Zap,
  RotateCcw, Braces, Hash
} from 'lucide-react';
import { compile } from './compiler/index.js';
import Header from './components/Header.jsx';
import HeroBanner from './components/HeroBanner.jsx';
import ExampleSelector from './components/ExampleSelector.jsx';
import WorkbenchWindow from './components/WorkbenchWindow.jsx';
import TabPanel from './components/TabPanel.jsx';
import TokenTable from './components/TokenTable.jsx';
import SyntaxTree from './components/SyntaxTree.jsx';
import QuadruplesTable from './components/QuadruplesTable.jsx';
import TriplesTable from './components/TriplesTable.jsx';
import StepExplanation from './components/StepExplanation.jsx';
import AboutTAC from './components/AboutTAC.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';
import './App.css';

// Built-in example expressions from project requirements
const EXAMPLES = [
  { label: 'Simple Assignment', expr: 'a = b + c * d' },
  { label: 'Parenthesized',     expr: 'x = (a + b) * (c - d)' },
  { label: 'Mixed Precedence',  expr: 'y = a + b * c - d' },
  { label: 'Division',          expr: 'result = (a + b) / (c - d)' },
  { label: 'Multiple Ops',      expr: 'z = a * b + c / d' },
  { label: 'With Constants',    expr: 'x = 10 + 20 * 3' },
  { label: 'Unary Minus',       expr: 'a = -b + c' },
  { label: 'No Assignment',     expr: 'a + b * c' },
  { label: 'Nested Parens',     expr: 'y = (a + b * c) / (d - e)' },
  { label: 'Complex Combo',     expr: 'z = -a + 5 * (b - 2)' },
];

function App() {
  // ---- Theme State ----
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('tac-theme') || 'dark';
  });

  // ---- Expression State ----
  const [expression, setExpression] = useState('a = b + c * d');

  // ---- Compilation Result ----
  const [result, setResult] = useState(null);

  // ---- Active Tab ----
  const [activeTab, setActiveTab] = useState('tokens');

  // ---- Current View ('dashboard' | 'about') ----
  const [currentView, setCurrentView] = useState('dashboard');

  // ---- History State ----
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tac-history') || '[]');
    } catch {
      return [];
    }
  });

  // ---- Show History Panel ----
  const [showHistory, setShowHistory] = useState(false);

  // ---- Toast State ----
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  // Persist Theme & set root attribute
  useEffect(() => {
    localStorage.setItem('tac-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial compilation on load
  useEffect(() => {
    const initial = compile('a = b + c * d');
    setResult(initial);
  }, []);

  // Toast Helper
  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Generate TAC Action
  const handleGenerate = useCallback(() => {
    if (!expression.trim()) {
      showToast('Please enter an expression first.', 'error');
      return;
    }

    const compilationResult = compile(expression.trim());
    setResult(compilationResult);

    if (compilationResult.success) {
      showToast('Three Address Code generated successfully!', 'success');
      // Update history in localStorage
      setHistory(prev => {
        const updated = [
          { expr: expression.trim(), timestamp: Date.now() },
          ...prev.filter(h => h.expr !== expression.trim()),
        ].slice(0, 25);
        localStorage.setItem('tac-history', JSON.stringify(updated));
        return updated;
      });
    } else {
      showToast(`Error: ${compilationResult.error}`, 'error');
    }
  }, [expression, showToast]);

  // Clear Expression
  const handleClear = useCallback(() => {
    setExpression('');
    setResult(null);
    showToast('Editor cleared.', 'info');
  }, [showToast]);

  // Load Example
  const handleLoadExample = useCallback((expr) => {
    setExpression(expr);
    const res = compile(expr);
    setResult(res);
    if (res.success) {
      showToast(`Loaded example: ${expr}`, 'info');
    }
  }, [showToast]);

  // Copy Generated TAC
  const handleCopy = useCallback(() => {
    if (result?.tac) {
      navigator.clipboard.writeText(result.tac.join('\n')).then(() => {
        showToast('Three Address Code copied to clipboard!', 'success');
      });
    }
  }, [result, showToast]);

  // Download TAC Output
  const handleDownload = useCallback(() => {
    if (result?.tac) {
      const content = [
        '// ============================================================',
        '// Three Address Code (TAC) Generator Output',
        '// Compiler Design Mini-Project',
        '// ============================================================',
        `// Input Expression : ${result.input}`,
        `// Instructions     : ${result.instructionCount}`,
        `// Temp Variables   : ${result.tempCount}`,
        `// Timestamp        : ${new Date().toLocaleString()}`,
        '',
        '// --- THREE ADDRESS CODE (TAC) ---',
        ...result.tac,
        '',
        '// --- QUADRUPLES (op, arg1, arg2, result) ---',
        ...result.quadruples.map(q => `(${q.op}, ${q.arg1}, ${q.arg2}, ${q.result})`),
        '',
        '// --- TRIPLES (index, op, arg1, arg2) ---',
        ...result.triples.map(t => `(${t.index})  ${t.op}  ${t.arg1}  ${t.arg2}`),
        '',
        '// --- STEP-BY-STEP EXPLANATION ---',
        ...result.explanation.map(s => `Step ${s.step}: ${s.instruction} -> ${s.explanation}`),
      ].join('\n');

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'three_address_code.txt';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported to three_address_code.txt', 'success');
    }
  }, [result, showToast]);

  // Keyboard shortcut: Ctrl + Enter / ⌘ + Enter
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleGenerate]);

  // History item selection
  const handleHistoryClick = useCallback((expr) => {
    setExpression(expr);
    const res = compile(expr);
    setResult(res);
    setShowHistory(false);
    showToast(`Restored: ${expr}`, 'info');
  }, [showToast]);

  // Clear history
  const handleClearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('tac-history');
    showToast('Expression history cleared.', 'info');
  }, [showToast]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <div className={`app-root ${theme}`}>
      {/* Sleek Floating Header */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        currentView={currentView}
        setCurrentView={setCurrentView}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        historyCount={history.length}
      />

      {/* Toast Notification Container */}
      <div className="toast-portal">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>

      {/* History Flyout Drawer */}
      {showHistory && (
        <div className="history-backdrop" onClick={() => setShowHistory(false)}>
          <div className="history-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title">
                <History size={18} />
                <span>Recent Expressions</span>
              </div>
              <div className="drawer-actions">
                {history.length > 0 && (
                  <button className="drawer-btn-icon" onClick={handleClearHistory} title="Clear all history">
                    <Trash2 size={15} />
                  </button>
                )}
                <button className="drawer-btn-icon" onClick={() => setShowHistory(false)}>
                  <X size={17} />
                </button>
              </div>
            </div>

            <div className="drawer-body">
              {history.length === 0 ? (
                <div className="drawer-empty">
                  <History size={36} />
                  <p>No recent history</p>
                  <span>Expressions you generate will be saved here automatically.</span>
                </div>
              ) : (
                <div className="drawer-list">
                  {history.map((item, idx) => (
                    <button
                      key={idx}
                      className="history-pill-card"
                      onClick={() => handleHistoryClick(item.expr)}
                    >
                      <code className="history-expr-code">{item.expr}</code>
                      <span className="history-timestamp">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="main-viewport">
        {currentView === 'about' ? (
          <AboutTAC
            onBack={() => setCurrentView('dashboard')}
            onTestExpression={() => {
              setCurrentView('dashboard');
              handleLoadExample('x = (a + b) * (c - d)');
            }}
          />
        ) : (
          <div className="dashboard-content-stack">
            {/* Hero Banner with Peeking Red Mascot */}
            <HeroBanner onSelectExample={handleLoadExample} />

            {/* Quick Example Pills Bar */}
            <ExampleSelector
              examples={EXAMPLES}
              onSelect={handleLoadExample}
            />

            {/* macOS-style Workbench Window (Editor + TAC Output) */}
            <WorkbenchWindow
              expression={expression}
              setExpression={setExpression}
              onGenerate={handleGenerate}
              onClear={handleClear}
              result={result}
              onCopy={handleCopy}
              onDownload={handleDownload}
            />

            {/* Bottom Analysis Tabs (Tokens, AST, Quadruples, Triples, Steps) */}
            {result?.success && (
              <TabPanel activeTab={activeTab} setActiveTab={setActiveTab}>
                {activeTab === 'tokens' && <TokenTable tokens={result.tokens} />}
                {activeTab === 'ast' && <SyntaxTree ast={result.ast} />}
                {activeTab === 'quadruples' && <QuadruplesTable quadruples={result.quadruples} />}
                {activeTab === 'triples' && <TriplesTable triples={result.triples} />}
                {activeTab === 'steps' && <StepExplanation steps={result.explanation} />}
              </TabPanel>
            )}

            {/* FAQ & Educational Section at the bottom */}
            <AboutTAC
              onBack={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              onTestExpression={() => handleLoadExample('result = (a + b) / (c - d)')}
            />
          </div>
        )}
      </main>

      {/* Modern Footer */}
      <Footer
        onOpenDashboard={() => {
          setCurrentView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAbout={() => {
          setCurrentView('about');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default App;

import React, { useRef, useEffect, useState } from 'react';
import { Play, Trash2, Zap, Sparkles, Wand2, Hash, Layers } from 'lucide-react';

export default function Editor({
  expression,
  setExpression,
  onGenerate,
  onClear,
  liveMode,
  setLiveMode,
  tokenCount = 0,
}) {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const [lineCount, setLineCount] = useState(1);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Update line count
  useEffect(() => {
    const lines = (expression || '').split('\n').length;
    setLineCount(Math.max(lines, 1));
  }, [expression]);

  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Track cursor position
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value.substring(0, textareaRef.current.selectionStart);
    const lines = text.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      setExpression(
        expression.substring(0, start) + '  ' + expression.substring(end)
      );
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Quick insert symbol at cursor
  const handleInsertSymbol = (symbol) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const val = expression || '';
    const needsSpaces = ['+', '-', '*', '/', '^', '%', '='].includes(symbol);
    const insertText = needsSpaces ? ` ${symbol} ` : symbol;

    const nextExpr = val.substring(0, start) + insertText + val.substring(end);
    setExpression(nextExpr);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const nextPos = start + insertText.length;
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = nextPos;
        updateCursorPosition();
      }
    }, 10);
  };

  // Prettify code / add standard spacing
  const handlePrettify = () => {
    if (!expression) return;
    const lines = expression.split('\n').map(line => {
      // Keep comments untouched
      if (line.trim().startsWith('//') || line.trim().startsWith('#')) return line;
      // Normalize spaces around operators
      return line
        .replace(/\s*([=+\-*/%^]|==|!=|<=|>=|<|>)\s*/g, ' $1 ')
        .replace(/\s+/g, ' ')
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')')
        .replace(/;\s*/g, ';\n')
        .trim();
    });
    setExpression(lines.join('\n'));
  };

  const quickOperators = [
    { label: '=', title: 'Assignment' },
    { label: '+', title: 'Add' },
    { label: '-', title: 'Subtract' },
    { label: '*', title: 'Multiply' },
    { label: '/', title: 'Divide' },
    { label: '^', title: 'Power' },
    { label: '%', title: 'Modulo' },
    { label: '(', title: 'Open Paren' },
    { label: ')', title: 'Close Paren' },
    { label: ';', title: 'Semicolon' },
  ];

  return (
    <div className="workbench-pane editor-pane">
      {/* Pane Header */}
      <div className="pane-subheader">
        <div className="pane-title-group">
          <span className="pane-file-dot" />
          <span className="pane-title">Source Expression</span>
        </div>
        <div className="pane-actions-right">
          {/* Live Evaluation Mode Toggle */}
          <button
            className={`live-mode-toggle ${liveMode ? 'active' : ''}`}
            onClick={() => setLiveMode(!liveMode)}
            title="Automatically recompile as you type"
          >
            <span className="live-pulse-dot" />
            <span className="live-label">LIVE</span>
          </button>

          <span className="shortcut-badge">
            <code>⌘ / Ctrl + Enter</code>
          </span>
        </div>
      </div>

      {/* Quick Insert Operator Palette */}
      <div className="quick-symbol-bar">
        <span className="quick-bar-title">Insert:</span>
        <div className="symbol-chips-wrapper">
          {quickOperators.map(op => (
            <button
              key={op.label}
              type="button"
              className="symbol-chip"
              onClick={() => handleInsertSymbol(op.label)}
              title={op.title}
            >
              {op.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="format-code-btn"
          onClick={handlePrettify}
          title="Format and standardize spacing"
        >
          <Wand2 size={12} />
          <span>Prettify</span>
        </button>
      </div>

      {/* Textarea Area */}
      <div className="code-editor-area">
        <div className="line-numbers-col" ref={lineNumbersRef}>
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="num-row">{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="code-textarea"
          value={expression}
          onChange={(e) => {
            setExpression(e.target.value);
            updateCursorPosition();
          }}
          onKeyUp={updateCursorPosition}
          onClick={updateCursorPosition}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder="Enter an expression to generate Three Address Code...&#10;&#10;Examples:&#10;  z = a * b + c / d&#10;  x = (a + b) * (c - d)&#10;  y = a ^ 2 + b ^ 2&#10;  a = b * c + b * c  (CSE optimization)&#10;&#10;Supports comments (//) and multi-statements (; or newlines)"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>

      {/* Editor Status & Action Bar */}
      <div className="pane-footer-bar">
        <div className="editor-footer-left">
          <button className="primary-pill-btn" onClick={onGenerate}>
            <Play size={15} fill="currentColor" />
            <span>Generate TAC</span>
          </button>
          <button className="secondary-pill-btn" onClick={onClear} title="Clear editor">
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        </div>

        {/* Editor Cursor & Meta Counters */}
        <div className="editor-meta-stats">
          <span className="meta-stat-item">
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span className="meta-divider">•</span>
          <span className="meta-stat-item">
            {(expression || '').length} chars
          </span>
          {tokenCount > 0 && (
            <>
              <span className="meta-divider">•</span>
              <span className="meta-stat-item highlight-cyan">
                {tokenCount} tokens
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useEffect, useState } from 'react';
import { Play, Trash2, Zap, CornerDownLeft } from 'lucide-react';

export default function Editor({ expression, setExpression, onGenerate, onClear }) {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const [lineCount, setLineCount] = useState(1);

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

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      setExpression(
        expression.substring(0, start) + '  ' + expression.substring(end)
      );
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="workbench-pane editor-pane">
      <div className="pane-subheader">
        <div className="pane-title-group">
          <span className="pane-file-dot" />
          <span className="pane-title">Source Expression</span>
        </div>
        <span className="shortcut-badge">
          <code>⌘ / Ctrl + Enter</code>
        </span>
      </div>

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
          onChange={(e) => setExpression(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder="Enter an expression to generate Three Address Code...&#10;&#10;Examples:&#10;  a = b + c * d&#10;  x = (a + b) * (c - d)&#10;  y = -a + 5 * (b - 2)"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>

      <div className="pane-footer-bar">
        <button className="primary-pill-btn" onClick={onGenerate}>
          <Play size={15} fill="currentColor" />
          <span>Generate TAC</span>
        </button>
        <button className="secondary-pill-btn" onClick={onClear}>
          <Trash2 size={14} />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
}

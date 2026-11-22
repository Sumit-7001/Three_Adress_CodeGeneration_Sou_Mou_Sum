import React from 'react';
import {
  Copy, Download, CheckCircle2, AlertTriangle, FileCode,
  Layers, Terminal, Check
} from 'lucide-react';

export default function OutputPanel({ result, onCopy, onDownload }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyClick = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!result) {
    return (
      <div className="workbench-pane output-pane">
        <div className="pane-subheader">
          <div className="pane-title-group">
            <span className="pane-file-dot output" />
            <span className="pane-title">Generated TAC</span>
          </div>
          <span className="status-pill idle">Awaiting Input</span>
        </div>
        <div className="output-empty-state">
          <div className="empty-icon-ring">
            <Terminal size={32} />
          </div>
          <h4>No Code Generated</h4>
          <p>Type or select an expression on the left and click <strong>Generate TAC</strong>.</p>
        </div>
      </div>
    );
  }

  if (!result.success) {
    return (
      <div className="workbench-pane output-pane">
        <div className="pane-subheader">
          <div className="pane-title-group">
            <span className="pane-file-dot error" />
            <span className="pane-title">Compiler Diagnostics</span>
          </div>
          <span className="status-pill error">
            <AlertTriangle size={12} /> Syntax Error
          </span>
        </div>
        <div className="output-error-container">
          <div className="error-pill-card">
            <div className="error-header">
              <AlertTriangle size={18} />
              <span>Compilation Failed {result.phase ? `in ${result.phase}` : ''}</span>
            </div>
            <p className="error-message">{result.error}</p>
            <div className="error-tip">
              Tip: Verify matched parentheses, operator operands, and valid identifier names.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workbench-pane output-pane">
      <div className="pane-subheader">
        <div className="pane-title-group">
          <span className="pane-file-dot success" />
          <span className="pane-title">Three Address Code</span>
        </div>
        <div className="output-actions-group">
          <span className="status-pill success">
            <CheckCircle2 size={12} /> Valid AST
          </span>
          <button className="icon-pill-btn" onClick={handleCopyClick} title="Copy Three Address Code">
            {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button className="icon-pill-btn" onClick={onDownload} title="Download TAC as TXT">
            <Download size={14} />
            <span>TXT</span>
          </button>
        </div>
      </div>

      <div className="tac-code-area">
        <div className="tac-code-lines">
          {result.tac.map((line, idx) => (
            <div key={idx} className="tac-code-row">
              <span className="row-num">{idx + 1}</span>
              <span className="row-content">{formatTACLine(line)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pane-footer-stats">
        <div className="stat-pill">
          <span className="stat-label">Instructions</span>
          <span className="stat-value">{result.instructionCount}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Temporaries</span>
          <span className="stat-value red-accent">{result.tempCount}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Format</span>
          <span className="stat-value">x = y op z</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Highlights TAC tokens: temporaries (t1, t2), variables, operators, and literals.
 */
function formatTACLine(line) {
  const match = line.match(/^(\S+)\s*=\s*(.+)$/);
  if (!match) return line;

  const result = match[1];
  const rhs = match[2];

  const elements = [];
  const isTemp = (str) => /^t\d+$/.test(str);
  const isNum = (str) => /^\d+(\.\d+)?$/.test(str);

  // Result variable
  elements.push(
    <span key="res" className={isTemp(result) ? 'token-temp' : 'token-var'}>
      {result}
    </span>
  );

  elements.push(<span key="eq" className="token-assign"> = </span>);

  // Check binary op: arg1 op arg2
  const binMatch = rhs.match(/^(\S+)\s+([+\-*/])\s+(\S+)$/);
  if (binMatch) {
    const [, a1, op, a2] = binMatch;
    elements.push(
      <span key="a1" className={isTemp(a1) ? 'token-temp' : isNum(a1) ? 'token-num' : 'token-var'}>
        {a1}
      </span>
    );
    elements.push(<span key="op" className="token-op"> {op} </span>);
    elements.push(
      <span key="a2" className={isTemp(a2) ? 'token-temp' : isNum(a2) ? 'token-num' : 'token-var'}>
        {a2}
      </span>
    );
  } else if (rhs.startsWith('-')) {
    // Unary minus: -operand
    const operand = rhs.slice(1);
    elements.push(<span key="neg" className="token-op">-</span>);
    elements.push(
      <span key="opnd" className={isTemp(operand) ? 'token-temp' : isNum(operand) ? 'token-num' : 'token-var'}>
        {operand}
      </span>
    );
  } else {
    // Simple assignment: variable = value
    elements.push(
      <span key="val" className={isTemp(rhs) ? 'token-temp' : isNum(rhs) ? 'token-num' : 'token-var'}>
        {rhs}
      </span>
    );
  }

  return elements;
}

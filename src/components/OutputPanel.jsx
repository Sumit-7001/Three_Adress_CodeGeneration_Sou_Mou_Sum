import React, { useState } from 'react';
import {
  Copy, Download, CheckCircle2, AlertTriangle, FileCode,
  Layers, Terminal, Check, Sparkles, Zap, FileJson, Table
} from 'lucide-react';

export default function OutputPanel({ result, onCopy, onDownload }) {
  const [copied, setCopied] = useState(false);
  const [tacMode, setTacMode] = useState('standard'); // 'standard' | 'optimized'
  const [copiedFormat, setCopiedFormat] = useState(null);

  const handleCopyClick = (format = 'txt') => {
    if (!result) return;

    if (format === 'txt') {
      const activeTac = tacMode === 'optimized' && result.optimized?.tac
        ? result.optimized.tac
        : result.tac;
      navigator.clipboard.writeText(activeTac.join('\n')).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else if (format === 'markdown') {
      const activeInstructions = tacMode === 'optimized' && result.optimized?.instructions
        ? result.optimized.instructions
        : result.instructions;

      const mdTable = [
        '| # | TAC Instruction | Operator | Arg1 | Arg2 | Result |',
        '|---|-----------------|----------|------|------|--------|',
        ...activeInstructions.map((instr, idx) => {
          const formatted = instr.op === '='
            ? `${instr.result} = ${instr.arg1}`
            : instr.op === 'neg'
            ? `${instr.result} = -${instr.arg1}`
            : `${instr.result} = ${instr.arg1} ${instr.op} ${instr.arg2}`;
          return `| ${idx + 1} | \`${formatted}\` | \`${instr.op}\` | \`${instr.arg1 || '—'}\` | \`${instr.arg2 || '—'}\` | \`${instr.result}\` |`;
        }),
      ].join('\n');

      navigator.clipboard.writeText(mdTable).then(() => {
        setCopiedFormat('markdown');
        setTimeout(() => setCopiedFormat(null), 2000);
      });
    }
  };

  const handleDownloadJSON = () => {
    if (!result) return;
    const jsonStr = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tac-compilation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
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

  const activeTac = tacMode === 'optimized' && result.optimized?.tac
    ? result.optimized.tac
    : result.tac;

  const hasOptimization = result.optimized?.stats?.savedInstructions > 0 || result.optimized?.stats?.foldedCount > 0;

  return (
    <div className="workbench-pane output-pane">
      {/* Pane Header */}
      <div className="pane-subheader">
        <div className="pane-title-group">
          <span className="pane-file-dot success" />
          <span className="pane-title">Three Address Code</span>
        </div>

        <div className="output-actions-group">
          {/* Mode Switcher: Standard vs Optimized */}
          <div className="tac-mode-selector">
            <button
              className={`mode-pill ${tacMode === 'standard' ? 'active' : ''}`}
              onClick={() => setTacMode('standard')}
              title="Standard Three Address Code"
            >
              Standard
            </button>
            <button
              className={`mode-pill ${tacMode === 'optimized' ? 'active' : ''}`}
              onClick={() => setTacMode('optimized')}
              title="Optimized TAC with Common Subexpression Elimination and Constant Folding"
            >
              <Zap size={12} />
              <span>Optimized</span>
              {hasOptimization && <span className="opt-badge-dot" />}
            </button>
          </div>

          <button className="icon-pill-btn" onClick={() => handleCopyClick('txt')} title="Copy Three Address Code">
            {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button className="icon-pill-btn" onClick={() => handleCopyClick('markdown')} title="Copy as Markdown table">
            {copiedFormat === 'markdown' ? <Check size={14} className="text-green" /> : <Table size={14} />}
            <span>MD</span>
          </button>

          <button className="icon-pill-btn" onClick={onDownload} title="Download TAC as text file">
            <Download size={14} />
            <span>TXT</span>
          </button>

          <button className="icon-pill-btn" onClick={handleDownloadJSON} title="Export full compiler JSON">
            <FileJson size={14} />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Optimization Banner if in optimized mode */}
      {tacMode === 'optimized' && (
        <div className="opt-status-banner">
          <Zap size={14} className="opt-bolt-icon" />
          <span>
            {hasOptimization
              ? `Optimization applied: ${result.optimized.stats.savedInstructions} redundant instructions saved, ${result.optimized.stats.foldedCount} constants folded.`
              : 'Expression is already optimal. No redundant subexpressions detected.'}
          </span>
        </div>
      )}

      {/* Code Display Area */}
      <div className="tac-code-area">
        <div className="tac-code-lines">
          {activeTac.map((line, idx) => (
            <div key={idx} className="tac-code-row">
              <span className="row-num">{idx + 1}</span>
              <span className="row-content">{formatTACLine(line)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Meta Statistics */}
      <div className="pane-footer-stats">
        <div className="stat-pill">
          <span className="stat-label">Instructions</span>
          <span className="stat-value">{activeTac.length}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Temporaries</span>
          <span className="stat-value red-accent">{result.tempCount}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Format</span>
          <span className="stat-value">x = y op z</span>
        </div>
        {hasOptimization && (
          <div className="stat-pill opt-benefit-pill">
            <span className="stat-label">Efficiency</span>
            <span className="stat-value green-accent">
              +{Math.round((result.optimized.stats.savedInstructions / result.instructions.length) * 100)}% CSE
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Highlights TAC tokens: temporaries (t1, t2), user variables, operators, and literals.
 */
function formatTACLine(line) {
  const match = line.match(/^(\S+)\s*=\s*(.+)$/);
  if (!match) return line;

  const resultVar = match[1];
  const rhs = match[2];

  const elements = [];
  const isTemp = (str) => /^t\d+$/.test(str);
  const isNum = (str) => /^\d+(\.\d+)?$/.test(str);

  // Result variable
  elements.push(
    <span key="res" className={isTemp(resultVar) ? 'token-temp' : 'token-var'}>
      {resultVar}
    </span>
  );

  elements.push(<span key="eq" className="token-assign"> = </span>);

  // Check binary op: arg1 op arg2
  const binMatch = rhs.match(/^(\S+)\s+([+\-*/%^]|==|!=|<=|>=|<|>)\s+(\S+)$/);
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

import React from 'react';
import Editor from './Editor.jsx';
import OutputPanel from './OutputPanel.jsx';

/**
 * WorkbenchWindow — A macOS-inspired dark window container
 * Matching the exact visual aesthetic with editor and generated TAC output.
 */
export default function WorkbenchWindow({
  expression, setExpression, onGenerate, onClear,
  result, onCopy, onDownload,
  liveMode, setLiveMode,
}) {
  return (
    <div className="macos-window-shell">
      {/* Window Title Bar with Traffic Light Dots */}
      <div className="window-titlebar">
        <div className="traffic-lights">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <div className="window-title">
          <span className="title-text">tac-generator — compiler-workbench</span>
        </div>
        <div className="window-meta">
          <span className="window-badge">LL(1) Recursive Descent • CSE Optimizer</span>
        </div>
      </div>

      {/* Main Split Body: Editor & Output */}
      <div className="window-body-split">
        <Editor
          expression={expression}
          setExpression={setExpression}
          onGenerate={onGenerate}
          onClear={onClear}
          liveMode={liveMode}
          setLiveMode={setLiveMode}
          tokenCount={result?.tokens?.length || 0}
        />
        <div className="split-divider" />
        <OutputPanel
          result={result}
          onCopy={onCopy}
          onDownload={onDownload}
        />
      </div>
    </div>
  );
}

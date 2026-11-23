import React, { useState, useEffect } from 'react';
import {
  Sparkles, CornerDownRight, Play, Pause, RotateCcw,
  SkipForward, SkipBack, Cpu, Sliders, CheckCircle2, Zap
} from 'lucide-react';
import { simulateTAC } from '../compiler/simulator.js';

export default function StepExplanation({ steps, instructions, variables = [] }) {
  const [activeTab, setActiveTab] = useState('walkthrough'); // 'walkthrough' | 'simulator'

  // Simulator variable state: default e.g. a=2, b=3, c=4, d=2
  const [varValues, setVarValues] = useState(() => {
    const initial = {};
    const defaults = [2, 3, 4, 2, 5, 6, 8, 10];
    variables.forEach((v, idx) => {
      initial[v] = defaults[idx % defaults.length];
    });
    return initial;
  });

  // Simulator execution progress
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync variables if input changes
  useEffect(() => {
    setVarValues(prev => {
      const next = { ...prev };
      const defaults = [2, 3, 4, 2, 5, 6, 8, 10];
      variables.forEach((v, idx) => {
        if (next[v] === undefined) {
          next[v] = defaults[idx % defaults.length];
        }
      });
      return next;
    });
    setCurrentStepIdx(0);
    setIsPlaying(false);
  }, [variables]);

  // Run simulation trace
  const simulationResult = React.useMemo(() => {
    if (!instructions || instructions.length === 0) return { steps: [], finalEnv: {} };
    return simulateTAC(instructions, varValues);
  }, [instructions, varValues]);

  const simSteps = simulationResult.steps;
  const activeSimStep = simSteps[currentStepIdx] || simSteps[simSteps.length - 1];

  // Auto-play interval
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIdx(curr => {
          if (curr >= simSteps.length - 1) {
            setIsPlaying(false);
            return curr;
          }
          return curr + 1;
        });
      }, 1200);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, simSteps.length]);

  if (!steps || steps.length === 0) {
    return (
      <div className="tab-empty-box">
        <Sparkles size={28} />
        <p>No step explanation available</p>
      </div>
    );
  }

  return (
    <div className="analysis-card-inner">
      {/* Top Bar with Mode Switcher */}
      <div className="table-top-bar">
        <div>
          <h3 className="section-card-title">Code Generation Walkthrough & Live Simulator</h3>
          <p className="section-card-subtitle">
            Inspect the step-by-step post-order decomposition or execute instructions live with custom variable values.
          </p>
        </div>

        <div className="table-actions-header">
          <div className="view-mode-toggle">
            <button
              className={`mode-btn ${activeTab === 'walkthrough' ? 'active' : ''}`}
              onClick={() => setActiveTab('walkthrough')}
              title="Step-by-step narrative walkthrough"
            >
              <Sparkles size={13} />
              <span>Walkthrough</span>
            </button>
            <button
              className={`mode-btn ${activeTab === 'simulator' ? 'active' : ''}`}
              onClick={() => setActiveTab('simulator')}
              title="Interactive live value execution simulator"
            >
              <Cpu size={13} />
              <span>Live Simulator</span>
            </button>
          </div>
          <span className="count-pill">{steps.length} Steps</span>
        </div>
      </div>

      {activeTab === 'walkthrough' ? (
        /* Walkthrough Narrative Cards */
        <div className="steps-flow-grid">
          {steps.map((step, idx) => (
            <div key={idx} className="step-flow-card">
              <div className="step-counter-badge">{step.step}</div>
              <div className="step-content-area">
                <div className="step-code-pill">
                  <code>{step.instruction}</code>
                </div>
                <div className="step-prose">
                  <CornerDownRight size={14} className="step-arrow-icon" />
                  <p>{step.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Live Execution Simulator */
        <div className="simulator-workbench">
          {/* Variable Inputs Palette */}
          {variables.length > 0 && (
            <div className="sim-variables-panel">
              <div className="sim-panel-header">
                <Sliders size={14} />
                <span>Variable Register Inputs:</span>
              </div>
              <div className="sim-var-inputs-list">
                {variables.map(v => (
                  <div key={v} className="sim-var-input-group">
                    <label className="sim-var-label">{v} =</label>
                    <input
                      type="number"
                      className="sim-number-input"
                      value={varValues[v] ?? 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setVarValues(prev => ({ ...prev, [v]: val }));
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Player Controls Bar */}
          <div className="sim-controls-bar">
            <div className="sim-playback-group">
              <button
                className="sim-ctrl-btn"
                onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
                disabled={currentStepIdx === 0}
                title="Previous step"
              >
                <SkipBack size={15} />
              </button>
              <button
                className="sim-ctrl-btn highlight-btn"
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pause' : 'Play walkthrough'}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
                <span>{isPlaying ? 'Pause' : 'Run'}</span>
              </button>
              <button
                className="sim-ctrl-btn"
                onClick={() => setCurrentStepIdx(prev => Math.min(simSteps.length - 1, prev + 1))}
                disabled={currentStepIdx >= simSteps.length - 1}
                title="Next step"
              >
                <SkipForward size={15} />
              </button>
              <button
                className="sim-ctrl-btn"
                onClick={() => {
                  setCurrentStepIdx(0);
                  setIsPlaying(false);
                }}
                title="Reset simulation"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            <div className="sim-step-progress">
              <span>
                Step {currentStepIdx + 1} of {simSteps.length}
              </span>
              <div className="sim-progress-track">
                <div
                  className="sim-progress-bar"
                  style={{
                    width: `${((currentStepIdx + 1) / simSteps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Active Step Calculation Card */}
          {activeSimStep && (
            <div className="sim-active-card">
              <div className="active-card-top">
                <span className="active-step-badge">Executing Instruction #{activeSimStep.stepNumber}</span>
                <code className="active-tac-code">
                  {formatInstrString(activeSimStep.instruction)}
                </code>
              </div>
              <div className="active-calc-banner">
                <Zap size={16} className="calc-bolt" />
                <span className="calc-text">{activeSimStep.calculationText}</span>
              </div>
            </div>
          )}

          {/* Environment Register State Table */}
          <div className="sim-env-card">
            <h4 className="sim-env-title">Live Memory / Register Environment</h4>
            <div className="sim-env-chips-grid">
              {Object.entries(activeSimStep?.environmentSnapshot || {}).map(([key, val]) => {
                const isJustChanged = activeSimStep?.resultVar === key;
                const isTemp = key.startsWith('t');
                return (
                  <div
                    key={key}
                    className={`env-chip ${isJustChanged ? 'just-updated' : ''} ${isTemp ? 'temp-chip' : 'var-chip'}`}
                  >
                    <span className="chip-key">{key}</span>
                    <span className="chip-equals">=</span>
                    <span className="chip-val">{typeof val === 'number' ? val : String(val)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatInstrString(instr) {
  if (!instr) return '';
  if (instr.op === '=') return `${instr.result} = ${instr.arg1}`;
  if (instr.op === 'neg') return `${instr.result} = -${instr.arg1}`;
  return `${instr.result} = ${instr.arg1} ${instr.op} ${instr.arg2}`;
}

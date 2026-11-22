import React from 'react';
import { Sparkles, ArrowRight, CornerDownRight } from 'lucide-react';

export default function StepExplanation({ steps }) {
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
      <div className="table-top-bar">
        <div>
          <h3 className="section-card-title">Step-by-Step Code Generation Walkthrough</h3>
          <p className="section-card-subtitle">Detailed narrative of how each TAC instruction computes operands and allocates temporaries.</p>
        </div>
        <span className="count-pill">{steps.length} Steps</span>
      </div>

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
    </div>
  );
}

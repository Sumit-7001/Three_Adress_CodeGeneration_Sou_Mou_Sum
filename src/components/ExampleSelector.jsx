import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ExampleSelector({ examples, onSelect }) {
  return (
    <div className="example-bar">
      <div className="example-bar-label">
        <Sparkles size={14} />
        <span>Quick Expressions:</span>
      </div>
      <div className="example-pills-scroll">
        {examples.map((ex, idx) => (
          <button
            key={idx}
            className="example-pill"
            onClick={() => onSelect(ex.expr)}
            title={ex.label}
          >
            <code>{ex.expr}</code>
          </button>
        ))}
      </div>
    </div>
  );
}

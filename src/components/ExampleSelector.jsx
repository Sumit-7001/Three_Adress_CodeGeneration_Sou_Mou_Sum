import React, { useState } from 'react';
import { Sparkles, Zap, Layers, Bookmark } from 'lucide-react';

export default function ExampleSelector({ examples, onSelect }) {
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Standard', 'Optimization', 'Advanced', 'Multi-Statement'];

  const filtered = examples.filter(ex => {
    if (filter === 'All') return true;
    return ex.category === filter;
  });

  return (
    <div className="example-bar">
      <div className="example-bar-header">
        <div className="example-bar-label">
          <Sparkles size={14} />
          <span>Quick Expressions:</span>
        </div>

        <div className="example-cat-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`example-cat-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="example-pills-scroll">
        {filtered.map((ex, idx) => (
          <button
            key={idx}
            className="example-pill"
            onClick={() => onSelect(ex.expr)}
            title={`${ex.label}: ${ex.expr}`}
          >
            <span className="ex-pill-label">{ex.label}</span>
            <code className="ex-pill-code">{ex.expr}</code>
          </button>
        ))}
      </div>
    </div>
  );
}

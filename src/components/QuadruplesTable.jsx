import React from 'react';
import { Layers } from 'lucide-react';

export default function QuadruplesTable({ quadruples }) {
  if (!quadruples || quadruples.length === 0) {
    return (
      <div className="tab-empty-box">
        <Layers size={28} />
        <p>No quadruples to display</p>
      </div>
    );
  }

  return (
    <div className="analysis-card-inner">
      <div className="table-top-bar">
        <div>
          <h3 className="section-card-title">Quadruples Intermediate Representation</h3>
          <p className="section-card-subtitle">4-tuple format: <code>(operator, argument 1, argument 2, result)</code> with explicit temporary results.</p>
        </div>
        <span className="count-pill">{quadruples.length} Quadruples</span>
      </div>

      <div className="table-responsive-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Index</th>
              <th>Operator (op)</th>
              <th>Argument 1</th>
              <th>Argument 2</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {quadruples.map((quad, idx) => (
              <tr key={idx}>
                <td className="index-cell">({quad.index})</td>
                <td><code className="cell-op">{quad.op}</code></td>
                <td><code className={getValClass(quad.arg1)}>{quad.arg1}</code></td>
                <td><code className={getValClass(quad.arg2)}>{quad.arg2}</code></td>
                <td><code className={getValClass(quad.result)}>{quad.result}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getValClass(val) {
  if (val === '—') return 'val-dash';
  if (typeof val === 'string' && val.match(/^t\d+$/)) return 'val-temp';
  if (typeof val === 'string' && val.match(/^\d/)) return 'val-num';
  return 'val-var';
}

import React from 'react';
import { Hash } from 'lucide-react';

export default function TriplesTable({ triples }) {
  if (!triples || triples.length === 0) {
    return (
      <div className="tab-empty-box">
        <Hash size={28} />
        <p>No triples to display</p>
      </div>
    );
  }

  return (
    <div className="analysis-card-inner">
      <div className="table-top-bar">
        <div>
          <h3 className="section-card-title">Triples Intermediate Representation</h3>
          <p className="section-card-subtitle">3-tuple format: <code>(operator, argument 1, argument 2)</code> referencing prior instruction pointers.</p>
        </div>
        <span className="count-pill">{triples.length} Triples</span>
      </div>

      <div className="table-responsive-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Instruction Index</th>
              <th>Operator (op)</th>
              <th>Argument 1</th>
              <th>Argument 2</th>
            </tr>
          </thead>
          <tbody>
            {triples.map((triple, idx) => (
              <tr key={idx}>
                <td className="index-cell">({triple.index})</td>
                <td><code className="cell-op">{triple.op}</code></td>
                <td><code className={getTripleClass(triple.arg1)}>{triple.arg1}</code></td>
                <td><code className={getTripleClass(triple.arg2)}>{triple.arg2}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getTripleClass(arg) {
  if (arg === '—') return 'val-dash';
  if (typeof arg === 'string' && /^\(\d+\)$/.test(arg)) return 'val-ref';
  if (typeof arg === 'string' && /^\d/.test(arg)) return 'val-num';
  return 'val-var';
}

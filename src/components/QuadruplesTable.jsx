import React, { useState } from 'react';
import { Layers, Copy, Check, Table, Search } from 'lucide-react';

export default function QuadruplesTable({ quadruples }) {
  const [copiedFormat, setCopiedFormat] = useState(null);
  const [search, setSearch] = useState('');

  if (!quadruples || quadruples.length === 0) {
    return (
      <div className="tab-empty-box">
        <Layers size={28} />
        <p>No quadruples to display</p>
      </div>
    );
  }

  const filtered = quadruples.filter(q =>
    q.op.toLowerCase().includes(search.toLowerCase()) ||
    String(q.arg1).toLowerCase().includes(search.toLowerCase()) ||
    String(q.arg2).toLowerCase().includes(search.toLowerCase()) ||
    String(q.result).toLowerCase().includes(search.toLowerCase()) ||
    String(q.index).includes(search)
  );

  const handleCopy = (format = 'md') => {
    let content = '';
    if (format === 'md') {
      content = [
        '| Index | Operator (op) | Argument 1 | Argument 2 | Result |',
        '|-------|---------------|------------|------------|--------|',
        ...quadruples.map(q => `| (${q.index}) | \`${q.op}\` | \`${q.arg1}\` | \`${q.arg2}\` | \`${q.result}\` |`),
      ].join('\n');
    } else {
      content = [
        'Index,Operator,Arg1,Arg2,Result',
        ...quadruples.map(q => `${q.index},${q.op},${q.arg1},${q.arg2},${q.result}`),
      ].join('\n');
    }

    navigator.clipboard.writeText(content).then(() => {
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    });
  };

  return (
    <div className="analysis-card-inner">
      <div className="table-top-bar">
        <div>
          <h3 className="section-card-title">Quadruples Intermediate Representation</h3>
          <p className="section-card-subtitle">
            4-tuple format: <code>(operator, argument 1, argument 2, result)</code> with explicit temporary results.
          </p>
        </div>

        <div className="table-actions-header">
          <button
            className="icon-pill-btn"
            onClick={() => handleCopy('md')}
            title="Copy as Markdown table"
          >
            {copiedFormat === 'md' ? <Check size={13} className="text-green" /> : <Table size={13} />}
            <span>MD</span>
          </button>
          <button
            className="icon-pill-btn"
            onClick={() => handleCopy('csv')}
            title="Copy as CSV table"
          >
            {copiedFormat === 'csv' ? <Check size={13} className="text-green" /> : <Copy size={13} />}
            <span>CSV</span>
          </button>
          <span className="count-pill">{quadruples.length} Quadruples</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="table-filter-bar">
        <div className="filter-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="table-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quadruples by op, args, or result..."
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>
              ×
            </button>
          )}
        </div>
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
            {filtered.map((quad, idx) => (
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

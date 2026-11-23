import React, { useState } from 'react';
import { Hash, Copy, Check, Table, Search, ArrowRight } from 'lucide-react';

export default function TriplesTable({ triples, indirectTriples }) {
  const [copiedFormat, setCopiedFormat] = useState(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('standard'); // 'standard' | 'indirect'

  if (!triples || triples.length === 0) {
    return (
      <div className="tab-empty-box">
        <Hash size={28} />
        <p>No triples to display</p>
      </div>
    );
  }

  const filteredTriples = triples.filter(t =>
    t.op.toLowerCase().includes(search.toLowerCase()) ||
    String(t.arg1).toLowerCase().includes(search.toLowerCase()) ||
    String(t.arg2).toLowerCase().includes(search.toLowerCase()) ||
    String(t.index).includes(search)
  );

  const handleCopy = (format = 'md') => {
    let content = '';
    if (format === 'md') {
      content = [
        '| Index | Operator (op) | Argument 1 | Argument 2 |',
        '|-------|---------------|------------|------------|',
        ...triples.map(t => `| (${t.index}) | \`${t.op}\` | \`${t.arg1}\` | \`${t.arg2}\` |`),
      ].join('\n');
    } else {
      content = [
        'Index,Operator,Arg1,Arg2',
        ...triples.map(t => `${t.index},${t.op},${t.arg1},${t.arg2}`),
      ].join('\n');
    }

    navigator.clipboard.writeText(content).then(() => {
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    });
  };

  return (
    <div className="analysis-card-inner">
      {/* Table Top Bar */}
      <div className="table-top-bar">
        <div>
          <h3 className="section-card-title">Triples & Indirect Triples IR</h3>
          <p className="section-card-subtitle">
            3-tuple format: <code>(operator, argument 1, argument 2)</code> referencing prior instruction indices.
          </p>
        </div>

        <div className="table-actions-header">
          {/* Sub-view toggle: Standard vs Indirect */}
          <div className="view-mode-toggle">
            <button
              className={`mode-btn ${viewMode === 'standard' ? 'active' : ''}`}
              onClick={() => setViewMode('standard')}
              title="Standard Triples representation"
            >
              Standard
            </button>
            <button
              className={`mode-btn ${viewMode === 'indirect' ? 'active' : ''}`}
              onClick={() => setViewMode('indirect')}
              title="Indirect Triples (Array of pointers to triples)"
            >
              Indirect Triples
            </button>
          </div>

          {/* Copy Table Buttons */}
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

          <span className="count-pill">{triples.length} Triples</span>
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
            placeholder="Search triples by op, operand, or index..."
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main Table Display */}
      {viewMode === 'standard' ? (
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
              {filteredTriples.map((triple, idx) => (
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
      ) : (
        /* Indirect Triples Side-by-Side View */
        <div className="indirect-triples-container">
          <div className="indirect-pointers-pane">
            <h4 className="indirect-pane-title">Pointer Array</h4>
            <div className="table-responsive-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Pointer</th>
                  </tr>
                </thead>
                <tbody>
                  {(indirectTriples?.pointers || []).map((ptr, idx) => (
                    <tr key={idx}>
                      <td className="index-cell">{idx}</td>
                      <td>
                        <span className="val-ref">({ptr.pointer})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="indirect-triples-pane">
            <h4 className="indirect-pane-title">Triples Table</h4>
            <div className="table-responsive-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Entry</th>
                    <th>Operator</th>
                    <th>Arg 1</th>
                    <th>Arg 2</th>
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
        </div>
      )}
    </div>
  );
}

function getTripleClass(arg) {
  if (arg === '—') return 'val-dash';
  if (typeof arg === 'string' && /^\(\d+\)$/.test(arg)) return 'val-ref';
  if (typeof arg === 'string' && /^\d/.test(arg)) return 'val-num';
  return 'val-var';
}

import React from 'react';
import { List } from 'lucide-react';

export default function TokenTable({ tokens }) {
  if (!tokens || tokens.length === 0) {
    return (
      <div className="tab-empty-box">
        <List size={28} />
        <p>No tokens identified</p>
      </div>
    );
  }

  return (
    <div className="analysis-card-inner">
      <div className="table-top-bar">
        <div>
          <h3 className="section-card-title">Lexical Token Stream</h3>
          <p className="section-card-subtitle">Linear sequence of classified lexical units extracted by the tokenizer.</p>
        </div>
        <span className="count-pill">{tokens.length} Tokens</span>
      </div>

      <div className="table-responsive-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Lexeme</th>
              <th>Token Classification</th>
              <th>Source Position</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, idx) => (
              <tr key={idx}>
                <td className="index-cell">{idx + 1}</td>
                <td>
                  <code className="token-lexeme-tag">{token.value}</code>
                </td>
                <td>
                  <span className={`pill-token-type type-${token.type.toLowerCase().replace(/\s/g, '-')}`}>
                    {token.type}
                  </span>
                </td>
                <td className="pos-cell">col {token.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

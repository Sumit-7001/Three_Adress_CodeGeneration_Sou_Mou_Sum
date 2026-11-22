import React from 'react';
import { List, GitBranch, Layers, Hash, Sparkles } from 'lucide-react';

const TABS = [
  { id: 'tokens',     label: 'Lexical Tokens',   icon: List,        desc: 'Tokenized character stream' },
  { id: 'ast',        label: 'Syntax Tree',      icon: GitBranch,   desc: 'Hierarchical AST graph' },
  { id: 'quadruples', label: 'Quadruples (4-tuple)', icon: Layers,  desc: '(op, arg1, arg2, result)' },
  { id: 'triples',    label: 'Triples (3-tuple)',    icon: Hash,    desc: '(index, op, arg1, arg2)' },
  { id: 'steps',      label: 'Step Walkthrough', icon: Sparkles,    desc: 'Line-by-line explanation' },
];

export default function TabPanel({ activeTab, setActiveTab, children }) {
  return (
    <section className="analysis-tabs-section">
      <div className="tabs-header-bar">
        <div className="tabs-pill-nav">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`tab-nav-pill ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} />
                <span className="tab-pill-label">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="tabs-card-content">
        {children}
      </div>
    </section>
  );
}

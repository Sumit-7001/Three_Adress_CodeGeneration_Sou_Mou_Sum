import React, { useState } from 'react';
import { ChevronDown, Sparkles, BookOpen, ArrowUpRight, Search, CheckCircle2 } from 'lucide-react';
import Mascot from './Mascot.jsx';

/**
 * AboutTAC / FAQSection — Comprehensive Compiler Theory & Viva Guide
 * Includes live keyword search and categorized high-yield questions.
 */
export default function AboutTAC({ onBack, onTestExpression }) {
  const [openIndex, setOpenIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const FAQS = [
    {
      category: 'Basics',
      q: "What is Three Address Code (TAC)?",
      a: "Three Address Code (TAC) is an intermediate code representation (IR) used by optimizing compilers where every instruction has at most three addresses (operands): at most two source operands and at most one destination result (x = y op z). It decomposes complex nested expressions into an atomic, linear instruction stream, which bridges the gap between high-level syntax and low-level machine registers."
    },
    {
      category: 'IR Formats',
      q: "What is the difference between Quadruples, Triples, and Indirect Triples?",
      a: "• Quadruples: A 4-tuple format (op, arg1, arg2, result). Temporary variables (t1, t2) are explicitly stored in the 'result' field. Advantage: Instructions can be moved or reordered without updating references.\n\n• Triples: A 3-tuple format (op, arg1, arg2). Omits the result column; previous results are referenced by their instruction index e.g., (0), (1). Advantage: Saves memory. Disadvantage: Difficult to reorder during optimization because moving a triple invalidates subsequent index references.\n\n• Indirect Triples: Solves the Triples reordering issue by maintaining a separate array of pointers to the triples table. To reorder instructions during code optimization, the compiler reorders entries in the pointer array rather than editing the triples themselves."
    },
    {
      category: 'Basics',
      q: "Why does the compiler generate temporary variables (t1, t2, ...)?",
      a: "CPUs typically only execute single binary operations at a time (e.g. ADD R1, R2). When high-level programs contain nested expressions like (a + b) * (c - d), the compiler must break down the expression and create compiler-managed temporary registers (t1, t2, ...) to store intermediate results before the final assignment. Later, during the code generator's register allocation phase (e.g., Graph Coloring or Linear Scan), these temporaries are assigned to physical CPU registers."
    },
    {
      category: 'AST & Parsing',
      q: "What is the difference between a Parse Tree and an Abstract Syntax Tree (AST)?",
      a: "• Parse Tree (Concrete Syntax Tree): A complete graphical representation of the grammar rules applied during derivation. It contains all grammar symbols including redundant punctuation like parentheses, commas, and semicolons.\n\n• Abstract Syntax Tree (AST): A condensed, semantic tree where interior nodes represent operators and leaf nodes represent operands. Parentheses and syntactic punctuation are omitted because the hierarchical tree structure itself implicitly dictates the exact operator precedence and associativity."
    },
    {
      category: 'AST & Parsing',
      q: "How does the Recursive Descent Parser enforce operator precedence?",
      a: "The parser structures the grammar into stratified non-terminals: assignment has the lowest precedence, followed by relational operators (==, <), then additive (+, -), then multiplicative (*, /, %), then exponentiation (^, right-associative), unary negation (-), and finally primary parenthesized expressions. Calling higher-precedence production rules from within lower-precedence rules ensures that tighter binding operations appear deeper in the AST and are evaluated first."
    },
    {
      category: 'Optimization',
      q: "What is Common Subexpression Elimination (CSE)?",
      a: "Common Subexpression Elimination is a compiler optimization technique that searches for occurrences of identical expressions (e.g., a * b) whose operand values have not changed between computations. Instead of calculating a * b twice, the compiler reuses the temporary variable holding the first calculation, saving CPU cycles and instruction memory."
    },
    {
      category: 'Optimization',
      q: "What is a DAG (Directed Acyclic Graph) in compiler optimization?",
      a: "A DAG is a specialized graph used in intermediate code optimization that merges identical subexpression nodes from an AST. Unlike an AST where duplicate subtrees exist independently, a DAG ensures that common subexpressions share a single node with multiple incoming parent edges. This automatically detects common subexpressions and dead code."
    },
    {
      category: 'Optimization',
      q: "What is Constant Folding and Constant Propagation?",
      a: "• Constant Folding: The simplification of operations on constant values at compile time rather than at runtime. For example, evaluating 10 + 20 * 3 directly into 70 during compilation.\n• Constant Propagation: Replacing variable occurrences with known constant values throughout a basic block when a variable is known to hold a fixed value."
    },
    {
      category: 'IR Formats',
      q: "What is Single Static Assignment (SSA) form?",
      a: "Single Static Assignment (SSA) is a property of an intermediate representation where every variable is assigned a value exactly once. When a variable is updated in source code, the compiler creates a fresh version (e.g., x1, x2, x3). At control flow merge points, special phi functions (ϕ) select the correct version based on the incoming branch. SSA dramatically simplifies data-flow analysis and register allocation."
    },
    {
      category: 'Viva Prep',
      q: "What are the common viva questions asked about this project?",
      a: "Top viva questions:\n1. 'What are the phases of a compiler pipeline?' (Lexical → Syntax → Semantic → Intermediate Code → Code Optimizer → Code Generator).\n2. 'How is unary minus represented in TAC?' (Either t = -operand, or translated to subtraction from zero: t = 0 - operand).\n3. 'Why is intermediate code needed?' (It isolates the front-end parser from the target machine architecture, allowing 1 parser to target N different CPUs).\n4. 'Which traversal order is used to generate TAC from an AST?' (Post-order traversal: children left and right before root operator)."
    }
  ];

  const categories = ['All', 'Basics', 'IR Formats', 'AST & Parsing', 'Optimization', 'Viva Prep'];

  const filteredFAQS = FAQS.filter(item => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.q.toLowerCase().includes(search.toLowerCase()) ||
                          item.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="faq-section-wrapper">
      <div className="faq-layout-grid">
        {/* Left Column: Heading + Mascot + CTA */}
        <div className="faq-left-col">
          <div className="faq-badge">
            <Sparkles size={13} />
            <span>Compiler Theory & Viva Prep</span>
          </div>

          <h2 className="faq-title">
            Frequently Asked Questions & Viva Guide
          </h2>

          <p className="faq-desc">
            Master the core concepts of Intermediate Code Generation, Quadruples, Triples, and Abstract Syntax Trees with detailed explanations.
          </p>

          <div className="faq-mascot-box">
            <Mascot pose="wave" size={130} />
          </div>

          <div className="faq-cta-box">
            <button
              className="primary-pill-btn w-full"
              onClick={onTestExpression}
            >
              <span>Test Sample Expression</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>

        {/* Right Column: Search + Category Pills + Accordion */}
        <div className="faq-right-col">
          {/* Search Box */}
          <div className="faq-search-box">
            <Search size={15} className="faq-search-icon" />
            <input
              type="text"
              className="faq-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search viva questions (e.g., quadruples, DAG, SSA, temporary)..."
            />
            {search && (
              <button className="clear-search-btn" onClick={() => setSearch('')}>
                ×
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="faq-cat-pills">
            {categories.map(cat => (
              <button
                key={cat}
                className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion Cards */}
          <div className="faq-accordion-list">
            {filteredFAQS.length === 0 ? (
              <div className="faq-empty-search">
                <BookOpen size={28} />
                <p>No questions matched "{search}".</p>
                <span>Try searching for "quadruples", "triples", or "AST".</span>
              </div>
            ) : (
              filteredFAQS.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={idx} className={`faq-card ${isOpen ? 'open' : ''}`}>
                    <button
                      className="faq-card-header"
                      onClick={() => toggleAccordion(idx)}
                    >
                      <div className="faq-q-text">
                        <span className="faq-cat-badge">{faq.category}</span>
                        <span>{faq.q}</span>
                      </div>
                      <ChevronDown
                        size={17}
                        className={`faq-chevron ${isOpen ? 'rotated' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="faq-card-body">
                        <p style={{ whiteSpace: 'pre-line' }}>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

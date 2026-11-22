import React, { useState } from 'react';
import { ChevronDown, Sparkles, BookOpen, ArrowUpRight } from 'lucide-react';
import Mascot from './Mascot.jsx';

/**
 * AboutTAC / FAQSection
 * Modeled directly after the "Frequently Asked Questions" panel from the reference image:
 * Left column: Bold heading, description, playful red mascot, and CTA pill button.
 * Right column: Stack of sleek pill-shaped accordion cards with smooth expanding answers.
 */
export default function AboutTAC({ onBack, onTestExpression }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const FAQS = [
    {
      q: "What is Three Address Code (TAC)?",
      a: "Three Address Code is an intermediate representation (IR) used by optimizing compilers where each instruction has at most three addresses (operands): at most two source operands and one destination result (x = y op z). It decomposes arbitrary complex expressions into linear, atomic instructions, making target machine code generation and optimization straightforward."
    },
    {
      q: "What is the difference between Quadruples and Triples?",
      a: "Quadruples use a 4-tuple (op, arg1, arg2, result) with an explicit result field storing the variable or compiler-generated temporary (e.g. t1, t2). This allows instructions to be reordered or moved without altering arguments.\n\nTriples use a 3-tuple (op, arg1, arg2) where results are referenced by their instruction index (e.g. (0), (1)). Triples save memory by eliminating the result column, but moving instructions requires rewriting all subsequent index references."
    },
    {
      q: "Why does the compiler generate temporary variables (t1, t2, ...)?",
      a: "High-level languages allow arbitrary complex nested expressions such as (a + b) * (c - d). Since CPU instructions can typically perform only one arithmetic operation at a time, the compiler decomposes the expression and allocates temporary variables (t1, t2, ...) to store intermediate results before the final assignment. Later compiler phases map these temporaries directly to CPU registers."
    },
    {
      q: "How does the Recursive Descent Parser enforce operator precedence?",
      a: "The parser structures the grammar into stratified non-terminals: assignment has the lowest precedence, followed by addition/subtraction, then multiplication/division, then unary minus, and finally parentheses. By calling higher-precedence production rules from within lower-precedence rules, terms with tighter binding (*, /) are parsed deeper in the AST and evaluated first during post-order traversal."
    },
    {
      q: "How does the Abstract Syntax Tree (AST) get translated into TAC?",
      a: "The generator performs a post-order traversal of the AST (children are evaluated before parent nodes). For any binary operator node, it recursively generates code for the left and right subtrees, allocates a new temporary variable (e.g., t1), and emits an instruction t1 = left_result op right_result. Finally, the assignment node stores the computed value in the destination variable."
    },
    {
      q: "Why is Intermediate Code Generation (ICG) necessary?",
      a: "ICG decouples the compiler's language-dependent front-end from the architecture-dependent back-end. A compiler supporting N source languages and M target machines only needs N front-ends and M back-ends connected via a common IR (like TAC), rather than N × M separate compilers. Furthermore, machine-independent optimizations (dead code elimination, constant folding, common subexpression elimination) are performed directly on the TAC."
    },
    {
      q: "What are Indirect Triples?",
      a: "Indirect Triples solve the reordering problem of standard Triples. They maintain a separate array of pointers to the triples. When instructions need to be reordered during optimization, the compiler simply reorders the pointer list instead of modifying the triple structures or updating index references."
    },
    {
      q: "What typical viva questions can be asked from this project?",
      a: "Common viva questions include:\n• Define Intermediate Code and name three representations.\n• What are the four fields of a Quadruple?\n• How do you handle unary minus in TAC? (t1 = -operand or t1 = 0 - operand)\n• Which parsing method did you use and why? (Recursive Descent LL(1) for arithmetic expressions)\n• What is the difference between a Parse Tree and an Abstract Syntax Tree? (AST omits redundant syntax like parentheses)."
    }
  ];

  return (
    <div className="faq-section-wrapper">
      <div className="faq-layout-grid">
        {/* Left Column: Heading + Mascot + CTA */}
        <div className="faq-left-col">
          <div className="faq-badge">
            <Sparkles size={13} />
            <span>Compiler Theory & Viva Prep</span>
          </div>

          <h2 className="faq-main-title">
            Frequently Asked Questions
          </h2>

          <p className="faq-intro-text">
            Everything you need to master Three Address Code, compiler phases, AST hierarchies, and ace your compiler design mini-project viva.
          </p>

          <div className="faq-mascot-box">
            <Mascot pose="sitting" size={130} />
          </div>

          <div className="faq-left-actions">
            <button className="primary-pill-btn" onClick={onBack}>
              <span>Open Workbench</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Column: Stack of Pill Accordion Cards */}
        <div className="faq-right-col">
          <div className="accordion-stack">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`accordion-pill-item ${isOpen ? 'open' : ''}`}
                >
                  <button
                    className="accordion-trigger-btn"
                    onClick={() => toggleAccordion(idx)}
                    aria-expanded={isOpen}
                  >
                    <span className="accordion-q-text">{faq.q}</span>
                    <div className={`accordion-icon-wrap ${isOpen ? 'rotated' : ''}`}>
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="accordion-body-content">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

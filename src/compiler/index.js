/**
 * ============================================================
 * COMPILER PIPELINE — Unified Entry Point
 * ============================================================
 * 
 * This module ties together the entire compiler pipeline:
 * 
 *   Source Expression
 *       ↓
 *   Lexical Analysis  (tokenizer)
 *       ↓
 *   Syntax Analysis   (parser → AST)
 *       ↓
 *   TAC Generation    (AST → Three Address Code)
 *       ↓
 *   Quadruples        (TAC → quadruples table)
 *       ↓
 *   Triples           (TAC → triples table)
 *       ↓
 *   Step Explanation   (human-readable walkthrough)
 * 
 * The compile() function runs the full pipeline and returns
 * all intermediate and final results, or an error.
 * ============================================================
 */

import { tokenize } from './lexer.js';
import { parse } from './parser.js';
import { generateTAC, formatTAC } from './tacGenerator.js';
import { generateQuadruples } from './quadruples.js';
import { generateTriples } from './triples.js';

/**
 * Generates step-by-step explanations for each TAC instruction.
 * 
 * @param {Array} instructions — TAC instructions
 * @returns {Array} — array of { step, instruction, explanation }
 */
function generateExplanation(instructions) {
  return instructions.map((instr, index) => {
    let explanation = '';

    if (instr.op === '=') {
      explanation = `Assign the value of ${instr.arg1} to variable ${instr.result}.`;
    } else if (instr.op === 'neg') {
      explanation = `Negate the value of ${instr.arg1} and store the result in temporary variable ${instr.result}.`;
    } else {
      const opNames = {
        '+': 'Add',
        '-': 'Subtract',
        '*': 'Multiply',
        '/': 'Divide',
      };
      const opVerbs = {
        '+': 'to',
        '-': 'from',
        '*': 'by',
        '/': 'by',
      };
      const opName = opNames[instr.op] || instr.op;
      
      if (instr.op === '-') {
        explanation = `${opName} ${instr.arg2} from ${instr.arg1} and store the result in temporary variable ${instr.result}.`;
      } else if (instr.op === '/') {
        explanation = `${opName} ${instr.arg1} by ${instr.arg2} and store the result in temporary variable ${instr.result}.`;
      } else {
        explanation = `${opName} ${instr.arg1} and ${instr.arg2} and store the result in temporary variable ${instr.result}.`;
      }
    }

    return {
      step: index + 1,
      instruction: formatSingleInstruction(instr),
      explanation,
    };
  });
}

/**
 * Formats a single TAC instruction to a string.
 */
function formatSingleInstruction(instr) {
  if (instr.op === '=') return `${instr.result} = ${instr.arg1}`;
  if (instr.op === 'neg') return `${instr.result} = -${instr.arg1}`;
  return `${instr.result} = ${instr.arg1} ${instr.op} ${instr.arg2}`;
}

/**
 * Runs the complete compiler pipeline.
 * 
 * @param {string} input — the source expression
 * @returns {Object} — compilation result with all outputs or error
 */
export function compile(input) {
  // Phase 1: Lexical Analysis
  const { tokens, error: lexError } = tokenize(input);
  if (lexError) {
    return { success: false, error: lexError, phase: 'Lexical Analysis' };
  }

  // Filter out EOF for display (keep it for the parser)
  const displayTokens = tokens.filter(t => t.type !== 'EOF');

  // Phase 2: Syntax Analysis (Parsing)
  const { ast, error: parseError } = parse(tokens);
  if (parseError) {
    return {
      success: false,
      error: parseError,
      phase: 'Syntax Analysis',
      tokens: displayTokens,
    };
  }

  // Phase 3: Three Address Code Generation
  const { instructions, tempCount } = generateTAC(ast);
  const tacLines = formatTAC(instructions);

  // Phase 4: Quadruples
  const quadruples = generateQuadruples(instructions);

  // Phase 5: Triples
  const triples = generateTriples(instructions);

  // Phase 6: Step-by-step Explanation
  const explanation = generateExplanation(instructions);

  return {
    success: true,
    input,
    tokens: displayTokens,
    ast,
    tac: tacLines,
    instructions,
    quadruples,
    triples,
    explanation,
    tempCount,
    instructionCount: instructions.length,
  };
}

// Re-export for direct access
export { tokenize } from './lexer.js';
export { parse } from './parser.js';
export { generateTAC, formatTAC } from './tacGenerator.js';
export { generateQuadruples } from './quadruples.js';
export { generateTriples } from './triples.js';

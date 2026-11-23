/**
 * ============================================================
 * TRIPLES REPRESENTATION
 * ============================================================
 * 
 * Triples are an alternative intermediate representation where
 * each instruction is a 3-tuple:
 * 
 *     (index, operator, argument1, argument2)
 * 
 * Unlike quadruples, triples do NOT have an explicit result
 * field. Instead, results are referenced by the instruction
 * index where they were computed. This saves space but makes
 * reordering instructions harder (since index references would
 * need updating).
 * 
 * When an argument comes from a previous computation, it is
 * represented as (index) — a reference to the instruction at
 * that index.
 * 
 * Example:
 *   For  a = b + c * d :
 *     (0)  *   c    d
 *     (1)  +   b   (0)
 *     (2)  =   a   (1)
 * ============================================================
 */

/**
 * Generates Triples from TAC instructions.
 * 
 * The algorithm maps each temporary variable to the index of
 * the instruction that produced it, then replaces temporary
 * variable references with index references.
 * 
 * @param {Array} instructions — TAC instructions from generateTAC
 * @returns {Array} — array of triple objects
 */
export function generateTriples(instructions) {
  // Map from temporary variable name → instruction index
  const tempToIndex = {};

  // First pass: record where each temp is defined
  instructions.forEach((instr, index) => {
    if (instr.result && instr.result.match(/^t\d+$/)) {
      tempToIndex[instr.result] = index;
    }
  });

  /**
   * Resolves an argument: if it refers to a temporary variable,
   * replace it with an index reference like "(0)".
   */
  function resolveArg(arg) {
    if (arg === null || arg === undefined) return '—';
    if (tempToIndex[arg] !== undefined) {
      return `(${tempToIndex[arg]})`;
    }
    return arg;
  }

  // Second pass: build the triples
  return instructions.map((instr, index) => {
    if (instr.op === '=') {
      // Assignment triple:  =  target  source
      return {
        index,
        op: '=',
        arg1: instr.result,            // the target variable
        arg2: resolveArg(instr.arg1),  // the source value
      };
    }

    if (instr.op === 'neg') {
      return {
        index,
        op: 'neg',
        arg1: resolveArg(instr.arg1),
        arg2: '—',
      };
    }

    // Binary operation
    return {
      index,
      op: instr.op,
      arg1: resolveArg(instr.arg1),
      arg2: resolveArg(instr.arg2),
    };
  });
}

/**
 * Generates Indirect Triples representation:
 * An array of pointers to the triples table, alongside the triples.
 * In optimizing compilers, instructions are reordered by modifying
 * only the pointer array, without altering internal index references.
 * 
 * @param {Array} triples — from generateTriples
 * @returns {{ pointers: Array<{ index: number, pointer: number }>, triples: Array }}
 */
export function generateIndirectTriples(triples) {
  const pointers = triples.map((t, idx) => ({
    index: idx,
    pointer: t.index,
  }));
  return { pointers, triples };
}

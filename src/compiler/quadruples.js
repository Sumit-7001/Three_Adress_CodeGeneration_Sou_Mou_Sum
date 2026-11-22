/**
 * ============================================================
 * QUADRUPLES REPRESENTATION
 * ============================================================
 * 
 * Quadruples are a popular intermediate representation in
 * compiler design. Each quadruple is a 4-tuple:
 * 
 *     (operator, argument1, argument2, result)
 * 
 * They directly correspond to Three Address Code instructions
 * and are stored in a table. The result field always holds the
 * temporary variable or target variable where the value is stored.
 * 
 * Advantages:
 *   - Easy to rearrange and optimize (each quad is independent)
 *   - Explicit result naming simplifies register allocation
 *   - Straightforward translation to target machine code
 * 
 * Example:
 *   For  a = b + c * d :
 *     (*, c, d, t1)
 *     (+, b, t1, t2)
 *     (=, t2, —, a)
 * ============================================================
 */

/**
 * Generates Quadruples from TAC instructions.
 * 
 * Each quadruple has the structure:
 *   { index, op, arg1, arg2, result }
 * 
 * @param {Array} instructions — TAC instructions from generateTAC
 * @returns {Array} — array of quadruple objects
 */
export function generateQuadruples(instructions) {
  return instructions.map((instr, index) => ({
    index: index,
    op: instr.op,
    arg1: instr.arg1 ?? '—',
    arg2: instr.arg2 ?? '—',
    result: instr.result,
  }));
}

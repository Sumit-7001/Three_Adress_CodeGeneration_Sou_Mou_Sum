/**
 * ============================================================
 * THREE ADDRESS CODE (TAC) GENERATOR
 * ============================================================
 * 
 * The TAC generator is the core of the intermediate code
 * generation phase. It performs a post-order traversal of the
 * AST and emits three-address instructions of the form:
 * 
 *     result = arg1 op arg2
 * 
 * Each instruction has at most one operator and up to two
 * operands. Complex expressions are decomposed using compiler-
 * generated temporary variables (t1, t2, t3, ...).
 * 
 * Algorithm:
 *   1. Traverse the AST in post-order (children before parent).
 *   2. For leaf nodes (numbers, variables), return the value.
 *   3. For binary operations, recursively generate code for
 *      left and right subtrees, then emit:
 *        t_n = left_result op right_result
 *   4. For unary minus, emit:
 *        t_n = 0 - operand_result    (using subtraction from 0)
 *   5. For assignments, emit:
 *        variable = expression_result
 * 
 * The output is a list of TAC instructions, each containing:
 *   { op, arg1, arg2, result }
 * ============================================================
 */

/**
 * Generates Three Address Code from an AST.
 * 
 * @param {Object} ast — the abstract syntax tree from the parser
 * @returns {{ instructions: Array, tempCount: number }}
 *   instructions: array of { op, arg1, arg2, result }
 *   tempCount: total number of temporary variables used
 */
export function generateTAC(ast) {
  const instructions = [];
  let tempCounter = 0;

  /**
   * Allocates a fresh temporary variable name.
   * @returns {string} e.g. "t1", "t2", ...
   */
  function newTemp() {
    tempCounter++;
    return `t${tempCounter}`;
  }

  /**
   * Recursively generates TAC for a subtree and returns
   * the name (variable or temporary) holding the result.
   * 
   * @param {Object} node — an AST node
   * @returns {string} — the name of the result
   */
  function generate(node) {
    switch (node.type) {

      // ---- Leaf: Identifier ----
      // No code to emit; just return the variable name.
      case 'Identifier':
        return node.name;

      // ---- Leaf: Number ----
      // No code to emit; just return the numeric literal.
      case 'Number':
        return node.value;

      // ---- Binary Operation ----
      // Post-order: generate left, generate right, then emit.
      case 'BinaryOp': {
        const leftResult = generate(node.left);
        const rightResult = generate(node.right);
        const temp = newTemp();
        instructions.push({
          op: node.op,
          arg1: leftResult,
          arg2: rightResult,
          result: temp,
        });
        return temp;
      }

      // ---- Unary Minus ----
      // Translate  -expr  to  t = 0 - expr
      // This is a standard compiler technique for unary negation.
      case 'UnaryOp': {
        const operandResult = generate(node.operand);
        const temp = newTemp();
        instructions.push({
          op: 'neg',
          arg1: operandResult,
          arg2: null,
          result: temp,
        });
        return temp;
      }

      // ---- Multiple Statements / Program ----
      case 'Program': {
        for (const stmt of node.body) {
          generate(stmt);
        }
        return null;
      }

      // ---- Assignment ----
      // Generate the right-hand side, then emit the assignment.
      case 'Assignment': {
        const exprResult = generate(node.expression);
        instructions.push({
          op: '=',
          arg1: exprResult,
          arg2: null,
          result: node.variable,
        });
        return node.variable;
      }

      default:
        throw new Error(`Unknown AST node type: ${node.type}`);
    }
  }

  generate(ast);

  return {
    instructions,
    tempCount: tempCounter,
  };
}

/**
 * Formats TAC instructions into human-readable strings.
 * 
 * @param {Array} instructions — from generateTAC
 * @returns {string[]} — array of formatted lines
 */
export function formatTAC(instructions) {
  return instructions.map(instr => {
    if (instr.op === '=') {
      // Assignment: variable = value
      return `${instr.result} = ${instr.arg1}`;
    }
    if (instr.op === 'neg') {
      // Unary negation: t = -operand
      return `${instr.result} = -${instr.arg1}`;
    }
    // Binary operation: result = arg1 op arg2
    return `${instr.result} = ${instr.arg1} ${instr.op} ${instr.arg2}`;
  });
}

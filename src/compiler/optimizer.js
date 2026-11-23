/**
 * ============================================================
 * TAC OPTIMIZER — Common Subexpression Elimination (CSE)
 *                & Constant Folding
 * ============================================================
 * 
 * Demonstrates intermediate code optimization phases:
 * 1. Constant Folding: evaluates operations on constant operands at compile time.
 * 2. Common Subexpression Elimination (CSE): reuses previously calculated temporaries
 *    when identical operand-operator pairs are repeated.
 * ============================================================
 */

export function optimizeTAC(instructions) {
  const optimized = [];
  const exprMap = new Map(); // key -> temporary variable
  const aliasMap = new Map(); // oldTemp -> newTemp/value
  let foldedCount = 0;
  let cseCount = 0;

  const resolve = (arg) => {
    if (arg === null || arg === undefined) return arg;
    let curr = arg;
    while (aliasMap.has(curr)) {
      curr = aliasMap.get(curr);
    }
    return curr;
  };

  const isNumeric = (str) => typeof str === 'number' || (typeof str === 'string' && !isNaN(Number(str)) && str !== '—');

  for (const instr of instructions) {
    const arg1 = resolve(instr.arg1);
    const arg2 = resolve(instr.arg2);

    // 1. Constant Folding: e.g. 10 * 3 => 30
    if (instr.op !== '=' && instr.op !== 'neg' && isNumeric(arg1) && isNumeric(arg2)) {
      const n1 = Number(arg1);
      const n2 = Number(arg2);
      let folded = null;
      if (instr.op === '+') folded = n1 + n2;
      else if (instr.op === '-') folded = n1 - n2;
      else if (instr.op === '*') folded = n1 * n2;
      else if (instr.op === '/' && n2 !== 0) folded = Math.round((n1 / n2) * 1000) / 1000;
      else if (instr.op === '%') folded = n1 % n2;
      else if (instr.op === '^') folded = Math.pow(n1, n2);

      if (folded !== null) {
        foldedCount++;
        aliasMap.set(instr.result, String(folded));
        optimized.push({
          op: '=',
          arg1: String(folded),
          arg2: null,
          result: instr.result,
          optimizedType: 'constant-folded',
        });
        continue;
      }
    }

    // 2. Unary Constant Folding: e.g. -5
    if (instr.op === 'neg' && isNumeric(arg1)) {
      const folded = -Number(arg1);
      foldedCount++;
      aliasMap.set(instr.result, String(folded));
      optimized.push({
        op: '=',
        arg1: String(folded),
        arg2: null,
        result: instr.result,
        optimizedType: 'constant-folded',
      });
      continue;
    }

    // 3. Common Subexpression Elimination (CSE)
    // Commutative operators: a + b == b + a, a * b == b * a
    let cseKey = null;
    if (instr.op !== '=' && instr.op !== 'neg') {
      const isCommutative = instr.op === '+' || instr.op === '*';
      if (isCommutative && String(arg1) > String(arg2)) {
        cseKey = `${instr.op}:${arg2}:${arg1}`;
      } else {
        cseKey = `${instr.op}:${arg1}:${arg2}`;
      }
    }

    if (cseKey && exprMap.has(cseKey)) {
      const existingTemp = exprMap.get(cseKey);
      cseCount++;
      aliasMap.set(instr.result, existingTemp);
      continue; // Skip recomputation!
    }

    // New operation or assignment
    const newInstr = {
      op: instr.op,
      arg1,
      arg2,
      result: instr.result,
    };

    if (cseKey) {
      exprMap.set(cseKey, instr.result);
    }

    optimized.push(newInstr);
  }

  return {
    instructions: optimized,
    stats: {
      originalCount: instructions.length,
      optimizedCount: optimized.length,
      savedInstructions: instructions.length - optimized.length,
      foldedCount,
      cseCount,
    },
  };
}

/**
 * ============================================================
 * TAC SIMULATOR & STEP RUNNER
 * ============================================================
 * 
 * Executes Three Address Code instructions step-by-step with
 * user-provided variable values, tracking register / memory
 * environment state at each stage.
 * ============================================================
 */

/**
 * Extracts all unique user variables (excluding compiler temporaries)
 * referenced in a list of TAC instructions.
 * 
 * @param {Array} instructions 
 * @returns {Array<string>} list of variable names
 */
export function extractVariables(instructions) {
  const vars = new Set();
  const isUserVar = (str) => typeof str === 'string' && !/^t\d+$/.test(str) && isNaN(Number(str)) && str !== '—';

  for (const instr of instructions) {
    if (instr.result && isUserVar(instr.result) && instr.op !== '=') {
      vars.add(instr.result);
    }
    if (instr.arg1 && isUserVar(instr.arg1)) {
      vars.add(instr.arg1);
    }
    if (instr.arg2 && isUserVar(instr.arg2)) {
      vars.add(instr.arg2);
    }
  }

  return Array.from(vars);
}

/**
 * Executes TAC instructions step-by-step.
 * 
 * @param {Array} instructions — TAC instructions
 * @param {Object} initialValues — map of variable names to numbers
 * @returns {{ steps: Array, finalEnv: Object }}
 */
export function simulateTAC(instructions, initialValues = {}) {
  const env = { ...initialValues };
  const steps = [];

  const resolve = (val) => {
    if (val === null || val === undefined || val === '—') return 0;
    if (typeof val === 'number') return val;
    if (!isNaN(Number(val))) return Number(val);
    if (env[val] !== undefined) return env[val];
    return 1; // Default fallback for undefined variable
  };

  instructions.forEach((instr, idx) => {
    const v1 = resolve(instr.arg1);
    const v2 = resolve(instr.arg2);
    let resultVal = 0;
    let calculationText = '';

    switch (instr.op) {
      case '+':
        resultVal = v1 + v2;
        calculationText = `${v1} + ${v2} = ${resultVal}`;
        break;
      case '-':
        resultVal = v1 - v2;
        calculationText = `${v1} - ${v2} = ${resultVal}`;
        break;
      case '*':
        resultVal = v1 * v2;
        calculationText = `${v1} × ${v2} = ${resultVal}`;
        break;
      case '/':
        resultVal = v2 !== 0 ? Math.round((v1 / v2) * 1000) / 1000 : Infinity;
        calculationText = v2 !== 0 ? `${v1} / ${v2} = ${resultVal}` : 'Division by zero!';
        break;
      case '%':
        resultVal = v1 % v2;
        calculationText = `${v1} % ${v2} = ${resultVal}`;
        break;
      case '^':
        resultVal = Math.pow(v1, v2);
        calculationText = `${v1} ^ ${v2} = ${resultVal}`;
        break;
      case '==':
        resultVal = v1 === v2 ? 1 : 0;
        calculationText = `${v1} == ${v2} → ${resultVal ? 'true (1)' : 'false (0)'}`;
        break;
      case '!=':
        resultVal = v1 !== v2 ? 1 : 0;
        calculationText = `${v1} != ${v2} → ${resultVal ? 'true (1)' : 'false (0)'}`;
        break;
      case '<':
        resultVal = v1 < v2 ? 1 : 0;
        calculationText = `${v1} < ${v2} → ${resultVal ? 'true (1)' : 'false (0)'}`;
        break;
      case '<=':
        resultVal = v1 <= v2 ? 1 : 0;
        calculationText = `${v1} <= ${v2} → ${resultVal ? 'true (1)' : 'false (0)'}`;
        break;
      case '>':
        resultVal = v1 > v2 ? 1 : 0;
        calculationText = `${v1} > ${v2} → ${resultVal ? 'true (1)' : 'false (0)'}`;
        break;
      case '>=':
        resultVal = v1 >= v2 ? 1 : 0;
        calculationText = `${v1} >= ${v2} → ${resultVal ? 'true (1)' : 'false (0)'}`;
        break;
      case 'neg':
        resultVal = -v1;
        calculationText = `-(${v1}) = ${resultVal}`;
        break;
      case '=':
        resultVal = v1;
        calculationText = `Store ${v1} into ${instr.result}`;
        break;
      default:
        resultVal = v1;
        calculationText = `${instr.op} ${v1}`;
    }

    env[instr.result] = resultVal;

    steps.push({
      stepNumber: idx + 1,
      instruction: instr,
      calculationText,
      resultVar: instr.result,
      resultVal,
      environmentSnapshot: { ...env },
    });
  });

  return { steps, finalEnv: env };
}

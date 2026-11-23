/**
 * ============================================================
 * SYNTAX ANALYZER (PARSER) — Recursive Descent
 * ============================================================
 * 
 * The parser is the second phase of the compiler pipeline.
 * It consumes the token stream produced by the lexer and
 * constructs an Abstract Syntax Tree (AST) that faithfully
 * represents the hierarchical structure of the expression,
 * respecting operator precedence and associativity.
 * 
 * Grammar (LL(1)-compatible):
 * 
 *   program      → assignment | expression
 *   assignment   → IDENTIFIER '=' expression
 *   expression   → term (( '+' | '-' ) term)*
 *   term         → unary (( '*' | '/' ) unary)*
 *   unary        → '-' unary | primary
 *   primary      → NUMBER | IDENTIFIER | '(' expression ')'
 * 
 * Operator Precedence (low → high):
 *   1. Assignment  =
 *   2. Addition / Subtraction  + -
 *   3. Multiplication / Division  * /
 *   4. Unary minus  -
 *   5. Parentheses  ( )
 * 
 * Associativity: left-to-right for binary operators.
 * 
 * The parser reports precise syntax errors with position info.
 * ============================================================
 */

import { TokenType } from './lexer.js';

// ---- AST Node Constructors ----

/**
 * Binary operation node: left op right
 * Example: a + b  →  BinaryOp('+', Ident('a'), Ident('b'))
 */
export function BinaryOp(op, left, right) {
  return { type: 'BinaryOp', op, left, right };
}

/**
 * Unary operation node: op operand
 * Example: -a  →  UnaryOp('-', Ident('a'))
 */
export function UnaryOp(op, operand) {
  return { type: 'UnaryOp', op, operand };
}

/**
 * Assignment node: variable = expression
 * Example: x = a + b  →  Assignment('x', BinaryOp('+', ...))
 */
export function Assignment(variable, expression) {
  return { type: 'Assignment', variable, expression };
}

/**
 * Identifier (variable name) leaf node
 */
export function Identifier(name) {
  return { type: 'Identifier', name };
}

/**
 * Numeric literal leaf node
 */
export function NumberLiteral(value) {
  return { type: 'Number', value };
}

/**
 * Parses the token array into an AST.
 * 
 * @param {Array} tokens — token array from the lexer
 * @returns {{ ast: Object|null, error: string|null }}
 */
export function parse(tokens) {
  let pos = 0;

  /**
   * Returns the current token without consuming it.
   */
  function peek() {
    return tokens[pos];
  }

  /**
   * Consumes and returns the current token, advancing the cursor.
   */
  function advance() {
    const token = tokens[pos];
    pos++;
    return token;
  }

  /**
   * Consumes a token of the expected type, or throws a syntax error.
   */
  function expect(type, contextMsg) {
    const token = peek();
    if (!token || token.type !== type) {
      const got = token ? `'${token.value}'` : 'end of input';
      throw new Error(
        `Syntax Error at position ${token ? token.position : '?'}: Expected ${type} ${contextMsg || ''}, but got ${got}.`
      );
    }
    return advance();
  }

  // ---- Recursive Descent Production Rules ----

  /**
   * statement → assignment | expression
   * 
   * We use a lookahead of 2 tokens: if the first token is an
   * IDENTIFIER and the second is '=', we parse an assignment.
   * Otherwise we parse a standalone expression.
   */
  function parseStatement() {
    if (
      peek().type === TokenType.IDENTIFIER &&
      pos + 1 < tokens.length &&
      tokens[pos + 1].type === TokenType.ASSIGN
    ) {
      return parseAssignment();
    }
    return parseExpression();
  }

  /**
   * program → statement* (delimited by semicolons or sequential statements)
   */
  function parseProgram() {
    const statements = [];
    while (peek().type !== TokenType.EOF) {
      if (peek().type === TokenType.SEMICOLON) {
        advance();
        continue;
      }
      statements.push(parseStatement());
      if (peek().type === TokenType.SEMICOLON) {
        advance();
      }
    }
    if (statements.length === 0) {
      throw new Error('Empty input: No statements found.');
    }
    return statements.length === 1
      ? statements[0]
      : { type: 'Program', body: statements };
  }

  /**
   * assignment → IDENTIFIER '=' expression
   * 
   * Validates that the left-hand side is a simple variable name.
   */
  function parseAssignment() {
    const idToken = expect(TokenType.IDENTIFIER);
    expect(TokenType.ASSIGN, "after variable name");
    const expr = parseExpression();
    return Assignment(idToken.value, expr);
  }

  /**
   * expression → relational
   */
  function parseExpression() {
    return parseRelational();
  }

  /**
   * relational → additive (( '==' | '!=' | '<=' | '>=' | '<' | '>' ) additive)*
   */
  function parseRelational() {
    let left = parseAdditive();

    const relOps = ['==', '!=', '<=', '>=', '<', '>'];
    while (
      peek().type === TokenType.OPERATOR &&
      relOps.includes(peek().value)
    ) {
      const op = advance().value;
      const right = parseAdditive();
      left = BinaryOp(op, left, right);
    }

    return left;
  }

  /**
   * additive → term (( '+' | '-' ) term)*
   * 
   * Handles addition and subtraction with left associativity.
   */
  function parseAdditive() {
    let left = parseTerm();

    while (
      peek().type === TokenType.OPERATOR &&
      (peek().value === '+' || peek().value === '-')
    ) {
      const op = advance().value;
      const right = parseTerm();
      left = BinaryOp(op, left, right);
    }

    return left;
  }

  /**
   * term → unary (( '*' | '/' | '%' ) unary)*
   * 
   * Handles multiplication, division, and modulo with left associativity.
   */
  function parseTerm() {
    let left = parsePower();

    while (
      peek().type === TokenType.OPERATOR &&
      (peek().value === '*' || peek().value === '/' || peek().value === '%')
    ) {
      const op = advance().value;
      const right = parsePower();
      left = BinaryOp(op, left, right);
    }

    return left;
  }

  /**
   * power → unary ( '^' power )?
   * 
   * Handles right-associative exponentiation: 2 ^ 3 ^ 2 = 2 ^ (3 ^ 2)
   */
  function parsePower() {
    const left = parseUnary();

    if (
      peek().type === TokenType.OPERATOR &&
      peek().value === '^'
    ) {
      const op = advance().value;
      const right = parsePower(); // right-recursive for right-associativity
      return BinaryOp(op, left, right);
    }

    return left;
  }

  /**
   * unary → '-' unary | primary
   * 
   * Handles the unary negation operator. It is right-associative
   * and can be chained: --a parses as -(-a).
   */
  function parseUnary() {
    if (
      peek().type === TokenType.OPERATOR &&
      peek().value === '-'
    ) {
      advance(); // consume '-'
      const operand = parseUnary(); // right-recursive
      return UnaryOp('-', operand);
    }
    return parsePrimary();
  }

  /**
   * primary → NUMBER | IDENTIFIER | '(' expression ')'
   * 
   * Leaf nodes and parenthesized sub-expressions.
   */
  function parsePrimary() {
    const token = peek();

    if (!token || token.type === TokenType.EOF) {
      throw new Error(
        `Syntax Error: Unexpected end of expression. Expected a number, variable, or '('.`
      );
    }

    // Numeric literal
    if (token.type === TokenType.NUMBER) {
      advance();
      return NumberLiteral(token.value);
    }

    // Identifier
    if (token.type === TokenType.IDENTIFIER) {
      advance();
      return Identifier(token.value);
    }

    // Parenthesized expression
    if (token.type === TokenType.LPAREN) {
      advance(); // consume '('
      const expr = parseExpression();
      expect(TokenType.RPAREN, "to match opening '('");
      return expr;
    }

    // Unexpected token
    throw new Error(
      `Syntax Error at position ${token.position}: Unexpected token '${token.value}'.`
    );
  }

  // ---- Main parse entry ----
  try {
    const ast = parseProgram();

    // Ensure all tokens have been consumed (except EOF)
    if (peek().type !== TokenType.EOF) {
      const leftover = peek();
      throw new Error(
        `Syntax Error at position ${leftover.position}: Unexpected token '${leftover.value}' after complete expression.`
      );
    }

    return { ast, error: null };
  } catch (err) {
    return { ast: null, error: err.message };
  }
}

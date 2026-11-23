/**
 * ============================================================
 * LEXICAL ANALYZER (TOKENIZER)
 * ============================================================
 * 
 * The lexer is the first phase of the compiler pipeline.
 * It reads the input character stream and produces a stream
 * of tokens — the smallest meaningful units of the language.
 * 
 * Token Types:
 *   IDENTIFIER  — variable names (a, b, result, myVar)
 *   NUMBER      — integer and decimal literals (5, 3.14)
 *   OPERATOR    — arithmetic operators (+, -, *, /)
 *   ASSIGN      — assignment operator (=)
 *   LPAREN      — left parenthesis (
 *   RPAREN      — right parenthesis )
 *   EOF         — end of input
 * 
 * The lexer also tracks the position (column) of each token
 * for precise error reporting.
 * ============================================================
 */

// Enumeration of all token types recognized by the lexer
export const TokenType = {
  IDENTIFIER: 'Identifier',
  NUMBER:     'Number',
  OPERATOR:   'Operator',
  ASSIGN:     'Assignment',
  LPAREN:     'Left Paren',
  RPAREN:     'Right Paren',
  SEMICOLON:  'Semicolon',
  EOF:        'EOF',
};

/**
 * Creates a token object.
 * 
 * @param {string} type    — one of TokenType values
 * @param {string} value   — the literal text of the token
 * @param {number} position — column index in the source string
 * @returns {{ type: string, value: string, position: number }}
 */
function createToken(type, value, position) {
  return { type, value, position };
}

/**
 * Tokenizes the input expression string into an array of tokens.
 * 
 * Algorithm:
 *   1. Walk through the input character by character.
 *   2. Skip whitespace.
 *   3. Recognize multi-character identifiers and numbers.
 *   4. Recognize single-character operators and punctuation.
 *   5. Report illegal characters.
 * 
 * @param {string} input — the source expression
 * @returns {{ tokens: Array, error: string|null }}
 */
export function tokenize(input) {
  const tokens = [];
  let pos = 0;

  // Guard: empty or whitespace-only input
  if (!input || input.trim().length === 0) {
    return {
      tokens: [],
      error: 'Empty input: Please enter an expression.',
    };
  }

  while (pos < input.length) {
    const ch = input[pos];

    // ---- Skip comments: // or # until end of line ----
    if (ch === '/' && pos + 1 < input.length && input[pos + 1] === '/') {
      while (pos < input.length && input[pos] !== '\n') {
        pos++;
      }
      continue;
    }
    if (ch === '#') {
      while (pos < input.length && input[pos] !== '\n') {
        pos++;
      }
      continue;
    }

    // ---- Skip whitespace ----
    if (/\s/.test(ch)) {
      pos++;
      continue;
    }

    // ---- Identifiers: [a-zA-Z_][a-zA-Z0-9_]* ----
    if (/[a-zA-Z_]/.test(ch)) {
      const start = pos;
      while (pos < input.length && /[a-zA-Z0-9_]/.test(input[pos])) {
        pos++;
      }
      tokens.push(createToken(TokenType.IDENTIFIER, input.slice(start, pos), start));
      continue;
    }

    // ---- Numbers: integer or decimal (e.g. 42, 3.14) ----
    if (/[0-9]/.test(ch)) {
      const start = pos;
      while (pos < input.length && /[0-9]/.test(input[pos])) {
        pos++;
      }
      // decimal part
      if (pos < input.length && input[pos] === '.') {
        pos++;
        if (pos < input.length && /[0-9]/.test(input[pos])) {
          while (pos < input.length && /[0-9]/.test(input[pos])) {
            pos++;
          }
        }
      }
      tokens.push(createToken(TokenType.NUMBER, input.slice(start, pos), start));
      continue;
    }

    // ---- Relational & Equality operators (==, !=, <=, >=) ----
    if (ch === '=' && pos + 1 < input.length && input[pos + 1] === '=') {
      tokens.push(createToken(TokenType.OPERATOR, '==', pos));
      pos += 2;
      continue;
    }
    if (ch === '!' && pos + 1 < input.length && input[pos + 1] === '=') {
      tokens.push(createToken(TokenType.OPERATOR, '!=', pos));
      pos += 2;
      continue;
    }
    if (ch === '<' && pos + 1 < input.length && input[pos + 1] === '=') {
      tokens.push(createToken(TokenType.OPERATOR, '<=', pos));
      pos += 2;
      continue;
    }
    if (ch === '>' && pos + 1 < input.length && input[pos + 1] === '=') {
      tokens.push(createToken(TokenType.OPERATOR, '>=', pos));
      pos += 2;
      continue;
    }
    if (ch === '<') {
      tokens.push(createToken(TokenType.OPERATOR, '<', pos));
      pos++;
      continue;
    }
    if (ch === '>') {
      tokens.push(createToken(TokenType.OPERATOR, '>', pos));
      pos++;
      continue;
    }

    // ---- Assignment operator (=) ----
    if (ch === '=') {
      tokens.push(createToken(TokenType.ASSIGN, '=', pos));
      pos++;
      continue;
    }

    // ---- Exponentiation (**) as ^ ----
    if (ch === '*' && pos + 1 < input.length && input[pos + 1] === '*') {
      tokens.push(createToken(TokenType.OPERATOR, '^', pos));
      pos += 2;
      continue;
    }

    // ---- Arithmetic operators (+, -, *, /, %, ^) ----
    if ('+-*/%^'.includes(ch)) {
      tokens.push(createToken(TokenType.OPERATOR, ch, pos));
      pos++;
      continue;
    }

    // ---- Parentheses ----
    if (ch === '(') {
      tokens.push(createToken(TokenType.LPAREN, '(', pos));
      pos++;
      continue;
    }
    if (ch === ')') {
      tokens.push(createToken(TokenType.RPAREN, ')', pos));
      pos++;
      continue;
    }

    // ---- Statement Delimiters ----
    if (ch === ';') {
      tokens.push(createToken(TokenType.SEMICOLON, ';', pos));
      pos++;
      continue;
    }

    // ---- Unrecognized character ----
    return {
      tokens: [],
      error: `Lexical Error at position ${pos}: Unexpected character '${ch}'.`,
    };
  }

  // Append the sentinel EOF token
  tokens.push(createToken(TokenType.EOF, 'EOF', pos));

  return { tokens, error: null };
}

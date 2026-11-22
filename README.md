# Three Address Code (TAC) Generator

> **Compiler Design — Intermediate Code Generation**
> A complete, interactive web application that generates Three Address Code from arithmetic and assignment expressions using a real compiler pipeline.

---

## 📋 Project Overview

This project is a **Three Address Code Generator** — a core component of the intermediate code generation phase in compiler design. It implements a complete compiler front-end pipeline that takes arithmetic/assignment expressions as input and produces Three Address Code (TAC) as output.

The application features a professional dark-themed IDE-like interface built with React and Vite, and implements real compiler algorithms including lexical analysis, recursive descent parsing, AST construction, and intermediate code generation.

## 🎯 Objectives

- Demonstrate the working of a compiler's intermediate code generation phase
- Implement a complete pipeline: Lexer → Parser → AST → TAC
- Visualize compiler internals (tokens, AST, quadruples, triples)
- Provide step-by-step explanations of the code generation process
- Create an educational tool suitable for Compiler Design coursework

## 🛠 Technologies Used

| Technology | Purpose |
|---|---|
| React 19 | UI component framework |
| Vite 6 | Build tool and dev server |
| JavaScript (ES Modules) | Compiler logic and application code |
| CSS3 (Custom Properties) | Styling with dark/light theme support |
| Lucide React | Professional SVG icons |
| localStorage | Expression history persistence |

## ✨ Features

### Compiler Features
- ✅ **Lexical Analyzer** — Tokenizes expressions into classified tokens
- ✅ **Recursive Descent Parser** — Builds AST with correct precedence
- ✅ **Three Address Code Generator** — Post-order AST traversal
- ✅ **Quadruples Representation** — 4-tuple intermediate representation
- ✅ **Triples Representation** — Index-referenced 3-tuple representation
- ✅ **Step-by-Step Explanations** — Human-readable instruction walkthrough

### Application Features
- ✅ Professional dark/light theme toggle
- ✅ Code editor with line numbers
- ✅ Syntax-highlighted TAC output
- ✅ One-click code generation
- ✅ Copy TAC to clipboard
- ✅ Download TAC as TXT file
- ✅ 10 built-in example expressions
- ✅ Expression history (localStorage)
- ✅ Toast notifications
- ✅ Keyboard shortcut (Ctrl+Enter)
- ✅ Comprehensive error messages
- ✅ Educational "Learn TAC" section
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Visual AST representation

## 🏗 Compiler Architecture

```
┌──────────────┐
│  Input        │  "a = b + c * d"
│  Expression   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Lexical      │  Tokenizer: identifies identifiers,
│  Analyzer     │  numbers, operators, parentheses
└──────┬───────┘
       │  Token Stream: [a, =, b, +, c, *, d]
       ▼
┌──────────────┐
│  Syntax       │  Recursive Descent Parser
│  Analyzer     │  Builds Abstract Syntax Tree
└──────┬───────┘
       │  AST:
       │    Assignment('a',
       │      BinaryOp('+',
       │        Identifier('b'),
       │        BinaryOp('*', Identifier('c'), Identifier('d'))
       │      )
       │    )
       ▼
┌──────────────┐
│  TAC          │  Post-order AST traversal
│  Generator    │  Emits three-address instructions
└──────┬───────┘
       │  TAC:
       │    t1 = c * d
       │    t2 = b + t1
       │    a = t2
       ▼
┌──────────────┐    ┌──────────────┐
│  Quadruples   │    │  Triples      │
│  Generator    │    │  Generator    │
└──────────────┘    └──────────────┘
```

## ⚙️ Working Principle

### 1. Lexical Analysis
The tokenizer scans the input character by character:
- Recognizes **identifiers** (variable names like `a`, `result`)
- Recognizes **numbers** (integers and decimals like `42`, `3.14`)
- Classifies **operators** (`+`, `-`, `*`, `/`, `=`)
- Identifies **parentheses** (`(`, `)`)
- Skips whitespace and reports illegal characters

### 2. Syntax Analysis (Parsing)
A **Recursive Descent Parser** implements the following grammar:

```
program      → assignment | expression
assignment   → IDENTIFIER '=' expression
expression   → term (( '+' | '-' ) term)*
term         → unary (( '*' | '/' ) unary)*
unary        → '-' unary | primary
primary      → NUMBER | IDENTIFIER | '(' expression ')'
```

**Operator Precedence** (low to high):
1. Assignment (`=`)
2. Addition, Subtraction (`+`, `-`)
3. Multiplication, Division (`*`, `/`)
4. Unary minus (`-`)
5. Parentheses (`()`)

### 3. AST Construction
The parser produces an Abstract Syntax Tree with these node types:
- `Assignment(variable, expression)`
- `BinaryOp(operator, left, right)`
- `UnaryOp(operator, operand)`
- `Identifier(name)`
- `Number(value)`

### 4. TAC Generation
Post-order traversal of the AST:
1. For leaf nodes (Identifier, Number): return the name/value directly
2. For BinaryOp: generate left, generate right, emit `temp = left op right`
3. For UnaryOp: generate operand, emit `temp = -operand`
4. For Assignment: generate expression, emit `variable = result`

## 📐 Algorithms Used

| Algorithm | Phase |
|---|---|
| Character-by-character scanning | Lexical Analysis |
| Recursive Descent Parsing | Syntax Analysis |
| Post-order tree traversal | TAC Generation |
| Temporary variable allocation | Code Generation |

## 📊 Sample Inputs and Outputs

### Example 1
**Input:** `a = b + c * d`
**TAC Output:**
```
t1 = c * d
t2 = b + t1
a = t2
```

### Example 2
**Input:** `x = (a + b) * (c - d)`
**TAC Output:**
```
t1 = a + b
t2 = c - d
t3 = t1 * t2
x = t3
```

### Example 3
**Input:** `y = a + b * c - d`
**TAC Output:**
```
t1 = b * c
t2 = a + t1
t3 = t2 - d
y = t3
```

### Example 4 (Error)
**Input:** `a = b +`
**Output:** `Syntax Error: Unexpected end of expression.`

## 📦 Installation

### Prerequisites
- **Node.js** (v18 or later)
- **npm** (v9 or later)

### Steps

```bash
# 1. Navigate to the project directory
cd "Three Address Code (TAC) Generator"

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The application will open at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm run preview
```

## 🧪 Test Cases

| # | Expression | Expected Behavior |
|---|---|---|
| 1 | `a = b + c * d` | Correct TAC with 3 instructions |
| 2 | `x = (a + b) * (c - d)` | Parentheses respected |
| 3 | `y = a + b * c - d` | Precedence: * before +/- |
| 4 | `result = (a + b) / (c - d)` | Division supported |
| 5 | `z = a * b + c / d` | Multiple operators |
| 6 | `x = 10 + 20 * 3` | Numeric constants |
| 7 | `a = -b + c` | Unary negation |
| 8 | `a + b * c` | Standalone expression (no assignment) |
| 9 | `a = b +` | Error: missing operand |
| 10 | `x = (a + b` | Error: unmatched parenthesis |

## ✅ Advantages

- Real compiler pipeline — not hardcoded or string-based
- Handles arbitrary nested expressions
- Correct operator precedence and associativity
- Professional, responsive UI
- Educational with step-by-step explanations
- Works offline after installation
- No backend or database required
- Multiple output representations (TAC, Quadruples, Triples)

## ⚠️ Limitations

- Supports only arithmetic expressions (no boolean, relational, or logical operators)
- Single expression per input (no multi-line programs)
- No control flow (if/else, loops)
- No function calls
- No type checking or semantic analysis
- Temporary variables are not optimized (no DAG-based optimization)

## 🔮 Future Scope

- Support for relational and boolean operators
- Control flow statements (if-else, while loops)
- Code optimization passes (constant folding, dead code elimination)
- Target code generation (assembly)
- Multi-line program support
- DAG representation for common subexpression elimination
- Register allocation simulation

## 📚 Viva Questions & Answers

### Q1: What is Three Address Code?
**A:** Three Address Code is an intermediate representation used in compilers where each instruction has at most three addresses — two source operands and one destination. It bridges the gap between the high-level source language and the low-level target machine code.

### Q2: Why is intermediate code generation needed?
**A:** Intermediate code provides machine independence, facilitates optimization, separates the front-end (source-dependent) from the back-end (machine-dependent), and makes the compiler more modular and portable.

### Q3: What is a temporary variable in TAC?
**A:** A temporary variable (t1, t2, ...) is a compiler-generated variable used to store intermediate computation results. They do not exist in the source code and are later mapped to CPU registers during code generation.

### Q4: Explain the difference between Quadruples and Triples.
**A:** **Quadruples** use a 4-tuple `(op, arg1, arg2, result)` with an explicit result field. **Triples** use a 3-tuple `(op, arg1, arg2)` where results are referenced by instruction index. Quadruples are easier to rearrange; Triples use less space.

### Q5: What parsing technique is used in this project?
**A:** Recursive Descent Parsing — a top-down parsing method where each grammar rule is implemented as a function. It is suitable for LL(1) grammars and naturally handles operator precedence through grammar stratification.

### Q6: How is operator precedence handled?
**A:** By stratifying the grammar: lower-precedence operators appear higher in the grammar (parsed first but evaluated last). The hierarchy is: Assignment → Addition/Subtraction → Multiplication/Division → Unary → Primary.

### Q7: What is an Abstract Syntax Tree (AST)?
**A:** An AST is a tree representation of the syntactic structure of the source code. Unlike a parse tree, it omits syntactic sugar (like parentheses) and focuses on the meaningful structure of the expression.

### Q8: How does the TAC generator traverse the AST?
**A:** It uses post-order traversal: visit left subtree, visit right subtree, then process the current node. This ensures that operands are computed before they are used by their parent operation.

### Q9: What types of errors does this generator detect?
**A:** Lexical errors (illegal characters), syntax errors (missing operands, unmatched parentheses, unexpected tokens), and semantic checks (non-variable on left side of assignment).

### Q10: Can this generator handle nested parentheses?
**A:** Yes. The recursive descent parser naturally handles nested parentheses through the recursive `primary → '(' expression ')'` rule, which calls back to `expression` for the inner content.

---

**Developed for Compiler Design Mini-Project**
# Three_Adress_CodeGeneration_Sou_Mou_Sum

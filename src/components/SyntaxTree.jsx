import React, { useState, useMemo, useRef } from 'react';
import {
  GitBranch, ZoomIn, ZoomOut, RotateCcw, Download,
  Layers, Check, Sparkles
} from 'lucide-react';

/**
 * Converts compiler AST nodes into a hierarchy tree format
 * with colors and typography matching the compiler reference design:
 *   - Assignment '=' : Deep Blue (#1d4ed8)
 *   - Add/Sub '+', '-' : Vibrant Green (#16a34a)
 *   - Mul/Div '*', '/' : Vibrant Purple (#7c3aed)
 *   - Variables/Identifiers : Vermilion Orange (#ea580c) with Serif font
 *   - Numeric Literals : Vermilion Orange (#ea580c)
 */
function toHierarchy(node, id = '0') {
  if (!node) return null;

  if (node.type === 'Assignment') {
    return {
      id,
      label: '=',
      nodeType: 'assign',
      color: '#1d4ed8',
      fontFamily: "system-ui, -apple-system, 'SF Pro Display', sans-serif",
      fontWeight: '800',
      description: 'Assignment Operator (=)',
      children: [
        {
          id: `${id}-0`,
          label: node.variable,
          nodeType: 'ident',
          color: '#ea580c',
          fontFamily: "Georgia, 'Times New Roman', Cambria, serif",
          fontWeight: '700',
          description: `Variable (${node.variable})`,
          children: [],
        },
        toHierarchy(node.expression, `${id}-1`),
      ].filter(Boolean),
    };
  }

  if (node.type === 'BinaryOp') {
    const isMulDiv = node.op === '*' || node.op === '/';
    const color = isMulDiv ? '#7c3aed' : '#16a34a';
    return {
      id,
      label: node.op,
      nodeType: 'op',
      color,
      fontFamily: "system-ui, -apple-system, 'SF Pro Display', sans-serif",
      fontWeight: '800',
      description: `Arithmetic Operator (${node.op})`,
      children: [
        toHierarchy(node.left, `${id}-0`),
        toHierarchy(node.right, `${id}-1`),
      ].filter(Boolean),
    };
  }

  if (node.type === 'UnaryOp') {
    return {
      id,
      label: node.op,
      nodeType: 'unary',
      color: '#16a34a',
      fontFamily: "system-ui, -apple-system, 'SF Pro Display', sans-serif",
      fontWeight: '800',
      description: `Unary Operator (${node.op})`,
      children: [toHierarchy(node.operand, `${id}-0`)].filter(Boolean),
    };
  }

  if (node.type === 'Identifier') {
    return {
      id,
      label: node.name,
      nodeType: 'ident',
      color: '#ea580c',
      fontFamily: "Georgia, 'Times New Roman', Cambria, serif",
      fontWeight: '700',
      description: `Identifier (${node.name})`,
      children: [],
    };
  }

  if (node.type === 'Number') {
    return {
      id,
      label: String(node.value),
      nodeType: 'number',
      color: '#ea580c',
      fontFamily: "Georgia, 'Times New Roman', Cambria, serif",
      fontWeight: '700',
      description: `Numeric Literal (${node.value})`,
      children: [],
    };
  }

  return null;
}

/**
 * Computes exact symmetric 2D coordinates for each AST node
 * so parents are centered directly above their children with
 * clean diagonal branch lines (Walker / Leaf-slot algorithm).
 */
function layoutAST(rootNode) {
  if (!rootNode) return { nodes: [], links: [], width: 400, height: 300 };

  const R = 28; // node circle radius
  const leafGap = 86; // horizontal leaf spacing
  const levelGap = 88; // vertical distance between tree levels

  let leafCounter = 0;
  const nodes = [];
  const links = [];

  // Pass 1: depth and initial in-order positions
  function computeInitial(node, depth) {
    node.depth = depth;
    if (!node.children || node.children.length === 0) {
      node.x = leafCounter * leafGap;
      leafCounter++;
    } else {
      for (const child of node.children) {
        computeInitial(child, depth + 1);
      }
      if (node.children.length === 1) {
        node.x = node.children[0].x;
      } else {
        const sum = node.children.reduce((acc, c) => acc + c.x, 0);
        node.x = sum / node.children.length;
      }
    }
  }

  computeInitial(rootNode, 0);

  // Pass 2: ensure minimum separation between any nodes on the same horizontal level
  const minSeparation = 76;
  const byDepth = [];
  function collectByDepth(node) {
    if (!byDepth[node.depth]) byDepth[node.depth] = [];
    byDepth[node.depth].push(node);
    for (const child of node.children || []) {
      collectByDepth(child);
    }
  }
  collectByDepth(rootNode);

  function shiftSubtree(node, dx) {
    node.x += dx;
    for (const child of node.children || []) {
      shiftSubtree(child, dx);
    }
  }

  for (let d = byDepth.length - 1; d >= 0; d--) {
    const levelNodes = byDepth[d].sort((a, b) => a.x - b.x);
    for (let i = 0; i < levelNodes.length - 1; i++) {
      const cur = levelNodes[i];
      const next = levelNodes[i + 1];
      if (next.x - cur.x < minSeparation) {
        const shift = minSeparation - (next.x - cur.x);
        shiftSubtree(next, shift);
      }
    }
  }

  // Pass 3: re-center parent nodes directly over their children
  function reCenterParents(node) {
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        reCenterParents(child);
      }
      if (node.children.length === 1) {
        node.x = node.children[0].x;
      } else {
        const sum = node.children.reduce((acc, c) => acc + c.x, 0);
        node.x = sum / node.children.length;
      }
    }
  }
  reCenterParents(rootNode);

  // Pass 4: flatten nodes and links
  function flatten(node) {
    nodes.push(node);
    for (const child of node.children || []) {
      links.push({ source: node, target: child });
      flatten(child);
    }
  }
  flatten(rootNode);

  // Pass 5: normalize with comfortable padding
  let minX = Infinity;
  let maxX = -Infinity;
  let maxDepth = 0;
  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.depth > maxDepth) maxDepth = n.depth;
  }

  const paddingX = 64;
  const paddingTop = 56;
  const paddingBottom = 64;

  for (const n of nodes) {
    n.x = n.x - minX + paddingX;
    n.y = n.depth * levelGap + paddingTop;
  }

  const width = Math.max(maxX - minX + paddingX * 2, 340);
  const height = maxDepth * levelGap + paddingTop + paddingBottom;

  return { nodes, links, width, height, radius: R };
}

function getNodeFontSize(label, nodeType) {
  const str = String(label);
  if (nodeType === 'assign' || nodeType === 'op' || nodeType === 'unary') {
    return str === '=' ? 30 : str === '*' ? 28 : 28;
  }
  if (str.length <= 1) return 24;
  if (str.length <= 2) return 20;
  if (str.length <= 4) return 15;
  if (str.length <= 6) return 13;
  return 11;
}

export default function SyntaxTree({ ast }) {
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState('reference'); // 'reference' | 'detailed'
  const [selectedStmtIndex, setSelectedStmtIndex] = useState(0);
  const svgRef = useRef(null);

  if (!ast) {
    return (
      <div className="tab-empty-box">
        <GitBranch size={28} />
        <p>No syntax tree to render</p>
      </div>
    );
  }

  // Handle multiple statements (Program node)
  const isProgram = ast.type === 'Program' && Array.isArray(ast.body);
  const statements = isProgram ? ast.body : [ast];
  const activeStmt = statements[selectedStmtIndex] || statements[0];

  const hierarchy = useMemo(() => toHierarchy(activeStmt), [activeStmt]);
  const layout = useMemo(() => layoutAST(hierarchy), [hierarchy]);

  // Zoom handlers
  const handleZoomIn = () => setZoom(z => Math.min(Number((z + 0.15).toFixed(2)), 2.2));
  const handleZoomOut = () => setZoom(z => Math.max(Number((z - 0.15).toFixed(2)), 0.5));
  const handleResetZoom = () => setZoom(1);

  // Download SVG
  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `syntax-tree-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="analysis-card-inner">
      {/* Top Header Bar */}
      <div className="table-top-bar">
        <div>
          <h3 className="section-card-title">Abstract Syntax Tree (AST)</h3>
          <p className="section-card-subtitle">
            Parsed hierarchy enforcing operator precedence and associativity.
          </p>
        </div>
        <div className="ast-header-actions">
          <div className="view-mode-toggle">
            <button
              className={`mode-btn ${viewMode === 'reference' ? 'active' : ''}`}
              onClick={() => setViewMode('reference')}
              title="Reference diagram style (white circular nodes, angled branches)"
            >
              <Sparkles size={13} />
              <span>Tree Graph</span>
            </button>
            <button
              className={`mode-btn ${viewMode === 'detailed' ? 'active' : ''}`}
              onClick={() => setViewMode('detailed')}
              title="Detailed AST badge cards"
            >
              <Layers size={13} />
              <span>Badges</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Statement Selector (if input has multiple instructions) */}
      {statements.length > 1 && (
        <div className="ast-statements-bar">
          <span className="statements-label">Instructions:</span>
          <div className="statements-list">
            {statements.map((stmt, idx) => (
              <button
                key={idx}
                className={`statement-pill ${selectedStmtIndex === idx ? 'active' : ''}`}
                onClick={() => setSelectedStmtIndex(idx)}
              >
                <span>Instruction {idx + 1}</span>
                {stmt.type === 'Assignment' && (
                  <code className="stmt-var-code">{stmt.variable} = ...</code>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      {viewMode === 'reference' ? (
        <div className="ast-visual-container">
          {/* Controls Toolbar */}
          <div className="ast-canvas-toolbar">
            <div className="ast-legend">
              <span className="legend-item">
                <span className="legend-dot assign-dot" />
                <span className="legend-text">Assignment (=)</span>
              </span>
              <span className="legend-item">
                <span className="legend-dot add-dot" />
                <span className="legend-text">+ / -</span>
              </span>
              <span className="legend-item">
                <span className="legend-dot mul-dot" />
                <span className="legend-text">* / /</span>
              </span>
              <span className="legend-item">
                <span className="legend-dot id-dot" />
                <span className="legend-text">Variables / Literals</span>
              </span>
            </div>

            <div className="ast-zoom-controls">
              <button className="icon-ctrl-btn" onClick={handleZoomOut} title="Zoom Out">
                <ZoomOut size={14} />
              </button>
              <span className="zoom-badge">{Math.round(zoom * 100)}%</span>
              <button className="icon-ctrl-btn" onClick={handleZoomIn} title="Zoom In">
                <ZoomIn size={14} />
              </button>
              <button className="icon-ctrl-btn" onClick={handleResetZoom} title="Reset View">
                <RotateCcw size={14} />
              </button>
              <button className="icon-ctrl-btn highlight" onClick={handleDownloadSVG} title="Download SVG Diagram">
                <Download size={14} />
                <span className="ctrl-btn-text">SVG</span>
              </button>
            </div>
          </div>

          {/* SVG Diagram Canvas */}
          <div className="ast-canvas-stage">
            <svg
              ref={svgRef}
              className="ast-svg-canvas"
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              style={{
                width: `${layout.width * zoom}px`,
                height: `${layout.height * zoom}px`,
              }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="node-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4.5" floodColor="#000000" floodOpacity="0.45" />
                </filter>
              </defs>

              {/* Connecting Branch Lines (rendered first so circles cover them seamlessly) */}
              <g className="ast-branch-lines">
                {layout.links.map((link, idx) => (
                  <line
                    key={`line-${idx}`}
                    x1={link.source.x}
                    y1={link.source.y}
                    x2={link.target.x}
                    y2={link.target.y}
                    stroke="#ffffff"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    className="ast-tree-line"
                  />
                ))}
              </g>

              {/* Circular Tree Nodes (matching user's reference diagram) */}
              <g className="ast-nodes-group">
                {layout.nodes.map(node => {
                  const fontSize = getNodeFontSize(node.label, node.nodeType);
                  return (
                    <g key={node.id} className="ast-node-element" tabIndex="0">
                      <title>{node.description || node.label}</title>
                      {/* Crisp White Circular Disc */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={layout.radius}
                        fill="#ffffff"
                        filter="url(#node-shadow)"
                        className="ast-node-circle"
                      />
                      {/* Colorful Centered Symbol / Variable */}
                      <text
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={node.color}
                        fontSize={fontSize}
                        fontWeight={node.fontWeight || '700'}
                        fontFamily={node.fontFamily}
                        className="ast-node-text"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
      ) : (
        /* Detailed AST Badges View */
        <div className="ast-tree-scrollable">
          <div className="ast-tree-canvas">
            <TreeNodeLegacy node={activeStmt} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Legacy badge view for users who wish to inspect AST token tags */
function TreeNodeLegacy({ node }) {
  if (!node) return null;

  switch (node.type) {
    case 'Assignment':
      return (
        <div className="ast-branch">
          <div className="ast-node node-assign">
            <span className="ast-tag">ASSIGN</span>
            <span className="ast-val">=</span>
          </div>
          <div className="ast-children">
            <div className="ast-child-wrap">
              <div className="ast-line" />
              <div className="ast-node node-id">
                <span className="ast-tag">L-VAL</span>
                <span className="ast-val">{node.variable}</span>
              </div>
            </div>
            <div className="ast-child-wrap">
              <div className="ast-line" />
              <TreeNodeLegacy node={node.expression} />
            </div>
          </div>
        </div>
      );

    case 'BinaryOp':
      return (
        <div className="ast-branch">
          <div className="ast-node node-op">
            <span className="ast-tag">OP</span>
            <span className="ast-val">{node.op}</span>
          </div>
          <div className="ast-children">
            <div className="ast-child-wrap">
              <div className="ast-line" />
              <TreeNodeLegacy node={node.left} />
            </div>
            <div className="ast-child-wrap">
              <div className="ast-line" />
              <TreeNodeLegacy node={node.right} />
            </div>
          </div>
        </div>
      );

    case 'UnaryOp':
      return (
        <div className="ast-branch">
          <div className="ast-node node-op unary">
            <span className="ast-tag">UNARY</span>
            <span className="ast-val">{node.op}</span>
          </div>
          <div className="ast-children single">
            <div className="ast-child-wrap">
              <div className="ast-line" />
              <TreeNodeLegacy node={node.operand} />
            </div>
          </div>
        </div>
      );

    case 'Identifier':
      return (
        <div className="ast-node node-id">
          <span className="ast-tag">IDENT</span>
          <span className="ast-val">{node.name}</span>
        </div>
      );

    case 'Number':
      return (
        <div className="ast-node node-num">
          <span className="ast-tag">CONST</span>
          <span className="ast-val">{node.value}</span>
        </div>
      );

    default:
      return (
        <div className="ast-node node-id">
          <span className="ast-val">{JSON.stringify(node)}</span>
        </div>
      );
  }
}

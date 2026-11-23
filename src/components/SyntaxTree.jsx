import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  GitBranch, ZoomIn, ZoomOut, RotateCcw, Download,
  Layers, Check, Sparkles, Maximize2, Minimize2,
  Info, Image as ImageIcon, X
} from 'lucide-react';

/**
 * Converts compiler AST nodes into a hierarchy tree format
 * with colors and typography matching the compiler reference design:
 *   - Assignment '=' : Deep Blue (#1d4ed8)
 *   - Add/Sub '+', '-' : Vibrant Green (#16a34a)
 *   - Mul/Div/Power '*', '/', '^', '%' : Vibrant Purple (#7c3aed)
 *   - Relational '==', '<', etc. : Emerald Green (#16a34a)
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
      subExpr: `${node.variable} = ...`,
      children: [
        {
          id: `${id}-0`,
          label: node.variable,
          nodeType: 'ident',
          color: '#ea580c',
          fontFamily: "Georgia, 'Times New Roman', Cambria, serif",
          fontWeight: '700',
          description: `Variable L-Value (${node.variable})`,
          subExpr: node.variable,
          children: [],
        },
        toHierarchy(node.expression, `${id}-1`),
      ].filter(Boolean),
    };
  }

  if (node.type === 'BinaryOp') {
    const isMulDiv = node.op === '*' || node.op === '/' || node.op === '%' || node.op === '^';
    const color = isMulDiv ? '#7c3aed' : '#16a34a';
    return {
      id,
      label: node.op,
      nodeType: 'op',
      color,
      fontFamily: "system-ui, -apple-system, 'SF Pro Display', sans-serif",
      fontWeight: '800',
      description: `Binary Operator (${node.op})`,
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
      subExpr: node.name,
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
      subExpr: String(node.value),
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
  if (!rootNode) return { nodes: [], links: [], width: 400, height: 300, stats: {} };

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
  let leafCount = 0;
  let opCount = 0;

  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.depth > maxDepth) maxDepth = n.depth;
    if (!n.children || n.children.length === 0) leafCount++;
    if (n.nodeType === 'op' || n.nodeType === 'assign' || n.nodeType === 'unary') opCount++;
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

  return {
    nodes,
    links,
    width,
    height,
    radius: R,
    stats: {
      totalNodes: nodes.length,
      maxDepth: maxDepth + 1,
      leafCount,
      opCount,
    },
  };
}

function getNodeFontSize(label, nodeType) {
  const str = String(label);
  if (nodeType === 'assign' || nodeType === 'op' || nodeType === 'unary') {
    if (str.length > 1) return 20;
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inspectedNode, setInspectedNode] = useState(null);

  // Pan state for dragging the canvas
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const svgRef = useRef(null);
  const stageRef = useRef(null);

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
  const handleZoomIn = () => setZoom(z => Math.min(Number((z + 0.15).toFixed(2)), 2.5));
  const handleZoomOut = () => setZoom(z => Math.max(Number((z - 0.15).toFixed(2)), 0.4));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag-to-pan handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // only left click
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

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

  // Download High-Resolution PNG (2x scale)
  const handleDownloadPNG = () => {
    if (!svgRef.current) return;
    const svgEl = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scale = 2; // 2x retina crispness
      const canvas = document.createElement('canvas');
      canvas.width = layout.width * scale;
      canvas.height = layout.height * scale;
      const ctx = canvas.getContext('2d');

      // Draw dark canvas background matching reference image
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `syntax-tree-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = url;
  };

  return (
    <div className={`analysis-card-inner ${isFullscreen ? 'ast-fullscreen-active' : ''}`}>
      {/* Top Header Bar */}
      <div className="table-top-bar">
        <div>
          <h3 className="section-card-title">Abstract Syntax Tree (AST)</h3>
          <p className="section-card-subtitle">
            Parsed hierarchy enforcing operator precedence and associativity.
          </p>
        </div>
        <div className="ast-header-actions">
          {/* Tree Statistics Pills */}
          <div className="ast-meta-pills">
            <span className="count-pill">{layout.stats.totalNodes} Nodes</span>
            <span className="count-pill depth-pill">{layout.stats.maxDepth} Levels</span>
          </div>

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
                onClick={() => {
                  setSelectedStmtIndex(idx);
                  setInspectedNode(null);
                }}
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
        <div className={`ast-visual-container ${isFullscreen ? 'fullscreen-container' : ''}`}>
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
                <span className="legend-text">* / / / ^ / %</span>
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
              <button className="icon-ctrl-btn" onClick={handleResetZoom} title="Reset Zoom & Pan">
                <RotateCcw size={14} />
              </button>

              <div className="ctrl-btn-separator" />

              <button className="icon-ctrl-btn highlight" onClick={handleDownloadPNG} title="Download High-Res PNG">
                <ImageIcon size={14} />
                <span className="ctrl-btn-text">PNG</span>
              </button>

              <button className="icon-ctrl-btn highlight" onClick={handleDownloadSVG} title="Download Vector SVG">
                <Download size={14} />
                <span className="ctrl-btn-text">SVG</span>
              </button>

              <button
                className="icon-ctrl-btn"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          </div>

          {/* Interactive Drag & Pan SVG Stage */}
          <div
            ref={stageRef}
            className={`ast-canvas-stage ${isDragging ? 'is-dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="ast-transform-layer"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
            >
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
                  <filter id="node-glow" x="-40%" y="-40%" width="180%" height="180%">
                    <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.8" />
                  </filter>
                </defs>

                {/* Connecting Branch Lines (rendered first so circles cover them cleanly) */}
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
                    const isSelected = inspectedNode?.id === node.id;
                    return (
                      <g
                        key={node.id}
                        className={`ast-node-element ${isSelected ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedNode(node);
                        }}
                      >
                        <title>{node.description || node.label}</title>
                        {/* Crisp White Circular Disc */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={layout.radius}
                          fill="#ffffff"
                          filter={isSelected ? 'url(#node-glow)' : 'url(#node-shadow)'}
                          stroke={isSelected ? '#38bdf8' : 'none'}
                          strokeWidth={isSelected ? '3' : '0'}
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

            {/* Interactive Node Inspector Card on Click */}
            {inspectedNode && (
              <div className="ast-inspector-card" onClick={e => e.stopPropagation()}>
                <div className="inspector-header">
                  <div className="inspector-title">
                    <span className="inspector-dot" style={{ background: inspectedNode.color }} />
                    <strong>Node: {inspectedNode.label}</strong>
                  </div>
                  <button
                    className="inspector-close-btn"
                    onClick={() => setInspectedNode(null)}
                    title="Close inspector"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="inspector-body">
                  <div className="inspector-row">
                    <span className="row-k">Classification</span>
                    <span className="row-v">{inspectedNode.description}</span>
                  </div>
                  <div className="inspector-row">
                    <span className="row-k">Tree Depth</span>
                    <span className="row-v">Level {inspectedNode.depth + 1}</span>
                  </div>
                  <div className="inspector-row">
                    <span className="row-k">Sub-nodes</span>
                    <span className="row-v">{inspectedNode.children?.length || 0} children</span>
                  </div>
                </div>
              </div>
            )}
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

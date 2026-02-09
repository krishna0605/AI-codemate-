/**
 * Code Metrics Calculator
 * Computes various code quality metrics for a given file.
 */

export interface FunctionMetric {
  name: string;
  startLine: number;
  endLine: number;
  loc: number;
  cyclomaticComplexity: number;
}

export interface FileMetrics {
  filePath: string;
  totalLOC: number;
  physicalLOC: number;
  blankLines: number;
  commentLines: number;
  codeLOC: number;
  functions: FunctionMetric[];
  averageComplexity: number;
  maxComplexity: number;
  importCount: number;
}

/**
 * Calculate metrics for a TypeScript/JavaScript file
 */
export function calculateFileMetrics(code: string, filePath: string): FileMetrics {
  const lines = code.split('\n');

  // Basic LOC
  const totalLOC = lines.length;
  const blankLines = lines.filter((line) => line.trim() === '').length;
  const commentLines = countCommentLines(lines);
  const codeLOC = totalLOC - blankLines - commentLines;

  // Count imports
  const importCount = lines.filter(
    (line) => line.trim().startsWith('import ') || line.trim().startsWith('require(')
  ).length;

  // Find functions and calculate complexity
  const functions = extractFunctions(code, lines);

  // Aggregate complexity
  const complexities = functions.map((f) => f.cyclomaticComplexity);
  const averageComplexity =
    complexities.length > 0 ? complexities.reduce((a, b) => a + b, 0) / complexities.length : 0;
  const maxComplexity = complexities.length > 0 ? Math.max(...complexities) : 0;

  return {
    filePath,
    totalLOC,
    physicalLOC: codeLOC + blankLines,
    blankLines,
    commentLines,
    codeLOC,
    functions,
    averageComplexity: Math.round(averageComplexity * 10) / 10,
    maxComplexity,
    importCount,
  };
}

/**
 * Count comment lines (simple heuristic for JS/TS)
 */
function countCommentLines(lines: string[]): number {
  let count = 0;
  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (inBlockComment) {
      count++;
      if (trimmed.includes('*/')) {
        inBlockComment = false;
      }
    } else if (trimmed.startsWith('//')) {
      count++;
    } else if (trimmed.startsWith('/*')) {
      count++;
      if (!trimmed.includes('*/')) {
        inBlockComment = true;
      }
    }
  }

  return count;
}

/**
 * Extract functions and calculate their metrics
 * Uses regex-based heuristics (a full parser would be more accurate)
 */
function extractFunctions(code: string, lines: string[]): FunctionMetric[] {
  const functions: FunctionMetric[] = [];

  // Patterns for function definitions
  const patterns = [
    /function\s+(\w+)\s*\(/g, // function foo()
    /const\s+(\w+)\s*=\s*(?:async\s*)?\(/g, // const foo = (
    /(\w+)\s*:\s*(?:async\s*)?\([^)]*\)\s*=>/g, // foo: () =>
    /(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/g, // method() { (class methods)
  ];

  // Simple brace matching to find function boundaries
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line contains a function definition
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(line);
      if (match) {
        const name = match[1] || 'anonymous';
        const startLine = i + 1;

        // Find the end of the function by counting braces
        let braceCount = 0;
        let foundOpen = false;
        let endLine = startLine;

        for (let j = i; j < lines.length; j++) {
          const searchLine = lines[j];
          for (const char of searchLine) {
            if (char === '{') {
              braceCount++;
              foundOpen = true;
            } else if (char === '}') {
              braceCount--;
            }
          }
          if (foundOpen && braceCount === 0) {
            endLine = j + 1;
            break;
          }
        }

        // Calculate function body
        const functionBody = lines.slice(i, endLine).join('\n');
        const loc = endLine - startLine + 1;
        const complexity = calculateCyclomaticComplexity(functionBody);

        functions.push({
          name,
          startLine,
          endLine,
          loc,
          cyclomaticComplexity: complexity,
        });

        break; // Only count first match per line
      }
    }
  }

  return functions;
}

/**
 * Calculate cyclomatic complexity using McCabe's formula
 * CC = E - N + 2P (simplified: count decision points + 1)
 */
function calculateCyclomaticComplexity(code: string): number {
  let complexity = 1; // Base complexity

  // Decision point keywords
  const decisionPatterns = [
    /\bif\s*\(/g,
    /\belse\s+if\s*\(/g,
    /\bwhile\s*\(/g,
    /\bfor\s*\(/g,
    /\bfor\s+of\s*\(/g,
    /\bfor\s+in\s*\(/g,
    /\bcase\s+/g,
    /\bcatch\s*\(/g,
    /\?\s*[^:]/g, // Ternary operator
    /\&\&/g, // Logical AND
    /\|\|/g, // Logical OR
    /\?\?/g, // Nullish coalescing
  ];

  for (const pattern of decisionPatterns) {
    const matches = code.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  }

  return complexity;
}

/**
 * Get a complexity rating based on threshold
 */
export function getComplexityRating(complexity: number): 'low' | 'medium' | 'high' | 'very-high' {
  if (complexity <= 5) return 'low';
  if (complexity <= 10) return 'medium';
  if (complexity <= 20) return 'high';
  return 'very-high';
}

/**
 * Get color for complexity rating
 */
export function getComplexityColor(rating: ReturnType<typeof getComplexityRating>): string {
  switch (rating) {
    case 'low':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'high':
      return 'text-orange-400';
    case 'very-high':
      return 'text-red-400';
  }
}

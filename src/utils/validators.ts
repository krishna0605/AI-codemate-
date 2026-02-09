import { Diagnostic } from '@/hooks/useDiagnostics';

/**
 * Custom validators for languages not natively supported by Monaco.
 * These provide basic syntax checking without full language server support.
 */

// Python validator - checks for common syntax issues
export function validatePython(content: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const lines = content.split('\n');

  let indentStack: number[] = [0];
  let inMultilineString = false;
  let multilineStringChar = '';

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) return;

    // Track multiline strings
    const tripleQuotes = ['"""', "'''"];
    for (const quote of tripleQuotes) {
      const count = (line.match(new RegExp(quote.replace(/'/g, "\\'"), 'g')) || []).length;
      if (count % 2 === 1) {
        if (!inMultilineString) {
          inMultilineString = true;
          multilineStringChar = quote;
        } else if (multilineStringChar === quote) {
          inMultilineString = false;
        }
      }
    }
    if (inMultilineString) return;

    // Check for missing colon after control statements
    const controlStatements = [
      'if',
      'elif',
      'else',
      'for',
      'while',
      'def',
      'class',
      'try',
      'except',
      'finally',
      'with',
    ];
    for (const stmt of controlStatements) {
      const pattern = new RegExp(`^${stmt}\\b(?!.*:)`);
      if (pattern.test(trimmed) && !trimmed.endsWith(':') && !trimmed.endsWith(':\\')) {
        diagnostics.push({
          message: `Missing colon after '${stmt}' statement`,
          severity: 'error',
          startLine: lineNumber,
          endLine: lineNumber,
          source: 'python',
        });
      }
    }

    // Check for unmatched brackets
    const brackets = { '(': ')', '[': ']', '{': '}' };
    const stack: string[] = [];
    for (const char of line) {
      if (char in brackets) {
        stack.push(brackets[char as keyof typeof brackets]);
      } else if (Object.values(brackets).includes(char)) {
        if (stack.length === 0 || stack.pop() !== char) {
          diagnostics.push({
            message: `Unmatched bracket '${char}'`,
            severity: 'error',
            startLine: lineNumber,
            endLine: lineNumber,
            source: 'python',
          });
        }
      }
    }

    // Check indentation (must be multiple of 4 or consistent tabs)
    const leadingSpaces = line.match(/^( *)/)?.[1].length || 0;
    if (leadingSpaces > 0 && leadingSpaces % 4 !== 0 && !line.startsWith('\t')) {
      diagnostics.push({
        message: 'Inconsistent indentation (should be multiple of 4 spaces)',
        severity: 'warning',
        startLine: lineNumber,
        endLine: lineNumber,
        source: 'python',
      });
    }
  });

  return diagnostics;
}

// Generic bracket matching for any language
export function validateBrackets(content: string, language: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const lines = content.split('\n');
  const stack: { char: string; line: number; col: number }[] = [];
  const brackets: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
  const closingBrackets = Object.values(brackets);

  lines.forEach((line, lineIndex) => {
    for (let col = 0; col < line.length; col++) {
      const char = line[col];
      if (char in brackets) {
        stack.push({ char: brackets[char], line: lineIndex + 1, col: col + 1 });
      } else if (closingBrackets.includes(char)) {
        if (stack.length === 0) {
          diagnostics.push({
            message: `Unexpected closing bracket '${char}'`,
            severity: 'error',
            startLine: lineIndex + 1,
            endLine: lineIndex + 1,
            source: language,
          });
        } else {
          const expected = stack.pop();
          if (expected && expected.char !== char) {
            diagnostics.push({
              message: `Mismatched bracket: expected '${expected.char}' but found '${char}'`,
              severity: 'error',
              startLine: lineIndex + 1,
              endLine: lineIndex + 1,
              source: language,
            });
          }
        }
      }
    }
  });

  // Report unclosed brackets
  stack.forEach((unclosed) => {
    diagnostics.push({
      message: `Unclosed bracket (opened with '${Object.keys(brackets).find((k) => brackets[k] === unclosed.char)}')`,
      severity: 'error',
      startLine: unclosed.line,
      endLine: unclosed.line,
      source: language,
    });
  });

  return diagnostics;
}

// Validator dispatcher based on language
export function validateCode(content: string, language: string): Diagnostic[] {
  switch (language) {
    case 'python':
      return validatePython(content);
    case 'go':
    case 'rust':
    case 'c':
    case 'cpp':
    case 'java':
      return validateBrackets(content, language);
    default:
      // Monaco handles ts, js, json, css, html internally
      return [];
  }
}

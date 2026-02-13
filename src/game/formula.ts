import type { FlagValue, FormulaRule } from './types';

export type EvalContext = Record<string, FlagValue>;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeExpression(expression: string): string {
  return expression.replace(/\bis null\b/g, '=== null');
}

export function evaluateExpression(
  expression: string,
  context: EvalContext,
  choice: (nodeId: string) => string | undefined
): FlagValue {
  const normalized = normalizeExpression(expression);
  const sandboxBase = {
    ...context,
    choice,
    clamp,
    Math
  };

  const sandbox = new Proxy(sandboxBase, {
    has: () => true,
    get(target, property: string | symbol) {
      if (typeof property === 'symbol') {
        return undefined;
      }
      return property in target ? target[property as keyof typeof target] : null;
    }
  });

  const evaluator = new Function(
    'sandbox',
    `with (sandbox) { return (${normalized}); }`
  ) as (sandboxValue: typeof sandboxBase) => FlagValue;

  return evaluator(sandbox as typeof sandboxBase);
}

export function executeAssignment(
  statement: string,
  context: EvalContext,
  choice: (nodeId: string) => string | undefined
): { key: string; value: FlagValue } {
  const assignmentMatch = statement.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)\s*$/);
  if (!assignmentMatch) {
    throw new Error(`Unsupported assignment statement: ${statement}`);
  }

  const [, key, rhs] = assignmentMatch;
  const value = evaluateExpression(rhs, context, choice);
  context[key] = value;

  return { key, value };
}

export function executeRules(
  rules: FormulaRule[] | undefined,
  context: EvalContext,
  choice: (nodeId: string) => string | undefined
): void {
  if (!rules) {
    return;
  }

  for (const rule of rules) {
    executeAssignment(rule.expression, context, choice);
  }
}

function parsePostClause(clause: string): {
  condition: string;
  key: string;
  rhs: string;
} {
  const withThen = clause.match(/^if\s*\((.+)\)\s*then\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/i);
  if (withThen) {
    const [, condition, key, rhs] = withThen;
    return { condition, key, rhs };
  }

  const withoutThen = clause.match(/^if\s*\((.+)\)\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/i);
  if (withoutThen) {
    const [, condition, key, rhs] = withoutThen;
    return { condition, key, rhs };
  }

  throw new Error(`Unsupported post-rule clause: ${clause}`);
}

export function executePostRule(
  statement: string,
  context: EvalContext,
  choice: (nodeId: string) => string | undefined
): Record<string, FlagValue> {
  const assignments: Record<string, FlagValue> = {};
  const clauses = statement
    .split(';')
    .map((segment) => segment.trim())
    .filter(Boolean);

  for (const clause of clauses) {
    const { condition, key, rhs } = parsePostClause(clause);
    const shouldAssign = Boolean(evaluateExpression(condition, context, choice));

    if (!shouldAssign) {
      continue;
    }

    const value = evaluateExpression(rhs, context, choice);
    context[key] = value;
    assignments[key] = value;
  }

  return assignments;
}

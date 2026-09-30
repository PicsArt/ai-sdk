/**
 * Declarative parameter constraint evaluator.
 *
 * Model(id).paramsFor(values) calls evaluateConstraints() and
 * evaluateRequirements() internally. The first returns a map of param key →
 * normalized restriction (allowed subset or disabled); the second the params a
 * matching rule made required. They are separate because "required" is
 * orthogonal to the other two: a param can be both required and limited to a
 * subset, so it must not take part in the disabled/allowed merge.
 */
import type { ConditionOperator, Constraint, GenerationContext, Restriction } from './types.ts';

/** Internal normalized form — discriminated union matching the public Restriction. */
export type NormalizedRestriction =
  | { kind: 'allowed'; allowed: unknown[]; reason?: string }
  | { kind: 'disabled'; reason?: string };

function normalize(r: Restriction): NormalizedRestriction | null {
  if ('required' in r) return null;
  if ('disabled' in r) return { kind: 'disabled', reason: r.reason };
  return { kind: 'allowed', allowed: r.allowed, reason: r.reason };
}

function matchOperator(op: ConditionOperator, actual: unknown): boolean {
  if ('exists' in op) {
    // Treat empty arrays and blank strings as "does not exist" — UI code paths
    // clear fields by setting them to the empty value of the same type
    // (`imageUrls = []`, `audioUrl = ''`), and semantically that means cleared.
    // Blank, not just empty: a whitespace-only prompt must match
    // `prompt: { exists: false }`, the same way `validateAll` counts it as
    // absent, or a conditional requirement on it could be satisfied by "  ".
    const has = actual != null
      && (!Array.isArray(actual) || actual.length > 0)
      && (typeof actual !== 'string' || actual.trim().length > 0);
    return op.exists ? has : !has;
  }
  if ('is' in op) return actual === op.is;
  return false;
}

function matchCondition(
  when: Record<string, ConditionOperator>,
  values: Partial<GenerationContext>,
): boolean {
  return Object.entries(when).every(([key, op]) =>
    matchOperator(op, values[key as keyof GenerationContext]),
  );
}

/** Merge two restrictions. Disabled beats allowed; two allowed sets intersect. */
function merge(prev: NormalizedRestriction | undefined, next: NormalizedRestriction): NormalizedRestriction {
  if (!prev) return next;
  if (prev.kind === 'disabled' || next.kind === 'disabled') {
    return { kind: 'disabled', reason: next.kind === 'disabled' ? next.reason : prev.kind === 'disabled' ? prev.reason : undefined };
  }
  const allowed = new Set(next.allowed.map(String));
  return {
    kind: 'allowed',
    allowed: prev.allowed.filter(o => allowed.has(String(o))),
    reason: next.reason ?? prev.reason,
  };
}

/**
 * Evaluate all constraint rules against current values.
 * When multiple rules match the same param, allow lists are intersected.
 */
export function evaluateConstraints(
  constraints: Constraint[] | undefined,
  values: Partial<GenerationContext>,
): Map<string, NormalizedRestriction> {
  const effects = new Map<string, NormalizedRestriction>();
  if (!constraints?.length) return effects;

  for (const rule of constraints) {
    if (!matchCondition(rule.when, values)) continue;
    for (const [key, restriction] of Object.entries(rule.then)) {
      const normalized = normalize(restriction);
      if (normalized) effects.set(key, merge(effects.get(key), normalized));
    }
  }
  return effects;
}

/** A param a matching rule made required, with the first matching rule's reason. */
export interface ConditionalRequirement {
  reason?: string;
}

/**
 * The params that `required` restrictions make required for these values.
 * The first matching rule's reason wins for a key.
 */
export function evaluateRequirements(
  constraints: Constraint[] | undefined,
  values: Partial<GenerationContext>,
): Map<string, ConditionalRequirement> {
  const requirements = new Map<string, ConditionalRequirement>();
  if (!constraints?.length) return requirements;

  for (const rule of constraints) {
    if (!matchCondition(rule.when, values)) continue;
    for (const [key, restriction] of Object.entries(rule.then)) {
      if ('required' in restriction && !requirements.has(key)) {
        requirements.set(key, { reason: restriction.reason });
      }
    }
  }
  return requirements;
}

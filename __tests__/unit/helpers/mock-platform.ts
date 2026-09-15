/**
 * Mock of the Picsart workflows platform at the fetch level — the seam the
 * built-in transport runs on (@picsart/workflows-client drives all lifecycle
 * HTTP through the injected fetch). A custom transport replaces this layer
 * outright; see `transport.test.ts`. Route shapes mirror
 * pa-pluggable-api-adapter:
 *   POST /workflows/{wf}/submit        → { status:'success', response:{ id } }
 *   GET  /workflows/{wf}/{id}/result   → { status:'success', response:{ id, updated, status, result, progress?, usage? } }
 *   POST /workflows/{wf}/execute       → { status:'success', response:{ result, usage? } }
 *   POST /workflows/{wf}/options       → { status:'success', response:{ credits } }
 */
import type { AuthenticatedFetch } from '../../../src/client/index.ts';

export interface StatusFrame {
  status: 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  result?: unknown;
  progress?: { percent: number; estimatedSecondsLeft?: number };
  usage?: unknown;
}

export interface PlatformHooks {
  /** Returns the task id for a submit. Default: 'task-1'. */
  submit?: (workflow: string, payload: Record<string, unknown>) => string;
  /** Returns the status frame for poll N (1-based) of a task. */
  status?: (workflow: string, id: string, poll: number) => StatusFrame;
  /** Returns the sync-execute task result. */
  execute?: (workflow: string, payload: Record<string, unknown>) => unknown;
  /** Returns the credits for an /options call (null → no credits field). */
  options?: (workflow: string, payload: Record<string, unknown>) => number | null;
}

export interface PlatformMock {
  fetch: AuthenticatedFetch;
  calls: {
    submits: Array<{ workflow: string; payload: Record<string, unknown> }>;
    polls: number;
    executes: Array<{ workflow: string; payload: Record<string, unknown> }>;
  };
}

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export function mockPlatform(hooks: PlatformHooks = {}): PlatformMock {
  const calls: PlatformMock['calls'] = { submits: [], polls: 0, executes: [] };
  const pollCounts = new Map<string, number>();

  const fetch: AuthenticatedFetch = async (url, init) => {
    if (init?.signal?.aborted) {
      throw new DOMException('The operation was aborted.', 'AbortError');
    }
    const u = new URL(url);
    const path = u.pathname.replace(/^.*\/workflows\//, '');
    const params = init?.body ? (JSON.parse(String(init.body)).params ?? {}) : {};

    if (path.endsWith('/submit')) {
      const workflow = path.slice(0, -'/submit'.length);
      calls.submits.push({ workflow, payload: params });
      const id = hooks.submit?.(workflow, params) ?? 'task-1';
      return json(200, { status: 'success', response: { id } });
    }
    if (path.endsWith('/result')) {
      const [, workflow, id] = /^(.*)\/([^/]+)\/result$/.exec(path)!;
      calls.polls++;
      const poll = (pollCounts.get(id) ?? 0) + 1;
      pollCounts.set(id, poll);
      const frame: StatusFrame = hooks.status?.(workflow, id, poll)
        ?? { status: 'COMPLETED', result: { url: 'https://cdn.example.com/result.jpg' } };
      return json(200, {
        status: 'success',
        response: { id, updated: new Date(1700000000000 + poll * 1000).toISOString(), ...frame },
      });
    }
    if (path.endsWith('/execute')) {
      const workflow = path.slice(0, -'/execute'.length);
      calls.executes.push({ workflow, payload: params });
      const result = hooks.execute?.(workflow, params) ?? { url: 'https://cdn.example.com/result.jpg' };
      return json(200, { status: 'success', response: { result } });
    }
    if (path.endsWith('/options')) {
      const workflow = path.slice(0, -'/options'.length);
      const credits = hooks.options ? hooks.options(workflow, params) : 5;
      return json(200, { status: 'success', response: credits === null ? {} : { credits } });
    }
    return json(404, { status: 'error', reason: 'not_found', message: `no such route: ${path}` });
  };

  return { fetch, calls };
}

/** Shared fast-poll options so unit tests never sit in real poll sleeps. */
export const FAST_POLL = { intervalMs: 1 } as const;

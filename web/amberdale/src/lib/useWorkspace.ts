import { useCallback, useMemo, useReducer } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { DemoId, RunMode } from './demo';

export interface Run {
  key: number;
  mode: RunMode;
}

interface State {
  active: DemoId;
  runs: Record<DemoId, Run>;
  completed: Record<DemoId, boolean>;
  reduced: boolean;
}

type Action =
  | { type: 'select'; id: DemoId }
  | { type: 'replay' }
  | { type: 'skip' }
  | { type: 'complete'; id: DemoId; key: number };

function restart(state: State, id: DemoId, mode: RunMode): State {
  return { ...state, runs: { ...state.runs, [id]: { key: state.runs[id].key + 1, mode } } };
}

/**
 * Revisit policy: a demo that already finished resumes on its finished state,
 * one that was interrupted plays again from the start. Reduced motion always
 * shows the finished state.
 */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'select': {
      if (action.id === state.active) return state;
      const mode: RunMode = state.reduced || state.completed[action.id] ? 'complete' : 'play';
      return { ...restart(state, action.id, mode), active: action.id };
    }
    case 'replay':
      return restart(state, state.active, state.reduced ? 'complete' : 'play');
    case 'skip':
      return {
        ...restart(state, state.active, 'complete'),
        completed: { ...state.completed, [state.active]: true },
      };
    case 'complete': {
      if (state.runs[action.id].key !== action.key || state.completed[action.id]) return state;
      return { ...state, completed: { ...state.completed, [action.id]: true } };
    }
  }
}

export function useWorkspace(initial: DemoId = 'branding') {
  const reduced = useReducedMotion() ?? false;
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const mode: RunMode = reduced ? 'complete' : 'play';
    return {
      active: initial,
      reduced,
      runs: { branding: { key: 0, mode }, websites: { key: 0, mode }, saas: { key: 0, mode } },
      completed: { branding: reduced, websites: reduced, saas: reduced },
    };
  });

  const select = useCallback((id: DemoId) => dispatch({ type: 'select', id }), []);
  const replay = useCallback(() => dispatch({ type: 'replay' }), []);
  const skip = useCallback(() => dispatch({ type: 'skip' }), []);
  const complete = useCallback((id: DemoId, key: number) => dispatch({ type: 'complete', id, key }), []);

  return useMemo(
    () => ({ ...state, run: state.runs[state.active], select, replay, skip, complete }),
    [state, select, replay, skip, complete],
  );
}

export type WorkspaceApi = ReturnType<typeof useWorkspace>;

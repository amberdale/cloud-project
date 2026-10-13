import { useCallback, useMemo, useState } from 'react';
import { quote, type QuoteInput } from './quote';

export const DEFAULT_QUOTE: QuoteInput = {
  job: 'walls',
  area: 64,
  coats: 2,
  paint: 'standard',
  prep: true,
  rush: false,
};

/**
 * Tool state lives above the demo, so the calculator keeps its values when
 * the visitor switches tabs or replays the build animation.
 */
export function useQuoteState() {
  const [input, setInput] = useState<QuoteInput>(DEFAULT_QUOTE);
  const update = useCallback(<K extends keyof QuoteInput>(key: K, value: QuoteInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  }, []);
  const reset = useCallback(() => setInput(DEFAULT_QUOTE), []);
  const result = useMemo(() => quote(input), [input]);
  return { input, result, update, reset };
}

export type QuoteState = ReturnType<typeof useQuoteState>;

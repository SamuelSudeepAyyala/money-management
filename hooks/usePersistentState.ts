import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { readDemoValue, writeDemoValue } from "../services/demoStorage";

export function usePersistentState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setValue(readDemoValue(key, initialValue));
    setLoaded(true);
  // Load once per storage key. Including an inline initial array here causes
  // feature pages to reset during ordinary parent renders, which looks like
  // flicker when switching between budgets, loans, and goals.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (loaded) writeDemoValue(key, value);
  }, [key, loaded, value]);

  return [value, setValue];
}

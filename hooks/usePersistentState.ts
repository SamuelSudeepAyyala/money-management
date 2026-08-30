import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { readDemoValue, writeDemoValue } from "../services/demoStorage";

export function usePersistentState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setValue(readDemoValue(key, initialValue));
    setLoaded(true);
  }, [initialValue, key]);

  useEffect(() => {
    if (loaded) writeDemoValue(key, value);
  }, [key, loaded, value]);

  return [value, setValue];
}


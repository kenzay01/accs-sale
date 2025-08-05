"use client";
import { useState, useEffect, useRef } from "react";
import { getDictionary } from "@/i18n";
import { Locale } from "@/i18n/config";

type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

export function useDictionary(locale: Locale) {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cache = useRef<Map<Locale, Dictionary>>(new Map()); // Cache dictionaries

  useEffect(() => {
    let isMounted = true;

    const loadDictionary = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        if (cache.current.has(locale)) {
          const cachedDict = cache.current.get(locale)!;
          if (isMounted) {
            setDict(cachedDict);
            setLoading(false);
          }
          return;
        }

        const dictionary = await getDictionary(locale);

        if (isMounted) {
          cache.current.set(locale, dictionary); // Store in cache
          setDict(dictionary);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to load dictionary")
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDictionary();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  return { dict, loading, error };
}

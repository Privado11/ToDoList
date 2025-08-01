import { useState, useEffect, useCallback } from "react";

export const useLocationSearch = () => {
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const SUPPORTED_LANGS = ["default", "en", "de", "fr"];

  const getLanguage = () => {
    if (typeof window !== "undefined") {
      const lang = (navigator.language || navigator.languages?.[0] || "en")
        .split("-")[0]
        .toLowerCase();

      return SUPPORTED_LANGS.includes(lang) ? lang : "en";
    }
    return "en";
  };

  const searchLocations = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setLocations([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const language = getLanguage();

      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
        searchQuery
      )}&lang=${language}&limit=15`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.features || !Array.isArray(data.features)) {
        throw new Error("Invalid response format");
      }

      const mappedLocations = data.features
        .map((item) => {
          const props = item.properties || {};
          const coords = item.geometry?.coordinates || [];

          return {
            placeId: props.osm_id || Math.random().toString(),
            city: props.name || "",
            state: props.state || "",
            country: props.country || "",
            displayName: `${props.name || ""}${
              props.state ? `, ${props.state}` : ""
            }${props.country ? `, ${props.country}` : ""}`,
            addresstype: props.osm_value || props.type || "",
            osmType: props.osm_key || "",
            coordinates: coords.length >= 2 ? [coords[0], coords[1]] : null,
            importance: props.importance || 0,
            rawProps: props,
          };
        })
        .filter((item) => {
          const hasValidData = item.city && item.country;
          const validTypes = ["city", "country"];
          const hasValidType = validTypes.includes(item.addresstype);

          return hasValidData && hasValidType;
        })
        .sort((a, b) => {
          const aExact = a.city
            .toLowerCase()
            .startsWith(searchQuery.toLowerCase());
          const bExact = b.city
            .toLowerCase()
            .startsWith(searchQuery.toLowerCase());

          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          return (b.importance || 0) - (a.importance || 0);
        })
        .slice(0, 10);

      setLocations(mappedLocations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchLocations]);

  return {
    query,
    setQuery,
    locations,
    loading,
    error,
  };
};

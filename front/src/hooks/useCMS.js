// ── useCMS.js ──
// Place this file at: src/hooks/useCMS.js
//
// Fetches CMS data from /api/public/cms on every component mount.
// Returns a `cms(key, fallback)` function.
// If CMS has a value for the key → returns that.
// If not → returns the fallback (the real hardcoded page text).
//
// HOW IT WORKS:
// - No module-level cache (avoids stale data across page navigations)
// - Each page that calls useCMS() fetches fresh CMS on mount
// - Until fetch completes, fallback values are shown (so page never looks blank)
// - After fetch, if admin set a value it overrides; otherwise fallback stays

import { useState, useEffect } from "react";

export function useCMS() {
    const [cmsMap, setCmsMap] = useState({});

    useEffect(() => {
        let cancelled = false;

        const fetchCMS = async () => {
            try {
                const res = await fetch(`/api/public/cms?t=${Date.now()}`);
                if (!res.ok) return;
                const data = await res.json();
                if (cancelled) return;
                if (data.success && Array.isArray(data.data)) {
                    const map = {};
                    data.data.forEach(item => {
                        if (item.key && item.value && item.value !== "__deleted__") {
                            map[item.key] = item.value;
                        }
                    });
                    setCmsMap(map);
                }
            } catch (err) {
                console.error("useCMS fetch error:", err);
            }
        };

        fetchCMS();
        return () => { cancelled = true; };
    }, []);

    // Returns CMS value if admin has set it, otherwise the exact fallback passed in
    return (key, fallback = "") => {
        const val = cmsMap[key];
        return (val && val.trim() !== "") ? val : fallback;
    };
}
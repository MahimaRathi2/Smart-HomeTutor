import { useState, useEffect, useCallback } from 'react';

/**
 * Custom React hook to maintain dashboard active tab across browser refreshes (F5).
 * Sources of truth priority:
 * 1. URL Query Parameter `?tab=...` or Hash `#...`
 * 2. `localStorage` fallback
 * 3. `defaultTab`
 */
export const useDashboardTab = (storageKey, defaultTab = 'overview', validTabs = []) => {
  const getInitialTab = () => {
    try {
      // 1. Check URL search query parameter 'tab'
      const params = new URLSearchParams(window.location.search);
      let tabFromUrl = params.get('tab');

      // Check URL hash fallback
      if (!tabFromUrl && window.location.hash) {
        tabFromUrl = window.location.hash.replace('#', '').trim();
      }

      if (tabFromUrl && (validTabs.length === 0 || validTabs.includes(tabFromUrl))) {
        return tabFromUrl;
      }

      // 2. Check localStorage fallback
      const storedTab = localStorage.getItem(storageKey);
      if (storedTab && (validTabs.length === 0 || validTabs.includes(storedTab))) {
        return storedTab;
      }
    } catch (err) {
      console.error('Error getting initial dashboard tab:', err);
    }

    return defaultTab;
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);

  const setActiveTab = useCallback((newTab) => {
    if (!newTab) return;
    try {
      setActiveTabState(newTab);
      localStorage.setItem(storageKey, newTab);

      // Seamlessly update URL query parameter without full page reload
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      window.history.replaceState({}, '', url.toString());
    } catch (err) {
      console.error('Error setting dashboard tab:', err);
    }
  }, [storageKey]);

  useEffect(() => {
    // Initial sync to ensure URL query param is present on page load
    try {
      const url = new URL(window.location.href);
      const currentTab = getInitialTab();
      if (url.searchParams.get('tab') !== currentTab) {
        url.searchParams.set('tab', currentTab);
        window.history.replaceState({}, '', url.toString());
      }
      localStorage.setItem(storageKey, currentTab);
    } catch (err) {
      console.error('Error syncing initial URL query param:', err);
    }

    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        let tabFromUrl = params.get('tab');
        if (!tabFromUrl && window.location.hash) {
          tabFromUrl = window.location.hash.replace('#', '').trim();
        }

        if (tabFromUrl && (validTabs.length === 0 || validTabs.includes(tabFromUrl))) {
          setActiveTabState(tabFromUrl);
          localStorage.setItem(storageKey, tabFromUrl);
        }
      } catch (err) {
        console.error('Error handling popstate tab change:', err);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [storageKey]);

  return [activeTab, setActiveTab];
};

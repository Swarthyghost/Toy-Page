import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { subscribeToSiteSettings, SiteSettings } from '../services/firebaseApi';

interface SiteSettingsContextType {
  siteSettings: SiteSettings | null;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToSiteSettings(settings => {
      setSiteSettings(settings);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ siteSettings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

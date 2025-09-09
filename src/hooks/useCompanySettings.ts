import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface CompanySettings {
  id: string;
  company_name: string;
  max_tables: number;
  created_at: string;
  updated_at: string;
}

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error loading company settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<Pick<CompanySettings, 'company_name' | 'max_tables'>>) => {
    if (!settings) return false;

    try {
      const { data, error } = await supabase
        .from('company_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
      return true;
    } catch (error) {
      console.error('Error updating company settings:', error);
      return false;
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    refetch: loadSettings,
  };
}
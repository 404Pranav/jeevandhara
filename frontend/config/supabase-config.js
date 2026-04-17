/**
 * Supabase Configuration Template
 * 
 * ⚠️  UPDATE THESE VALUES with your Supabase credentials
 * Get them from: https://app.supabase.com/project/[YOUR_PROJECT]/settings/api
 * 
 * @file frontend/config/supabase-config.js
 */

export const supabaseConfig = {
  // Supabase configuration values
  url: "https://uboobsildtrvwvgmamlw.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVib29ic2lsZHRydnd2Z21hbWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzIwMzksImV4cCI6MjA5MjAwODAzOX0.OvOSKUOzglZBfwXF6ZLlBcHGRLLJB0j0zgQDCU9eGm8"
};

/**
 * IMPORTANT:
 * - anonKey: PUBLIC - can be used in frontend. Scoped by Row Level Security (RLS) rules
 * - serviceKey: SECRET - only use in backend. Never expose in frontend!
 * 
 * Example usage in dashboard.js:
 * 
 * import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
 * import { supabaseConfig } from '../config/supabase-config.js';
 * 
 * const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
 * 
 * // Now you can use:
 * const { data, error } = await supabase
 *   .from('users')
 *   .select('*')
 *   .eq('id', userId)
 *   .single();
 */

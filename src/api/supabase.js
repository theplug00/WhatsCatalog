import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// Optional: Export a helper for common queries
export const db = {
  // Get all records from a table
  async getAll(table) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data;
  },

  // Get a single record by ID
  async getById(table, id) {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  // Create a new record
  async create(table, data) {
    const { data: result, error } = await supabase.from(table).insert(data).select();
    if (error) throw error;
    return result[0];
  },

  // Update a record
  async update(table, id, data) {
    const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select();
    if (error) throw error;
    return result[0];
  },

  // Delete a record
  async delete(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
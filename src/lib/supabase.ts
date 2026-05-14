import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test function
export async function testConnection() {
  const { data, error } = await supabase
    .from('work_types')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
  
  console.log('✅ Supabase connected successfully!', data)
  return true
}

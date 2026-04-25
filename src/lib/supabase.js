import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://beexuyztqakaddkvscuc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZXh1eXp0cWFrYWRka3ZzY3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzk1NjEsImV4cCI6MjA5MjcxNTU2MX0.mpIhP1GMiH7wtUcm23zuZCFFdYM8WtMV-6mY5aW9sro'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
import { createClient } from '@supabase/supabase-js'

// You get these from your Supabase Dashboard -> Settings -> API
const supabaseUrl = 'https://wgxszhetpietfjlgeffp.supabase.co/'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneHN6aGV0cGlldGZqbGdlZmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxODUxOTYsImV4cCI6MjA5Mjc2MTE5Nn0.WPfXK-5qPgvnZP2H_eyC55EXpfAf8C7rGLsDwv86Oz0'

export const supabase = createClient(supabaseUrl, supabaseKey)
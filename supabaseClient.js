import { createClient } from '@supabase/supabase-js'

// You get these from your Supabase Dashboard -> Settings -> API
const supabaseUrl = 'https://wgxszhetpietfjlgeffp.supabase.co'
const supabaseKey = 'sb_publishable_3NhlyfBqrV1fI3g_-TbMBA_NkXH8JRs'

export const supabase = createClient(supabaseUrl, supabaseKey)
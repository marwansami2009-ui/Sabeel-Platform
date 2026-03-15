import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lcawdobznibeopkgnmty.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjYXdkb2J6bmliZW9wa2dubXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDgzNjEsImV4cCI6MjA4OTE4NDM2MX0.CXdE-fVvvVk-Ku27eie8Mrsm8gd89hXAo5qqj3wYdRU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
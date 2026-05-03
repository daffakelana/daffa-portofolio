import { supabase } from "./SupabaseClient";
// ============================================================
// TYPES
// ============================================================

export type Block =
  | { type: 'text'; value: string }
  | { type: 'image'; url: string; caption?: string | null }
  | { type: 'images'; urls: string[]; caption?: string | null }
  | { type: 'embed'; url: string; caption?: string | null }
  | { type: 'link'; label: string; url: string }

export type Section = {
  id: string
  label: string
  blocks: Block[]
}

// Data lengkap — untuk halaman detail
export type Project = {
  id: string
  title: string
  slug: string
  date: string
  thumbnail: string
  description: string | null
  tags: string[]
  sections: Section[]
  created_at: string
  updated_at: string
}

// Data ringkas — untuk halaman list (tanpa sections)
export type ProjectSummary = Omit<Project, 'sections'>

// Payload untuk create/update
export type ProjectPayload = {
  title: string
  slug: string
  date: string
  thumbnail: string
  description?: string
  tags?: string[]
  sections?: Section[]
}

// ============================================================
// CLIENT
// ============================================================

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================================
// READ
// ============================================================

// Ambil semua project TANPA sections (ringan, untuk halaman list)
export async function getProjects(): Promise<ProjectSummary[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, slug, date, thumbnail, description, tags, created_at, updated_at')
    .order('date', { ascending: false })

  if (error) {
    console.error('getProjects error:', error.message)
    return []
  }

  return data ?? []
}

// Ambil satu project lengkap WITH sections (untuk halaman detail)
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('getProjectBySlug error:', error.message)
    return null
  }

  return data
}

// Ambil satu project by ID
export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('getProjectById error:', error.message)
    return null
  }

  return data
}

// Ambil semua slug (untuk generateStaticParams di Next.js)
export async function getAllSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('slug')

  if (error) {
    console.error('getAllSlugs error:', error.message)
    return []
  }

  return data?.map((p:any) => p.slug) ?? []
}

// Ambil projects berdasarkan tag
export async function getProjectsByTag(tag: string): Promise<ProjectSummary[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, slug, date, thumbnail, description, tags, created_at, updated_at')
    .contains('tags', [tag])
    .order('date', { ascending: false })

  if (error) {
    console.error('getProjectsByTag error:', error.message)
    return []
  }

  return data ?? []
}

// ============================================================
// CREATE
// ============================================================

export async function createProject(
  payload: ProjectPayload
): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('createProject error:', error.message)
    return null
  }

  return data
}

// ============================================================
// UPDATE
// ============================================================

// Update seluruh project
export async function updateProject(
  id: string,
  payload: Partial<ProjectPayload>
): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('updateProject error:', error.message)
    return null
  }

  return data
}

// Update hanya sections (untuk admin editor)
export async function updateSections(
  id: string,
  sections: Section[]
): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .update({ sections })
    .eq('id', id)

  if (error) {
    console.error('updateSections error:', error.message)
    return false
  }

  return true
}

// ============================================================
// DELETE
// ============================================================

export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('deleteProject error:', error.message)
    return false
  }

  return true
}
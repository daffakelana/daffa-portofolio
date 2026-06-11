import { cache } from 'react'
import { notFound } from 'next/navigation'
import ProjectDetailPage from '@/components/ProjectDetail'
import { ThemeToggle } from '@/components/ThemeToggle'
import { supabase } from '@/lib/SupabaseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// Satu sumber data, dipakai bareng oleh generateMetadata & Page.
// React cache() bikin pemanggilan ganda dalam 1 request cuma jadi 1 query ke DB.
const getProject = cache(async (slug: string) => {
  const { data, error } = await supabase.rpc('get_project_by_slug', {
    p_slug: slug,
  })
  if (error) return null
  return data?.[0] ?? null
})

export function generateMetadata({ params }: { params: { slug: string } }) {
  const title = params.slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  return { title }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug)
  if (!project) notFound()

  return (
    <>
      <ThemeToggle />
      <ProjectDetailPage project={project} />
    </>
  )
}
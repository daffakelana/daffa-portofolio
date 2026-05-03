import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ProjectDetailPage from '@/components/ProjectDetail'
import { ThemeToggle } from '@/components/ThemeToggle'
import { supabase } from '@/lib/SupabaseClient'


export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const { data } = await supabase.from('projects').select('slug')
  return (data ?? []).map((p:any) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const { data } = await supabase.rpc('get_project_by_slug', {
    p_slug: params.slug,
  })
  const project = data?.[0]
  if (!project) return {}
  return {
    title: project.title,
    description: project.description ?? '',
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { data, error } = await supabase.rpc('get_project_by_slug', {
    p_slug: params.slug,
  })

  if (error || !data || data.length === 0) notFound()

  return (
    <>
      <ThemeToggle />
      <ProjectDetailPage project={data[0]} />
    </>
  )
}

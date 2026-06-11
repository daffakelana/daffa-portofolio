import { notFound } from 'next/navigation'
import ProjectDetailPage from '@/components/ProjectDetail'
import { ThemeToggle } from '@/components/ThemeToggle'
import { supabase } from '@/lib/SupabaseClient'

// Selalu render di request time + matikan semua cache fetch ke Supabase.
// Ini kombinasi yang bikin data SELALU fresh, cocok kalau project diedit
// langsung di DB (bukan lewat Server Action di app ini).
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// CATATAN: generateStaticParams sengaja DIHAPUS.
// generateStaticParams = "pre-render statis saat build", yang bertentangan
// dengan force-dynamic. Pilih satu strategi; di sini kita pilih full dynamic.

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
import { Layout } from '@/components/Layout'
import { PortfolioList } from '@/components/PortofolioPage'
import { supabase } from '@/lib/SupabaseClient'
import { unstable_noStore as noStore } from 'next/cache'

// Hapus revalidate, ganti dengan ini
export const dynamic = 'force-dynamic'


export default async function HomePage() {
  noStore()
  const { data: projects, error } = await supabase.rpc('get_projects')

  console.log('=== DEBUG ===')
  console.log('error:', error)
  console.log('count:', projects?.length)
  console.log('ids:', projects?.map((p: any) => p.id))
  console.log('=============')

  return (
    <Layout>
      <PortfolioList projects={projects ?? []} />
    </Layout>
  )
}
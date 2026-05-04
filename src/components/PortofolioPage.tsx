'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'

// ============================================================
// TYPES
// ============================================================

export type Project = {
  id: string
  title: string
  slug: string
  date: string | Date
  thumbnail: string
  description: string
  tags: string[]
}

// ============================================================
// FormattedDate — sama persis seperti aslinya
// ============================================================

function FormattedDate({
  date,
  className,
}: {
  date: string | Date
  className?: string
}) {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return (
    <time dateTime={dateObj.toISOString()} className={className}>
      {dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
    </time>
  )
}

// ============================================================
// ContentWrapper — sama persis seperti mdx.tsx
// ============================================================

function ContentWrapper({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
      <div className="lg:ml-72 lg:flex lg:w-full lg:justify-end lg:pl-20">
        <div
          className={clsx(
            'mx-auto max-w-md lg:mx-0 lg:w-0 lg:max-w-lg lg:flex-auto',
            className,
          )}
          {...props}
        />
      </div>
    </div>
  )
}

// ============================================================
// ArticleHeader — sama persis seperti mdx.tsx
// ============================================================

function ArticleHeader({ id, date }: { id: string; date: string | Date }) {
  return (
    <header className="relative mb-6 xl:mb-0">
      {/* Tanggal kiri untuk desktop */}
      <div className="pointer-events-none absolute left-[max(-0.5rem,calc(50%-18.625rem))] top-0 z-50 flex h-4 items-center justify-end gap-x-2 lg:left-0 lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] xl:h-8">
        <FormattedDate
          date={date}
          className="hidden xl:pointer-events-auto xl:block xl:text-2xs/4 xl:font-medium xl:text-white/50"
        />
        <div className="h-[0.0625rem] w-3.5 bg-gray-400 lg:-mr-3.5 xl:mr-0 xl:bg-gray-300" />
      </div>

      {/* Tanggal di mobile */}
      <ContentWrapper>
        <div className="flex">
          <FormattedDate
            date={date}
            className="text-2xs/4 font-medium text-gray-500 xl:hidden dark:text-white/50"
          />
        </div>
      </ContentWrapper>
    </header>
  )
}

// ============================================================
// ProjectThumbnail — menggantikan <img> dari mdx.tsx
// ============================================================

function ProjectThumbnail({
  src,
  alt,
  href,
}: {
  src: string
  alt: string
  href?: string
}) {
  const imageElement = (
    <div className="relative mt-2 overflow-hidden rounded-xl bg-gray-50 transition-all group-hover:brightness-75 dark:bg-gray-900 [&+*]:mt-2">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={450}
        sizes="(min-width: 1280px) 36rem, (min-width: 1024px) 45vw, (min-width: 640px) 32rem, 95vw"
        className="w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10 dark:ring-white/10" />
    </div>
  )

  if (href) {
    return <Link href={href}>{imageElement}</Link>
  }

  return imageElement
}

// ============================================================
// ProjectCard — menggantikan <article> dari mdx.tsx
// ============================================================

export function ProjectCard({ project }: { project: Project }) {
  
  const router = useRouter()
  const heightRef = useRef<HTMLDivElement>(null)
  const [heightAdjustment, setHeightAdjustment] = useState(12)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!heightRef.current) return
    const observer = new window.ResizeObserver(() => {
      if (!heightRef.current) return
      const { height } = heightRef.current.getBoundingClientRect()
      const nextMultipleOf8 = 8 * Math.ceil(height / 8)
      setHeightAdjustment(nextMultipleOf8 - height)
    })

    observer.observe(heightRef.current)
    return () => observer.disconnect()
  }, [])

    useEffect(() => {
      const el = ref.current
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            router.prefetch(`/portfolio/${project.slug}`)
            observer.disconnect() // prefetch sekali saja
          }
        },
        { rootMargin: '200px' }, // mulai prefetch 200px sebelum card terlihat
      )

      observer.observe(el)
      return () => observer.disconnect()
    }, [project.slug, router])

  return (
    <article
      className="group block scroll-mt-2 rounded-xl border border-transparent py-12 transition-all duration-200 hover:border-gray-200 hover:bg-gray-100 dark:hover:border-gray-700 dark:hover:bg-gray-900"
      // style={{ paddingBottom: `${heightAdjustment}px` }}
    >
      <Link href={`/portofolio/${project.slug}`} prefetch={true} className="block">
        <div ref={heightRef}>
          <ArticleHeader id={project.id} date={project.date} />

          {/* Konten card — menggantikan children MDX */}
          <ContentWrapper className="typography">
            {/* Thumbnail */}
            <ProjectThumbnail src={project.thumbnail} alt={project.title} />

            {/* Judul — menggantikan ## heading di MDX */}
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              {project.title}
            </h2>

            {/* Deskripsi singkat */}
            {project.description && (
              <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                {project.description}
              </p>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </ContentWrapper>
        </div>
      </Link>
    </article>
  )
}

// ============================================================
// PortfolioList — menggantikan list article di page.mdx
// ============================================================

export function PortfolioList({ projects }: { projects: Project[] }) {
  return (
    <main className="space-y-20 py-20 sm:space-y-16 sm:py-20">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </main>
  )
}

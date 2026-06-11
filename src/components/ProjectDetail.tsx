'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { RichText } from '@/components/RichText'

// ============================================================
// TYPES
// ============================================================

type Block =
  | { type: 'text'; value: string }
  | { type: 'image'; url: string; caption?: string | null }
  | { type: 'images'; urls: string[]; caption?: string | null }
  | { type: 'embed'; url: string; caption?: string | null }
  | { type: 'link'; label: string; url: string }

type Section = {
  id: string
  label: string
  blocks: Block[]
}

type Project = {
  id: string
  title: string
  slug: string
  date: string
  thumbnail: string
  description: string | null
  tags: string[]
  sections: Section[]
}

// ============================================================
// BLOCK RENDERER
// ============================================================

function BlockRenderer({ block }: { block: Block }) {
  if (block.type === 'text') {
    // Data baru dari rich editor = HTML. Data lama = plain text.
    // Deteksi: kalau mengandung tag HTML, render sebagai rich text;
    // kalau tidak, fallback ke plain text yang tetap menghormati baris baru.
    const isHtml = /<[a-z][\s\S]*>/i.test(block.value)

    return isHtml ? (
      <RichText html={block.value} />
    ) : (
      <div className="space-y-4">
        {block.value.split(/\n{2,}/).map((para, i) => (
          <p
            key={i}
            className="whitespace-pre-line text-[0.9375rem] leading-relaxed text-gray-600 dark:text-gray-400"
          >
            {para}
          </p>
        ))}
      </div>
    )
  }

  if (block.type === 'image') {
    return (
      <figure className="my-6">
        <div className="overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/5">
          <img
            src={block.url}
            alt={block.caption ?? ''}
            className="w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
          />
        </div>
        {block.caption && (
          <figcaption className="mt-2 text-center text-xs text-gray-400 dark:text-gray-600">
            {block.caption}
          </figcaption>
        )}
      </figure>
    )
  }

  if (block.type === 'images') {
    return (
      <figure className="my-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          {block.urls.map((url, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/5"
            >
              <img
                src={url}
                alt=""
                className="w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
          ))}
        </div>
        {block.caption && (
          <figcaption className="mt-2 text-center text-xs text-gray-400 dark:text-gray-600">
            {block.caption}
          </figcaption>
        )}
      </figure>
    )
  }

  if (block.type === 'embed') {
    return (
      <figure className="my-6">
        <div className="overflow-hidden rounded-xl ring-1 ring-gray-900/5 dark:ring-white/5">
          <iframe
            src={block.url}
            className="h-[500px] w-full"
            allowFullScreen
          />
        </div>
        {block.caption && (
          <figcaption className="mt-2 text-center text-xs text-gray-400 dark:text-gray-600">
            {block.caption}
          </figcaption>
        )}
      </figure>
    )
  }

  if (block.type === 'link') {
    return (
      <a
        href={block.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:bg-gray-800"
      >
        {block.label}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    )
  }

  return null
}

// ============================================================
// SECTION RENDERER
// ============================================================

function SectionRenderer({ section }: { section: Section }) {
  return (
    <div id={section.id} className="scroll-mt-24 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {section.label}
      </h2>
      <div className="space-y-4">
        {section.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// SIDEBAR NAV — desktop
// ============================================================

function SidebarNav({
  sections,
  activeId,
  onNavigate,
}: {
  sections: Section[]
  activeId: string
  onNavigate: (id: string) => void
}) {
  return (
    <nav className="space-y-0.5">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onNavigate(section.id)}
          className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${
            activeId === section.id
              ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-white'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-800/50 dark:hover:text-gray-300'
          }`}
        >
          <span
            className={`h-1 w-1 flex-none rounded-full transition-all duration-200 ${
              activeId === section.id
                ? 'bg-gray-900 dark:bg-white'
                : 'bg-gray-300 group-hover:bg-gray-400 dark:bg-gray-700'
            }`}
          />
          {section.label}
        </button>
      ))}
    </nav>
  )
}

// ============================================================
// MOBILE NAV — sticky top bar with dropdown
// ============================================================

function MobileNav({
  sections,
  activeId,
  onNavigate,
}: {
  sections: Section[]
  activeId: string
  onNavigate: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const activeSection = sections.find((s) => s.id === activeId)

  const handleClick = (id: string) => {
    onNavigate(id)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="sticky top-0 z-40 lg:hidden">
      <div className="relative border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between py-3 pl-20 pr-16 text-sm"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Section
            </span>
            <span className="truncate font-medium text-gray-900 dark:text-white">
              {activeSection?.label ?? 'Navigasi'}
            </span>
          </span>
          <svg
            className={`h-4 w-4 flex-none text-gray-500 transition-transform duration-300 ${
              open ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div
          className={`absolute left-0 right-0 top-full overflow-hidden bg-white/95 backdrop-blur-md transition-all duration-300 ease-out dark:bg-gray-950/95 ${
            open
              ? 'max-h-[60vh] border-b border-gray-100 opacity-100 shadow-lg dark:border-gray-800'
              : 'pointer-events-none max-h-0 opacity-0'
          }`}
        >
          <div className="max-h-[60vh] overflow-y-auto py-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleClick(section.id)}
                className={`flex w-full items-center gap-3 px-6 py-2.5 text-left text-sm transition-colors ${
                  activeId === section.id
                    ? 'bg-gray-50 font-medium text-gray-900 dark:bg-gray-800/50 dark:text-white'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                }`}
              >
                <span
                  className={`h-1 w-1 flex-none rounded-full transition-colors ${
                    activeId === section.id
                      ? 'bg-gray-900 dark:bg-white'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// FORMATTED DATE
// ============================================================

function FormattedDate({ date }: { date: string }) {
  return (
    <time dateTime={date}>
      {new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
    </time>
  )
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function ProjectDetailPage({ project }: { project: Project }) {
  const [activeId, setActiveId] = useState<string>(
    project.sections[0]?.id ?? '',
  )
  const [loaded, setLoaded] = useState(false)

  // Lock active state sebentar setelah klik supaya tidak "loncat"
  // ke section lain karena IntersectionObserver kebaca duluan saat smooth scroll.
  const lockUntilRef = useRef<number>(0)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 50)
    return () => clearTimeout(t)
  }, [])

  // ----------------------------------------------------------
  // SCROLL-SPY: update activeId saat user scroll
  // ----------------------------------------------------------
  useEffect(() => {
    if (project.sections.length === 0) return

    const elements = project.sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const updateActive = () => {
      // Skip kalau masih dalam masa "lock" setelah klik manual
      if (Date.now() < lockUntilRef.current) return

      // Cari section yang paling dekat dengan trigger line (~25% dari atas viewport)
      const triggerY = window.innerHeight * 0.25
      let bestId = elements[0].id
      let bestDistance = Infinity

      for (const el of elements) {
        const rect = el.getBoundingClientRect()
        // Section dianggap kandidat kalau topnya sudah lewat trigger line
        // (atau masih di atas viewport)
        if (rect.top <= triggerY) {
          const distance = triggerY - rect.top
          if (distance < bestDistance) {
            bestDistance = distance
            bestId = el.id
          }
        }
      }

      // Edge case: kalau scroll sampai mentok bawah, paksa section terakhir aktif
      const scrolledToBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4
      if (scrolledToBottom) {
        bestId = elements[elements.length - 1].id
      }

      setActiveId((prev) => (prev === bestId ? prev : bestId))
    }

    updateActive()

    window.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)
    return () => {
      window.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
    }
  }, [project.sections])

  // ----------------------------------------------------------
  // Handler scroll ketika user klik section di nav
  // ----------------------------------------------------------
  const handleNavigate = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    setActiveId(id)
    // Lock 800ms supaya scroll-spy tidak override pilihan user
    // selama animasi smooth scroll berlangsung.
    lockUntilRef.current = Date.now() + 800
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <MobileNav
        sections={project.sections}
        activeId={activeId}
        onNavigate={handleNavigate}
      />

      <div
        className={`fixed left-6 top-6 z-50 transition-all duration-500 ${
          loaded ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-600 backdrop-blur-sm transition-all hover:border-gray-300 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950/80 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M9.5 6H2.5M2.5 6L5.5 3M2.5 6L5.5 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </Link>
      </div>

      <div
        className={`transition-all duration-700 ${
          loaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="relative h-[45vh] min-h-[280px] w-full overflow-hidden bg-gray-100 sm:h-[55vh] dark:bg-gray-900">
          {project.thumbnail && (
            <img
              src={project.thumbnail}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-gray-950 dark:via-gray-950/20" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-8 pt-2 sm:px-8">
          {project.tags?.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="max-w-2xl text-2xl font-semibold leading-snug text-gray-900 sm:text-3xl dark:text-white">
            {project.title}
          </h1>

          {project.description && (
            <p className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
              {project.description}
            </p>
          )}

          <p className="mt-3 text-xs text-gray-400 dark:text-gray-600">
            <FormattedDate date={project.date} />
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="border-t border-gray-100 dark:border-gray-800" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-16">
          <aside
            className={`hidden transition-all delay-200 duration-700 lg:block ${
              loaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="sticky top-24">
              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                Contents
              </p>
              <SidebarNav
                sections={project.sections}
                activeId={activeId}
                onNavigate={handleNavigate}
              />
            </div>
          </aside>

          <main
            className={`min-w-0 transition-all delay-100 duration-700 ${
              loaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {project.sections.length === 0 ? (
              <p className="text-sm text-gray-400">Tidak ada konten.</p>
            ) : (
              <div className="space-y-14">
                {project.sections.map((section, i) => (
                  <div
                    key={section.id}
                    className="transition-all duration-700"
                    style={{ transitionDelay: `${150 + i * 80}ms` }}
                  >
                    <SectionRenderer section={section} />
                    {i < project.sections.length - 1 && (
                      <div className="mt-14 border-t border-gray-100 dark:border-gray-800/60" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useRef, useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import { FormattedDate } from '@/components/FormattedDate'

// alias tag <a>
export const a = Link

type ImagePropsWithOptionalAltAndHref = Omit<ImageProps, 'alt'> & {
  alt?: string
  href?: string
}

export const img = function Img({
  href,
  ...props
}: ImagePropsWithOptionalAltAndHref) {
  const imageElement = (
    // MODIFIKASI: Mengurangi margin atas (mt-8 menjadi mt-4) dan margin setelahnya ([&+*]:mt-8 menjadi [&+*]:mt-4)
    <div className="relative mt-2 overflow-hidden rounded-xl bg-gray-50 transition-all group-hover:brightness-75 dark:bg-gray-900 [&+*]:mt-2">
      <Image
        alt={props.alt || ''}
        sizes="(min-width: 1280px) 36rem, (min-width: 1024px) 45vw, (min-width: 640px) 32rem, 95vw"
        {...props}
      />
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10 dark:ring-white/10" />
    </div>
  )

  if (href) {
    return (
      <Link href={href} legacyBehavior>
        <a>{imageElement}</a>
      </Link>
    )
  }

  return imageElement
}

function ContentWrapper({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
      {/* MODIFIKASI: Mengurangi spasi margin kiri (lg:ml-96 menjadi lg:ml-72) dan padding kiri (lg:pl-32 menjadi lg:pl-20) */}
      <div className="lg:ml-72 lg:flex lg:w-full lg:justify-end lg:pl-20">
        <div
          className={clsx(
            // MODIFIKASI: Mengurangi lebar maksimal (max-w-lg menjadi max-w-md, dan max-w-xl menjadi max-w-lg)
            'mx-auto max-w-md lg:mx-0 lg:w-0 lg:max-w-lg lg:flex-auto',
            className,
          )}
          {...props}
        />
      </div>
    </div>
  )
}

function ArticleHeader({ id, date }: { id: string; date: string | Date }) {
  return (
    // MODIFIKASI: Mengurangi margin-bottom (mb-10 menjadi mb-6) untuk mengurangi jarak dengan konten
    <header className="relative mb-6 xl:mb-0">
      {/* Tanggal kiri untuk desktop */}
      <div className="pointer-events-none absolute left-[max(-0.5rem,calc(50%-18.625rem))] top-0 z-50 flex h-4 items-center justify-end gap-x-2 lg:left-0 lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] xl:h-8">
        <FormattedDate
          date={date}
          className="hidden xl:pointer-events-auto xl:block xl:text-2xs/4 xl:font-medium xl:text-white/50"
        />
        <div className="h-[0.0625rem] w-3.5 bg-gray-400 lg:-mr-3.5 xl:mr-0 xl:bg-gray-300" />
      </div>

      {/* Bagian tanggal di mobile */}
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

export const article = function Article({
  id,
  date,
  children,
}: {
  id: string
  date: string | Date
  children: React.ReactNode
}) {
  const heightRef = useRef<HTMLDivElement>(null)
  const [heightAdjustment, setHeightAdjustment] = useState(0)

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

  return (
    // Padding vertikal (py-5) pada elemen 'a' juga bisa disesuaikan (misal: py-3) jika spasi antar artikel di daftar terasa terlalu jauh
    <Link href={`/article/${id}`} legacyBehavior>
      <a className="group block scroll-mt-16 rounded-2xl border border-transparent py-5 transition-all duration-200 hover:border-gray-200 hover:bg-gray-100 dark:hover:border-gray-700 dark:hover:bg-gray-900">
        <article style={{ paddingBottom: `${heightAdjustment}px` }}>
          <div ref={heightRef}>
            <ArticleHeader id={id} date={date} />
            <ContentWrapper className="typography" data-mdx-content>
              {children}
            </ContentWrapper>
          </div>
        </article>
      </a>
    </Link>
  )
}

export const code = function Code({
  highlightedCode,
  ...props
}: React.ComponentPropsWithoutRef<'code'> & { highlightedCode?: string }) {
  if (highlightedCode) {
    return (
      <code {...props} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    )
  }

  return <code {...props} />
}

import DOMPurify from 'isomorphic-dompurify'
import clsx from 'clsx'

// Styling konten — dipakai bareng oleh editor (saat mengetik) dan render frontend
// supaya tampilan "apa yang diketik = apa yang muncul". Pakai arbitrary variants
// Tailwind biar nggak butuh plugin @tailwindcss/typography.
export const richTextClass = clsx(
  'max-w-none text-[0.9375rem] leading-relaxed text-gray-600 dark:text-gray-400',
  '[&_p]:my-2',
  '[&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-gray-900 dark:[&_h2]:text-white',
  '[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-900 dark:[&_h3]:text-white',
  '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li]:my-0.5',
  '[&_a]:font-medium [&_a]:text-sky-500 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-sky-400',
  '[&_strong]:font-semibold [&_strong]:text-gray-900 dark:[&_strong]:text-white',
)

export function RichText({
  html,
  className,
}: {
  html: string
  className?: string
}) {
  // Disanitasi sekali lagi saat render (defense-in-depth, walau sudah
  // disanitasi waktu disimpan dari editor).
  const clean = DOMPurify.sanitize(html ?? '')

  return (
    <div
      className={clsx(richTextClass, className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}

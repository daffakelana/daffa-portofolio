'use client'

import { useCallback } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import DOMPurify from 'isomorphic-dompurify'
import clsx from 'clsx'
import { richTextClass } from './RichText'

function Btn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={clsx(
        'flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors',
        active
          ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
      )}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = useCallback(() => {
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt(
      'Masukkan URL (kosongkan untuk menghapus link):',
      prev ?? '',
    )
    if (url === null) return // batal
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-1.5 dark:border-gray-800 dark:bg-gray-900/50">
      <Btn
        title="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-bold">B</span>
      </Btn>
      <Btn
        title="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </Btn>

      <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />

      <Btn
        title="Heading 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </Btn>
      <Btn
        title="Heading 3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </Btn>

      <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />

      <Btn
        title="Bullet list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </Btn>
      <Btn
        title="Numbered list"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </Btn>

      <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />

      <Btn title="Link" active={editor.isActive('link')} onClick={setLink}>
        Link
      </Btn>
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value?: string
  onChange: (html: string) => void
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Batasi heading ke H2 & H3 (H1 dipakai judul project)
        heading: { levels: [2, 3] },
        // Di TipTap v3, Link sudah termasuk StarterKit — cukup dikonfigurasi di sini
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
    ],
    content: value ?? '',
    immediatelyRender: false, // wajib di Next.js: hindari hydration mismatch
    shouldRerenderOnTransaction: true, // wajib di v3: supaya state toolbar ikut update
    editorProps: {
      attributes: {
        class: clsx(richTextClass, 'min-h-[160px] px-3 py-2.5 focus:outline-none'),
      },
    },
    onUpdate: ({ editor }) => {
      // Sanitasi sebelum disimpan supaya HTML yang masuk DB sudah bersih
      onChange(DOMPurify.sanitize(editor.getHTML()))
    },
  })

  if (!editor) return null

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/20 dark:border-gray-800 dark:bg-gray-950">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

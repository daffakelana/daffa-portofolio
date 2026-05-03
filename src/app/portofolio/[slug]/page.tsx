'use client'

import { supabase } from '@/lib/SupabaseClient'
import { useCallback, useEffect, useRef, useState } from 'react'


// ============================================================
// TYPES
// ============================================================

type Block =
  | { type: 'text'; value: string }
  | { type: 'image'; url: string; caption: string; file?: File }
  | { type: 'images'; urls: string[]; caption: string; files?: File[] }
  | { type: 'embed'; url: string; caption: string }
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
  description: string
  tags: string[]
  sections: Section[]
}

type Toast = {
  id: string
  type: 'success' | 'error'
  message: string
}

// ============================================================
// HELPERS
// ============================================================

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function uploadImage(file: File, slug: string): Promise<string | null> {
  const ext = file.name.split('.').pop()
  const folder = slug && slug.trim() !== '' ? slug : 'misc'
  const path = `${folder}/${generateId()}.${ext}`

  console.log('Uploading:', path, file.name, file.size)

  const { data, error } = await supabase.storage
    .from('projects')
    .upload(path, file, { upsert: true })

  console.log('Upload result:', { data, error })

  if (error) {
    console.error('Upload error:', error.message)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('projects')
    .getPublicUrl(path)

  console.log('Public URL:', urlData.publicUrl)

  return urlData.publicUrl
}

// ============================================================
// TOAST
// ============================================================

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-300 ring-1 ring-emerald-800'
              : 'bg-red-950 text-red-300 ring-1 ring-red-800'
          }`}
        >
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          <span>{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-2 opacity-50 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// BLOCK EDITOR
// ============================================================

function BlockEditor({
  block,
  index,
  slug,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  block: Block
  index: number
  slug: string
  onChange: (block: Block) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const filesRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    const url = await uploadImage(file, slug || 'temp')
    setUploading(false)
    if (url && block.type === 'image') {
      onChange({ ...block, url })
    }
  }

  const handleImagesUpload = async (files: FileList) => {
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const url = await uploadImage(file, slug || 'temp')
      if (url) urls.push(url)
    }
    setUploading(false)
    if (block.type === 'images') {
      onChange({ ...block, urls: [...block.urls, ...urls] })
    }
  }

  return (
    <div className="group relative rounded-lg border border-gray-800 bg-gray-950 p-4">
      {/* Block type badge + controls */}
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-md bg-gray-800 px-2 py-0.5 font-mono text-xs text-gray-400">
          {block.type}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            className="rounded p-1 text-gray-600 hover:bg-gray-800 hover:text-gray-300"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            className="rounded p-1 text-gray-600 hover:bg-gray-800 hover:text-gray-300"
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={onRemove}
            className="rounded p-1 text-gray-600 hover:bg-red-900 hover:text-red-400"
            title="Remove"
          >
            ×
          </button>
        </div>
      </div>

      {/* Text block */}
      {block.type === 'text' && (
        <textarea
          value={block.value}
          onChange={(e) => onChange({ ...block, value: e.target.value })}
          placeholder="Tulis teks di sini..."
          rows={4}
          className="w-full resize-y rounded-lg bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none ring-1 ring-gray-800 focus:ring-gray-600"
        />
      )}

      {/* Image block */}
      {block.type === 'image' && (
        <div className="space-y-2">
          {block.url ? (
            <div className="relative overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.url}
                alt=""
                className="h-40 w-full object-cover"
              />
              <button
                onClick={() => onChange({ ...block, url: '' })}
                className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80"
              >
                Ganti
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-28 w-full items-center justify-center rounded-lg border border-dashed border-gray-700 text-sm text-gray-500 hover:border-gray-500 hover:text-gray-400 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : '+ Pilih gambar'}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && handleImageUpload(e.target.files[0])
            }
          />
          <input
            value={block.caption}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Caption (opsional)"
            className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none ring-1 ring-gray-800 focus:ring-gray-600"
          />
        </div>
      )}

      {/* Images block */}
      {block.type === 'images' && (
        <div className="space-y-2">
          {block.urls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {block.urls.map((url, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-24 w-full object-cover" />
                  <button
                    onClick={() =>
                      onChange({
                        ...block,
                        urls: block.urls.filter((_, j) => j !== i),
                      })
                    }
                    className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-xs text-white hover:bg-black/80"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => filesRef.current?.click()}
            disabled={uploading}
            className="flex h-16 w-full items-center justify-center rounded-lg border border-dashed border-gray-700 text-sm text-gray-500 hover:border-gray-500 hover:text-gray-400 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : '+ Tambah gambar'}
          </button>
          <input
            ref={filesRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) =>
              e.target.files && handleImagesUpload(e.target.files)
            }
          />
          <input
            value={block.caption}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Caption (opsional)"
            className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none ring-1 ring-gray-800 focus:ring-gray-600"
          />
        </div>
      )}

      {/* Embed block */}
      {block.type === 'embed' && (
        <div className="space-y-2">
          <input
            value={block.url}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
            placeholder="URL embed Figma..."
            className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none ring-1 ring-gray-800 focus:ring-gray-600"
          />
          <input
            value={block.caption}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Caption (opsional)"
            className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none ring-1 ring-gray-800 focus:ring-gray-600"
          />
        </div>
      )}

      {/* Link block */}
      {block.type === 'link' && (
        <div className="space-y-2">
          <input
            value={block.label}
            onChange={(e) => onChange({ ...block, label: e.target.value })}
            placeholder="Label (contoh: Open in Figma)"
            className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none ring-1 ring-gray-800 focus:ring-gray-600"
          />
          <input
            value={block.url}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
            placeholder="URL"
            className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none ring-1 ring-gray-800 focus:ring-gray-600"
          />
        </div>
      )}
    </div>
  )
}

// ============================================================
// SECTION EDITOR
// ============================================================

function SectionEditor({
  section,
  slug,
  onChange,
  onRemove,
}: {
  section: Section
  slug: string
  onChange: (section: Section) => void
  onRemove: () => void
}) {
  const addBlock = (type: Block['type']) => {
    const newBlock: Block =
      type === 'text'
        ? { type, value: '' }
        : type === 'image'
          ? { type, url: '', caption: '' }
          : type === 'images'
            ? { type, urls: [], caption: '' }
            : type === 'embed'
              ? { type, url: '', caption: '' }
              : { type: 'link', label: '', url: '' }

    onChange({ ...section, blocks: [...section.blocks, newBlock] })
  }

  const updateBlock = (index: number, block: Block) => {
    const blocks = [...section.blocks]
    blocks[index] = block
    onChange({ ...section, blocks })
  }

  const removeBlock = (index: number) => {
    onChange({
      ...section,
      blocks: section.blocks.filter((_, i) => i !== index),
    })
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const blocks = [...section.blocks]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= blocks.length) return
    ;[blocks[index], blocks[target]] = [blocks[target], blocks[index]]
    onChange({ ...section, blocks })
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50">
      {/* Section header */}
      <div className="flex items-center gap-3 border-b border-gray-800 px-4 py-3">
        <div className="flex flex-1 gap-2">
          <input
            value={section.id}
            onChange={(e) => onChange({ ...section, id: e.target.value })}
            placeholder="id (contoh: overview)"
            className="w-32 rounded-lg bg-gray-800 px-2 py-1.5 font-mono text-xs text-gray-400 outline-none focus:ring-1 focus:ring-gray-600"
          />
          <input
            value={section.label}
            onChange={(e) =>
              onChange({
                ...section,
                label: e.target.value,
                id: slugify(e.target.value),
              })
            }
            placeholder="Label section (contoh: Overview)"
            className="flex-1 rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-200 outline-none focus:ring-1 focus:ring-gray-600"
          />
        </div>
        <button
          onClick={onRemove}
          className="rounded p-1 text-gray-600 hover:bg-red-900/50 hover:text-red-400"
        >
          Hapus section
        </button>
      </div>

      {/* Blocks */}
      <div className="space-y-3 p-4">
        {section.blocks.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-600">
            Belum ada block. Tambahkan di bawah.
          </p>
        )}
        {section.blocks.map((block, i) => (
          <BlockEditor
            key={i}
            block={block}
            index={i}
            slug={slug}
            onChange={(b) => updateBlock(i, b)}
            onRemove={() => removeBlock(i)}
            onMoveUp={() => moveBlock(i, 'up')}
            onMoveDown={() => moveBlock(i, 'down')}
          />
        ))}

        {/* Add block buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {(
            ['text', 'image', 'images', 'embed', 'link'] as Block['type'][]
          ).map((type) => (
            <button
              key={type}
              onClick={() => addBlock(type)}
              className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            >
              + {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// PROJECT FORM
// ============================================================

function ProjectForm({
  initial,
  onSave,
  onCancel,
  onDelete,
}: {
  initial?: Project
  onSave: (project: Omit<Project, 'id'>, id?: string) => Promise<void>
  onCancel: () => void
  onDelete?: (id: string) => Promise<void>
}) {
  const isEdit = !!initial
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const thumbnailRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<Omit<Project, 'id'>>({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    date: initial?.date
      ? initial.date.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    thumbnail: initial?.thumbnail ?? '',
    description: initial?.description ?? '',
    tags: initial?.tags ?? [],
    sections: initial?.sections ?? [],
  })

  const [tagsInput, setTagsInput] = useState(initial?.tags?.join(', ') ?? '')
  const [uploadingThumb, setUploadingThumb] = useState(false)

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: isEdit ? f.slug : slugify(title),
    }))
  }

  const handleThumbnailUpload = async (file: File) => {
    setUploadingThumb(true)
    const url = await uploadImage(file, form.slug || 'temp')
    setUploadingThumb(false)
    if (url) setForm((f) => ({ ...f, thumbnail: url }))
  }

  const addSection = () => {
    const id = generateId()
    setForm((f) => ({
      ...f,
      sections: [...f.sections, { id, label: '', blocks: [] }],
    }))
  }

  const updateSection = (index: number, section: Section) => {
    const sections = [...form.sections]
    sections[index] = section
    setForm((f) => ({ ...f, sections }))
  }

  const removeSection = (index: number) => {
    setForm((f) => ({
      ...f,
      sections: f.sections.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    await onSave({ ...form, tags }, initial?.id)
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!initial?.id || !onDelete) return
    if (!confirm(`Hapus project "${initial.title}"?`)) return
    setDeleting(true)
    await onDelete(initial.id)
    setDeleting(false)
  }


  return (
    <div className="space-y-6">
      {/* Basic info */}
      <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Info Dasar
        </h3>

        <div className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Judul project"
            className="w-full rounded-lg bg-gray-800 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 outline-none ring-1 ring-gray-700 focus:ring-gray-500"
          />
          <div className="flex gap-2">
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="slug"
              className="flex-1 rounded-lg bg-gray-800 px-3 py-2.5 font-mono text-sm text-gray-400 placeholder-gray-600 outline-none ring-1 ring-gray-700 focus:ring-gray-500"
            />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="rounded-lg bg-gray-800 px-3 py-2.5 text-sm text-gray-400 outline-none ring-1 ring-gray-700 focus:ring-gray-500"
            />
          </div>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Deskripsi singkat (tampil di card list)"
            rows={2}
            className="w-full resize-none rounded-lg bg-gray-800 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 outline-none ring-1 ring-gray-700 focus:ring-gray-500"
          />
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags (pisah dengan koma: UI Design, Web, Mobile)"
            className="w-full rounded-lg bg-gray-800 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 outline-none ring-1 ring-gray-700 focus:ring-gray-500"
          />
        </div>

        {/* Thumbnail */}
        <div>
          <p className="mb-2 text-xs text-gray-500">Thumbnail</p>
          {form.thumbnail ? (
            <div className="relative overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.thumbnail}
                alt=""
                className="h-48 w-full object-cover"
              />
              <button
                onClick={() => setForm((f) => ({ ...f, thumbnail: '' }))}
                className="absolute right-2 top-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white hover:bg-black/80"
              >
                Ganti
              </button>
            </div>
          ) : (
            <button
              onClick={() => thumbnailRef.current?.click()}
              disabled={uploadingThumb}
              className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-gray-700 text-sm text-gray-500 hover:border-gray-500 hover:text-gray-400 disabled:opacity-50"
            >
              {uploadingThumb ? 'Uploading...' : '+ Upload thumbnail'}
            </button>
          )}
          <input
            ref={thumbnailRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && handleThumbnailUpload(e.target.files[0])
            }
          />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Sections
          </h3>
          <button
            onClick={addSection}
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
          >
            + Tambah section
          </button>
        </div>

        {form.sections.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-800 py-10 text-center text-sm text-gray-600">
            {`Belum ada section. Klik "+ Tambah section" untuk mulai.`}
          </div>
        )}

        {form.sections.map((section, i) => (
          <SectionEditor
            key={i}
            section={section}
            slug={form.slug}
            onChange={(s) => updateSection(i, s)}
            onRemove={() => removeSection(i)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-800 pt-4">
        <div>
          {isEdit && onDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg px-4 py-2 text-sm text-red-500 hover:bg-red-900/30 disabled:opacity-50"
            >
              {deleting ? 'Menghapus...' : 'Hapus project'}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-gray-800"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 disabled:opacity-50"
          >
            {saving
              ? 'Menyimpan...'
              : isEdit
                ? 'Simpan perubahan'
                : 'Buat project'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN ADMIN PAGE
// ============================================================

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selected, setSelected] = useState<Project | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = generateId()
    setToasts((t) => [...t, { id, type, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }

  const removeToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id))

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_projects')
    if (error) showToast('error', 'Gagal memuat projects')
    else setProjects(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleSave = async (payload: Omit<Project, 'id'>, id?: string) => {
    if (id) {
      const { error } = await supabase
        .from('projects')
        .update({ ...payload, date: new Date(payload.date).toISOString() })
        .eq('id', id)

      if (error) {
        showToast('error', 'Gagal menyimpan perubahan')
        return
      }
      showToast('success', 'Project berhasil diupdate!')
    } else {
      const { error } = await supabase
        .from('projects')
        .insert({ ...payload, date: new Date(payload.date).toISOString() })

      if (error) {
        showToast('error', 'Gagal membuat project baru')
        return
      }
      showToast('success', 'Project berhasil dibuat!')
    }

    await fetchProjects()
    setView('list')
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      showToast('error', 'Gagal menghapus project')
      return
    }
    showToast('success', 'Project berhasil dihapus!')
    await fetchProjects()
    setView('list')
  }

  const handleEdit = async (project: Project) => {
    const { data, error } = await supabase.rpc('get_project_by_slug', {
      p_slug: project.slug,
    })

    if (error || !data || data.length === 0) {
      showToast('error', 'Gagal memuat detail project')
      return
    }

    setSelected(data[0])
    setView('edit')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            {view !== 'list' && (
              <button
                onClick={() => setView('list')}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
              >
                ←
              </button>
            )}
            <h1 className="text-sm font-semibold text-gray-100">
              {view === 'list'
                ? 'Portfolio Admin'
                : view === 'create'
                  ? 'Buat Project Baru'
                  : `Edit: ${selected?.title}`}
            </h1>
          </div>
          {view === 'list' && (
            <button
              onClick={() => {
                setSelected(null)
                setView('create')
              }}
              className="rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-200"
            >
              + Project baru
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* List view */}
        {view === 'list' && (
          <div className="space-y-2">
            {loading ? (
              <div className="py-20 text-center text-sm text-gray-600">
                Memuat...
              </div>
            ) : projects.length === 0 ? (
              <div className="py-20 text-center text-sm text-gray-600">
                Belum ada project.
              </div>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleEdit(project)}
                  className="flex w-full items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-left transition hover:border-gray-700 hover:bg-gray-900"
                >
                  {project.thumbnail && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={project.thumbnail}
                      alt=""
                      className="h-14 w-20 flex-none rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-100">
                      {project.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {new Date(project.date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {project.tags?.length > 0 &&
                        ` · ${project.tags.join(', ')}`}
                    </p>
                  </div>
                  <span className="text-gray-600">→</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Create / Edit view */}
        {(view === 'create' || view === 'edit') && (
          <ProjectForm
            initial={view === 'edit' ? selected ?? undefined : undefined}
            onSave={handleSave}
            onCancel={() => setView('list')}
            onDelete={view === 'edit' ? handleDelete : undefined}
          />
        )}
      </main>
    </div>
  )
}
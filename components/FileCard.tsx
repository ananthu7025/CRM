'use client'

import { Trash2, Download, FileText, Image, FileArchive, FileCode, File } from 'lucide-react'
import type { ProjectFile } from '@/drizzle/schema'

interface Props {
  file: ProjectFile
  onDelete: (id: string) => void
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <Image size={18} />
  if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('document'))
    return <FileText size={18} />
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar'))
    return <FileArchive size={18} />
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('html') || mimeType.includes('css'))
    return <FileCode size={18} />
  return <File size={18} />
}

function fileColor(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '#10B981'
  if (mimeType.includes('pdf')) return '#EF4444'
  if (mimeType.includes('zip') || mimeType.includes('tar')) return '#F59E0B'
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('typescript')) return '#6366F1'
  return '#FF5E8D'
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileCard({ file, onDelete }: Props) {
  const color = fileColor(file.mimeType)
  const date = new Date(file.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const isImage = file.mimeType.startsWith('image/')

  return (
    <div className="group bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#FF5E8D]/20 transition-all duration-200">
      {/* Preview for images */}
      {isImage ? (
        <div className="h-32 bg-[#F7F8FB] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-20 flex items-center justify-center" style={{ backgroundColor: `${color}10` }}>
          <span style={{ color }}><FileIcon mimeType={file.mimeType} /></span>
        </div>
      )}

      <div className="p-3">
        <p className="text-sm font-medium text-[#0F172A] truncate" title={file.name}>{file.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-[#94A3B8]">{formatSize(file.size)} · {date}</span>
        </div>

        <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={file.url}
            download={file.name}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#F1F3F7] hover:bg-[#FF5E8D] hover:text-white text-[#475569] text-xs font-medium transition-colors"
          >
            <Download size={11} /> Download
          </a>
          <button
            onClick={() => onDelete(file.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FFF1F5] hover:bg-red-500 hover:text-white text-red-400 transition-colors flex-shrink-0"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

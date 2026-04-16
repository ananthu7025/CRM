'use client'

import { Blog } from '@/drizzle/schema'
import { Trash2, Edit, Eye, EyeOff } from 'lucide-react'

interface BlogCardProps {
  blog: Blog
  onEdit: (blog: Blog) => void
  onDelete: (id: string) => void
  onTogglePublish: (id: string, published: boolean) => void
}

export default function BlogCard({ blog, onEdit, onDelete, onTogglePublish }: BlogCardProps) {
  const formattedDate = blog.publishDate
    ? new Date(blog.publishDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Not scheduled'

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#0F172A] text-sm mb-1 truncate">{blog.title}</h3>
          <p className="text-xs text-[#94A3B8] truncate">{blog.slug}</p>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0 ml-2 ${
            blog.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {blog.published ? 'Published' : 'Draft'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {blog.tag && <p className="text-xs text-[#475569]">📌 <span className="font-medium">{blog.tag}</span></p>}
        {blog.author && <p className="text-xs text-[#475569]">✍️ <span className="font-medium">{blog.author}</span></p>}
        <p className="text-xs text-[#94A3B8]">📅 {formattedDate}</p>
        {blog.readTime && <p className="text-xs text-[#94A3B8]">⏱️ {blog.readTime} min read</p>}
      </div>

      {blog.description && <p className="text-xs text-[#475569] mb-4 line-clamp-2">{blog.description}</p>}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onTogglePublish(blog.id, !blog.published)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg hover:bg-[#F1F3F7] text-[#475569] transition-colors"
          title={blog.published ? 'Unpublish' : 'Publish'}
        >
          {blog.published ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button
          onClick={() => onEdit(blog)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg hover:bg-[#F1F3F7] text-[#475569] transition-colors"
        >
          <Edit size={14} /> Edit
        </button>
        <button
          onClick={() => onDelete(blog.id)}
          className="px-2 py-1.5 text-xs font-medium rounded-lg hover:bg-red-50 text-red-600 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

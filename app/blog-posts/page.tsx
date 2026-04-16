'use client'

import { useEffect, useState, useCallback } from 'react'
import { Blog } from '@/drizzle/schema'
import BlogCard from '@/components/BlogCard'
import BlogForm from '@/components/BlogForm'
import Modal from '@/components/Modal'
import { Plus } from 'lucide-react'

export default function BlogPostsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/blog')
    const data = await res.json()
    setBlogs(data.blogs || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async (data: any) => {
    const res = await fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const blog = await res.json()
    setBlogs((b) => [blog, ...b])
    setShowModal(false)
  }

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog)
    setShowModal(true)
  }

  const handleUpdate = async (data: any) => {
    if (!editingBlog) return
    const res = await fetch(`/api/blog/${editingBlog.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const updated = await res.json()
    setBlogs((b) => b.map((x) => (x.id === editingBlog.id ? updated : x)))
    setShowModal(false)
    setEditingBlog(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return
    await fetch(`/api/blog/${id}`, { method: 'DELETE' })
    setBlogs((b) => b.filter((x) => x.id !== id))
  }

  const handleTogglePublish = async (id: string, published: boolean) => {
    const res = await fetch(`/api/blog/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published }),
    })
    const updated = await res.json()
    setBlogs((b) => b.map((x) => (x.id === id ? updated : x)))
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBlog(null)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Blog Posts</h1>
          <p className="text-sm text-[#94A3B8] mt-1">{blogs.length} blog posts</p>
        </div>
        <button
          onClick={() => {
            setEditingBlog(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-[#FF5E8D] hover:bg-[#E14F79] text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> New Blog Post
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-[#E2E8F0] rounded mb-3 w-2/3"></div>
              <div className="h-3 bg-[#E2E8F0] rounded mb-4 w-1/2"></div>
              <div className="h-20 bg-[#E2E8F0] rounded mb-4"></div>
              <div className="h-8 bg-[#E2E8F0] rounded"></div>
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-2">No blog posts yet</h2>
          <p className="text-sm text-[#94A3B8]">Create your first blog post to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editingBlog ? 'Edit Blog Post' : 'New Blog Post'} onClose={closeModal}>
          <BlogForm
            initial={editingBlog || undefined}
            onSubmit={editingBlog ? handleUpdate : handleAdd}
            submitLabel={editingBlog ? 'Update Blog Post' : 'Create Blog Post'}
          />
        </Modal>
      )}
    </div>
  )
}

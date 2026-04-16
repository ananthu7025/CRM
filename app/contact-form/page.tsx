'use client'

import { useEffect, useState, useCallback } from 'react'
import { ContactFormSubmission } from '@/drizzle/schema'
import Modal from '@/components/Modal'
import { Mail, Phone, User, MessageSquare, Calendar, X } from 'lucide-react'

export default function ContactFormPage() {
  const [submissions, setSubmissions] = useState<ContactFormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<ContactFormSubmission | null>(null)
  const [showModal, setShowModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contact-form/submissions')
      const data = await res.json()
      setSubmissions(data.submissions)
    } catch (error) {
      console.error('Error loading submissions:', error)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleViewDetails = (submission: ContactFormSubmission) => {
    setSelectedSubmission(submission)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedSubmission(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading submissions...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Form Submissions</h1>
        <p className="text-gray-600 mb-6">Manage and respond to contact form submissions</p>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600">No submissions yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden shadow">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subject</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">{submission.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{submission.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{submission.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          submission.status === 'new'
                            ? 'bg-blue-100 text-blue-700'
                            : submission.status === 'read'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleViewDetails(submission)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && selectedSubmission && (
          <Modal title="Contact Form Submission" onClose={handleCloseModal}>
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" /> Name
                    </label>
                    <p className="text-gray-900 font-medium">{selectedSubmission.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4" /> Phone
                    </label>
                    <p className="text-gray-900 font-medium">{selectedSubmission.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4" /> Email
                    </label>
                    <p className="text-gray-900 font-medium">{selectedSubmission.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4" /> Date
                    </label>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedSubmission.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium mb-2 block">Subject</label>
                  <p className="text-gray-900">{selectedSubmission.subject}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium mb-2 block">Message</label>
                  <div className="bg-gray-50 rounded p-4 text-gray-900 whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition font-medium"
                  >
                    Close
                  </button>
                  <a
                    href={`mailto:${selectedSubmission.email}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium text-center"
                  >
                    Reply via Email
                  </a>
                </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}

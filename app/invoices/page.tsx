/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, Download, X, Eye } from 'lucide-react'

interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
}

const generateInvoiceNumber = () =>
  `INV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

const getDefaultDueDate = () => {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

const formatDate = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A'

// Shared invoice styles as inline style objects (needed for html2canvas capture)
const invoiceStyles = {
  root: {
    width: '794px',
    backgroundColor: '#ffffff',
    padding: '40px 48px',
    fontFamily: 'Georgia, serif',
    color: '#111827',
    boxSizing: 'border-box' as const,
  },
}

export default function InvoicesPage() {
  // The hidden ref is always mounted — used for PDF generation
  const hiddenInvoiceRef = useRef<HTMLDivElement>(null)

  const [showPreview, setShowPreview] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber)
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(getDefaultDueDate)
  const [projectName, setProjectName] = useState('')

  const [clientName, setClientName] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')

  const [companyName, setCompanyName] = useState('Luminous Logics')
  const [companyEmail, setCompanyEmail] = useState('contact@luminouslogics.com')
  const [companyPhone, setCompanyPhone] = useState('+91 484 000 0000')
  const [companyAddress, setCompanyAddress] = useState('Kakkanad, Kochi, Kerala')

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0 },
  ])
  const [taxPercent, setTaxPercent] = useState(0)
  const [paymentTerms, setPaymentTerms] = useState('')
  const [notes, setNotes] = useState('')

  const addLineItem = () =>
    setLineItems(prev => [
      ...prev,
      { id: Math.random().toString(36).slice(2, 11), description: '', quantity: 1, rate: 0 },
    ])

  const removeLineItem = (id: string) =>
    setLineItems(prev => prev.filter(item => item.id !== id))

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) =>
    setLineItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    )

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const taxAmount = subtotal * (taxPercent / 100)
  const total = subtotal + taxAmount

  const downloadPDF = async () => {
    const el = hiddenInvoiceRef.current
    if (!el) return

    setIsDownloading(true)
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      })

      const imgData = canvas.toDataURL('image/png')

      // A4: 210 x 297 mm
      const pageWidth = 210
      const pageHeight = 297
      const margin = 10
      const usableWidth = pageWidth - margin * 2
      const usableHeight = pageHeight - margin * 2

      // Scale the captured image to fit usable width
      const scaledWidth = usableWidth
      const scaledHeight = (canvas.height / canvas.width) * scaledWidth

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

      if (scaledHeight <= usableHeight) {
        // Single page
        pdf.addImage(imgData, 'PNG', margin, margin, scaledWidth, scaledHeight)
      } else {
        // Multi-page: slice canvas per page
        let yOffset = 0
        let isFirstPage = true

        while (yOffset < scaledHeight) {
          if (!isFirstPage) pdf.addPage()
          isFirstPage = false

          const sliceHeightMm = Math.min(usableHeight, scaledHeight - yOffset)
          const srcYRatio = yOffset / scaledHeight
          const srcHeightRatio = sliceHeightMm / scaledHeight

          const srcY = Math.round(srcYRatio * canvas.height)
          const srcH = Math.round(srcHeightRatio * canvas.height)

          const pageCanvas = document.createElement('canvas')
          pageCanvas.width = canvas.width
          pageCanvas.height = srcH
          const ctx = pageCanvas.getContext('2d')!
          ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH)

          pdf.addImage(
            pageCanvas.toDataURL('image/png'),
            'PNG',
            margin,
            margin,
            scaledWidth,
            sliceHeightMm
          )
          yOffset += sliceHeightMm
        }
      }

      pdf.save(`invoice-${invoiceNumber}.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  // The invoice layout — used both in the hidden div (for PDF) and in the modal preview
  const InvoiceLayout = () => (
    <>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #111827', paddingBottom: '20px', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px', color: '#111827', fontFamily: 'Georgia, serif' }}>INVOICE</div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', fontFamily: 'sans-serif' }}>{companyName}</div>
        </div>
        <div style={{ border: '2px solid #111827', borderRadius: '6px', padding: '10px 16px', textAlign: 'right' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'sans-serif' }}>Invoice #</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#111827', fontFamily: 'monospace' }}>{invoiceNumber}</div>
        </div>
      </div>

      {/* 3-col info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px', fontFamily: 'sans-serif' }}>From</div>
          <div style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>
            <div style={{ fontWeight: '700', marginBottom: '2px' }}>{companyName}</div>
            {companyAddress && <div style={{ color: '#374151' }}>{companyAddress}</div>}
            <div style={{ color: '#374151' }}>{companyEmail}</div>
            <div style={{ color: '#374151' }}>{companyPhone}</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px', fontFamily: 'sans-serif' }}>Bill To</div>
          <div style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>
            <div style={{ fontWeight: '700', marginBottom: '2px' }}>{clientName || 'Client Name'}</div>
            {clientCompany && <div style={{ color: '#374151' }}>{clientCompany}</div>}
            {clientAddress && <div style={{ color: '#374151' }}>{clientAddress}</div>}
            {clientEmail && <div style={{ color: '#374151' }}>{clientEmail}</div>}
            {clientPhone && <div style={{ color: '#374151' }}>{clientPhone}</div>}
          </div>
        </div>
        <div style={{ fontFamily: 'sans-serif' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Invoice Date</div>
            <div style={{ fontSize: '12px', fontWeight: '600' }}>{formatDate(invoiceDate)}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Due Date</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#dc2626' }}>{formatDate(dueDate)}</div>
          </div>
        </div>
      </div>

      {/* Project */}
      {projectName && (
        <div style={{ background: '#f3f4f6', borderLeft: '4px solid #111827', padding: '8px 12px', marginBottom: '16px', fontFamily: 'sans-serif' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Project: </span>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>{projectName}</span>
        </div>
      )}

      {/* Line items table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontFamily: 'sans-serif' }}>
        <thead>
          <tr style={{ background: '#111827', color: '#ffffff' }}>
            <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>Description</th>
            <th style={{ textAlign: 'center', padding: '8px 10px', fontSize: '11px', fontWeight: '700', width: '60px' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '11px', fontWeight: '700', width: '100px' }}>Unit Price</th>
            <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '11px', fontWeight: '700', width: '100px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, idx) => (
            <tr key={item.id} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px 10px', fontSize: '12px', color: '#111827' }}>{item.description || 'Item'}</td>
              <td style={{ padding: '8px 10px', fontSize: '12px', color: '#374151', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '8px 10px', fontSize: '12px', color: '#374151', textAlign: 'right' }}>{formatCurrency(item.rate)}</td>
              <td style={{ padding: '8px 10px', fontSize: '12px', fontWeight: '700', color: '#111827', textAlign: 'right' }}>{formatCurrency(item.quantity * item.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <div style={{ width: '260px', fontFamily: 'sans-serif' }}>
          <div style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px 6px 0 0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Subtotal</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>{formatCurrency(subtotal)}</span>
            </div>
            {taxPercent > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Tax ({taxPercent}%)</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>{formatCurrency(taxAmount)}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#111827', borderRadius: '0 0 6px 6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff', letterSpacing: '1px' }}>TOTAL DUE</span>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      {(paymentTerms || notes) ? (
        <div style={{ borderTop: '2px solid #111827', paddingTop: '16px', fontFamily: 'sans-serif' }}>
          {paymentTerms && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Payment Terms</div>
              <div style={{ fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>{paymentTerms}</div>
            </div>
          )}
          {notes && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Notes</div>
              <div style={{ fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>{notes}</div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ borderTop: '2px solid #111827', paddingTop: '12px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <span style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>Thank you for your business!</span>
        </div>
      )}
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden invoice — always mounted so ref is always valid for PDF capture */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', top: 0, left: '-9999px', zIndex: -1, pointerEvents: 'none', opacity: 0 }}
      >
        <div ref={hiddenInvoiceRef} style={invoiceStyles.root}>
          <InvoiceLayout />
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Invoice Generator</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Eye size={18} />
              Preview
            </button>
            <button
              onClick={downloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Invoice Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Invoice Details</h2>
            <div className="grid grid-cols-3 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="e.g., Mobile App Development"
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* From / Bill To */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-5">From</h2>
              <div className="space-y-4">
                {(
                  [
                    { label: 'Company Name', value: companyName, set: setCompanyName, type: 'text' },
                    { label: 'Email', value: companyEmail, set: setCompanyEmail, type: 'email' },
                    { label: 'Phone', value: companyPhone, set: setCompanyPhone, type: 'tel' },
                    { label: 'Address', value: companyAddress, set: setCompanyAddress, type: 'text', placeholder: 'Optional' },
                  ] as const
                ).map(({ label, value, set, type, placeholder }: any) => (
                  <div key={label}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => set(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Bill To</h2>
              <div className="space-y-4">
                {(
                  [
                    { label: 'Client Name', value: clientName, set: setClientName, type: 'text' },
                    { label: 'Company', value: clientCompany, set: setClientCompany, type: 'text' },
                    { label: 'Email', value: clientEmail, set: setClientEmail, type: 'email' },
                    { label: 'Phone', value: clientPhone, set: setClientPhone, type: 'tel' },
                    { label: 'Address', value: clientAddress, set: setClientAddress, type: 'text' },
                  ] as const
                ).map(({ label, value, set, type }: any) => (
                  <div key={label}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => set(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Items & Services</h2>
              <button
                onClick={addLineItem}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={15} /> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {lineItems.map(item => (
                <div key={item.id} className="flex gap-3 items-end p-4 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Service or product description"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Qty</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.5"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Unit Price</label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={e => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Total</label>
                    <div className="px-3 py-2 text-sm font-bold text-gray-900 bg-white border border-gray-300 rounded">
                      {formatCurrency(item.quantity * item.rate)}
                    </div>
                  </div>
                  <button
                    onClick={() => removeLineItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            {/* Live summary */}
            <div className="mt-4 flex justify-end">
              <div className="text-sm text-right space-y-1">
                <div className="text-gray-600">Subtotal: <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span></div>
                {taxPercent > 0 && (
                  <div className="text-gray-600">Tax ({taxPercent}%): <span className="font-bold text-gray-900">{formatCurrency(taxAmount)}</span></div>
                )}
                <div className="text-base font-bold text-gray-900 border-t border-gray-300 pt-1">Total: {formatCurrency(total)}</div>
              </div>
            </div>
          </div>

          {/* Tax & Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Percentage (%)</label>
                <input
                  type="number"
                  value={taxPercent}
                  onChange={e => setTaxPercent(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Terms</label>
                <textarea
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value)}
                  placeholder="e.g., Due in 30 days, payment via bank transfer"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Thank you for your business! Any additional terms..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-h-[95vh] flex flex-col w-full max-w-4xl">
            {/* Modal header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Invoice Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Scrollable preview body */}
            <div className="overflow-y-auto flex-1 bg-gray-100 p-6">
              <div className="flex justify-center">
                <div style={{ ...invoiceStyles.root, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
                  <InvoiceLayout />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end flex-shrink-0 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowPreview(false)}
                className="px-5 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={downloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 px-5 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
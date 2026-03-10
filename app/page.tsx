'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Quotation {
  id: number
  number: string
  date: string
  clientName: string
  currency: string
  total: number
  status: string
}

const STATUS_OPTIONS = ['Draft', 'Sent', 'Accepted', 'Archived'] as const

const STATUS_STYLES: Record<string, string> = {
  Draft:    'bg-gray-100 text-gray-700',
  Sent:     'bg-blue-100 text-blue-700',
  Accepted: 'bg-green-100 text-green-700',
  Archived: 'bg-amber-100 text-amber-700',
}

export default function HomePage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/quotations')
      .then(r => r.json())
      .then(data => setQuotations(data))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: number) {
    if (!confirm('Delete this quotation?')) return
    await fetch(`/api/quotations/${id}`, { method: 'DELETE' })
    setQuotations(prev => prev.filter(q => q.id !== id))
  }

  async function handleStatusChange(id: number, status: string) {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status } : q))
    await fetch(`/api/quotations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  if (loading) return <div className="max-w-4xl mx-auto p-6">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quotations</h1>
        <Link
          href="/quotations/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + New Quotation
        </Link>
      </div>

      {quotations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No quotations yet.</p>
          <Link href="/quotations/new" className="text-blue-600 hover:underline mt-2 inline-block">
            Create your first quotation
          </Link>
        </div>
      ) : (
        <table className="w-full border border-gray-200 rounded">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Number</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Client</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {quotations.map(q => (
              <tr key={q.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/quotations/${q.id}`} className="text-blue-600 hover:underline font-medium">
                    {q.number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(q.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">{q.clientName}</td>
                <td className="px-4 py-3">
                  <select
                    value={q.status}
                    onChange={e => handleStatusChange(q.id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 ${STATUS_STYLES[q.status] ?? STATUS_STYLES.Draft}`}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  {q.currency} {Math.round(q.total).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

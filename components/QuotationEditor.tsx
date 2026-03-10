'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QuotationHeader from './QuotationHeader'
import SectionRow from './SectionRow'
import LineItemRow from './LineItemRow'

interface Section {
  tempId: number
  name: string
  order: number
}

interface LineItem {
  tempId: number
  sectionTempId: number | null
  itemNumber: string
  service: string
  description: string
  price: number
  order: number
}

interface Props {
  quotationId?: number
  initialData?: {
    number: string
    date: string
    clientName: string
    currency: string
    notes: string
    sections: Array<{ id: number; name: string; order: number }>
    items: Array<{
      id: number
      sectionId: number | null
      itemNumber: string
      service: string
      description: string
      price: number
      order: number
    }>
  }
}

let tempIdCounter = 1

function today() {
  return new Date().toISOString().split('T')[0]
}

export default function QuotationEditor({ quotationId, initialData }: Props) {
  const router = useRouter()
  const [number] = useState(initialData?.number || 'Auto-assigned')
  const [date, setDate] = useState(initialData?.date || today())
  const [clientName, setClientName] = useState(initialData?.clientName || '')
  const [currency, setCurrency] = useState(initialData?.currency || 'USD')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [saving, setSaving] = useState(false)

  // Pre-assign tempIds for sections so items can reference them
  const initialSections: Section[] = (initialData?.sections || []).map(s => ({
    tempId: tempIdCounter++,
    name: s.name,
    order: s.order,
  }))
  const sectionDbIdToTempId = new Map<number, number>(
    (initialData?.sections || []).map((s, i) => [s.id, initialSections[i].tempId])
  )

  const [sections, setSections] = useState<Section[]>(initialSections)

  // Build items with resolved sectionTempId
  const [items, setItems] = useState<LineItem[]>(() => {
    if (!initialData?.items) return []
    return initialData.items.map(item => ({
      tempId: tempIdCounter++,
      sectionTempId: item.sectionId ? (sectionDbIdToTempId.get(item.sectionId) ?? null) : null,
      itemNumber: item.itemNumber,
      service: item.service,
      description: item.description,
      price: item.price,
      order: item.order,
    }))
  })

  function handleHeaderChange(field: string, value: string) {
    if (field === 'date') setDate(value)
    else if (field === 'clientName') setClientName(value)
    else if (field === 'currency') setCurrency(value)
  }

  function addSection() {
    const tempId = tempIdCounter++
    setSections(prev => [...prev, { tempId, name: 'New Section', order: prev.length }])
  }

  function deleteSection(tempId: number) {
    setSections(prev => prev.filter(s => s.tempId !== tempId))
    setItems(prev => prev.map(item =>
      item.sectionTempId === tempId ? { ...item, sectionTempId: null } : item
    ))
  }

  function updateSection(tempId: number, name: string) {
    setSections(prev => prev.map(s => s.tempId === tempId ? { ...s, name } : s))
  }

  function addItem(sectionTempId: number | null = null) {
    const newTempId = tempIdCounter++
    setItems(prev => {
      const order = prev.length
      return [...prev, {
        tempId: newTempId,
        sectionTempId,
        itemNumber: String(order + 1),
        service: '',
        description: '',
        price: 0,
        order,
      }]
    })
  }

  function deleteItem(tempId: number) {
    setItems(prev => prev.filter(i => i.tempId !== tempId))
  }

  function moveSectionUp(tempId: number) {
    setSections(prev => {
      const idx = prev.findIndex(s => s.tempId === tempId)
      if (idx <= 0) return prev
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  function moveSectionDown(tempId: number) {
    setSections(prev => {
      const idx = prev.findIndex(s => s.tempId === tempId)
      if (idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  function moveItemUp(tempId: number) {
    const item = items.find(i => i.tempId === tempId)
    if (!item) return

    const peers = items.filter(i => i.sectionTempId === item.sectionTempId)
    const peerIdx = peers.findIndex(i => i.tempId === tempId)

    if (peerIdx > 0) {
      // Swap within same group
      const swapWith = peers[peerIdx - 1]
      setItems(prev => {
        const next = [...prev]
        const idxA = next.findIndex(i => i.tempId === swapWith.tempId)
        const idxB = next.findIndex(i => i.tempId === tempId)
        ;[next[idxA], next[idxB]] = [next[idxB], next[idxA]]
        return next
      })
      return
    }

    // First in its group — cross into previous group
    if (item.sectionTempId === null) return // already at very top

    const sectionIdx = sections.findIndex(s => s.tempId === item.sectionTempId)
    const prevGroupTempId = sectionIdx === 0 ? null : sections[sectionIdx - 1].tempId

    setItems(prev => {
      const next = prev.filter(i => i.tempId !== tempId)
      const updatedItem = { ...item, sectionTempId: prevGroupTempId }
      const prevGroupItems = next.filter(i => i.sectionTempId === prevGroupTempId)
      if (prevGroupItems.length === 0) {
        // Insert before remaining peers in current section
        const remainingPeers = next.filter(i => i.sectionTempId === item.sectionTempId)
        const insertAt = remainingPeers.length > 0
          ? next.findIndex(i => i.tempId === remainingPeers[0].tempId)
          : next.length
        next.splice(insertAt, 0, updatedItem)
      } else {
        const lastInPrev = prevGroupItems[prevGroupItems.length - 1]
        next.splice(next.findIndex(i => i.tempId === lastInPrev.tempId) + 1, 0, updatedItem)
      }
      return next
    })
  }

  function moveItemDown(tempId: number) {
    const item = items.find(i => i.tempId === tempId)
    if (!item) return

    const peers = items.filter(i => i.sectionTempId === item.sectionTempId)
    const peerIdx = peers.findIndex(i => i.tempId === tempId)

    if (peerIdx < peers.length - 1) {
      // Swap within same group
      const swapWith = peers[peerIdx + 1]
      setItems(prev => {
        const next = [...prev]
        const idxA = next.findIndex(i => i.tempId === tempId)
        const idxB = next.findIndex(i => i.tempId === swapWith.tempId)
        ;[next[idxA], next[idxB]] = [next[idxB], next[idxA]]
        return next
      })
      return
    }

    // Last in its group — cross into next group
    const sectionIdx = item.sectionTempId === null
      ? -1
      : sections.findIndex(s => s.tempId === item.sectionTempId)

    if (sectionIdx >= sections.length - 1) return // already at very bottom

    const nextGroupTempId = sections[sectionIdx + 1].tempId

    setItems(prev => {
      const next = prev.filter(i => i.tempId !== tempId)
      const updatedItem = { ...item, sectionTempId: nextGroupTempId }
      const nextGroupItems = next.filter(i => i.sectionTempId === nextGroupTempId)
      if (nextGroupItems.length === 0) {
        next.push(updatedItem)
      } else {
        next.splice(next.findIndex(i => i.tempId === nextGroupItems[0].tempId), 0, updatedItem)
      }
      return next
    })
  }

  function updateItem(tempId: number, field: string, value: string | number) {
    setItems(prev => prev.map(i => i.tempId === tempId ? { ...i, [field]: value } : i))
  }

  function getSectionSubtotal(sectionTempId: number) {
    return items
      .filter(i => i.sectionTempId === sectionTempId)
      .reduce((sum, i) => sum + i.price, 0)
  }

  const grandTotal = items.reduce((sum, i) => sum + i.price, 0)

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        date,
        clientName,
        currency,
        notes,
        sections: sections.map((s, idx) => ({ ...s, order: idx })),
        items: items.map((item, idx) => ({ ...item, order: idx })),
      }
      let res: Response
      if (quotationId) {
        res = await fetch(`/api/quotations/${quotationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/quotations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      router.push(`/quotations/${data.id}`)
    } catch {
      alert('Failed to save quotation')
    } finally {
      setSaving(false)
    }
  }

  // Render rows: interleave sections and their items
  function renderRows() {
    const rows: React.ReactElement[] = []

    // Global flat order: unsectioned first, then section groups in order
    const allOrderedItems = [
      ...items.filter(i => i.sectionTempId === null),
      ...sections.flatMap(s => items.filter(i => i.sectionTempId === s.tempId)),
    ]
    const globalFirst = allOrderedItems[0]?.tempId
    const globalLast = allOrderedItems[allOrderedItems.length - 1]?.tempId

    const unsectionedItems = items.filter(i => i.sectionTempId === null)
    unsectionedItems.forEach(item => {
      rows.push(
        <LineItemRow
          key={`item-${item.tempId}`}
          itemNumber={item.itemNumber}
          service={item.service}
          description={item.description}
          price={item.price}
          currency={currency}
          isFirst={item.tempId === globalFirst}
          isLast={item.tempId === globalLast}
          onChange={(field, value) => updateItem(item.tempId, field, value)}
          onDelete={() => deleteItem(item.tempId)}
          onMoveUp={() => moveItemUp(item.tempId)}
          onMoveDown={() => moveItemDown(item.tempId)}
        />
      )
    })

    sections.forEach((section, sectionIdx) => {
      const sectionItems = items.filter(i => i.sectionTempId === section.tempId)
      rows.push(
        <SectionRow
          key={`section-${section.tempId}`}
          name={section.name}
          subtotal={getSectionSubtotal(section.tempId)}
          currency={currency}
          isFirst={sectionIdx === 0}
          isLast={sectionIdx === sections.length - 1}
          onChange={name => updateSection(section.tempId, name)}
          onDelete={() => deleteSection(section.tempId)}
          onAddItem={() => addItem(section.tempId)}
          onMoveUp={() => moveSectionUp(section.tempId)}
          onMoveDown={() => moveSectionDown(section.tempId)}
        />
      )
      sectionItems.forEach(item => {
        rows.push(
          <LineItemRow
            key={`item-${item.tempId}`}
            itemNumber={item.itemNumber}
            service={item.service}
            description={item.description}
            price={item.price}
            currency={currency}
            isFirst={item.tempId === globalFirst}
            isLast={item.tempId === globalLast}
            onChange={(field, value) => updateItem(item.tempId, field, value)}
            onDelete={() => deleteItem(item.tempId)}
            onMoveUp={() => moveItemUp(item.tempId)}
            onMoveDown={() => moveItemDown(item.tempId)}
          />
        )
      })
    })

    return rows
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{quotationId ? `Edit Quotation ${number}` : 'New Quotation'}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          {quotationId && (
            <button
              onClick={() => window.open(`/quotations/${quotationId}/print`, '_blank')}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Print
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <QuotationHeader
        number={number}
        date={date}
        clientName={clientName}
        currency={currency}
        onChange={handleHeaderChange}
      />

      <div className="mb-6">
        <table className="w-full border border-gray-200 rounded">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-600 w-16">Item #</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Service / Description</th>
              <th className="px-3 py-2 text-right text-sm font-medium text-gray-600 w-36">Price</th>
              <th className="px-3 py-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {renderRows()}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300">
              <td colSpan={2} className="px-3 py-3 text-right font-bold">Grand Total</td>
              <td className="px-3 py-3 text-right font-bold">{currency} {Math.round(grandTotal).toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => addItem(sections.length > 0 ? sections[sections.length - 1].tempId : null)}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            + Add Item
          </button>
          <button
            onClick={addSection}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            + Add Section
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Payment Terms</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          placeholder="Payment terms, validity, etc."
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>
    </div>
  )
}

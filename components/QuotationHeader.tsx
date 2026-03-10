'use client'

interface Props {
  number: string
  date: string
  clientName: string
  currency: string
  onChange: (field: string, value: string) => void
}

export default function QuotationHeader({ number, date, clientName, currency, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quotation #</label>
        <input
          type="text"
          value={number}
          readOnly
          className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => onChange('date', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
        <input
          type="text"
          value={clientName}
          onChange={e => onChange('clientName', e.target.value)}
          placeholder="Client name"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
        <input
          type="text"
          value={currency}
          onChange={e => onChange('currency', e.target.value)}
          placeholder="USD"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
    </div>
  )
}

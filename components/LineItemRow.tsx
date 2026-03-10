'use client'

interface Props {
  itemNumber: string
  service: string
  description: string
  price: number
  currency: string
  isFirst: boolean
  isLast: boolean
  onChange: (field: string, value: string | number) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export default function LineItemRow({ itemNumber, service, description, price, currency, isFirst, isLast, onChange, onDelete, onMoveUp, onMoveDown }: Props) {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-3 py-2 w-16">
        <div className="flex flex-col gap-0.5 mb-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-default leading-none text-xs"
            title="Move item up"
          >▲</button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-default leading-none text-xs"
            title="Move item down"
          >▼</button>
        </div>
        <input
          type="text"
          value={itemNumber}
          onChange={e => onChange('itemNumber', e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="text"
          value={service}
          onChange={e => onChange('service', e.target.value)}
          placeholder="Service"
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
        <input
          type="text"
          value={description}
          onChange={e => onChange('description', e.target.value)}
          placeholder="Description"
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1 text-gray-500"
        />
      </td>
      <td className="px-3 py-2 w-36">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">{currency}</span>
          <input
            type="number"
            value={price}
            onChange={e => onChange('price', parseFloat(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right"
            min="0"
            step="0.01"
          />
        </div>
      </td>
      <td className="px-3 py-2 w-16 text-center">
        <button onClick={onDelete} className="text-red-500 hover:text-red-700 text-sm">✕</button>
      </td>
    </tr>
  )
}

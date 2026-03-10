'use client'

interface Props {
  name: string
  subtotal: number
  currency: string
  isFirst: boolean
  isLast: boolean
  onChange: (name: string) => void
  onDelete: () => void
  onAddItem: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export default function SectionRow({ name, subtotal, currency, isFirst, isLast, onChange, onDelete, onAddItem, onMoveUp, onMoveDown }: Props) {
  return (
    <tr className="bg-gray-100">
      <td className="px-3 py-2 w-16">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-default leading-none"
            title="Move section up"
          >▲</button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-default leading-none"
            title="Move section down"
          >▼</button>
        </div>
      </td>
      <td className="px-3 py-2">
        <input
          type="text"
          value={name}
          onChange={e => onChange(e.target.value)}
          placeholder="Section name"
          className="w-full bg-transparent font-semibold border-b border-gray-400 focus:outline-none focus:border-blue-500"
        />
      </td>
      <td className="px-3 py-2 text-right font-semibold">
        {currency} {Math.round(subtotal).toLocaleString()}
      </td>
      <td className="px-3 py-2 text-right">
        <button onClick={onAddItem} className="text-blue-600 hover:text-blue-800 text-sm mr-2">+ Item</button>
        <button onClick={onDelete} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
      </td>
    </tr>
  )
}

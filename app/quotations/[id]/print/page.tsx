import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = parseInt(idStr)
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      sections: { orderBy: { order: 'asc' } },
      items: { orderBy: { order: 'asc' } },
    },
  })

  if (!quotation) notFound()

  const grandTotal = quotation.items.reduce((sum, item) => sum + Number(item.price), 0)

  function getSectionItems(sectionId: number) {
    return quotation!.items.filter(i => i.sectionId === sectionId)
  }

  function getSectionSubtotal(sectionId: number) {
    return getSectionItems(sectionId).reduce((sum, i) => sum + Number(i.price), 0)
  }

  const unsectionedItems = quotation.items.filter(i => i.sectionId === null)

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: 'window.onload = function() { window.print(); }',
        }}
      />
      <div className="max-w-4xl mx-auto p-8 print:p-4">
        <div className="flex justify-between items-start mb-8 print:mb-6">
          <h1 className="text-3xl font-bold print:text-2xl">QUOTATION</h1>
          <div className="text-3xl font-bold tracking-tight print:text-2xl">
            Carv<span style={{ color: '#c45c26' }}>e</span>
          </div>
        </div>
        <div className="mb-8 print:mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Quotation #:</strong> {quotation.number}</p>
              <p><strong>Date:</strong> {new Date(quotation.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p><strong>Client:</strong> {quotation.clientName}</p>
              <p><strong>Currency:</strong> {quotation.currency}</p>
            </div>
          </div>
        </div>

        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="text-left py-2 w-16">Item #</th>
              <th className="text-left py-2">Service / Description</th>
              <th className="text-right py-2 w-32">Price ({quotation.currency})</th>
            </tr>
          </thead>
          <tbody>
            {unsectionedItems.map(item => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-2">{item.itemNumber}</td>
                <td className="py-2">
                  <div>{item.service}</div>
                  {item.description && <div className="text-sm text-gray-600">{item.description}</div>}
                </td>
                <td className="py-2 text-right">{Math.round(Number(item.price)).toLocaleString()}</td>
              </tr>
            ))}

            {quotation.sections.map(section => {
              const sectionItems = getSectionItems(section.id)
              const subtotal = getSectionSubtotal(section.id)
              return (
                <>
                  <tr key={`section-${section.id}`} className="bg-gray-100">
                    <td colSpan={2} className="py-2 font-semibold pl-0">{section.name}</td>
                    <td className="py-2 text-right font-semibold">{Math.round(subtotal).toLocaleString()}</td>
                  </tr>
                  {sectionItems.map(item => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-2 pl-4">{item.itemNumber}</td>
                      <td className="py-2">
                        <div>{item.service}</div>
                        {item.description && <div className="text-sm text-gray-600">{item.description}</div>}
                      </td>
                      <td className="py-2 text-right">{Math.round(Number(item.price)).toLocaleString()}</td>
                    </tr>
                  ))}
                </>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-800">
              <td colSpan={2} className="py-3 text-right font-bold text-lg">Grand Total ({quotation.currency})</td>
              <td className="py-3 text-right font-bold text-lg">{Math.round(grandTotal).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        {quotation.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm whitespace-pre-wrap">{quotation.notes}</p>
          </div>
        )}
      </div>

      <style>{`
        @page { margin: 0; }
        @media print {
          body { margin: 0; padding: 2cm; }
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  )
}

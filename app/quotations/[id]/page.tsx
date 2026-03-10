import { prisma } from '@/lib/prisma'
import QuotationEditor from '@/components/QuotationEditor'
import { notFound } from 'next/navigation'

export default async function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
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

  const initialData = {
    number: quotation.number,
    date: quotation.date.toISOString().split('T')[0],
    clientName: quotation.clientName,
    currency: quotation.currency,
    notes: quotation.notes,
    sections: quotation.sections,
    items: quotation.items.map(item => ({
      ...item,
      price: Number(item.price),
    })),
  }

  return <QuotationEditor quotationId={id} initialData={initialData} />
}

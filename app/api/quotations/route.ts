import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const quotations = await prisma.quotation.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  const result = quotations.map(q => ({
    ...q,
    total: q.items.reduce((sum, item) => sum + item.price, 0),
  }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Auto-generate number
  const last = await prisma.quotation.findFirst({
    orderBy: { number: 'desc' },
  })
  let nextNum = 1
  if (last) {
    const match = last.number.match(/QT-(\d+)/)
    if (match) nextNum = parseInt(match[1]) + 1
  }
  const number = `QT-${String(nextNum).padStart(4, '0')}`

  const quotation = await prisma.quotation.create({
    data: {
      number,
      date: new Date(body.date),
      clientName: body.clientName,
      currency: body.currency,
      notes: body.notes || '',
      sections: {
        create: (body.sections || []).map((s: { name: string; order: number; tempId?: number }) => ({
          name: s.name,
          order: s.order,
        })),
      },
    },
    include: { sections: true, items: true },
  })

  // Create line items with resolved sectionId
  if (body.items && body.items.length > 0) {
    for (const item of body.items) {
      let resolvedSectionId: number | null = null
      if (item.sectionTempId !== undefined && item.sectionTempId !== null) {
        const sectionIndex = body.sections.findIndex((s: { tempId?: number }) => s.tempId === item.sectionTempId)
        if (sectionIndex >= 0) {
          resolvedSectionId = quotation.sections[sectionIndex].id
        }
      }
      await prisma.lineItem.create({
        data: {
          quotationId: quotation.id,
          sectionId: resolvedSectionId,
          itemNumber: item.itemNumber,
          service: item.service,
          description: item.description,
          price: item.price,
          order: item.order,
        },
      })
    }
  }

  const final = await prisma.quotation.findUnique({
    where: { id: quotation.id },
    include: { sections: true, items: true },
  })
  return NextResponse.json(final, { status: 201 })
}

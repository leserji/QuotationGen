import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = parseInt(idStr)
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { sections: { orderBy: { order: 'asc' } }, items: { orderBy: { order: 'asc' } } },
  })
  if (!quotation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(quotation)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = parseInt(idStr)
  const body = await req.json()

  // Delete existing sections and items, then recreate
  await prisma.lineItem.deleteMany({ where: { quotationId: id } })
  await prisma.section.deleteMany({ where: { quotationId: id } })

  const updatedSections = await Promise.all(
    (body.sections || []).map((s: { name: string; order: number }) =>
      prisma.section.create({
        data: { quotationId: id, name: s.name, order: s.order },
      })
    )
  )

  for (const item of body.items || []) {
    let resolvedSectionId: number | null = null
    if (item.sectionTempId !== undefined && item.sectionTempId !== null) {
      const sectionIndex = (body.sections || []).findIndex((s: { tempId?: number }) => s.tempId === item.sectionTempId)
      if (sectionIndex >= 0 && updatedSections[sectionIndex]) {
        resolvedSectionId = updatedSections[sectionIndex].id
      }
    }
    await prisma.lineItem.create({
      data: {
        quotationId: id,
        sectionId: resolvedSectionId,
        itemNumber: item.itemNumber,
        service: item.service,
        description: item.description,
        price: parseFloat(item.price) || 0,
        order: item.order,
      },
    })
  }

  const quotation = await prisma.quotation.update({
    where: { id },
    data: {
      date: new Date(body.date),
      clientName: body.clientName,
      currency: body.currency,
      notes: body.notes || '',
    },
    include: { sections: { orderBy: { order: 'asc' } }, items: { orderBy: { order: 'asc' } } },
  })

  return NextResponse.json(quotation)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = parseInt(idStr)
  await prisma.quotation.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

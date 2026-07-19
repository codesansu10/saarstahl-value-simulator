import jsPDF from 'jspdf'
import type { BriefResult } from '@/lib/brief-schema'
import type { DealInput } from '@/lib/types'

export function generateBriefPDF(
  deal: DealInput,
  result: BriefResult,
  filename: string = 'sales-brief',
) {
  const { brief, mode } = result
  const doc = new jsPDF()
  let y = 20

  // Helper function to add text with line breaks
  const addMultilineText = (text: string, x: number, startY: number, maxWidth: number) => {
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.text(lines, x, startY)
    return startY + lines.length * 5
  }

  // Title
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Sales Preparation Brief', 20, y)
  y += 15

  // Deal header
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Company: ${deal.companyName}`, 20, y)
  y += 6
  doc.text(`Product: ${deal.productName}`, 20, y)
  y += 6
  doc.text(`Stakeholder: ${brief.stakeholder}`, 20, y)
  y += 6
  doc.text(`Mode: ${mode === 'llm' ? 'LLM' : 'Template'}`, 20, y)
  y += 12

  // Primary Objection
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Primary Objection to Address', 20, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  y = addMultilineText(brief.primaryObjection, 20, y, 170)
  y += 8

  // Recommended Opening
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Recommended Opening', 20, y)
  y += 8
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(10)
  y = addMultilineText(`"${brief.recommendedOpening}"`, 25, y, 160)
  y += 8

  // Helper to add section
  const addSection = (title: string, items: Array<{ text: string }>) => {
    if (!items.length) return y

    if (y > 250) {
      doc.addPage()
      y = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(title, 20, y)
    y += 7

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    items.forEach((item) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      const lines = doc.splitTextToSize(`• ${item.text}`, 165)
      doc.text(lines, 25, y)
      y += lines.length * 5 + 2
    })

    y += 3
    return y
  }

  // Add all sections
  y = addSection('Why This is Likely', brief.whyLikely)
  y = addSection('Conversation Strategy', brief.conversationStrategy)
  y = addSection('Evidence to Bring', brief.evidenceToBring)
  y = addSection('Claims to Avoid', brief.claimsToAvoid)
  y = addSection('Follow-up Questions', brief.followUpQuestions)
  y = addSection('Missing Information', brief.missingInformation)

  // Recommended Next Step
  if (y > 250) {
    doc.addPage()
    y = 20
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Recommended Next Step', 20, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  y = addMultilineText(brief.recommendedNextStep, 20, y, 170)

  // Footer
  const pageCount = doc.getNumberOfPages()
  doc.setFontSize(8)
  doc.setTextColor(150)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' },
    )
  }

  // Save PDF
  doc.save(`${filename}.pdf`)
}

'use client';

import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportViewerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  markdownContent: string;
}

// Basic markdown to HTML converter
function markdownToHtml(markdown: string): string {
    return markdown
        .replace(/^# (.*$)/gmi, '<h1 class="text-2xl font-bold mb-4 mt-6">$1</h1>')
        .replace(/^## (.*$)/gmi, '<h2 class="text-xl font-semibold mb-3 mt-5 border-b pb-2">$1</h2>')
        .replace(/^### (.*$)/gmi, '<h3 class="text-lg font-medium mb-2 mt-4">$1</h3>')
        .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*)\*/g, '<em>$1</em>')
        .replace(/^- (.*$)/gmi, '<li class="ml-4 list-disc">$1</li>')
        .replace(/(\r\n|\n){2,}/g, '<br/><br/>') // Handle paragraphs
        .replace(/\n/g, '<br/>'); // Handle line breaks
}


export default function ReportViewer({ isOpen, onOpenChange, markdownContent }: ReportViewerProps) {
  const reportContentRef = useRef<HTMLDivElement>(null);

  const handleExportToPdf = () => {
    const input = reportContentRef.current;
    if (input) {
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const imgHeight = canvasHeight / ratio;
            let height = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            height -= pdfHeight;
            while(height > 0) {
                position = height - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                height -= pdfHeight;
            }
            pdf.save('report.pdf');
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Generated Analysis Report</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full rounded-md border">
            <div ref={reportContentRef} className="p-6 prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(markdownContent) }} />
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button onClick={handleExportToPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

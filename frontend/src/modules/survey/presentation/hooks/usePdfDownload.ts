// src/modules/survey/presentation/hooks/usePdfDownload.ts
import { domToPng } from 'modern-screenshot';
import jsPDF from 'jspdf';
import type { RefObject } from 'react';

export function usePdfDownload(ref: RefObject<HTMLElement | null>, logoSrc?: string) {
  return async (filename = 'report.pdf') => {
    const el = ref.current;
    if (!el) return;

    let logoImg: HTMLImageElement | null = null;
    try {
      if (logoSrc) {
        logoImg = new Image();
        logoImg.src = logoSrc;
        logoImg.style.cssText = 'width:360px;display:block;margin:0 auto 16px';

        await new Promise<void>((res) => {
          if (logoImg!.complete) res();
          else {
            logoImg!.onload = () => res();
            logoImg!.onerror = () => res();
          }
        });
        el.insertBefore(logoImg, el.firstChild);
      }

      const dataUrl = await domToPng(el, { scale: 2 });
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((res) => { img.onload = () => res(); });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Scale the captured image to fill the full A4 width, then slice it
      // across as many A4 pages as its height needs.
      const targetWidth = pageWidth;
      const targetHeight = (img.height * pageWidth) / img.width;

      let position = 0;
      let remaining = targetHeight;
      pdf.addImage(dataUrl, 'PNG', 0, position, targetWidth, targetHeight, undefined, 'FAST');
      remaining -= pageHeight;
      while (remaining > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, targetWidth, targetHeight, undefined, 'FAST');
        remaining -= pageHeight;
      }

      pdf.save(filename);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      logoImg?.parentNode?.removeChild(logoImg);
    }
  };
}

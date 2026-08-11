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

      const dataUrl = await domToPng(el, { scale: 3 });
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((res) => { img.onload = () => res(); });

      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width, img.height],
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      pdf.save(filename);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      logoImg?.parentNode?.removeChild(logoImg);
    }
  };
}

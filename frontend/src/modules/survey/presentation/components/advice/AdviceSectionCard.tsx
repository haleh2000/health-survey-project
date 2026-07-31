// src/modules/survey/presentation/components/advice/AdviceSectionCard.tsx
import { Card } from "@ds/components/Card";
import { cn } from "@ds/lib/cn";
import type { ReactNode } from "react";

interface AdviceSectionCardProps {
  title: string;
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
  backgroundColor?: string;
}

export function AdviceSectionCard({
  title,
  imageSrc,
  imageAlt,
  children,
  backgroundColor = "bg-white",
}: AdviceSectionCardProps) {
  return (
    <Card className={cn("overflow-hidden p-0", backgroundColor)}>
      {/* هدر با عکس */}
      <div className="relative flex items-center justify-between border-b border-border bg-gradient-to-l from-cyan-50 to-teal-50 px-6 py-4">
        <h3 className="text-base font-bold text-ink">{title}</h3>
        <img src={imageSrc} alt={imageAlt} className="h-20 w-20 object-contain" />
      </div>

      {/* محتوا */}
      <div className="p-6">{children}</div>
    </Card>
  );
}

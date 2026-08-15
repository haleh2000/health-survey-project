// src/modules/survey/presentation/components/advice/shared/AdviceSectionCard.tsx
import type { ReactNode } from "react";
import { Card } from '@ds/components/Card';
import { cn } from "@ds/lib/cn";

interface AdviceSectionCardProps {
  title: string;
  imageSrc?: string;
  imageAlt?: string;
  children: ReactNode;
  backgroundColor?: string;
  borderTitle?: string;
}

export function AdviceSectionCard({
  imageSrc,
  children,
  backgroundColor = "bg-white",
  borderTitle,
}: AdviceSectionCardProps) {
  return (
    <Card className={cn("m-3 sm:m-6 overflow-hidden p-0 relative", backgroundColor)}
  style={imageSrc ? { backgroundImage: `url(${imageSrc})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
      {borderTitle && (
        <div className="absolute top-0 right-4 sm:right-15 -translate-y-1/2 bg-white px-3 text-lg sm:text-2xl">
          <span className="font-semibold text-day-primary">{borderTitle}</span>
        </div>
      )}
      <div className="p-2">{children}</div>
    </Card>
  );
}

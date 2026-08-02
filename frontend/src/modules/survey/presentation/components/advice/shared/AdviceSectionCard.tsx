import type { ReactNode } from "react";
import { Card } from '@ds/components/Card';
import { cn } from "@ds/lib/cn";


interface AdviceSectionCardProps {
  title: string;
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
  backgroundColor?: string;
  borderTitle?: string;
}

export function AdviceSectionCard({
  title,
  imageSrc,
  imageAlt,
  children,
  backgroundColor = "bg-white",
  borderTitle,
}: AdviceSectionCardProps) {
  return (
    <Card className={cn("m-6 overflow-hidden p-0", backgroundColor)}>
      {borderTitle && (
        <div className="absolute top-0 right-15 -translate-y-1/2 bg-white px-3 text-2xl">
          <span className="font-semibold text-day-primary">{borderTitle}</span>
        </div>
      )}

      <div className="p-6">{children}</div>
    </Card>
  );
}

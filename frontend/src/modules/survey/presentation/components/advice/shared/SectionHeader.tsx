// src/modules/survey/presentation/components/advice/shared/SectionHeader.tsx
interface SectionHeaderProps {
  emoji: string;
  title: string;
  titleColorClass?: string;
  description: string;
}

export function SectionHeader({ emoji, title, titleColorClass = "text-gray-800", description }: SectionHeaderProps) {
  return (
    <ul className="space-y-1 my-4 text-sm text-gray-700 ">
      <li className="flex items-center gap-1">
        <span className="text-2xl">{emoji}</span>
        <span className={`${titleColorClass} text-lg font-bold`}>{title}</span>
      </li>
      <li className="flex items-center gap-2">
        <span>{description}</span>
      </li>
    </ul>
  );
}

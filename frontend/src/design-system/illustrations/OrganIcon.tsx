import { ORGAN_ICON_COMPONENT } from './organ-icon-map';

interface OrganIconProps {
  organ: string;
  className?: string;
  size?: number;
  color?: string;
}

export function OrganIcon({ organ, className, size = 20, color }: OrganIconProps) {
  const IconComponent = ORGAN_ICON_COMPONENT[organ as keyof typeof ORGAN_ICON_COMPONENT];
  if (!IconComponent) return null;

  return (
    <IconComponent
      className={className}
      size={size}
      style={color ? { color } : undefined}
    />
  );
}

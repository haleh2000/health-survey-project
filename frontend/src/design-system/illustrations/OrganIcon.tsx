// src/design-system/illustrations/OrganIcon.tsx

import { ORGAN_ICON_COMPONENT } from './organ-icon-map';
import type { OrganKey } from '@survey/presentation/components/dashboard/organ-meta';

interface OrganIconProps {
  organ: OrganKey;
  className?: string;
  size?: number;
  color?: string;
}

export const OrganIcon = ({ organ, className, size = 24, color }: OrganIconProps) => {
  const IconComponent = ORGAN_ICON_COMPONENT[organ];
  if (!IconComponent) return null;

  return (
    <IconComponent
      className={className}
      size={size}
      style={color ? { color } : undefined}
    />
  );
};

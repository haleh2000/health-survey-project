import type { ComponentType, CSSProperties } from 'react';
import {
  HeartIcon,
  BrainIcon,
  LungsIcon,
  LiverIcon,
  StomachIcon,
  ColonIcon,
  PancreasIcon,
  MetabolicIcon,
} from '@survey/presentation/components/dashboard/organ-icons';
import type { OrganKey } from '@survey/presentation/components/dashboard/organ-meta';

export const ORGAN_ICON_COMPONENT: Record<OrganKey, ComponentType<{ className?: string; size?: number; style?: CSSProperties }>> = {
  cardiac:   HeartIcon,
  stroke:    BrainIcon,
  lung:      LungsIcon,
  liver:     LiverIcon,
  gastric:   StomachIcon,
  colon:     ColonIcon,
  pancreas:  PancreasIcon,
  metabolic: MetabolicIcon,
};



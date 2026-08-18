import type { ComponentType, CSSProperties } from 'react';
import {
  HeartOrgan,
  BrainOrgan,
  LungsOrgan,
  LiverOrgan,
  StomachOrgan,
  ColonOrgan,
  PancreasOrgan,
  MetabolicOrgan,
} from './AnatomicalOrgans';
import type { OrganKey } from '@survey/presentation/components/dashboard/organ-meta';

export const ANATOMICAL_ORGAN_COMPONENT: Record<OrganKey, ComponentType<{ className?: string; style?: CSSProperties }>> = {
  cardiac:   HeartOrgan,
  stroke:    BrainOrgan,
  lung:      LungsOrgan,
  liver:     LiverOrgan,
  gastric:   StomachOrgan,
  colon:     ColonOrgan,
  pancreas:  PancreasOrgan,
  metabolic: MetabolicOrgan,
};

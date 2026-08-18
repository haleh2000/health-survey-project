import { motion } from 'framer-motion';
import { ORGAN_POSITIONS } from '../config/organ-positions';
import { getRiskStyle, type RiskLevel } from '@ds/tokens/risk-colors';
import { ANATOMICAL_ORGAN_COMPONENT } from '@ds/illustrations/anatomical-organ-map';
import { BodySilhouette } from '@ds/illustrations/BodySilhouette';
import type { OrganKey } from '@survey/presentation/components/dashboard/organ-meta';
import { RiskTier } from '@survey/domain/entities/risk-assessment.entity';

interface BodyMapProps {
  organRisks?: Partial<Record<OrganKey, { tier: RiskTier }>>;
  onOrganClick?: (organKey: OrganKey) => void;
}

const TIER_TO_LEVEL: Record<RiskTier, RiskLevel> = {
  [RiskTier.Critical]: 'critical',
  [RiskTier.Elevated]: 'elevated',
  [RiskTier.Moderate]: 'moderate',
  [RiskTier.Low]: 'low',
};

function tierToRiskLevel(tier?: RiskTier): RiskLevel {
  return tier ? TIER_TO_LEVEL[tier] : 'low';
}

export function BodyMap({ organRisks, onOrganClick }: BodyMapProps) {
  const risks = organRisks ?? {};

  return (
    <div className="relative mx-auto w-full max-w-[280px] aspect-[2/3] select-none">
      <BodySilhouette className="absolute inset-0 w-full h-full text-slate-300 dark:text-slate-600" />

      {ORGAN_POSITIONS.map((organ, index) => {
        const tier = risks[organ.organKey]?.tier;
        const level = tierToRiskLevel(tier);
        const style = getRiskStyle(level);
        const OrganComponent = ANATOMICAL_ORGAN_COMPONENT[organ.organKey];

        if (!OrganComponent) return null;

        return (
          <motion.button
            key={organ.id}
            type="button"
            onClick={() => onOrganClick?.(organ.organKey)}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.3 + index * 0.08,
              type: 'spring',
              stiffness: 200,
              damping: 18,
            }}
            whileHover={{ scale: 1.12, zIndex: 10 }}
            whileTap={{ scale: 0.95 }}
            style={{
              top: organ.top,
              left: organ.left,
              width: organ.width,
              height: organ.height,
              transform: 'translate(-50%, -50%)',
            }}
            className={`absolute flex items-center justify-center rounded-xl
                        transition-shadow duration-300 cursor-pointer
                        ${level === 'critical' ? 'animate-pulse-slow' : ''}
                        ${style.glow}`}
            aria-label={organ.label}
          >
            <OrganComponent
              className={`w-full h-full ${style.icon} drop-shadow-sm`}
              style={{ filter: `drop-shadow(0 1px 3px ${style.hex}40)` }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}

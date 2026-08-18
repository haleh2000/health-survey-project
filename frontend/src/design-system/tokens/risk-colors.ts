export type RiskLevel = 'critical' | 'elevated' | 'moderate' | 'low';

interface RiskStyle {
  bg: string;
  ring: string;
  icon: string;
  glow: string;
  hex: string;
}

export const RISK_STYLES: Record<RiskLevel, RiskStyle> = {
  critical: {
    bg: 'bg-red-50',
    ring: 'ring-red-500',
    icon: 'text-red-600',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]',
    hex: '#ef4444',
  },
  elevated: {
    bg: 'bg-orange-50',
    ring: 'ring-orange-500',
    icon: 'text-orange-600',
    glow: 'shadow-[0_0_14px_rgba(249,115,22,0.4)]',
    hex: '#f97316',
  },
  moderate: {
    bg: 'bg-yellow-50',
    ring: 'ring-yellow-500',
    icon: 'text-yellow-600',
    glow: '',
    hex: '#eab308',
  },
  low: {
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-500',
    icon: 'text-emerald-600',
    glow: '',
    hex: '#10b981',
  },
};

export function getRiskStyle(risk: RiskLevel): RiskStyle {
  return RISK_STYLES[risk] ?? RISK_STYLES.low;
}

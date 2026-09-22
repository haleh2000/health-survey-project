/**
 * Height/weight and the BMI derived from them.
 *
 * The backend computes BMI internally for scoring but does not return it, so
 * this mirrors the same formula in order to show the user what their answers
 * imply. Category cut-offs follow WHO classification with three levels:
 *   - Underweight: < 18.5
 *   - Normal:      18.5 – 24.9
 *   - Overweight:  ≥ 25  (merged overweight + obese)
 */

export const BmiCategory = {
  Underweight: "underweight",
  Normal: "normal",
  Overweight: "overweight",
} as const;

export type BmiCategory = (typeof BmiCategory)[keyof typeof BmiCategory];

export const BMI_CATEGORY_LABELS: Record<BmiCategory, string> = {
  underweight: "کمبود وزن",
  normal: "نرمال",
  overweight: "اضافه وزن / چاق",
};

export class BodyMetrics {
  readonly heightCm: number;
  readonly weightKg: number;
  readonly bmi: number;

  private constructor(heightCm: number, weightKg: number, bmi: number) {
    this.heightCm = heightCm;
    this.weightKg = weightKg;
    this.bmi = bmi;
  }

  static create(heightCm: number, weightKg: number): BodyMetrics | null {
    if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg)) return null;
    if (heightCm <= 0 || weightKg <= 0) return null;

    const meters = heightCm / 100;
    return new BodyMetrics(heightCm, weightKg, weightKg / (meters * meters));
  }

  get category(): BmiCategory {
    if (this.bmi < 18.5) return BmiCategory.Underweight;
    if (this.bmi < 25) return BmiCategory.Normal;
    return BmiCategory.Overweight;
  }

  get categoryLabel(): string {
    return BMI_CATEGORY_LABELS[this.category];
  }

  /** One decimal place is the convention for reporting BMI. */
  get rounded(): number {
    return Math.round(this.bmi * 10) / 10;
  }
}

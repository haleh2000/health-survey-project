/**
 * Height/weight and the BMI derived from them.
 *
 * The backend computes BMI internally for scoring but does not return it, so
 * this mirrors the same formula in order to show the user what their answers
 * imply. Category cut-offs follow the WHO classification, and obesity begins
 * at 30 — the exact threshold `backend/processing.py` uses for `obesity_bin`.
 */

export const BmiCategory = {
  Underweight: "underweight",
  Normal: "normal",
  Overweight: "overweight",
  Obese: "obese",
} as const;

export type BmiCategory = (typeof BmiCategory)[keyof typeof BmiCategory];

export const BMI_CATEGORY_LABELS: Record<BmiCategory, string> = {
  underweight: "کمبود وزن",
  normal: "وزن مناسب",
  overweight: "اضافه وزن",
  obese: "چاقی",
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
    if (this.bmi < 30) return BmiCategory.Overweight;
    return BmiCategory.Obese;
  }

  get categoryLabel(): string {
    return BMI_CATEGORY_LABELS[this.category];
  }

  /** One decimal place is the convention for reporting BMI. */
  get rounded(): number {
    return Math.round(this.bmi * 10) / 10;
  }
}

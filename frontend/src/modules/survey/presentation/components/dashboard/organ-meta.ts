import type { OrganRisks, RiskTier } from '@survey/domain/entities/risk-assessment.entity';
import { RiskTier as RiskTierEnum } from '@survey/domain/entities/risk-assessment.entity';

export type OrganKey = keyof OrganRisks;

export interface OrganMeta {
  readonly key: OrganKey;
  readonly label: string;
  readonly maxScore: number;
  readonly driverLabel: string;
}

export const ORGAN_META: OrganMeta[] = [
  { key: 'cardiac',   label: 'قلب و عروق',   maxScore: 7, driverLabel: 'فشار خون · کلسترول' },
  { key: 'stroke',    label: 'مغز و اعصاب',  maxScore: 7, driverLabel: 'فشار خون · استرس'   },
  { key: 'lung',      label: 'ریه‌ها',        maxScore: 9, driverLabel: 'دخانیات · آلودگی'   },
  { key: 'liver',     label: 'کبد',           maxScore: 10, driverLabel: 'الکل · چربی کبد'    },
  { key: 'gastric',   label: 'معده و گوارش',  maxScore: 10, driverLabel: 'رژیم · هلیکوباکتر'  },
  { key: 'colon',     label: 'روده بزرگ',     maxScore: 9, driverLabel: 'فیبر · سابقه خانوادگی' },
  { key: 'pancreas',  label: 'پانکراس',       maxScore: 10, driverLabel: 'دخانیات · دیابت'    },
  { key: 'metabolic', label: 'متابولیک',      maxScore: 5, driverLabel: 'قند · چربی خون'     },
];

export const organPercent = (risks: OrganRisks, meta: OrganMeta): number =>
  Math.round(Math.min(risks[meta.key] / meta.maxScore, 1) * 100);

export const scoreToTier = (percent: number): RiskTier => {
  if (percent >= 67) return RiskTierEnum.Critical;
  if (percent >= 34) return RiskTierEnum.Elevated;
  if (percent >= 12) return RiskTierEnum.Moderate;
  return RiskTierEnum.Low;
};

export interface SeverityStyle {
  readonly label: string;
  readonly textClass: string;
  readonly chipClass: string;
  readonly hex: string;
}

export const severityOf = (percent: number): SeverityStyle => {
  if (percent >= 67) return { label: 'نیاز به توجه فوری', textClass: 'text-risk-critical', chipClass: 'bg-red-500/10 text-risk-critical',    hex: '#dc2626' };
  if (percent >= 34) return { label: 'نیاز به پیگیری',    textClass: 'text-risk-elevated', chipClass: 'bg-orange-500/10 text-risk-elevated', hex: '#ea580c' };
  if (percent >= 12) return { label: 'قابل بهبود',        textClass: 'text-risk-moderate', chipClass: 'bg-amber-500/10 text-risk-moderate',  hex: '#ca8a04' };
  return               { label: 'مطلوب',              textClass: 'text-risk-low',      chipClass: 'bg-teal-500/10 text-risk-low',       hex: '#0d9488' };
};

export interface OrganContent {
  readonly description: string;
  readonly tips: readonly string[];
  readonly warningSign: string;
}

export const ORGAN_CONTENT: Record<OrganKey, OrganContent> = {
  cardiac: {
    description: 'فشار خون بالا، کلسترول زیاد و سبک زندگی کم‌تحرک از عوامل اصلی بیماری‌های قلبی هستند.',
    tips: [
      'حداقل ۱۵۰ دقیقه فعالیت هوازی در هفته داشته باشید',
      'مصرف نمک را به زیر ۵ گرم در روز کاهش دهید',
      'چربی‌های اشباع را با روغن‌های گیاهی جایگزین کنید',
      'فشار خون خود را هر ۶ ماه یک‌بار اندازه بگیرید',
    ],
    warningSign: 'درد یا فشار در قفسه سینه، تنگی نفس ناگهانی',
  },
  stroke: {
    description: 'فشار خون بالا، دیابت و کم‌تحرکی مهم‌ترین عوامل ریسک سکته مغزی هستند.',
    tips: [
      'فشار خون بالای ۱۴۰/۹۰ را جدی بگیرید و کنترل کنید',
      '۷-۹ ساعت خواب باکیفیت داشته باشید',
      'مدیریت استرس با مدیتیشن یا تمرین تنفسی',
      'فعالیت بدنی منظم و ترک سیگار را در اولویت قرار دهید',
    ],
    warningSign: 'ضعف یا بی‌حسی ناگهانی یک‌طرفه بدن، گفتار نامفهوم، سردرد شدید ناگهانی',
  },
  lung: {
    description: 'ریه‌ها مسئول تبادل اکسیژن و دی‌اکسیدکربن هستند. دخانیات بزرگ‌ترین عامل آسیب ریوی است.',
    tips: [
      'سیگار نکشید — ترک سیگار در هر سنی مفید است',
      'در مکان‌های آلوده از ماسک N95 استفاده کنید',
      'تهویه مناسب خانه را تأمین کنید',
      'واکسن آنفولانزا و پنوموکوک را دریافت کنید',
    ],
    warningSign: 'سرفه مزمن بیش از ۳ هفته، خلط خونی',
  },
  liver: {
    description: 'کبد بیش از ۵۰۰ عملکرد حیاتی دارد؛ از سم‌زدایی تا ساخت پروتئین. چربی کبد اغلب بدون علامت پیشرفت می‌کند.',
    tips: [
      'مصرف الکل را قطع یا به حداقل برسانید',
      'قند و کربوهیدرات تصفیه‌شده را کم کنید',
      'وزن ایده‌آل خود را حفظ کنید',
      'آزمایش عملکرد کبد را سالانه انجام دهید',
    ],
    warningSign: 'زردی پوست یا سفیدی چشم، درد زیر دنده راست',
  },
  gastric: {
    description: 'دستگاه گوارش نقش محوری در جذب مواد مغذی دارد. استرس، رژیم نامناسب و هلیکوباکتر پیلوری عوامل اصلی آسیب هستند.',
    tips: [
      'وعده‌های غذایی منظم و بدون عجله بخورید',
      'مصرف غذاهای فرآوری‌شده و پرنمک را کاهش دهید',
      'فیبر کافی از میوه و سبزیجات دریافت کنید',
      'آنتی‌بیوتیک‌ها را فقط با تجویز پزشک بخورید',
    ],
    warningSign: 'درد مداوم شکم، خون در مدفوع، کاهش وزن بی‌دلیل',
  },
  colon: {
    description: 'تغذیه کم‌فیبر، کم‌تحرکی و سابقه خانوادگی از عوامل اصلی ریسک سرطان روده بزرگ هستند.',
    tips: [
      'مصرف فیبر (غلات کامل، سبزیجات، حبوبات) را افزایش دهید',
      'مصرف گوشت قرمز و فرآوری‌شده را محدود کنید',
      'فعالیت بدنی منظم داشته باشید',
      'غربالگری کولونوسکوپی را از سن توصیه‌شده شروع کنید',
    ],
    warningSign: 'خون در مدفوع، تغییر عادت روده، کاهش وزن بی‌دلیل',
  },
  pancreas: {
    description: 'دخانیات، مصرف الکل و اضافه‌وزن از عوامل اصلی ریسک آسیب پانکراس هستند.',
    tips: [
      'سیگار و الکل را ترک کنید',
      'وزن سالم و دور کمر مناسب را حفظ کنید',
      'مصرف چربی‌های اشباع را کاهش دهید',
      'قند خون را به‌طور منظم چک کنید',
    ],
    warningSign: 'درد شدید بالای شکم که به پشت می‌زند، زردی پوست',
  },
  metabolic: {
    description: 'ترکیبی از قند خون بالا، فشار خون بالا، چربی خون نامناسب و چاقی شکمی، ریسک دیابت و بیماری قلبی را افزایش می‌دهد.',
    tips: [
      'دور کمر و وزن خود را در محدوده سالم نگه دارید',
      'مصرف قند و کربوهیدرات تصفیه‌شده را کاهش دهید',
      'فعالیت بدنی منظم داشته باشید',
      'قند خون، چربی خون و فشار خون را سالانه چک کنید',
    ],
    warningSign: 'تشنگی و ادرار مکرر غیرعادی، خستگی مداوم',
  },
};

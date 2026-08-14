// src/modules/survey/domain/causal-alerts.ts
import type { AssessmentFlags } from './entities/risk-assessment.entity';

export type CausalSeverity = 'بالا' | 'متوسط' | 'کم';

export interface CausalFactor {
  key: keyof AssessmentFlags;
  label: string;
  severity: CausalSeverity;
}

export interface OrganCausalMap {
  organLabel: string;
  factors: CausalFactor[];
  description?: string;
  recommendation?: string;
}

export const ORGAN_CAUSAL_FACTORS: Record<string, OrganCausalMap> = {
  lung: {
    organLabel: 'ریه',
    description:
      'ریه‌ها در برابر دود سیگار، قلیان و آلاینده‌های محیطی بسیار آسیب‌پذیرند و مواجهه مداوم می‌تواند به کاهش ظرفیت تنفسی و افزایش خطر بیماری‌های مزمن ریوی منجر شود.',
    recommendation:
      'ترک کامل سیگار و قلیان، کاهش مواجهه با آلودگی هوا و دود محیطی، و انجام معاینات دوره‌ای تنفسی توصیه می‌شود.',
    factors: [
      { key: 'heavy_smoker',         label: 'سیگار سنگین',          severity: 'بالا'   },
      { key: 'hookah_ecig',          label: 'قلیان / سیگار الکترونیک', severity: 'بالا' },
      { key: 'occupational_hazard',  label: 'مواجهه شغلی',           severity: 'بالا'   },
      { key: 'air_pollution',        label: 'آلودگی هوا',            severity: 'متوسط'  },
      { key: 'family_lung_cancer',   label: 'سابقه خانوادگی سرطان ریه', severity: 'بالا' },
      { key: 'low_physical_activity',label: 'کم‌تحرکی',              severity: 'کم'     },
    ],
  },
  gastric: {
    organLabel: 'معده',
    description:
      'الگوی تغذیه نامنظم، مصرف زیاد غذاهای فرآوری‌شده، شور و دودی، و استرس مزمن می‌توانند مخاط معده را تحریک کرده و زمینه‌ساز التهاب و آسیب‌های گوارشی شوند.',
    recommendation:
      'اصلاح رژیم غذایی با کاهش نمک و غذاهای فرآوری‌شده، وعده‌های منظم غذایی، و مدیریت استرس برای حفظ سلامت معده توصیه می‌شود.',
    factors: [
      { key: 'hpylori_active',       label: 'هلیکوباکتر پیلوری',    severity: 'بالا'   },
      { key: 'heavy_smoker',         label: 'سیگار',                 severity: 'بالا'   },
      { key: 'salty_food',           label: 'رژیم پرنمک',            severity: 'بالا'   },
      { key: 'hot_drink',            label: 'نوشیدنی داغ',           severity: 'متوسط'  },
      { key: 'smoked_food',          label: 'غذای دودی',             severity: 'متوسط'  },
      { key: 'heavy_alcohol',        label: 'مصرف الکل',             severity: 'متوسط'  },
      { key: 'family_gastric_cancer',label: 'سابقه خانوادگی سرطان معده', severity: 'بالا' },
    ],
  },
  colon: {
    organLabel: 'روده بزرگ',
    description:
      'کمبود فیبر در رژیم غذایی، کم‌تحرکی، مصرف بالای گوشت قرمز و فرآوری‌شده از عوامل مؤثر در افزایش خطر بیماری‌های روده بزرگ هستند.',
    recommendation:
      'افزایش مصرف فیبر (سبزیجات، میوه و غلات کامل)، فعالیت بدنی منظم و کاهش مصرف گوشت فرآوری‌شده توصیه می‌شود.',
    factors: [
      { key: 'processed_meat_high',  label: 'گوشت فراوری‌شده',       severity: 'بالا'   },
      { key: 'low_fiber',            label: 'رژیم کم‌فیبر',          severity: 'متوسط'  },
      { key: 'obesity',              label: 'چاقی',                  severity: 'متوسط'  },
      { key: 'low_physical_activity',label: 'کم‌تحرکی',              severity: 'متوسط'  },
      { key: 'junk_food',            label: 'غذای ناسالم',            severity: 'کم'     },
      { key: 'family_colon_cancer',  label: 'سابقه خانوادگی سرطان روده', severity: 'بالا' },
    ],
  },
  pancreas: {
    organLabel: 'پانکراس',
    description:
      'مصرف الکل، رژیم غذایی پرچرب و شیرین، و اضافه‌وزن می‌توانند عملکرد پانکراس را مختل کرده و خطر ابتلا به اختلالات آن را افزایش دهند.',
    recommendation:
      'پرهیز از مصرف الکل، کنترل وزن و کاهش مصرف چربی و قند در رژیم غذایی برای حفظ سلامت پانکراس توصیه می‌شود.',
    factors: [
      { key: 'heavy_smoker',         label: 'سیگار',                 severity: 'بالا'   },
      { key: 'chronic_pancreatitis', label: 'پانکراتیت مزمن',        severity: 'بالا'   },
      { key: 'diabetes',             label: 'دیابت',                 severity: 'بالا'   },
      { key: 'obesity',              label: 'چاقی',                  severity: 'متوسط'  },
      { key: 'heavy_alcohol',        label: 'مصرف الکل',             severity: 'متوسط'  },
      { key: 'family_pancreas_cancer',label: 'سابقه خانوادگی سرطان پانکراس', severity: 'بالا' },
    ],
  },
  stroke: {
    organLabel: 'سکته مغزی',
    description:
      'فشار خون بالا، کلسترول بالا، دیابت کنترل‌نشده و سبک زندگی کم‌تحرک از مهم‌ترین عوامل افزایش‌دهنده خطر سکته مغزی هستند.',
    recommendation:
      'کنترل منظم فشار خون و قند خون، اصلاح رژیم غذایی، و افزایش فعالیت بدنی برای کاهش خطر سکته مغزی ضروری است.',
    factors: [
      { key: 'hypertension',         label: 'فشار خون بالا',         severity: 'بالا'   },
      { key: 'heart_disease',        label: 'بیماری قلبی',           severity: 'بالا'   },
      { key: 'brain_stroke_history', label: 'سابقه سکته مغزی',       severity: 'بالا'   },
      { key: 'diabetes',             label: 'دیابت',                 severity: 'بالا'   },
      { key: 'heavy_smoker',         label: 'سیگار',                 severity: 'بالا'   },
      { key: 'family_stroke',        label: 'سابقه خانوادگی سکته',   severity: 'بالا'   },
      { key: 'obesity',              label: 'چاقی',                  severity: 'متوسط'  },
      { key: 'low_physical_activity',label: 'کم‌تحرکی',              severity: 'متوسط'  },
      { key: 'salty_food',           label: 'رژیم پرنمک',            severity: 'کم'     },
    ],
  },
  cardiac: {
    organLabel: 'قلب',
    description:
      'کلسترول بالا، فشار خون، سیگار کشیدن و کم‌تحرکی از عوامل اصلی افزایش خطر بیماری‌های قلبی-عروقی محسوب می‌شوند.',
    recommendation:
      'ترک سیگار، کنترل چربی و فشار خون، و انجام فعالیت هوازی منظم برای سلامت قلب توصیه می‌شود.',
    factors: [
      { key: 'family_cardiac',       label: 'سابقه خانوادگی قلبی',   severity: 'بالا'   },
      { key: 'hypertension',         label: 'فشار خون بالا',         severity: 'بالا'   },
      { key: 'heavy_smoker',         label: 'سیگار',                 severity: 'بالا'   },
      { key: 'diabetes',             label: 'دیابت',                 severity: 'بالا'   },
      { key: 'heart_attack_history', label: 'سابقه حمله قلبی',       severity: 'بالا'   },
      { key: 'obesity',              label: 'چاقی',                  severity: 'متوسط'  },
      { key: 'low_physical_activity',label: 'کم‌تحرکی',              severity: 'متوسط'  },
      { key: 'junk_food',            label: 'تغذیه ناسالم',           severity: 'متوسط'  },
      { key: 'salty_food',           label: 'رژیم پرنمک',            severity: 'کم'     },
    ],
  },
  metabolic: {
    organLabel: 'متابولیک',
    description:
      'اضافه‌وزن، مصرف بالای قند و کربوهیدرات ساده، و کم‌تحرکی می‌توانند منجر به اختلالات متابولیک نظیر مقاومت به انسولین شوند.',
    recommendation:
      'کاهش وزن در صورت نیاز، محدود کردن قند و کربوهیدرات ساده، و افزایش فعالیت بدنی برای بهبود سلامت متابولیک توصیه می‌شود.',
    factors: [
      { key: 'obesity',              label: 'چاقی',                  severity: 'بالا'   },
      { key: 'diabetes',             label: 'دیابت',                 severity: 'بالا'   },
      { key: 'junk_food',            label: 'تغذیه ناسالم',           severity: 'بالا'   },
      { key: 'low_physical_activity',label: 'کم‌تحرکی',              severity: 'بالا'   },
      { key: 'low_fiber',            label: 'رژیم کم‌فیبر',          severity: 'متوسط'  },
      { key: 'psychosocial',         label: 'استرس روانی-اجتماعی',   severity: 'متوسط'  },
    ],
  },
  liver: {
    organLabel: 'کبد',
    description:
      'مصرف الکل، رژیم غذایی پرچرب، اضافه‌وزن و مصرف بی‌رویه برخی داروها می‌توانند به کبد آسیب رسانده و خطر کبد چرب یا سایر اختلالات کبدی را افزایش دهند.',
    recommendation:
      'پرهیز از مصرف الکل، کنترل وزن، اصلاح رژیم غذایی و مصرف داروها تنها با تجویز پزشک برای حفظ سلامت کبد توصیه می‌شود.',
    factors: [
      { key: 'heavy_alcohol',        label: 'مصرف الکل',             severity: 'بالا'   },
      { key: 'obesity',              label: 'چاقی',                  severity: 'بالا'   },
      { key: 'diabetes',             label: 'دیابت',                 severity: 'متوسط'  },
      { key: 'junk_food',            label: 'تغذیه ناسالم',           severity: 'متوسط'  },
      { key: 'infectious_disease',   label: 'بیماری عفونی',          severity: 'بالا'   },
      { key: 'family_liver_cancer',  label: 'سابقه خانوادگی سرطان کبد', severity: 'متوسط' },
    ],
  },
};

export function getActiveCausalFactors(
  organKey: string,
  flags: AssessmentFlags,
): CausalFactor[] {
  const map = ORGAN_CAUSAL_FACTORS[organKey];
  if (!map) return [];
  return map.factors.filter((factor) => flags[factor.key] === true);
}

export function getAllActiveCausalFactors(
  flags: AssessmentFlags,
): Record<string, CausalFactor[]> {
  return Object.fromEntries(
    Object.keys(ORGAN_CAUSAL_FACTORS).map((organKey) => [
      organKey,
      getActiveCausalFactors(organKey, flags),
    ]),
  );
}

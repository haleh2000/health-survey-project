// src/modules/survey/presentation/components/dashboard/recommendationStories.ts

import {
  Activity, Apple, Bed, BellOff, Bike, BookOpen, Brain, Carrot, Clock, Coffee,
  CupSoda, Droplets, Dumbbell, Egg, Fish, Flame, Footprints, HandHeart,
  Headphones, HeartPulse, Milk, Moon, Mountain, NotebookPen, Nut,
  PersonStanding, Salad, Scale, Smartphone, Smile, Soup, Sprout,
  StretchHorizontal, Sun, Sunrise, Timer, TreePine, TrendingUp, Users,
  Utensils, Waves, Wheat, Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { pickBySeed } from "@core/random/seeded-pick";

import exerciseImg from "@assets/exercise.png";
import nutritionImg from "@assets/nutrition.png";
import peaceImg from "@assets/peace.png";

export interface StorySlide {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly icon: LucideIcon;
  /** اگر خالی بماند، از cover گروه پر می‌شود. */
  readonly image?: string;
}

/** یک «سری» کامل از نکات برای یک گروه. */
export interface StoryVariant {
  readonly id: string;
  readonly slides: readonly StorySlide[];
}

export interface StoryGroup {
  readonly key: string;
  readonly label: string;
  readonly cover: string;
  readonly icon: LucideIcon;
  readonly variants: readonly StoryVariant[];
}

/** چیزی که به UI می‌رسد: یک سری انتخاب‌شده با تصاویر قطعی. */
export interface ResolvedStorySlide extends StorySlide {
  readonly image: string;
}

export interface ResolvedStoryGroup {
  readonly key: string;
  readonly label: string;
  readonly cover: string;
  readonly icon: LucideIcon;
  readonly variantId: string;
  readonly slides: readonly ResolvedStorySlide[];
}

export const STORY_GROUPS: readonly StoryGroup[] = [
  {
    key: "nutrition",
    label: "تغذیه",
    cover: nutritionImg,
    icon: Salad,
    variants: [
      {
        id: "n-plate",
        slides: [
          { id: "n1", title: "نیم‌بشقاب سبزیجات", body: "در هر وعده اصلی، نصف بشقاب را با سبزیجات تازه یا پخته پر کنید. حجم غذا حفظ می‌شود و کالری پایین می‌آید.", icon: Carrot },
          { id: "n2", title: "روزی ۶ تا ۸ لیوان آب", body: "بخش زیادی از احساس خستگی بعدازظهر، کم‌آبی ساده است. یک بطری آب همراهتان باشد.", icon: Droplets },
          { id: "n3", title: "غلات کامل جای آرد سفید", body: "نان سنگک، جو و برنج قهوه‌ای قند خون را آرام‌تر بالا می‌برند و سیری طولانی‌تری می‌دهند.", icon: Wheat },
          { id: "n4", title: "هفته‌ای دو بار ماهی", body: "امگا۳ ماهی برای قلب و عروق مفید است. اگر ماهی دوست ندارید، گردو و تخم کتان جایگزین خوبی‌اند.", icon: Fish },
          { id: "n5", title: "نوشیدنی شیرین را حذف کنید", body: "یک نوشابه حدود ۹ حبه قند دارد. جایگزین ساده: آب، دوغ کم‌نمک یا چای بدون شکر.", icon: CupSoda },
        ],
      },
      {
        id: "n-portion",
        slides: [
          { id: "n6", title: "نمک پنهان را بشناسید", body: "بیشتر نمک روزانه از سوسیس، کنسرو و تنقلات می‌آید، نه نمک‌پاش سر سفره. برچسب سدیم را نگاه کنید.", icon: Soup },
          { id: "n7", title: "پروتئین در صبحانه", body: "تخم‌مرغ، پنیر کم‌نمک یا حبوبات در وعده اول، ولع میان‌وعده تا ظهر را کم می‌کند.", icon: Egg },
          { id: "n8", title: "میان‌وعده مغزها", body: "یک مشت گردو یا بادام بدون نمک، جایگزین چیپس و بیسکویت. چربی مفید با سیری واقعی.", icon: Nut },
          { id: "n9", title: "بشقاب کوچک‌تر", body: "همان غذا در بشقاب کوچک‌تر، حدود ۲۰٪ کمتر مصرف می‌شود بدون اینکه احساس محدودیت کنید.", icon: Utensils },
          { id: "n10", title: "گوشت فرآوری‌شده کمتر", body: "سوسیس و کالباس با ریسک سرطان گوارش مرتبط‌اند. هفته‌ای بیش از یک بار توصیه نمی‌شود.", icon: Scale },
        ],
      },
      {
        id: "n-habit",
        slides: [
          { id: "n11", title: "میوه کامل جای آبمیوه", body: "آبمیوه فیبر ندارد و قند آزادش سریع جذب می‌شود. میوه کامل هم سیرکننده‌تر است هم آرام‌تر.", icon: Apple },
          { id: "n12", title: "سبزی خام پیش از غذا", body: "شروع وعده با سالاد ساده، حجم غذای اصلی را طبیعی کم می‌کند.", icon: Sprout },
          { id: "n13", title: "نوشیدنی داغ را کمی صبر کنید", body: "چای و قهوه بسیار داغ به مخاط مری آسیب می‌زند. چند دقیقه صبر، ریسک را پایین می‌آورد.", icon: Coffee },
          { id: "n14", title: "لبنیات کم‌چرب روزانه", body: "دو سهم شیر، ماست یا کشک کم‌نمک، کلسیم مورد نیاز استخوان را تأمین می‌کند.", icon: Milk },
          { id: "n15", title: "برچسب را بخوانید", body: "قند، نمک و چربی ترانس معمولاً در سه ردیف اول جدول ارزش غذایی پیدا می‌شوند.", icon: BookOpen },
        ],
      },
    ],
  },
  {
    key: "exercise",
    label: "ورزش",
    cover: exerciseImg,
    icon: Dumbbell,
    variants: [
      {
        id: "e-base",
        slides: [
          { id: "e1", title: "هفته‌ای ۱۵۰ دقیقه", body: "پنج روز، هر روز ۳۰ دقیقه پیاده‌روی تند. همین مقدار خطر بیماری قلبی را محسوس کم می‌کند.", icon: Footprints },
          { id: "e2", title: "دو جلسه قدرتی", body: "تمرین با وزن بدن یا دمبل سبک، توده عضلانی و تراکم استخوان را حفظ می‌کند.", icon: Dumbbell },
          { id: "e3", title: "هر ۴۵ دقیقه بلند شوید", body: "نشستن طولانی مستقل از ورزش ریسک دارد. سه دقیقه راه رفتن یا کشش کافی است.", icon: Timer },
          { id: "e4", title: "ضربان هدف را بشناسید", body: "در شدت متوسط باید بتوانید حرف بزنید ولی نه آواز بخوانید. همین معیار ساده کافی است.", icon: HeartPulse },
          { id: "e5", title: "ورزشی که ادامه‌پذیر باشد", body: "دوچرخه، شنا یا کوهِ آخر هفته؛ بهترین برنامه همان است که سه ماه بعد هم انجامش می‌دهید.", icon: Bike },
        ],
      },
      {
        id: "e-daily",
        slides: [
          { id: "e6", title: "روزی ۷ تا ۱۰ هزار قدم", body: "لازم نیست یک‌جا باشد. سه پیاده‌روی ۱۰ دقیقه‌ای همان اثر را دارد.", icon: Footprints },
          { id: "e7", title: "پله جای آسانسور", body: "بالا رفتن از پله، تمرین قلبی-عروقی رایگان در وسط روز کاری است.", icon: TrendingUp },
          { id: "e8", title: "کشش صبحگاهی", body: "پنج دقیقه کشش گردن، کمر و پشت پا، درد ناشی از میزنشینی را کم می‌کند.", icon: StretchHorizontal },
          { id: "e9", title: "شنا برای مفاصل", body: "اگر زانو یا کمر اجازه نمی‌دهد، آب وزن بدن را می‌گیرد و تمرین بی‌فشار می‌شود.", icon: Waves },
          { id: "e10", title: "هفته‌ای یک وزن‌کشی", body: "یک روز ثابت، صبح، ناشتا. روند مهم است نه نوسان روزانه.", icon: Scale },
        ],
      },
      {
        id: "e-progress",
        slides: [
          { id: "e11", title: "۵ دقیقه گرم کردن", body: "شروع آرام، احتمال آسیب عضلانی را به‌شکل معناداری کم می‌کند.", icon: Flame },
          { id: "e12", title: "تمرین تعادل", body: "ایستادن روی یک پا هنگام مسواک زدن؛ ساده، ولی برای پیشگیری از زمین خوردن مؤثر.", icon: PersonStanding },
          { id: "e13", title: "ورزش را وارد مسیر کنید", body: "بخشی از مسیر رفت‌وآمد را پیاده یا با دوچرخه بروید تا به وقت اضافه نیاز نداشته باشید.", icon: Activity },
          { id: "e14", title: "کوهِ آخر هفته", body: "یک برنامه بیرون از خانه در هفته، هم تمرین هوازی است هم برای خلق‌وخو مفید.", icon: Mountain },
          { id: "e15", title: "یک روز ریکاوری", body: "عضله در استراحت ساخته می‌شود. بدون روز سبک، خستگی جمع می‌شود و انگیزه می‌ریزد.", icon: Bed },
        ],
      },
    ],
  },
  {
    key: "peace",
    label: "آرامش ذهن",
    cover: peaceImg,
    icon: Smile,
    variants: [
      {
        id: "p-base",
        slides: [
          { id: "p1", title: "۷ تا ۸ ساعت خواب", body: "ساعت خواب و بیداری ثابت، مهم‌تر از طول خواب است. آخر هفته‌ها هم زیاد جابه‌جا نکنید.", icon: Moon },
          { id: "p2", title: "تنفس ۴-۷-۸", body: "۴ ثانیه دم، ۷ ثانیه نگه‌داشتن، ۸ ثانیه بازدم. چهار بار تکرار، سیستم عصبی را آرام می‌کند.", icon: Wind },
          { id: "p3", title: "یک ساعت بی‌نمایشگر", body: "نور آبی و اسکرول شبانه، به‌خواب‌رفتن را عقب می‌اندازد. گوشی را بیرون از اتاق بگذارید.", icon: Smartphone },
          { id: "p4", title: "ارتباط انسانی", body: "هفته‌ای یک گفت‌وگوی واقعی با دوست یا خانواده، به اندازه ورزش روی خلق‌وخو اثر دارد.", icon: Users },
          { id: "p5", title: "نور صبحگاهی", body: "۱۰ دقیقه نور طبیعی در ساعت اول بیداری، ساعت بدن را تنظیم می‌کند.", icon: Sun },
        ],
      },
      {
        id: "p-sleep",
        slides: [
          { id: "p6", title: "اتاق تاریک و خنک", body: "دمای حدود ۱۸ تا ۲۰ درجه و تاریکی کامل، عمق خواب را بیشتر می‌کند.", icon: Bed },
          { id: "p7", title: "کافئین بعد از عصر نه", body: "نیمه‌عمر کافئین حدود ۵ ساعت است. قهوه ساعت ۵ عصر، خواب ۱۱ شب را به‌هم می‌زند.", icon: Coffee },
          { id: "p8", title: "سه خط قبل از خواب", body: "نوشتن سه چیز خوب امروز، چرخه فکرهای تکراری شبانه را می‌شکند.", icon: NotebookPen },
          { id: "p9", title: "نوتیفیکیشن‌ها را کم کنید", body: "هر قطع تمرکز، چند دقیقه برای بازگشت هزینه دارد. فقط تماس‌ها را باز بگذارید.", icon: BellOff },
          { id: "p10", title: "پیاده‌روی در طبیعت", body: "۲۰ دقیقه در فضای سبز، سطح کورتیزول را قابل‌اندازه‌گیری پایین می‌آورد.", icon: TreePine },
        ],
      },
      {
        id: "p-mind",
        slides: [
          { id: "p11", title: "۱۰ دقیقه تمرکز بر تنفس", body: "لازم نیست ذهن خالی شود. هر بار که پرت شد، آرام برگردید؛ همین تمرین است.", icon: Brain },
          { id: "p12", title: "صدای آرام", body: "موسیقی بی‌کلام یا صدای محیط، در کارهای پرتمرکز جای هیاهو را می‌گیرد.", icon: Headphones },
          { id: "p13", title: "طلوع را از دست ندهید", body: "دیدن نور اول صبح، کیفیت خواب همان شب را بهتر می‌کند.", icon: Sunrise },
          { id: "p14", title: "به یک نفر کمک کنید", body: "کار کوچک برای دیگری، یکی از مؤثرترین راه‌های بالا بردن حس رضایت است.", icon: HandHeart },
          { id: "p15", title: "مرز کار و زندگی", body: "یک ساعت پایان مشخص برای کار بگذارید و بعد از آن ایمیل را باز نکنید.", icon: Clock },
        ],
      },
    ],
  },
];

/** یک سری را بر اساس seed انتخاب می‌کند؛ برای یک seed ثابت، نتیجه همیشه یکی است. */
export const resolveStoryGroup = (
  group: StoryGroup,
  seed: string,
): ResolvedStoryGroup | null => {
  const variant = pickBySeed(group.variants, `${seed}:${group.key}`);
  if (!variant) return null;

  return {
    key: group.key,
    label: group.label,
    cover: group.cover,
    icon: group.icon,
    variantId: variant.id,
    slides: variant.slides.map((slide) => ({
      ...slide,
      image: slide.image ?? group.cover,
    })),
  };
};

export const resolveStoryGroups = (seed: string): readonly ResolvedStoryGroup[] =>
  STORY_GROUPS.map((group) => resolveStoryGroup(group, seed)).filter(
    (group): group is ResolvedStoryGroup => group !== null,
  );

// صفحهٔ پیش‌نمایشِ موقتِ پیکره — فقط برای بازبینیِ چشمی، جزوِ اپ نیست.
import { createRoot } from "react-dom/client";

import { BodyFigure } from "./design-system/illustrations/anatomy/BodyFigure";
import {
  BODY_VIEW_BOX,
  computeBodyShape,
  type BodyProfile,
} from "./design-system/illustrations/anatomy/body-shape";

const kg = (bmi: number, cm: number): number =>
  Math.round(bmi * (cm / 100) ** 2);

/** یک ردیف: همان قد و سن، در سراسرِ طیفِ BMI. */
function bmiRow(
  label: string,
  cm: number,
  ageYears: number,
  sex: "male" | "female",
  bmis: readonly number[],
) {
  return {
    label,
    cases: bmis.map((bmi) => ({
      caption: `BMI ${bmi}`,
      sub: `${kg(bmi, cm)}kg`,
      profile: { heightCm: cm, weightKg: kg(bmi, cm), ageYears, sex } as BodyProfile,
    })),
  };
}

const ADULT_BMIS = [14, 17, 20, 22, 25, 28, 32, 36, 40, 50] as const;

const ROWS = [
  bmiRow("مرد ۱۷۵ / ۳۲ ساله", 175, 32, "male", ADULT_BMIS),
  bmiRow("زن ۱۶۵ / ۳۰ ساله", 165, 30, "female", ADULT_BMIS),
  {
    label: "قد — مردِ BMI ۲۲",
    cases: [150, 160, 170, 180, 190, 200].map((cm) => ({
      caption: `${cm}cm`,
      sub: `${kg(22, cm)}kg`,
      profile: { heightCm: cm, weightKg: kg(22, cm), ageYears: 32, sex: "male" } as BodyProfile,
    })),
  },
  {
    label: "سن — پسر، وزنِ نوعی",
    cases: [
      [2, 88], [5, 110], [8, 128], [11, 145], [14, 163], [17, 174], [25, 176],
    ].map(([age, cm]) => ({
      caption: `${age} ساله`,
      sub: `${cm}cm`,
      profile: {
        heightCm: cm,
        weightKg: null,
        ageYears: age,
        sex: "male",
      } as BodyProfile,
    })),
  },
  {
    label: "سن — دختر، اضافه‌وزن",
    cases: [
      [5, 110, 26], [8, 128, 38], [11, 145, 55], [14, 160, 72], [17, 164, 82],
    ].map(([age, cm, w]) => ({
      caption: `${age} ساله`,
      sub: `${w}kg`,
      profile: {
        heightCm: cm,
        weightKg: w,
        ageYears: age,
        sex: "female",
      } as BodyProfile,
    })),
  },
  {
    label: "حالت‌های حدی و ناقص",
    cases: [
      { caption: "بدون داده", sub: "—", profile: {} as BodyProfile },
      { caption: "۱۱۱cm / ۱۱۱kg", sub: "BMI ۹۰", profile: { heightCm: 111, weightKg: 111, ageYears: 8, sex: "female" } as BodyProfile },
      { caption: "۲۰۰cm / ۴۵kg", sub: "BMI ۱۱", profile: { heightCm: 200, weightKg: 45, ageYears: 30, sex: "male" } as BodyProfile },
      { caption: "۱۴۰cm / ۱۲۰kg", sub: "BMI ۶۱", profile: { heightCm: 140, weightKg: 120, ageYears: 45, sex: "male" } as BodyProfile },
      { caption: "۹۰ ساله", sub: "۱۶۰/۵۰", profile: { heightCm: 160, weightKg: 50, ageYears: 90, sex: "female" } as BodyProfile },
      { caption: "قد نامعتبر", sub: "0 / 70", profile: { heightCm: 0, weightKg: 70, ageYears: 30, sex: "male" } as BodyProfile },
    ],
  },
] as const;

function Figure({
  caption,
  sub,
  profile,
  size,
}: {
  caption: string;
  sub: string;
  profile: BodyProfile;
  size: number;
}) {
  return (
    <figure style={{ margin: 0, textAlign: "center" }}>
      <svg
        width={size}
        height={size * (600 / 380)}
        viewBox={BODY_VIEW_BOX}
        style={{ background: "#fbfaf8", borderRadius: 8 }}
      >
        <BodyFigure shape={computeBodyShape(profile)} />
      </svg>
      <figcaption style={{ fontSize: 12, color: "#6b6259", marginTop: 4 }}>
        {caption}
        <div style={{ fontSize: 11, color: "#a49a8f" }}>{sub}</div>
      </figcaption>
    </figure>
  );
}

function App() {
  return (
    <div
      style={{
        background: "#fff",
        padding: 24,
        fontFamily: "system-ui",
        color: "#3d3630",
      }}
    >
      {ROWS.map((row) => (
        <section key={row.label} style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 15, margin: "0 0 10px", fontWeight: 700 }}>
            {row.label}
          </h2>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            {row.cases.map((item) => (
              <Figure key={item.caption + item.sub} {...item} size={150} />
            ))}
          </div>
        </section>
      ))}

      {(
        [
          ["مرد ۱۷۵", "male", 175],
          ["زن ۱۶۵", "female", 165],
        ] as const
      ).map(([label, sex, cm]) => (
        <section key={label} style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 15, margin: "0 0 10px", fontWeight: 700 }}>
            بزرگ — {label} — لاغر / نرمال / چاق / خیلی چاق
          </h2>
          <div style={{ display: "flex", gap: 20 }}>
            {[16, 22, 30, 40].map((bmi) => (
              <Figure
                key={bmi}
                caption={`BMI ${bmi}`}
                sub={`${kg(bmi, cm)}kg`}
                size={340}
                profile={{
                  heightCm: cm,
                  weightKg: kg(bmi, cm),
                  ageYears: 32,
                  sex,
                }}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(<App />);

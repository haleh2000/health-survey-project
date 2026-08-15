import config
from models import SurveyInput
import jdatetime
from enums import YesNoEnum, SmokingStatusEnum, HotDrinkEnum

def _check_keywords_in_list(item_list: list[str], keyword: str) -> int:
    """Generic function to check if a keyword exists in a list of strings."""
    if not item_list:
        return 0
    joined_string = " ".join(item_list)
    return 1 if keyword in joined_string else 0

def calculate_risk_sync(data: SurveyInput) -> dict:
    """Calculates risk using pure Python math and dictionary lookups (O(1) complexity)."""
    
    # 1. Base Metrics
    birth_year = int(data.birth_date[:4])
    current_year = jdatetime.date.today().year 
    age = current_year - birth_year
    
    if data.height > 0:
        bmi = data.weight / ((data.height / 100) ** 2)
    else:
        bmi = 0
        
    obesity_bin = 1 if bmi >= 30 else 0

    # 2. Lifestyle parsing
    smoker_bin = 0 if data.smoking_status == SmokingStatusEnum.NONE.value else 1
    cig_score = config.CIGARETTE_MAP.get(data.cigarettes_per_day, 0) if smoker_bin else 0
    heavy_smoker = 1 if (smoker_bin and cig_score >= 15) else 0

    hookah_ecig_bin = 1 if data.hookah_ecig == YesNoEnum.YES.value else 0
   
    alcohol_level = config.ALCOHOL_MAP.get(data.alcohol.value if hasattr(data.alcohol, 'value') else data.alcohol, 0)
    heavy_alcohol = 1 if alcohol_level == 2 else 0

    salty_food_bin = 1 if data.adds_salt == YesNoEnum.YES.value else 0
    hot_drink_bin = 1 if data.hot_drink_temp == HotDrinkEnum.VERY_HOT.value else 0
    
    junk_food_level = config.JUNK_FOOD_MAP.get(data.junk_food.value if hasattr(data.junk_food, 'value') else data.junk_food, 0)
    junk_food_bin = 1 if junk_food_level >= 2 else 0

    proc_meat_level = config.PROCESSED_MEAT_MAP.get(data.processed_meat.value if hasattr(data.processed_meat, 'value') else data.processed_meat, 0)
    processed_meat_high_bin = 1 if proc_meat_level == 3 else 0

    veg_fruit_level = config.VEG_FRUIT_MAP.get(data.veg_fruit.value if hasattr(data.veg_fruit, 'value') else data.veg_fruit, 0)
    low_fiber_bin = 1 if veg_fruit_level == 1 else 0

    smoked_food_bin = 1 if data.smoked_food == YesNoEnum.YES.value else 0
    air_pollution_bin = 1 if data.air_pollution == YesNoEnum.YES.value else 0
    occupational_hazard_bin = 1 if data.occupational_hazard == YesNoEnum.YES.value else 0
    
    low_physical_activity = 1 if config.LOW_PHYSICAL_ACTIVITY_KEYWORD in data.physical_activity else 0

    # 3. Diseases (Generic checking)
    diseases = {}
    for key, keyword in config.DISEASE_KEYWORDS.items():
        diseases[key] = _check_keywords_in_list(data.confirmed_diseases, keyword)

    strokes = {}
    for key, keyword in config.STROKE_KEYWORDS.items():
        strokes[key] = _check_keywords_in_list(data.stroke_history, keyword)
    
    heart_disease_combined = 1 if (diseases['heart_disease'] or strokes['heart_attack']) else 0

    hpylori_active_bin = 1 if config.H_PYLORI_ACTIVE_KEYWORD in data.h_pylori else 0
    has_any_cancer = 1 if data.cancer_history == YesNoEnum.YES.value else 0

    cancers = {}
    for key, keyword in config.CANCER_TYPES_KEYWORDS.items():
        cancers[key] = _check_keywords_in_list(data.cancer_types, keyword)

    family = {}
    for key, keyword in config.FAMILY_DISEASE_KEYWORDS.items():
        family[key] = _check_keywords_in_list(data.family_history, keyword)

    # 4. Risk Indices Calculation
    lung_risk = (2 * heavy_smoker + 2 * cancers.get('lung', 0) + hookah_ecig_bin + 
                 occupational_hazard_bin + air_pollution_bin + family.get('lung_cancer', 0) + diseases.get('respiratory_disease', 0))
    
    gastric_risk = (2 * hpylori_active_bin + 2 * cancers.get('gastric', 0) + salty_food_bin + 
                    hot_drink_bin + smoked_food_bin + heavy_alcohol + family.get('gastric_cancer', 0) + obesity_bin)
    
    colon_risk = (processed_meat_high_bin + 2 * cancers.get('colon', 0) + low_fiber_bin + 
                  obesity_bin + low_physical_activity + family.get('colon_cancer', 0) + diseases.get('diabetes', 0) + junk_food_bin)
    
    pancreas_risk = (heavy_smoker + 2 * diseases.get('chronic_pancreatitis', 0) + 2 * cancers.get('pancreas', 0) + 
                     family.get('pancreas_cancer', 0) + diseases.get('diabetes', 0) + low_physical_activity + heavy_alcohol + obesity_bin)
    
    stroke_risk = (2 * diseases.get('hypertension', 0) + diseases.get('diabetes', 0) + heavy_smoker + 
                   strokes.get('brain_stroke', 0) + diseases.get('psychosocial', 0) + family.get('stroke', 0))
    
    cardiac_risk = (diseases.get('heart_disease', 0) + diseases.get('hypertension', 0) + diseases.get('diabetes', 0) + 
                heavy_smoker + family.get('cardiac_disease', 0) + strokes.get('heart_attack', 0) + obesity_bin)
    
    metabolic_risk = (diseases.get('diabetes', 0) + diseases.get('heart_disease', 0) + strokes.get('heart_attack', 0) + 
                  diseases.get('hypertension', 0) + diseases.get('psychosocial', 0))
    
    liver_risk = (2 * cancers.get('liver', 0) + 2 * heavy_alcohol + 2 * diseases.get('infectious', 0) + 
                  family.get('liver_cancer', 0) + obesity_bin + diseases.get('diabetes', 0) + heavy_smoker)

    # 5. Total Score
    total_risk_score = (lung_risk * 1.5 + gastric_risk * 1.0 + colon_risk * 1.0 + pancreas_risk * 1.5 + 
                        liver_risk * 1.5 + stroke_risk * 2.0 + cardiac_risk * 2.0 + metabolic_risk * 1.2)
    
    age_risk_factor = 0 if age < 40 else (1 if age < 50 else (2 if age < 60 else 3))
    total_risk_score += age_risk_factor

    # 6. Categorization
    if has_any_cancer == 1 or strokes.get('heart_attack', 0) == 1 or strokes.get('brain_stroke', 0) == 1:
        health_risk_level = config.RISK_LEVEL_1
    elif total_risk_score > 16:
        health_risk_level = config.RISK_LEVEL_2
    elif total_risk_score > 10:
        health_risk_level = config.RISK_LEVEL_3
    else:
        health_risk_level = config.RISK_LEVEL_4

    # 7. Return dict
    return {
        "name": data.full_name,
        "national_id": data.national_id,
        "age": age,
        "bmi": round(bmi, 1),
        "risk_score": total_risk_score,
        "risk_level": health_risk_level,
        "lung_risk": lung_risk,
        "gastric_risk": gastric_risk,
        "colon_risk": colon_risk,
        "pancreas_risk": pancreas_risk,
        "stroke_risk": stroke_risk,
        "cardiac_risk": cardiac_risk,
        "metabolic_risk": metabolic_risk,
        "liver_risk": liver_risk,
        "flags": {
            "heavy_smoker":           bool(heavy_smoker),
            "hookah_ecig":            bool(hookah_ecig_bin),
            "occupational_hazard":    bool(occupational_hazard_bin),
            "air_pollution":          bool(air_pollution_bin),
            "hpylori_active":         bool(hpylori_active_bin),
            "salty_food":             bool(salty_food_bin),
            "hot_drink":              bool(hot_drink_bin),
            "smoked_food":            bool(smoked_food_bin),
            "heavy_alcohol":          bool(heavy_alcohol),
            "obesity":                bool(obesity_bin),
            "processed_meat_high":    bool(processed_meat_high_bin),
            "low_fiber":              bool(low_fiber_bin),
            "junk_food":              bool(junk_food_bin),
            "low_physical_activity":  bool(low_physical_activity),
            "diabetes":               bool(diseases["diabetes"]),
            "hypertension":           bool(diseases["hypertension"]),
            "heart_disease":          bool(heart_disease_combined),
            "chronic_pancreatitis":   bool(diseases["chronic_pancreatitis"]),
            "psychosocial":           bool(diseases["psychosocial"]),
            "infectious_disease":     bool(diseases["infectious"]),
            "brain_stroke_history":   bool(strokes["brain_stroke"]),
            "heart_attack_history":   bool(strokes["heart_attack"]),
            "family_lung_cancer":     bool(family["lung_cancer"]),
            "family_gastric_cancer":  bool(family["gastric_cancer"]),
            "family_colon_cancer":    bool(family["colon_cancer"]),
            "family_pancreas_cancer": bool(family["pancreas_cancer"]),
            "family_liver_cancer":    bool(family["liver_cancer"]),
            "family_stroke":          bool(family["stroke"]),
            "family_cardiac":         bool(family["cardiac_disease"]),
        },
    }

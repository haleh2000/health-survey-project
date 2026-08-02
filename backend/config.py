# Mappings
CIGARETTE_MAP = {'کمتر از ۱۰ نخ': 5, 'بین ۱۰تا ۲۰ نخ': 15, 'بیشتر از 20 نخ': 30}

ALCOHOL_MAP = {
    'الکل مصرف نمی‌کنم': 0, 
    'مصرف گهگاهی (کمتر از ۱بار در هفته)': 1, 
    'مصرف منظم (بیشتر از ۱بار در هفته یا مقادیر زیاد)': 2
}

JUNK_FOOD_MAP = {
    'کم (ماهیانه 1-2 بار)': 1, 
    'متوسط (هفته‌ای 1-2 بار)': 2, 
    'زیاد (بیشتر از ۳بار در هفته)': 3
}

PROCESSED_MEAT_MAP = {
    'به ندرت یا هرگز': 1, 
    'متوسط': 2, 
    'زیاد (بیشتر از 2-3 وعده در هفته)': 3
}

VEG_FRUIT_MAP = {
    'کمتر از ۱ واحد در روز': 1, 
    '۱تا ۲ واحد در روز': 2, 
    '۳ واحد یا بیشتر در روز': 3
}

LOW_PHYSICAL_ACTIVITY_KEYWORD = 'فعالیت خاصی ندارم'
H_PYLORI_ACTIVE_KEYWORD = 'فعال'


# Keywords for generic searching in lists
DISEASE_KEYWORDS = {
    'diabetes': 'دیابت',
    'hypertension': 'فشار خون',
    'heart_disease': 'قلبی',
    'respiratory_disease': 'تنفسی',
    'chronic_pancreatitis': 'پانکراس',
    'psychosocial': 'اعصاب',
    'infectious': 'عفونی'
}

STROKE_KEYWORDS = {
    'brain_stroke': 'سکته مغزی',
    'heart_attack': 'سکته قلبی'
}

CANCER_TYPES_KEYWORDS = {
    'lung': 'ریه', 
    'gastric': 'معده', 
    'colon': 'روده', 
    'prostate': 'پروستات', 
    'breast': 'سینه', 
    'pancreas': 'پانکراس', 
    'liver': 'کبد'
}

FAMILY_DISEASE_KEYWORDS = {
    'lung_cancer': 'سرطان ریه',
    'gastric_cancer': 'سرطان معده',
    'colon_cancer': 'سرطان روده',
    'pancreas_cancer': 'سرطان پانکراس',
    'liver_cancer': 'سرطان کبد',
    'breast_cancer': 'سرطان سینه',
    'stroke': 'سکته مغزی',
    'cardiac_disease': 'سکته قلبی'
}

# Risk Levels
RISK_LEVEL_1 = 'گروه ۱: گروه پر ریسک (با بیماری قطعی)'
RISK_LEVEL_2 = 'گروه ۲: گروه در آستانه خطر (کوتاه‌مدت)'
RISK_LEVEL_3 = 'گروه ۳: گروه در معرض خطر (بلندمدت)'
RISK_LEVEL_4 = 'گروه ۴: گروه افراد سالم'

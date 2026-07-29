from enum import Enum

class YesNoEnum(str, Enum):
    YES = "بله"
    NO = "خیر"

class GenderEnum(str, Enum):
    MALE = "مرد"
    FEMALE = "زن"

class SmokingStatusEnum(str, Enum):
    NONE = "اصلاً سیگار نمی‌کشم"
    YES = "بله" 

class AlcoholEnum(str, Enum):
    NONE = "الکل مصرف نمی‌کنم"
    OCCASIONAL = "مصرف گهگاهی (کمتر از ۱بار در هفته)"
    REGULAR = "مصرف منظم (بیشتر از ۱بار در هفته یا مقادیر زیاد)"

class JunkFoodEnum(str, Enum):
    LOW = "کم (ماهیانه 1-2 بار)"
    MEDIUM = "متوسط (هفته‌ای 1-2 بار)"
    HIGH = "زیاد (بیشتر از ۳بار در هفته)"

class ProcessedMeatEnum(str, Enum):
    RARE = "به ندرت یا هرگز"
    MEDIUM = "متوسط"
    HIGH = "زیاد (بیشتر از 2-3 وعده در هفته)"

class VegFruitEnum(str, Enum):
    LOW = "کمتر از ۱ واحد در روز"
    MEDIUM = "۱تا ۲ واحد در روز"
    HIGH = "۳ واحد یا بیشتر در روز"

class HotDrinkEnum(str, Enum):
    VERY_HOT = "بسیار داغ"
    WARM = "گرم"

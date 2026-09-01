export type FraudCaseFeedbackField = {
  key?: string;
  label?: string;
  value?: boolean;
  comment?: string;
  [key: string]: unknown;
};

export type FraudCaseFeedback = {
  id?: string;
  damageReportId?: string | null;
  fraudCaseId?: number | null;
  dynamicFields?: FraudCaseFeedbackField[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
} | null;

export type TagType =
  | 'مورد مشکوک'
  | 'احتمال تقلب'
  | 'نیاز به بررسی'
  | 'تقلب تایید شده'
  | 'ثبت نادرست';

export type Tag = {
  id: string;
  name: string;
  type: TagType;
  color: string;
  description: string | null;
};

export type FraudCase = {
  id: number;
  suspiciousCaseType: string;
  case1Id: string;
  case1NationalCode: string;
  case1Condition: string | null;
  registrationDateCase1: string;
  case1Images?: string[];
  case2Id: string | null;
  case2NationalCode: string;
  case2Condition: string | null;
  registrationDateCase2: string | null;
  case2Images?: string[];
  duplicateImagesCase1?: string | null;
  duplicateImagesCase2?: string | null;
  additionalNote: string | null;
  feedback?: FraudCaseFeedback;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
  similarityPercentage?: number;
};

export type FraudCasesApiResponse =
  | FraudCase[]
  | {
      items?: FraudCase[];
      meta?: {
        page?: number;
        size?: number;
        total?: number;
        totalPages?: number;
      };
      [key: string]: unknown;
    };

export type FraudCaseColumn = {
  key: keyof FraudCase | "actions";
  label: string;
};

export type UserRecord = {
  id?: string | number;
  username?: string;
  displayName?: string;
  email?: string;
  avatar?: string | null;
  role?: number;
  [key: string]: unknown;
};

export type UserEditForm = {
  email: string;
  roleId: string;
};

export type UsersApiResponse =
  | UserRecord[]
  | {
      data?: UserRecord[] | { users?: UserRecord[] };
      users?: UserRecord[];
    };

export type DuplicateMatchResponse = {
  items: FraudCase[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
};

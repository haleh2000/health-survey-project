export interface OrganPosition {
  id: string;
  organKey: 'cardiac' | 'stroke' | 'lung' | 'liver' | 'gastric' | 'colon' | 'pancreas' | 'metabolic';
  label: string;
  top: string;   // درصد از بالای silhouette
  left: string;  // درصد از عرض silhouette
  width: string; // عرض organ SVG
  height: string; // ارتفاع organ SVG
}

export const ORGAN_POSITIONS: OrganPosition[] = [
  { id: 'stroke',    organKey: 'stroke',    label: 'مغز',      top: '4%',   left: '50%',  width: '56px', height: '48px' },
  { id: 'cardiac',   organKey: 'cardiac',   label: 'قلب',      top: '25%',  left: '47%',  width: '44px', height: '44px' },
  { id: 'lung',      organKey: 'lung',      label: 'ریه',      top: '22%',  left: '50%',  width: '52px', height: '44px' },
  { id: 'liver',     organKey: 'liver',     label: 'کبد',      top: '34%',  left: '54%',  width: '50px', height: '34px' },
  { id: 'gastric',   organKey: 'gastric',   label: 'معده',     top: '33%',  left: '44%',  width: '40px', height: '46px' },
  { id: 'pancreas',  organKey: 'pancreas',  label: 'پانکراس',  top: '38%',  left: '50%',  width: '48px', height: '26px' },
  { id: 'colon',     organKey: 'colon',     label: 'روده',     top: '46%',  left: '50%',  width: '48px', height: '42px' },
  { id: 'metabolic', organKey: 'metabolic', label: 'متابولیک', top: '42%',  left: '44%',  width: '40px', height: '40px' },
];

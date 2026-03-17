/** Application-wide constants */

export const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  JOB_FINDER: 'jobFinder',
  TRAINER: 'trainer',
  CUSTOMER: 'customer',
  SELLER: 'seller',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.STUDENT]: 'Student',
  [ROLES.JOB_FINDER]: 'Job Finder',
  [ROLES.TRAINER]: 'Trainer',
  [ROLES.CUSTOMER]: 'Customer',
  [ROLES.SELLER]: 'Seller',
};

export const ROLE_DASHBOARD_PATHS = {
  [ROLES.ADMIN]: '/dashboard/admin',
  [ROLES.STUDENT]: '/dashboard/student',
  [ROLES.JOB_FINDER]: '/dashboard/jobs',
  [ROLES.TRAINER]: '/dashboard/trainer',
  [ROLES.CUSTOMER]: '/dashboard/customer',
  [ROLES.SELLER]: '/dashboard/seller',
};

export const ADMIN_CODES = ['SVTECH2023', 'ADMIN1234'];

export const JOB_TYPES = ['full-time', 'part-time', 'contract', 'remote', 'internship'];
export const JOB_STATUSES = ['open', 'closed', 'paused'];

export const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced'];
export const COURSE_CATEGORIES = ['development', 'design', 'data-science', 'networking', 'cybersecurity', 'ai-ml', 'business'];

export const POST_CATEGORIES = ['announcement', 'tutorial', 'news', 'article', 'case-study'];

export const CONTACT_INFO = {
  phone: '0913767842',
  email: 'svacademy12m@gmail.com',
  whatsapp: 'https://wa.me/251913767842',
  telegram: 'https://t.me/svtechacademy',
  instagram: 'https://www.instagram.com/svtechacademy',
  youtube: 'https://www.youtube.com/@svtech2024',
  tiktok: 'https://www.tiktok.com/@svtech2024',
  tiktokPro: 'https://www.tiktok.com/@svtechpro',
  phones: ['0913767842', '0918285517', '0918800597']
};

export type ItemType = 'LOST' | 'FOUND';
export type ItemStatus = 'ACTIVE' | 'IN_REVIEW' | 'RETURNED' | 'CANCELLED';
export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONFIRMED';
export type UserRole = 'STUDENT' | 'STAFF_PORTARIA' | 'ADMIN';

export interface CampusBlock {
  id: string;
  name: string;
  description?: string | null;
  campus: string;
  _count?: {
    items: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  _count?: {
    items: number;
  };
}

export interface Course {
  id: string;
  name: string;
  department?: string | null;
  createdAt?: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  banerUrl?: string | null;
  academicCourse?: string | null;
  academicPeriod?: number | null;
  role?: UserRole;
  reputationScore?: number;
  isVerified?: boolean;
  frequentedBlocks?: Array<{ id: string; name: string; campus?: string }>;
}

export interface Hint {
  id: string;
  content: string;
  isHelpful: boolean;
  itemId: string;
  authorId: string;
  author: UserSummary;
  createdAt: string;
}

export interface HandoffPin {
  id: string;
  claimId: string;
  code: string;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
  isUsed: boolean;
}

export interface Claim {
  id: string;
  itemId: string;
  claimantId: string;
  status: ClaimStatus;
  secretDetails?: string | null;
  securityCode?: string | null;
  handoffPin?: HandoffPin | null;
  createdAt: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  type: ItemType;
  status: ItemStatus;
  categoryId: string;
  blockId: string;
  specificLocation?: string | null;
  photoUrl?: string | null;
  hasReward: boolean;
  isUnderStaffCustody: boolean;
  custodyLocation?: string | null;
  authorId: string;
  resolvedAt?: string | null;
  resolvedById?: string | null;
  createdAt: string;
  updatedAt: string;
  category: Category;
  block: CampusBlock;
  author: UserSummary;
  hints?: Hint[];
  isLiked?: boolean;
  isSaved?: boolean;
  _count?: {
    hints: number;
    likes: number;
    claims: number;
  };
}

export interface FeedResponse {
  data: Item[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

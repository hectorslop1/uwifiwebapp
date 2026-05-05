export type SupabaseAuthUser = {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
};

export type SupabaseSessionResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: SupabaseAuthUser;
};

export type CustomerRow = {
  customer_id: number;
  customer_afiliate_id: number | null;
  shared_link_id: string | null;
  customer_category_fk: number | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  remember: boolean;
};

export type PortalUser = {
  authId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  customerId: number;
  customerAffiliateId: number | null;
  sharedLinkId: string | null;
  customerCategoryId: number | null;
};

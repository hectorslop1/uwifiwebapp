export type SettingsProfile = {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type SettingsProfileRow = {
  customer_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  mobile_phone: string | null;
};

export interface UserRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  role: {
      id: string;
      name: string;
  } | null;
  last_access: string;
  affiliated_company_id?: {
      id: string;
      company_name: string;
  } | null;
}

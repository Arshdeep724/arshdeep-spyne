export interface UserDeletedEvent {
  id: string;
  name: string;
  email: string;
  mobile_number: string;
  password: string;
  last_login: Date;
  created_at: Date;
  updated_at: Date;
}

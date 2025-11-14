export interface User {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  university_id?: number | null;
  group_id?: number | null;
  xp: number;
  coins: number;
  completed_courses: string[];
  purchases: string[];
  university?: {
    id: number;
    name: string;
  } | null;
  group?: {
    id: number;
    name: string;
  } | null;
}

// src/types/user.ts

export interface User {
  id: number;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  photo_url: string | null;
  language_code: string | null;
  group_id: number | null;
  university_id: number | null;
  xp: number;
  coins: number;
}

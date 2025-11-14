// src/types/user.ts

interface University {
  id: number;
  name: string;
  points: number;
}

interface Group {
  id: number;
  name: string;
  course_id: number;
}

interface CompletedCourse {
  id: number;
  course_id: string;
}

interface PurchasedItem {
  id: number;
  item_id: string;
}

export interface User {
  id: number;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  photo_url: string | null;
  language_code: string | null;
  
  // IDs are still useful for quick checks
  group_id: number | null;
  university_id: number | null;

  // Nested objects for detailed info
  group?: Group | null;
  university?: University | null;

  xp: number;
  coins: number;

  completed_courses: CompletedCourse[];
  purchases: PurchasedItem[];
}

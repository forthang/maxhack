export interface ReviewOut {
  id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: string; // ISO 8601 string
  user_name: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  aiori_user_id?: string;
  created_at: string;
}

export interface UserProfile {
  id: number;
  user_id: string;
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  gender?: string;
  fitness_level: string;
  preferred_activity: string;
  daily_step_goal: number;
  daily_calorie_goal: number;
  updated_at: string;
}

export interface Workout {
  id: number;
  user_id: string;
  title: string;
  category: string;
  duration_minutes: number;
  calories_burned: number;
  distance_km: number;
  heart_rate_avg?: number;
  notes?: string;
  performed_at: string;
  created_at: string;
}

export interface WorkoutSummary {
  total_workouts: number;
  total_duration_minutes: number;
  total_calories_burned: number;
  total_distance_km: number;
  category_breakdown: Array<{ category: string; count: number }>;
}

export interface MetricToday {
  steps: number;
  calories_burned: number;
  active_minutes: number;
  heart_rate_avg?: number;
  resting_heart_rate?: number;
  sleep_hours?: number;
  sleep_score?: number;
  vo2_max?: number;
  is_synthetic: boolean;
  sensor_source_label: string;
}

export interface DashboardTelemetry {
  today: MetricToday;
  goals: {
    step_goal: number;
    calorie_goal: number;
    step_progress_pct: number;
    calorie_progress_pct: number;
  };
  weekly_steps: Array<{ date: string; day: string; steps: number }>;
  weekly_calories: Array<{ date: string; day: string; calories: number }>;
  workout_distribution: Array<{ name: string; value: number }>;
  total_workouts: number;
}

export interface FitnessGoal {
  id: number;
  user_id: string;
  title: string;
  goal_type: 'STEPS' | 'CALORIES' | 'WORKOUTS_WEEKLY' | 'WEIGHT_TARGET' | 'DISTANCE';
  target_value: number;
  current_value: number;
  unit: string;
  deadline?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityHistoryItem {
  id: number;
  user_id: string;
  activity_type: string;
  summary: string;
  metric_value?: string;
  timestamp: string;
}

export interface NoticeRead {
  version: string;
  hash_sha256: string;
  title: string;
  content: string;
  language: string;
}

export interface PurposeConsentState {
  purpose_id: string;
  purpose_name: string;
  purpose_description: string;
  status: 'CONSENT_GRANTED' | 'CONSENT_WITHDRAWN' | 'CONSENT_PENDING' | 'CONSENT_STALE' | 'NO_CONSENT';
  raw_status: 'GRANTED' | 'WITHDRAWN' | 'NO_CONSENT';
  is_stale: boolean;
  notice_version?: string;
  notice_hash?: string;
  language?: string;
  last_updated?: string;
  latest_receipt_id?: string;
  is_pending_outbox: boolean;
}

export interface UserConsentOverview {
  user_id: string;
  current_notice?: NoticeRead;
  purposes: PurposeConsentState[];
  aiori_connected: boolean;
  last_synced_at?: string;
  error_message?: string;
}

export interface ReceiptRead {
  receipt_id: string;
  consent_event_id: string;
  user_id: string;
  purpose_id: string;
  purpose_name: string;
  action: string;
  notice_version: string;
  notice_hash: string;
  language: string;
  data_categories: string[];
  timestamp_utc: string;
  collection_channel: string;
  actor_id: string;
  actor_type: string;
  application_id: string;
  receipt_hash: string;
}

export interface ReceiptVerifyResult {
  receipt_id: string;
  is_valid: boolean;
  computed_hash: string;
  stored_hash: string;
  verified_at: string;
  notice_hash_matched: boolean;
  error_message?: string;
}

export interface ConsumerAccessResponse {
  allowed: boolean;
  status_code: number;
  status: string;
  reason_code: string;
  message: string;
  consumer_id?: string;
  user_id: string;
  purpose: string;
  timestamp: string;
  data?: any;
  problem_details?: any;
}


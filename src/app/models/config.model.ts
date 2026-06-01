export interface Config {
  id: string;
  passcode: string;
  start_date: string;
  target_date: string;
  spicy_score: number;
  welcome_message: string;
  event_name: string | null;
  cycle_start_date: string | null;
  cycle_length: number | null;
  updated_at: string;
}

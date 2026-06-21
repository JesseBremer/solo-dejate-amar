export type PinType =
  // Current
  | 'dining' | 'cafe' | 'nature' | 'travel' | 'home' | 'celebration'
  | 'shows' | 'culture' | 'milestone' | 'night_out' | 'bucket_list' | 'stay'
  // Legacy (kept so existing DB rows don't error)
  | 'first_meeting' | 'first_date' | 'trip' | 'special' | 'food' | 'music' | 'adventure';

export interface MapLocation {
  id: string;
  title: string;
  description: string | null;
  address: string | null;
  lat: number;
  lng: number;
  visit_date: string | null;
  pin_type: PinType | null;
  timeline_event_id: string | null;
  created_at: string;
}

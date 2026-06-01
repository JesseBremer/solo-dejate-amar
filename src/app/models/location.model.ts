export type PinType = 'first_meeting' | 'first_date' | 'trip' | 'home' | 'special' | 'food' | 'music' | 'adventure';

export interface MapLocation {
  id: string;
  title: string;
  description: string | null;
  address: string | null;
  lat: number;
  lng: number;
  visit_date: string | null;
  pin_type: PinType | null;
  created_at: string;
}

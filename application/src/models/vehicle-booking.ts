import { Vehicle } from './vehicle';

export type VehicleBooking = Readonly<{
  bookingId?: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  servicePlanId?: string;
  vehicle?: Vehicle;
  options?: BookingOptions;
  status: 'BOOKED' | 'CANCELLED' | 'COMPLETED';
}>;

export type BookingOptions = Readonly<{
  oilService?: boolean;
  brakesCheck?: boolean;
  tireRotation?: boolean;
  clutchInspection?: boolean;
  washAndVac?: boolean;
}>;

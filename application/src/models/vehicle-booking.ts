import { bookingStatus } from '@shared/types/booking-status';
import { Vehicle } from './vehicle';

export type VehicleBookingPayload = Readonly<{
  userId: string;
  startDate: Date;
  endDate: Date;
  servicePlanId?: string;
  vehicle?: Vehicle;
  options?: BookingOptions;
}>;

export type VehicleBooking = Readonly<{
  bookingId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  servicePlanId?: string;
  vehicle?: Vehicle;
  options?: BookingOptions;
  status: bookingStatus;
  createdAt: Date;
  updatedAt: Date;
}>;

export type BookingOptions = Readonly<{
  oilService?: boolean;
  brakesCheck?: boolean;
  tireRotation?: boolean;
  clutchInspection?: boolean;
  washAndVac?: boolean;
}>;

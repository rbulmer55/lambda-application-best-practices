import { VehicleBooking } from '@models/vehicle-booking';
import { BookingRepository } from '@shared/database/repositories/booking-repository';

export const completeVehicleBookingDatabaseAdapter = async (
  booking: VehicleBooking,
) => {
  // implementation for persisting vehicle booking completion
  const bookingRepository = new BookingRepository();
  return await bookingRepository.createBooking(booking);
};

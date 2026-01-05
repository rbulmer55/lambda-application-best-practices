import { VehicleBooking, VehicleBookingPayload } from '@models/vehicle-booking';
import { BookingRepository } from '@shared/database/repositories/booking-repository';
import { logger } from '@shared/powertools';
import { bookingStatus } from '@shared/types/booking-status';

export const createVehicleBookingDatabaseAdapter = async (
  booking: VehicleBookingPayload & { status: bookingStatus },
): Promise<VehicleBooking> => {
  // implementation for persisting vehicle booking completion
  logger.info('Saving Booking to database');

  const bookingRepository = new BookingRepository();

  const savedBooking = await bookingRepository.createBooking(booking);

  logger.info('Booking Saved', {
    bookingId: savedBooking.bookingId,
  });
  return savedBooking;
};

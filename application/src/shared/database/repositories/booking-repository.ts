import { VehicleBooking } from '@models/vehicle-booking';
import { logger, tracer } from '@shared/powertools';
import { getMongoDb } from '../connection';
import { Collection, ObjectId } from 'mongodb';

async function getBookingCollection(): Promise<Collection> {
  const db = await getMongoDb();
  return db.collection('vehicleBookings');
}

export class BookingRepository {
  @tracer.captureMethod({ subSegmentName: 'DB.CompleteVehicleBooking' })
  async createBooking(booking: VehicleBooking): Promise<VehicleBooking> {
    const collection = await getBookingCollection();

    const bookingId = new ObjectId();
    try {
      await collection.insertOne({
        _id: bookingId,
        ...booking,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      logger.info('Booking saved to database', { bookingId });
      return booking;
    } catch (err) {
      logger.error('Failed to save booking', {
        bookingId,
        error: err,
      });
      throw err;
    }
  }

  @tracer.captureMethod({ subSegmentName: 'DB.GetBooking' })
  async getBookingById(bookingId: string): Promise<VehicleBooking | null> {
    const collection = await getBookingCollection();

    const doc = await collection.findOne({ _id: new ObjectId(bookingId) });

    if (!doc) return null;

    return {
      bookingId: bookingId,
      userId: doc.userId,
      startDate: doc.startDate,
      endDate: doc.endDate,
      status: doc.status,
      vehicle: doc.vehicle,
      options: doc.options,
      servicePlanId: doc.servicePlanId,
    } as VehicleBooking;
  }
}

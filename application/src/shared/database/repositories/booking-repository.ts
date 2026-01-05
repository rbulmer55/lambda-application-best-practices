import { VehicleBooking, VehicleBookingPayload } from '@models/vehicle-booking';
import { logger, tracer } from '@shared/powertools';
import { getMongoDb } from '../connection';
import { Collection, ObjectId } from 'mongodb';
import { bookingStatus } from '@shared/types/booking-status';

async function getBookingCollection(): Promise<Collection> {
  const db = await getMongoDb();
  return db.collection('vehicleBookings');
}

export class BookingRepository {
  @tracer.captureMethod({ subSegmentName: 'DB.CreateVehicleBooking' })
  async createBooking(
    booking: VehicleBookingPayload & { status: bookingStatus },
  ): Promise<VehicleBooking> {
    const collection = await getBookingCollection();

    const bookingId = new ObjectId();

    const databaseBooking: VehicleBooking & { _id: ObjectId } = {
      ...booking,
      _id: bookingId,
      bookingId: bookingId.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await collection.insertOne(databaseBooking);

      logger.info('Booking saved to database', {
        bookingId: databaseBooking.bookingId,
      });

      return databaseBooking;
    } catch (err) {
      logger.error('Failed to save booking', {
        bookingId: databaseBooking.bookingId,
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

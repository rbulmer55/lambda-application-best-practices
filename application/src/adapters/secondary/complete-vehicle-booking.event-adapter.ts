import { config } from '@config/config';
import { VehicleBooking } from '@models/vehicle-booking';
import { EventPublisher } from '@shared/events/event-publisher';
import { ServiceMetadata } from '@shared/types/service-metadata';

const eventBusName = config.get('eventBusName');
const eventPublisher = new EventPublisher(eventBusName);

export const completeVehicleBookingEventAdapter = async (
  booking: VehicleBooking,
  metadata: ServiceMetadata,
) => {
  await eventPublisher.publish({
    type: 'VehicleBookingCompleted',
    payload: {
      bookingId: booking.bookingId,
      userId: booking.userId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      vehicle: booking.vehicle,
      options: booking.options,
      servicePlanId: booking.servicePlanId,
    },
    metadata: { ...metadata },
  });
};

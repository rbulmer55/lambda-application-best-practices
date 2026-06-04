import {
  VehicleBookingRequestDTO,
  VehicleBookingResponseDTO,
} from '@dto/vehicle-booking-dto';
import {
  createVehicleBookingFromDTO,
  createVehicleBookingToDTO,
} from './create-booking.factory';
import { VehicleBooking } from '@models/vehicle-booking';
import {
  createVehicleBookingDatabaseAdapter,
  createVehicleBookingEventAdapter,
} from '@adapters/secondary/create-vehicle-booking';
import { ServiceMetadata } from '@shared/types/service-metadata';
import { logger } from '@shared/index';

/**
 *
 * Use case: Create Vehcile Booking
 * Purpose: Handles the flow of creating a new vehicle booking by
 *          transforming input DTOs, persisting data, publishing events,
 *          and returning output DTOs.
 */
export async function createBookingUseCase(
  dto: VehicleBookingRequestDTO,
  metadata: ServiceMetadata,
): Promise<VehicleBookingResponseDTO> {
  // validate and transform DTO to domain model
  const booking = createVehicleBookingFromDTO(dto);

  // persist booking - secondary adapter
  const createdBooking: VehicleBooking =
    await createVehicleBookingDatabaseAdapter(booking);

  // publish event - secondary adapter
  await createVehicleBookingEventAdapter(createdBooking, metadata);

  // transform domain model to DTO - Return response
  return createVehicleBookingToDTO(createdBooking);
}

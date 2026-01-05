import {
  VehicleBookingRequestDTO,
  VehicleBookingResponseDTO,
} from '@dto/vehicle-booking-dto';
import {
  createVehicleBookingFromDTO,
  createVehicleBookingToDTO,
} from './create-booking.factory';
import { VehicleBooking, VehicleBookingPayload } from '@models/vehicle-booking';
import {
  createVehicleBookingDatabaseAdapter,
  createVehicleBookingEventAdapter,
} from '@adapters/secondary/create-vehicle-booking';
import { ServiceMetadata } from '@shared/types/service-metadata';

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
  // transform DTO to domain model
  const booking = createVehicleBookingFromDTO(dto);

  // persist booking
  const createdBooking: VehicleBooking =
    await createVehicleBookingDatabaseAdapter(booking);
  // publish event
  await createVehicleBookingEventAdapter(createdBooking, metadata);

  // transform domain model to DTO
  return createVehicleBookingToDTO(createdBooking);
}

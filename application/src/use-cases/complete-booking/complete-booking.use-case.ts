import {
  VehicleBookingRequestDTO,
  VehicleBookingResponseDTO,
} from '@dto/vehicle-booking-dto';
import {
  completeVehicleBookingFromDTO,
  completeVehicleBookingToDTO,
} from './complete-booking.factory';
import { VehicleBooking } from '@models/vehicle-booking';
import { completeVehicleBookingDatabaseAdapter } from '@adapters/secondary/complete-vehicle-booking.db-adapter';
import { completeVehicleBookingEventAdapter } from '@adapters/secondary/complete-vehicle-booking.event-adapter';
import { ServiceMetadata } from '@shared/types/service-metadata';

export async function completeBookingUseCase(
  dto: VehicleBookingRequestDTO,
  metadata: ServiceMetadata,
): Promise<VehicleBookingResponseDTO> {
  // transform DTO to domain model
  const booking: VehicleBooking = completeVehicleBookingFromDTO(dto);

  // persist booking
  await completeVehicleBookingDatabaseAdapter(booking);
  // publish event
  await completeVehicleBookingEventAdapter(booking, metadata);

  // transform domain model to DTO
  return completeVehicleBookingToDTO(booking);
}

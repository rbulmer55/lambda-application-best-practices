import {
  VehicleBookingRequestDTO,
  VehicleBookingResponseDTO,
} from '@dto/vehicle-booking-dto';
import { VehicleBooking } from '@models/vehicle-booking';

export function completeVehicleBookingFromDTO(
  input: VehicleBookingRequestDTO,
): VehicleBooking {
  if (input.startDate >= input.endDate) {
    throw new Error('Start date must be before end date');
  }

  if (
    input.vehicleDetails?.fuelType === 'ELECTRIC' &&
    input.bookingOptions?.oilService
  ) {
    throw new Error('Oil service not allowed for electric vehicles');
  }

  return {
    userId: input.userId,
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
    servicePlanId: input.servicePlanId,
    vehicle: input.vehicleDetails
      ? {
          make: input.vehicleDetails.make,
          model: input.vehicleDetails.model,
          year: input.vehicleDetails.year,
          fuelType: input.vehicleDetails.fuelType,
          mileage: input.vehicleDetails.mileage,
          warrantyId: input.vehicleDetails.warrantyId,
        }
      : undefined,
    options: input.bookingOptions
      ? {
          oilService: input.bookingOptions.oilService,
          brakesCheck: input.bookingOptions.brakesCheck,
          tireRotation: input.bookingOptions.tireRotation,
          clutchInspection: input.bookingOptions.clutchInspection,
          washAndVac: input.bookingOptions.washAndVac,
        }
      : undefined,
    status: 'BOOKED',
  };
}

export const completeVehicleBookingToDTO = (
  booking: VehicleBooking,
): VehicleBookingResponseDTO => {
  if (!booking.bookingId) {
    throw new Error('Booking ID is required for response DTO');
  }
  return {
    bookingId: booking.bookingId,
    userId: booking.userId,
    startDate: booking.startDate.toISOString(),
    endDate: booking.endDate.toISOString(),
    status: booking.status,
  };
};

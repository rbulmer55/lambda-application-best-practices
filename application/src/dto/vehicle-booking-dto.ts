export type VehicleBookingRequestDTO = {
  userId: string;
  startDate: string;
  endDate: string;
  servicePlanId?: string;
  vehicleDetails?: {
    make: string;
    model: string;
    year: number;
    fuelType: 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
    mileage?: number;
    warrantyId?: string;
  };
  bookingOptions?: {
    oilService?: boolean;
    brakesCheck?: boolean;
    tireRotation?: boolean;
    clutchInspection?: boolean;
    washAndVac?: boolean;
  };
};

export type VehicleBookingResponseDTO = {
  bookingId: string;
  status: 'BOOKED' | 'CANCELLED' | 'COMPLETED';
  userId: string;
  startDate: string;
  endDate: string;
};

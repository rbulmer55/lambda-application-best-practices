export const VehicleBookingRequestSchema = {
  type: 'object',
  properties: {
    vehicleId: { type: 'string' },
    userId: { type: 'string' },
    startDate: { type: 'string', format: 'date-time' },
    endDate: { type: 'string', format: 'date-time' },
    servicePlanId: { type: 'string' },
    warrantyId: { type: 'string' },
    vehicleDetails: {
      type: 'object',
      properties: {
        make: { type: 'string' },
        model: { type: 'string' },
        year: { type: 'integer' },
        fuelType: {
          type: 'string',
          enum: ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'],
        },
        mileage: { type: 'integer' },
      },
      required: ['make', 'model', 'year', 'fuelType'],
    },
    bookingOptions: {
      type: 'object',
      properties: {
        oilService: { type: 'boolean' },
        brakesCheck: { type: 'boolean' },
        tireRotation: { type: 'boolean' },
        clutchInspection: { type: 'boolean' },
        washAndVac: { type: 'boolean' },
      },
    },
  },
  required: ['vehicleId', 'userId', 'startDate', 'endDate'],
};

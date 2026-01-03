export type Vehicle = Readonly<{
  make: string;
  model: string;
  year: number;
  fuelType: 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
  mileage?: number;
  warrantyId?: string;
}>;

import { z } from 'zod'
import { MONGO_OBJECT_ID } from './students-form'

export const createVehicleSchema = z.object({
  licensePlate: z.string().trim().min(1, 'Vehicle number is required'),
  capacity: z
    .string()
    .min(1, 'Capacity is required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Enter a valid capacity'),
  vehicleType: z.enum(['BUS', 'MINIBUS', 'VAN']),
  modelName: z.string().trim().min(1, 'Model name is required'),
})

export type CreateVehicleForm = z.infer<typeof createVehicleSchema>

export function buildCreateVehiclePayload(form: CreateVehicleForm) {
  return {
    vehicleNumber: form.licensePlate.trim(),
    modelName: form.modelName.trim(),
    capacity: Math.floor(Number(form.capacity)),
  }
}

export function buildCreateVehiclePayloadAttempts(form: CreateVehicleForm): Record<string, unknown>[] {
  const payload = buildCreateVehiclePayload(form)
  return [payload, { ...payload, vehicleType: form.vehicleType }]
}

export const createRouteSchema = z.object({
  routeName: z.string().trim().min(1, 'Route name is required'),
  routeFare: z
    .string()
    .min(1, 'Monthly fare is required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Enter a valid fare amount'),
  startPoint: z.string().trim().min(1, 'Start point is required'),
  endPoint: z.string().trim().min(1, 'End point is required'),
})

export type CreateRouteForm = z.infer<typeof createRouteSchema>

/** Live API: routeName, startPoint, endPoint, fare (₹). */
export function buildCreateRoutePayload(form: CreateRouteForm) {
  const fare = Number(form.routeFare)
  return {
    routeName: form.routeName.trim(),
    startPoint: form.startPoint.trim(),
    endPoint: form.endPoint.trim(),
    fare,
    routeFare: fare,
  }
}

export const assignDriverSchema = z.object({
  driverId: z.string().regex(MONGO_OBJECT_ID, 'Select a driver'),
  vehicleId: z.string().regex(MONGO_OBJECT_ID, 'Select a vehicle'),
})

export type AssignDriverForm = z.infer<typeof assignDriverSchema>

export function buildAssignDriverPayload(form: AssignDriverForm) {
  return {
    driverId: form.driverId,
    vehicleId: form.vehicleId,
  }
}

export const allocateStudentSchema = z.object({
  studentId: z.string().regex(MONGO_OBJECT_ID, 'Select a student'),
  routeId: z.string().regex(MONGO_OBJECT_ID, 'Select a route'),
  vehicleId: z.string().regex(MONGO_OBJECT_ID, 'Select a vehicle'),
  stopName: z.string().trim().min(1, 'Stop name is required'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
})

export type AllocateStudentForm = z.infer<typeof allocateStudentSchema>

export function buildAllocateStudentPayload(form: AllocateStudentForm) {
  const payload: Record<string, unknown> = {
    studentId: form.studentId,
    routeId: form.routeId,
    vehicleId: form.vehicleId,
    stopName: form.stopName.trim(),
  }

  const lat = form.latitude?.trim() ? Number(form.latitude) : undefined
  const lng = form.longitude?.trim() ? Number(form.longitude) : undefined
  if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
    payload.location = { latitude: lat, longitude: lng }
  }

  return payload
}

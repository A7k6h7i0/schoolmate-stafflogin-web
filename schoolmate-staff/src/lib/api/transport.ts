import axios from 'axios'
import { apiClient } from './client'
import { unwrapData, unwrapList } from './helpers'
import type { TransportRoute, Vehicle, Driver } from '@/types/entities'
import {
  buildAllocateStudentPayload,
  buildAssignDriverPayload,
  buildCreateRoutePayload,
  buildCreateVehiclePayloadAttempts,
  type AllocateStudentForm,
  type AssignDriverForm,
  type CreateRouteForm,
  type CreateVehicleForm,
} from '@/lib/transport-form'

function normalizeRoute(raw: Record<string, unknown>): TransportRoute {
  const id = raw.id ?? raw._id ?? raw.routeId
  const stops = Array.isArray(raw.stops) ? (raw.stops as string[]) : undefined
  const name = raw.routeName ?? raw.name

  return {
    id: id != null ? String(id) : '',
    name: name != null ? String(name) : 'Unnamed route',
    startPoint:
      raw.startPoint != null
        ? String(raw.startPoint)
        : stops?.[0] ?? undefined,
    endPoint:
      raw.endPoint != null
        ? String(raw.endPoint)
        : stops && stops.length > 1
          ? stops[stops.length - 1]
          : undefined,
    stops,
    routeFare:
      typeof raw.fare === 'number'
        ? raw.fare
        : typeof raw.routeFare === 'number'
          ? raw.routeFare
          : undefined,
    status: raw.status != null ? String(raw.status) : undefined,
  }
}

function normalizeVehicle(raw: Record<string, unknown>): Vehicle {
  const id = raw.id ?? raw._id ?? raw.vehicleId
  const plate =
    raw.vehicleNumber ??
    raw.licensePlate ??
    raw.registrationNumber ??
    raw.plateNumber
  return {
    id: id != null ? String(id) : '',
    registrationNumber: plate != null ? String(plate) : '',
    capacity:
      typeof raw.capacity === 'number'
        ? raw.capacity
        : typeof raw.seatingCapacity === 'number'
          ? raw.seatingCapacity
          : undefined,
    model:
      raw.modelName != null
        ? String(raw.modelName)
        : raw.model != null
          ? String(raw.model)
          : raw.vehicleModel != null
            ? String(raw.vehicleModel)
            : undefined,
    status: raw.status != null ? String(raw.status) : undefined,
  }
}

export async function listRoutes() {
  const { data } = await apiClient.get('/transport/routes')
  const items = unwrapList<Record<string, unknown>>(data).items
  return items.map(normalizeRoute).filter((route) => route.id)
}

export async function createRoute(form: CreateRouteForm) {
  const payload = buildCreateRoutePayload(form)
  if (import.meta.env.DEV) {
    console.info('[transport] POST /transport/routes', JSON.stringify(payload))
  }
  const { data } = await apiClient.post('/transport/routes', payload)
  return unwrapData<TransportRoute>(data)
}

export async function listVehicles() {
  const { data } = await apiClient.get('/transport/vehicles')
  const items = unwrapList<Record<string, unknown>>(data).items
  return items.map(normalizeVehicle).filter((vehicle) => vehicle.id)
}

export async function createVehicle(form: CreateVehicleForm) {
  const attempts = buildCreateVehiclePayloadAttempts(form)
  let lastError: unknown

  for (const payload of attempts) {
    try {
      if (import.meta.env.DEV) {
        console.info('[transport] POST /transport/vehicles', JSON.stringify(payload))
      }
      const { data } = await apiClient.post('/transport/vehicles', payload)
      return unwrapData<Vehicle>(data)
    } catch (error) {
      lastError = error
      if (!axios.isAxiosError(error) || error.response?.status !== 400) {
        throw error
      }
      if (import.meta.env.DEV) {
        const message =
          (error.response?.data as { message?: string } | undefined)?.message ??
          JSON.stringify(error.response?.data)
        console.warn('[transport] vehicle payload rejected:', message)
      }
    }
  }

  throw lastError
}

export async function listDrivers() {
  const { data } = await apiClient.get('/transport/drivers')
  return unwrapList<Driver>(data).items
}

export async function assignDriver(form: AssignDriverForm) {
  const payload = buildAssignDriverPayload(form)
  if (import.meta.env.DEV) {
    console.info('[transport] POST /transport/drivers', JSON.stringify(payload))
  }
  const { data } = await apiClient.post('/transport/drivers', payload)
  return unwrapData(data)
}

export async function allocateStudent(form: AllocateStudentForm) {
  const payload = buildAllocateStudentPayload(form)
  if (import.meta.env.DEV) {
    console.info('[transport] POST /transport/allocations', JSON.stringify(payload))
  }
  const { data } = await apiClient.post('/transport/allocations', payload)
  return unwrapData(data)
}

export async function getStudentAllocation(studentId: string) {
  const { data } = await apiClient.get(`/transport/allocations/student/${studentId}`)
  return unwrapData(data)
}

export async function getRouteAllocations(routeId: string) {
  const { data } = await apiClient.get(`/transport/routes/${routeId}/allocations`)
  return unwrapData(data)
}

export async function getRouteLocation(routeId: string) {
  const { data } = await apiClient.get(`/transport/routes/${routeId}/location`)
  return unwrapData(data)
}

export async function updateRouteLocation(routeId: string, payload: { latitude: number; longitude: number }) {
  const { data } = await apiClient.post(`/transport/routes/${routeId}/location`, payload)
  return unwrapData(data)
}

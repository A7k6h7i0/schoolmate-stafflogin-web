import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import {
  allocateStudent,
  assignDriver,
  createRoute,
  createVehicle,
  listDrivers,
  listRoutes,
  listVehicles,
  updateRouteLocation,
} from '@/lib/api/transport'
import { getErrorMessage } from '@/lib/api/client'
import {
  allocateStudentSchema,
  assignDriverSchema,
  createRouteSchema,
  createVehicleSchema,
} from '@/lib/transport-form'
import { formatEmployeeName, listEmployees } from '@/lib/api/hr'
import { listStudents } from '@/lib/api/students'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingTable } from '@/components/shared/LoadingTable'
import { FormErrorSummary } from '@/components/shared/FormErrorSummary'
import { FormFieldError } from '@/components/shared/FormFieldError'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function TransportPage() {
  const queryClient = useQueryClient()
  const [routeOpen, setRouteOpen] = useState(false)
  const [vehicleOpen, setVehicleOpen] = useState(false)
  const [driverOpen, setDriverOpen] = useState(false)
  const [allocOpen, setAllocOpen] = useState(false)
  const [gpsOpen, setGpsOpen] = useState(false)
  const [routeForm, setRouteForm] = useState({
    routeName: '',
    routeFare: '',
    startPoint: '',
    endPoint: '',
  })
  const [routeErrors, setRouteErrors] = useState<Record<string, string>>({})
  const [vehicleForm, setVehicleForm] = useState({
    licensePlate: '',
    capacity: '',
    vehicleType: 'BUS',
    modelName: '',
  })
  const [vehicleErrors, setVehicleErrors] = useState<Record<string, string>>({})
  const [driverForm, setDriverForm] = useState({ driverId: '', vehicleId: '' })
  const [driverErrors, setDriverErrors] = useState<Record<string, string>>({})
  const [allocForm, setAllocForm] = useState({
    studentId: '',
    routeId: '',
    vehicleId: '',
    stopName: '',
    latitude: '',
    longitude: '',
  })
  const [allocErrors, setAllocErrors] = useState<Record<string, string>>({})
  const [gpsForm, setGpsForm] = useState({ routeId: '', latitude: '', longitude: '' })

  const { data: routes = [], isLoading: routesLoading } = useQuery({ queryKey: ['routes'], queryFn: listRoutes })
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({ queryKey: ['vehicles'], queryFn: listVehicles })
  const { data: drivers = [], isLoading: driversLoading } = useQuery({ queryKey: ['drivers'], queryFn: listDrivers })
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => listEmployees({ limit: 100 }),
  })
  const { data: studentsData } = useQuery({
    queryKey: ['students-all'],
    queryFn: () => listStudents({ limit: 100 }),
  })
  const driverOptions = (employeesData?.items ?? []).filter((e) => e.role === 'DRIVER')

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['routes'] })
    queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    queryClient.invalidateQueries({ queryKey: ['drivers'] })
  }

  const routeMut = useMutation({
    mutationFn: () => {
      const parsed = createRouteSchema.safeParse(routeForm)
      if (!parsed.success) {
        const errors: Record<string, string> = {}
        parsed.error.issues.forEach((issue) => {
          errors[String(issue.path[0] ?? 'form')] = issue.message
        })
        setRouteErrors(errors)
        throw new Error('validation')
      }
      setRouteErrors({})
      return createRoute(parsed.data)
    },
    onSuccess: () => {
      toast.success('Route created')
      invalidate()
      setRouteOpen(false)
      setRouteForm({ routeName: '', routeFare: '', startPoint: '', endPoint: '' })
    },
    onError: (e) => {
      if (e instanceof Error && e.message === 'validation') {
        toast.error('Please fix the highlighted fields')
        return
      }
      toast.error(getErrorMessage(e))
    },
  })
  const vehicleMut = useMutation({
    mutationFn: () => {
      const parsed = createVehicleSchema.safeParse(vehicleForm)
      if (!parsed.success) {
        const errors: Record<string, string> = {}
        parsed.error.issues.forEach((issue) => {
          errors[String(issue.path[0] ?? 'form')] = issue.message
        })
        setVehicleErrors(errors)
        throw new Error('validation')
      }
      setVehicleErrors({})
      return createVehicle(parsed.data)
    },
    onSuccess: () => {
      toast.success('Vehicle registered')
      invalidate()
      setVehicleOpen(false)
      setVehicleForm({ licensePlate: '', capacity: '', vehicleType: 'BUS', modelName: '' })
    },
    onError: (e) => {
      if (e instanceof Error && e.message === 'validation') {
        toast.error('Please fix the highlighted fields')
        return
      }
      toast.error(getErrorMessage(e))
    },
  })
  const driverMut = useMutation({
    mutationFn: () => {
      const parsed = assignDriverSchema.safeParse(driverForm)
      if (!parsed.success) {
        const errors: Record<string, string> = {}
        parsed.error.issues.forEach((issue) => {
          errors[String(issue.path[0] ?? 'form')] = issue.message
        })
        setDriverErrors(errors)
        throw new Error('validation')
      }
      setDriverErrors({})
      return assignDriver(parsed.data)
    },
    onSuccess: () => {
      toast.success('Driver assigned')
      invalidate()
      setDriverOpen(false)
      setDriverForm({ driverId: '', vehicleId: '' })
    },
    onError: (e) => {
      if (e instanceof Error && e.message === 'validation') {
        toast.error('Please fix the highlighted fields')
        return
      }
      toast.error(getErrorMessage(e))
    },
  })
  const allocMut = useMutation({
    mutationFn: () => {
      const parsed = allocateStudentSchema.safeParse(allocForm)
      if (!parsed.success) {
        const errors: Record<string, string> = {}
        parsed.error.issues.forEach((issue) => {
          errors[String(issue.path[0] ?? 'form')] = issue.message
        })
        setAllocErrors(errors)
        throw new Error('validation')
      }
      setAllocErrors({})
      return allocateStudent(parsed.data)
    },
    onSuccess: () => {
      toast.success('Student allocated')
      setAllocOpen(false)
      setAllocForm({ studentId: '', routeId: '', vehicleId: '', stopName: '', latitude: '', longitude: '' })
    },
    onError: (e) => {
      if (e instanceof Error && e.message === 'validation') {
        toast.error('Please fix the highlighted fields')
        return
      }
      toast.error(getErrorMessage(e))
    },
  })
  const gpsMut = useMutation({
    mutationFn: () => updateRouteLocation(gpsForm.routeId, {
      latitude: Number(gpsForm.latitude),
      longitude: Number(gpsForm.longitude),
    }),
    onSuccess: () => { toast.success('GPS updated'); setGpsOpen(false) },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div>
      <PageHeader title="Transport" description="Routes, vehicles, drivers, allocations, and GPS telemetry." />
      <Tabs defaultValue="routes">
        <TabsList>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setRouteErrors({})
                setRouteOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Add route
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAllocOpen(true)}>Allocate student</Button>
            <Button size="sm" variant="outline" onClick={() => setGpsOpen(true)}><MapPin className="h-4 w-4" />Update GPS</Button>
          </div>
          {routesLoading ? <LoadingTable /> : routes.length === 0 ? <EmptyState /> : (
            <div className="grid gap-4 md:grid-cols-2">
              {routes.map((r) => (
                <div key={r.id} className="rounded-xl border p-4">
                  <h3 className="font-semibold">{r.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {r.startPoint && r.endPoint ? `${r.startPoint} → ${r.endPoint}` : r.stops?.join(' → ') ?? '—'}
                  </p>
                  {r.routeFare != null && (
                    <p className="text-xs text-muted-foreground mt-1">₹{r.routeFare.toLocaleString('en-IN')}/month</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vehicles">
          <Button
            size="sm"
            className="mb-4"
            onClick={() => {
              setVehicleErrors({})
              setVehicleOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Add vehicle
          </Button>
          {vehiclesLoading ? <LoadingTable /> : vehicles.length === 0 ? <EmptyState /> : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left">Registration</th><th className="px-4 py-3 text-left">Model</th><th className="px-4 py-3 text-left">Capacity</th></tr></thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id} className="border-t">
                      <td className="px-4 py-3">{v.registrationNumber}</td>
                      <td className="px-4 py-3">{v.model ?? '—'}</td>
                      <td className="px-4 py-3">{v.capacity ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="drivers">
          <Button size="sm" className="mb-4" onClick={() => setDriverOpen(true)}><Plus className="h-4 w-4" />Assign driver</Button>
          {driversLoading ? <LoadingTable /> : drivers.length === 0 ? <EmptyState /> : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left">Driver</th><th className="px-4 py-3 text-left">License</th></tr></thead>
                <tbody>
                  {drivers.map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="px-4 py-3">{d.name ?? d.employeeId}</td>
                      <td className="px-4 py-3">{d.licenseNumber ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={routeOpen} onOpenChange={setRouteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add route</DialogTitle>
            <DialogDescription>
              Route name and monthly fare (₹) are required. Start/end points become stop names in the route.
            </DialogDescription>
          </DialogHeader>
          <FormErrorSummary errors={routeErrors} />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Route name *</Label>
              <Input
                value={routeForm.routeName}
                onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                placeholder="Route 7 — Koramangala to School"
                className={routeErrors.routeName ? 'border-destructive' : ''}
              />
              <FormFieldError message={routeErrors.routeName} />
            </div>
            <div className="space-y-2">
              <Label>Monthly fare (₹) *</Label>
              <Input
                type="number"
                value={routeForm.routeFare}
                onChange={(e) => setRouteForm({ ...routeForm, routeFare: e.target.value })}
                placeholder="1800"
                className={routeErrors.routeFare ? 'border-destructive' : ''}
              />
              <FormFieldError message={routeErrors.routeFare} />
            </div>
            <div className="space-y-2">
              <Label>Start point *</Label>
              <Input
                value={routeForm.startPoint}
                onChange={(e) => setRouteForm({ ...routeForm, startPoint: e.target.value })}
                placeholder="Bus Station Alpha"
                className={routeErrors.startPoint ? 'border-destructive' : ''}
              />
              <FormFieldError message={routeErrors.startPoint} />
            </div>
            <div className="space-y-2">
              <Label>End point *</Label>
              <Input
                value={routeForm.endPoint}
                onChange={(e) => setRouteForm({ ...routeForm, endPoint: e.target.value })}
                placeholder="School campus"
                className={routeErrors.endPoint ? 'border-destructive' : ''}
              />
              <FormFieldError message={routeErrors.endPoint} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => routeMut.mutate()} disabled={routeMut.isPending}>
              {routeMut.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={vehicleOpen} onOpenChange={setVehicleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register vehicle</DialogTitle>
            <DialogDescription>
              Vehicle number, model name, and capacity are required (e.g. KA-09-AB-1234, Tata Starbus).
            </DialogDescription>
          </DialogHeader>
          <FormErrorSummary errors={vehicleErrors} />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vehicle number *</Label>
              <Input
                value={vehicleForm.licensePlate}
                onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value })}
                placeholder="KA-09-AB-1234"
                className={vehicleErrors.licensePlate ? 'border-destructive' : ''}
              />
              <FormFieldError message={vehicleErrors.licensePlate} />
            </div>
            <div className="space-y-2">
              <Label>Vehicle type *</Label>
              <Select
                value={vehicleForm.vehicleType}
                onValueChange={(v) => setVehicleForm({ ...vehicleForm, vehicleType: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUS">Bus</SelectItem>
                  <SelectItem value="MINIBUS">Minibus</SelectItem>
                  <SelectItem value="VAN">Van</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model name *</Label>
              <Input
                value={vehicleForm.modelName}
                onChange={(e) => setVehicleForm({ ...vehicleForm, modelName: e.target.value })}
                placeholder="e.g. Tata Starbus"
                className={vehicleErrors.modelName ? 'border-destructive' : ''}
              />
              <FormFieldError message={vehicleErrors.modelName} />
            </div>
            <div className="space-y-2">
              <Label>Capacity *</Label>
              <Input
                type="number"
                value={vehicleForm.capacity}
                onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                placeholder="Seating capacity"
                className={vehicleErrors.capacity ? 'border-destructive' : ''}
              />
              <FormFieldError message={vehicleErrors.capacity} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => vehicleMut.mutate()} disabled={vehicleMut.isPending}>
              {vehicleMut.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={driverOpen} onOpenChange={setDriverOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign driver</DialogTitle>
            <DialogDescription>Select a DRIVER-role employee and a registered vehicle.</DialogDescription>
          </DialogHeader>
          <FormErrorSummary errors={driverErrors} />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Driver *</Label>
              <Select
                value={driverForm.driverId || undefined}
                onValueChange={(v) => setDriverForm({ ...driverForm, driverId: v })}
              >
                <SelectTrigger className={driverErrors.driverId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {driverOptions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {formatEmployeeName(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormFieldError message={driverErrors.driverId} />
            </div>
            <div className="space-y-2">
              <Label>Vehicle *</Label>
              <Select
                value={driverForm.vehicleId || undefined}
                onValueChange={(v) => setDriverForm({ ...driverForm, vehicleId: v })}
              >
                <SelectTrigger className={driverErrors.vehicleId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.registrationNumber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormFieldError message={driverErrors.vehicleId} />
            </div>
          </div>
          <DialogFooter><Button onClick={() => driverMut.mutate()}>Assign</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={allocOpen} onOpenChange={setAllocOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate student to route</DialogTitle>
            <DialogDescription>Links a student to a route stop and vehicle.</DialogDescription>
          </DialogHeader>
          <FormErrorSummary errors={allocErrors} />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Student *</Label>
              <Select
                value={allocForm.studentId || undefined}
                onValueChange={(v) => setAllocForm({ ...allocForm, studentId: v })}
              >
                <SelectTrigger className={allocErrors.studentId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {studentsData?.items.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormFieldError message={allocErrors.studentId} />
            </div>
            <div className="space-y-2">
              <Label>Route *</Label>
              <Select
                value={allocForm.routeId || undefined}
                onValueChange={(v) => setAllocForm({ ...allocForm, routeId: v })}
              >
                <SelectTrigger className={allocErrors.routeId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormFieldError message={allocErrors.routeId} />
            </div>
            <div className="space-y-2">
              <Label>Vehicle *</Label>
              <Select
                value={allocForm.vehicleId || undefined}
                onValueChange={(v) => setAllocForm({ ...allocForm, vehicleId: v })}
              >
                <SelectTrigger className={allocErrors.vehicleId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.registrationNumber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormFieldError message={allocErrors.vehicleId} />
            </div>
            <div className="space-y-2">
              <Label>Stop name *</Label>
              <Input
                value={allocForm.stopName}
                onChange={(e) => setAllocForm({ ...allocForm, stopName: e.target.value })}
                placeholder="Potter Residence Stop"
                className={allocErrors.stopName ? 'border-destructive' : ''}
              />
              <FormFieldError message={allocErrors.stopName} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Latitude (optional)</Label>
                <Input
                  value={allocForm.latitude}
                  onChange={(e) => setAllocForm({ ...allocForm, latitude: e.target.value })}
                  placeholder="29.599"
                />
              </div>
              <div className="space-y-2">
                <Label>Longitude (optional)</Label>
                <Input
                  value={allocForm.longitude}
                  onChange={(e) => setAllocForm({ ...allocForm, longitude: e.target.value })}
                  placeholder="77.445"
                />
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={() => allocMut.mutate()}>Allocate</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={gpsOpen} onOpenChange={setGpsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update route GPS</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input value={gpsForm.routeId} onChange={(e) => setGpsForm({ ...gpsForm, routeId: e.target.value })} placeholder="Route ID" />
            <Input value={gpsForm.latitude} onChange={(e) => setGpsForm({ ...gpsForm, latitude: e.target.value })} placeholder="Latitude" />
            <Input value={gpsForm.longitude} onChange={(e) => setGpsForm({ ...gpsForm, longitude: e.target.value })} placeholder="Longitude" />
          </div>
          <DialogFooter><Button onClick={() => gpsMut.mutate()}>Update</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

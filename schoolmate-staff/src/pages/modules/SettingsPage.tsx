import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { ROLE_LABELS } from '@/config/roles'
import { isStaffRole } from '@/config/roles'
import { registerFcmToken, deregisterFcmToken } from '@/lib/api/notifications'
import { getErrorMessage } from '@/lib/api/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const schoolId = useAuthStore((s) => s.schoolId)
  const [fcmToken, setFcmToken] = useState('')

  const registerMut = useMutation({
    mutationFn: () => registerFcmToken(fcmToken),
    onSuccess: () => toast.success('FCM token registered'),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const deregisterMut = useMutation({
    mutationFn: () => deregisterFcmToken(fcmToken),
    onSuccess: () => toast.success('FCM token removed'),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div>
      <PageHeader title="Settings" description="Profile and push notification configuration." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
            <CardDescription>Active session from login</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email / Username</p>
              <p className="font-medium">{user?.email ?? user?.username ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              {user?.role && isStaffRole(user.role) ? (
                <Badge>{ROLE_LABELS[user.role]}</Badge>
              ) : (
                <p>—</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">School ID</p>
              <p className="font-mono text-sm">{schoolId ?? user?.schoolId ?? '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Push notifications (FCM)</CardTitle>
            <CardDescription>Register device token for Firebase Cloud Messaging</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>FCM device token</Label>
              <Input
                value={fcmToken}
                onChange={(e) => setFcmToken(e.target.value)}
                placeholder="Paste FCM token from mobile/web client"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => registerMut.mutate()} disabled={!fcmToken || registerMut.isPending}>
                Register token
              </Button>
              <Button
                variant="outline"
                onClick={() => deregisterMut.mutate()}
                disabled={!fcmToken || deregisterMut.isPending}
              >
                Remove token
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

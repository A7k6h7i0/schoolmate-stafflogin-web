import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { GraduationCap, Loader2, Lock, Mail, School, User } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const loginSchema = z
  .object({
    schoolId: z.string().min(24, 'School ID must be a valid MongoDB ObjectId (24 characters)'),
    loginMethod: z.enum(['email', 'username']),
    email: z.string().optional(),
    username: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .superRefine((data, ctx) => {
    if (data.loginMethod === 'email' && !data.email?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Email is required', path: ['email'] })
    }
    if (data.loginMethod === 'username' && !data.username?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Username is required', path: ['username'] })
    }
    if (data.loginMethod === 'email' && data.email) {
      const emailResult = z.email().safeParse(data.email)
      if (!emailResult.success) {
        ctx.addIssue({ code: 'custom', message: 'Enter a valid email', path: ['email'] })
      }
    }
  })

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  const [loginMethod, setLoginMethod] = useState<'email' | 'username'>('email')

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, from, navigate])

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      schoolId: '',
      loginMethod: 'email',
      email: '',
      username: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginForm) => {
    clearError()
    try {
      await login({
        schoolId: data.schoolId.trim(),
        password: data.password,
        ...(data.loginMethod === 'email'
          ? { email: data.email?.trim() }
          : { username: data.username?.trim() }),
      })
      navigate(from, { replace: true })
    } catch {
      // error stored in auth store
    }
  }

  const switchMethod = (method: 'email' | 'username') => {
    setLoginMethod(method)
    form.setValue('loginMethod', method)
    clearError()
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/30" />
      <div
        className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16"
        >
          <div className="mx-auto max-w-lg">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Schoolmate</h1>
                <p className="text-muted-foreground">Staff Administration Portal</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
              Manage your school
              <span className="text-primary"> with confidence</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Secure staff portal for attendance, academics, finance, HR, transport, library, and
              more — powered by your Schoolmate ERP backend.
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {['12 operational modules', 'Role-based access', 'Real-time analytics', 'Secure JWT auth'].map(
                (item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-lg border bg-card/60 px-4 py-3 text-sm backdrop-blur-sm"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16"
        >
          <Card className="w-full max-w-md border-0 bg-card/90 shadow-2xl backdrop-blur-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Staff sign in</CardTitle>
              <CardDescription>
                Enter your school ID and credentials to access the portal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolId">School ID</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="schoolId"
                      placeholder="60d21b4667d0d8992e610c85"
                      className="pl-10"
                      {...form.register('schoolId')}
                    />
                  </div>
                  {form.formState.errors.schoolId && (
                    <p className="text-sm text-destructive">{form.formState.errors.schoolId.message}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={loginMethod === 'email' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => switchMethod('email')}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={loginMethod === 'username' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => switchMethod('username')}
                  >
                    <User className="h-4 w-4" />
                    Username
                  </Button>
                </div>

                {loginMethod === 'email' ? (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@school.edu"
                        className="pl-10"
                        {...form.register('email')}
                      />
                    </div>
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="username"
                        placeholder="staff_username"
                        className="pl-10"
                        {...form.register('username')}
                      />
                    </div>
                    {form.formState.errors.username && (
                      <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      {...form.register('password')}
                    />
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in to portal'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  )
}

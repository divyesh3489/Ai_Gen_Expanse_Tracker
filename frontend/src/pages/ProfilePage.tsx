import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { getErrorMessage } from '../app/api/error'
import { useAuth } from '../app/auth/AuthContext'
import { getMe, patchMe, requestPasswordReset, uploadProfilePicture, type UpdateMePayload } from '../features/user/api'

export function ProfilePage() {
  const { user, refreshMe } = useAuth()
  const queryClient = useQueryClient()

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { data: me, isLoading: isMeLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    placeholderData: user ?? undefined,
  })

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateMePayload) => patchMe(payload),
    onSuccess: async () => {
      setSuccess('Profile updated.')
      setError(null)
      await refreshMe()
    },
    onError: (err: unknown) => {
      setSuccess(null)
      setError(getErrorMessage(err, 'Failed to update profile.'))
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadProfilePicture(file),
    onSuccess: async (data) => {
      setSuccess('Profile picture updated.')
      setError(null)
      queryClient.setQueryData(['me'], (prev: unknown) => {
        if (!prev || typeof prev !== 'object') return prev
        return { ...(prev as Record<string, unknown>), profile_picture: data.profile_picture }
      })
      queryClient.invalidateQueries({ queryKey: ['me'] })
      await refreshMe()
    },
    onError: (err: unknown) => {
      setSuccess(null)
      setError(getErrorMessage(err, 'Failed to upload profile picture.'))
    },
  })

  const passwordResetMutation = useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
    onSuccess: (res) => {
      setError(null)
      setSuccess(res.message || 'Password reset link sent. Please check your email.')
    },
    onError: (err: unknown) => {
      setSuccess(null)
      setError(getErrorMessage(err, 'Failed to send password reset link.'))
    },
  })

  const isBusy = isMeLoading || updateMutation.isPending || uploadMutation.isPending

  const previewName =
    (typeof me?.full_name === 'string' && me.full_name.trim()) ||
    `${me?.first_name ?? ''} ${me?.last_name ?? ''}`.trim() ||
    me?.email ||
    'User'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const form = new FormData(e.currentTarget as HTMLFormElement)
    const firstName = (form.get('first_name') ?? '').toString().trim()
    const lastName = (form.get('last_name') ?? '').toString().trim()
    const genderRaw = (form.get('gender') ?? '').toString().trim()
    const dob = (form.get('dob') ?? '').toString().trim()

    const payload: UpdateMePayload = {
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      gender: genderRaw === 'male' || genderRaw === 'female' ? genderRaw : null,
      dob: dob || null,
    }

    updateMutation.mutate(payload)
  }

  function onPickFile() {
    fileInputRef.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setSuccess(null)
    uploadMutation.mutate(file)
  }

  function onSendPasswordReset() {
    const email = me?.email || user?.email
    if (!email) {
      setSuccess(null)
      setError('Email not available for this account.')
      return
    }
    setError(null)
    setSuccess(null)
    passwordResetMutation.mutate(email)
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold text-slate-900 dark:text-slate-50">Profile</div>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Update your personal details. Email can’t be changed.
        </div>
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60">
              {me?.profile_picture ? (
                <img src={me.profile_picture} alt={previewName} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {previewName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">{previewName}</div>
              <div className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{me?.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
              aria-label="Upload profile picture"
            />
            <Button type="button" variant="secondary" onClick={onPickFile} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4 border-slate-400/40 border-t-slate-700" />
                  Uploading…
                </>
              ) : (
                'Change photo'
              )}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input label="Email" value={me?.email ?? ''} disabled />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              name="first_name"
              defaultValue={me?.first_name ?? ''}
              placeholder="First name"
            />
            <Input
              label="Last name"
              name="last_name"
              defaultValue={me?.last_name ?? ''}
              placeholder="Last name"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Gender</div>
              <select
                name="gender"
                defaultValue={me?.gender ?? ''}
                className={
                  'h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition ' +
                  'border-slate-200 text-slate-900 focus:border-slate-300 focus:ring-2 focus:ring-slate-400/20 ' +
                  'dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50 dark:focus:border-slate-700 dark:focus:ring-slate-300/20'
                }
              >
                <option value="">Not set</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>

            <Input
              label="Date of birth"
              type="date"
              name="dob"
              defaultValue={me?.dob ?? ''}
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/25 dark:text-emerald-200">
              {success}
            </div>
          ) : null}

          <Button type="submit" disabled={isBusy}>
            {updateMutation.isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4 border-white/40 border-t-white dark:border-slate-400/40 dark:border-t-slate-900" />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Reset password</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              We’ll email you a password reset link.
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={onSendPasswordReset}
            disabled={passwordResetMutation.isPending}
          >
            {passwordResetMutation.isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4 border-slate-400/40 border-t-slate-700" />
                Sending…
              </>
            ) : (
              'Send reset email'
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}


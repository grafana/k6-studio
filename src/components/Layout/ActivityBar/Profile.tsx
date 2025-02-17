import { PersonIcon } from '@radix-ui/react-icons'
import {
  Button,
  Dialog,
  Flex,
  IconButton,
  Spinner,
  Tooltip,
} from '@radix-ui/themes'
import { useEffect, useState } from 'react'

interface ConfirmState {
  type: 'confirm'
}

interface InitializingState {
  type: 'initializing'
}

interface CodeState {
  type: 'code'
  code: string
}

type SignInState = ConfirmState | InitializingState | CodeState

interface SignInProps {
  onProfileChange: (profile: UserProfile) => void
}

function SignIn({ onProfileChange }: SignInProps) {
  const [state, setState] = useState<SignInState>({
    type: 'confirm',
  })

  function handleSignIn() {
    setState({
      type: 'initializing',
    })

    window.studio.auth
      .signIn()
      .then((profile) => {
        onProfileChange(profile)
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setState({
          type: 'confirm',
        })
      })
  }

  useEffect(() => {
    return window.studio.auth.onUserCode((code) => {
      setState({
        type: 'code',
        code,
      })
    })
  }, [])

  if (state.type === 'confirm') {
    return <Button onClick={handleSignIn}>Sign in</Button>
  }

  if (state.type === 'initializing') {
    return (
      <Flex align="center" gap="2">
        <Spinner /> Opening Grafana Cloud...
      </Flex>
    )
  }

  return (
    <div>
      Your code is <code>{state.code}</code>.
    </div>
  )
}

interface SignOutProps {
  onProfileChange: (profile: UserProfile) => void
}

function SignOut({ onProfileChange }: SignOutProps) {
  function handleSignOut() {
    window.studio.auth
      .signOut()
      .then(() => {
        onProfileChange({
          type: 'anonymous',
        })
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return <Button onClick={handleSignOut}>Sign out</Button>
}

interface AnonymousProfile {
  type: 'anonymous'
}

interface CloudProfile {
  type: 'cloud'
  username: string
}

export type UserProfile = AnonymousProfile | CloudProfile

export function Profile() {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({ type: 'anonymous' })

  useEffect(() => {
    window.studio.auth
      .getProfile()
      .then((profile) => {
        setProfile(profile)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [])

  function handleProfileChange(profile: UserProfile) {
    setProfile(profile)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Tooltip
        content={
          profile.type === 'anonymous'
            ? 'Sign in'
            : `Signed in as ${profile.username}`
        }
      >
        <Dialog.Trigger>
          <IconButton variant="outline" size="4">
            <PersonIcon width="24" height="24" strokeWidth="1" />
          </IconButton>
        </Dialog.Trigger>
      </Tooltip>
      <Dialog.Content>
        <Dialog.Title>
          {profile.type === 'anonymous'
            ? 'Not signed in'
            : `Signed in as ${profile.username}`}
        </Dialog.Title>
        <Dialog.Description>
          <Flex justify="center" align="center">
            {profile.type === 'anonymous' && (
              <SignIn onProfileChange={handleProfileChange} />
            )}
            {profile.type === 'cloud' && (
              <SignOut onProfileChange={handleProfileChange} />
            )}
          </Flex>
        </Dialog.Description>
      </Dialog.Content>
    </Dialog.Root>
  )
}

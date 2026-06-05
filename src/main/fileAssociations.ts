import { execFileSync } from 'child_process'
import log from 'electron-log/main'

interface FileAssociation {
  ext: string
  progId: string
  friendlyName: string
}

const FILE_ASSOCIATIONS: FileAssociation[] = [
  {
    ext: 'k6g',
    progId: 'k6Studio.k6g',
    friendlyName: 'k6 Studio Generator File',
  },
  {
    ext: 'k6b',
    progId: 'k6Studio.k6b',
    friendlyName: 'k6 Studio Browser Recording',
  },
]

const SQUIRREL_EVENTS = [
  '--squirrel-install',
  '--squirrel-updated',
  '--squirrel-uninstall',
  '--squirrel-obsolete',
] as const

type SquirrelEvent = (typeof SQUIRREL_EVENTS)[number]

function isSquirrelEvent(arg: string): arg is SquirrelEvent {
  return (SQUIRREL_EVENTS as readonly string[]).includes(arg)
}

/**
 * Handles Squirrel.Windows lifecycle events (install, update, uninstall).
 * Registers or unregisters file associations in the Windows registry and
 * quits the app, as required by the Squirrel protocol.
 *
 * Returns true if a Squirrel event was handled (the app will quit).
 */
export function handleWindowsInstall(): boolean {
  if (process.platform !== 'win32') {
    return false
  }

  const squirrelEvent = process.argv[1]

  if (!squirrelEvent || !isSquirrelEvent(squirrelEvent)) {
    return false
  }

  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      registerFileAssociations(process.execPath)
      break

    case '--squirrel-uninstall':
      unregisterFileAssociations()
      break
  }

  return true
}

function registerFileAssociations(exePath: string) {
  for (const { ext, progId, friendlyName } of FILE_ASSOCIATIONS) {
    try {
      execFileSync('reg', [
        'add',
        `HKCU\\Software\\Classes\\.${ext}`,
        '/ve',
        '/d',
        progId,
        '/f',
      ])
      execFileSync('reg', [
        'add',
        `HKCU\\Software\\Classes\\${progId}`,
        '/ve',
        '/d',
        friendlyName,
        '/f',
      ])
      execFileSync('reg', [
        'add',
        `HKCU\\Software\\Classes\\${progId}\\shell\\open\\command`,
        '/ve',
        '/d',
        `"${exePath}" "%1"`,
        '/f',
      ])
    } catch (err) {
      log.error(`Failed to register file association for .${ext}:`, err)
    }
  }
}

function unregisterFileAssociations() {
  for (const { ext, progId } of FILE_ASSOCIATIONS) {
    try {
      execFileSync('reg', ['delete', `HKCU\\Software\\Classes\\.${ext}`, '/f'])
    } catch {
      // Registry key may not exist; ignore
    }

    try {
      execFileSync('reg', [
        'delete',
        `HKCU\\Software\\Classes\\${progId}`,
        '/f',
      ])
    } catch {
      // Registry key may not exist; ignore
    }
  }
}

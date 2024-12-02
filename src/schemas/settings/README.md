# Settings migration

Migrations are needed when changing the structure of existing settings file such as renaming or deleting keys.

If you're simply adding new options to the settings file, a migration is not needed. In this case, extend the latest schema available.

## Creating a new migration

For when a new migration is needed:

1. Create a directory for the new version (e.g. `/v2`).
2. Declare the new schema with appropriate changes.
3. In `/v2/index.ts`, implement a `migrate` function that takes a `v2` schema and returns a `v3` schema.
4. Update `/schemas/settings/index.ts` to use the new version:

```ts
function migrate(settings: z.infer<typeof AnySettingSchema>) {

case '2.0':
  return migrate(v2.migrate(settings))

}
```

5. Update `src/types/settings.ts` to use types from the new version.
6. Update the default settings in `src/settings.ts` according to the new schema.
7. Make changes to the remaining implementation to use the new schema.

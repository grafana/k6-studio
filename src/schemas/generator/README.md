# Generator migration

Migrations are needed when changing the structure of existing generators file such as renaming or deleting keys.

If you're simply adding new options to the generator file, a migration may not be needed. In this case, extend the latest schema available.

## Creating a new migration

For when a new migration is needed:

1. Create a directory for the new version (e.g. `/v2`).
2. Declare the new schema with appropriate changes.
3. In `/v1/index.ts`, implement a `migrate` function that takes a `v1` schema and returns a `v2` schema.
4. Update `/schemas/generators/index.ts` to use the new version:

```ts
function migrate(settings: z.infer<typeof AnySettingSchema>) {

case '1.0':
  return migrate(v1.migrate(settings))

}
```

5. Make changes to the remaining implementation to use the new schema.

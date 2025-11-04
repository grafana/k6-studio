# Settings migration

Migrations are needed when changing the structure of existing settings file such as renaming or deleting keys.

If you're simply adding new options to the settings file, a migration is not needed. In this case, extend the latest schema available.

## Creating a new migration

Let's say the current version is `v2` and you want to add a `v3` schema.

1. Create a copy of the `v2` directory and rename the copy to `v3`
  
   > NOTE: it's important to work with a copy the *entire* schema, otherwise you might accidentally make breaking changes to previous versions of the schema.

2. Make the necessary changes to the schema in `v3`.
3. In `/v2/index.ts`, implement a `migrate` function that takes a `v2` schema and returns a `v3` schema.
4. Update `/schemas/settings/index.ts` to use the new version:

```ts
function migrate(settings: z.infer<typeof AnySettingSchema>) {

case '2.0':
  return migrate(v2.migrate(settings))

}
```

5. Export types from the new version in `/schemas/settings/index.ts`.
6. Update the default settings in `src/settings.ts` according to the new schema.
7. Make changes to the remaining implementation to use the new schema.

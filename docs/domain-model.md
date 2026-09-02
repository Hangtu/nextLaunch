# Domain Model

> Read before touching `src/lib/db/schema.ts` or writing a migration.
> Update this file in the same change whenever the schema changes — it's
> the map from "what's in the database" to "why", which the schema file
> alone doesn't carry.

## Current entities

### `users` (`src/lib/db/schema.ts`)

Example table — synced from Clerk via the `user.created` /
`user.updated` / `user.deleted` events in
`src/app/api/webhooks/clerk/route.ts` (currently stubbed with `TODO`s).

| Column                      | Type             | Notes                                     |
| --------------------------- | ---------------- | ----------------------------------------- |
| `id`                        | `uuid`, PK       | Generated, internal ID — not the Clerk ID |
| `clerk_id`                  | `text`, unique   | Foreign identity from Clerk               |
| `email`                     | `text`, unique   |                                           |
| `name`                      | `text`, nullable |                                           |
| `created_at` / `updated_at` | `timestamptz`    | Defaults to `now()`                       |

**Why a separate `users` table at all, given Clerk already has one:** so
domain tables can foreign-key to a local ID instead of a Clerk ID, and so
the app has somewhere to store fields Clerk doesn't model (roles live in
Clerk's `publicMetadata` today — see `src/lib/constants.ts`, but a
project with more than two roles will likely want them here instead).

## Adding a domain entity

1. Add the table to `src/lib/db/schema.ts`.
2. `npm run db:push` (dev) or `db:generate` + `db:migrate` if you've
   started using migrations instead of push.
3. Add a Zod schema in `src/schemas/`.
4. Add DAL functions in `src/data/<entity>.ts` — pure queries only.
5. Add Server Actions in `src/actions/<entity>.ts` following
   `example.ts`'s `requireAuth → validate → DAL → logger → ActionResponse`
   shape.
6. Document the entity in this file: what it is, its lifecycle, and any
   non-obvious constraint (soft delete? who can see it? does deleting it
   cascade anywhere?).

_(No project-specific entities yet — this section grows with the first
real feature.)_

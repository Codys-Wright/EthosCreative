# Worker w0-2 Progress

## ethos-17x.14: Implement Student Enrollment System

### What was done
- Added `EnrollmentWithUser` schema for admin dashboard views (JOINs enrollment with user name/email/image)
- Added 3 new RPC endpoints: `enrollSelf`, `listByCourseWithUsers`, `cancelEnrollment`
- Course overview page now shows enrollment CTA ("Enroll Now — Free") for non-enrolled users
- Dashboard and lesson pages gated by enrollment status (free/preview lessons remain accessible)
- Admin dashboard replaced mock student data with real enrollment queries
- Admin can add students by user ID and remove enrollments via UI

### Key learnings
- The enrollment backend (data model, repo, service, RPC definitions) was already fully implemented — the work was purely frontend integration
- `AtomRpc.Tag` `.runtime.fn<T>()` atoms are called via `useAtomSet()` and return promises with `_tag: "Right"/"Left"` (Effect Exit pattern)
- `AuthContext` middleware in RPC handlers provides `userId` without client needing to send it — used for `enrollSelf`
- Column mapping pattern: SQL uses `snake_case`, TypeScript uses `camelCase` — managed via `AS "camelCase"` in SELECT queries
- `"user"` table name needs quotes in SQL because `user` is a reserved word in PostgreSQL

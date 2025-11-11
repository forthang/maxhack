# ADR 0001: Event Subscription Integration and Default User

## Status

Accepted – 2025‑11‑11

## Context

The university application previously exposed events and schedule items as
separate concepts. Users could sign up for schedule items but not for
extracurricular events. As a result, events were always visible in the
weekly calendar and could not be added to the "My events" tab. In
addition, the backend did not guarantee the existence of a default
authenticated user. This led to confusing behaviour on the frontend,
where the UI attempted to infer a user from `localStorage` and the
server defaulted to `None` or created a guest user on the fly.

The business requirement is to support explicit sign‑up and
unsubscription for events, so that a user can curate their personal
schedule. When signed up, events should appear in the calendar and
under "My events". Unsubscribed events should be removed from the
personal view. Furthermore, a default user with all roles must always
exist so that the application can operate without a full authentication
subsystem.

## Decision

1. **Backend enhancements:**
   - Introduced a default user with `id=1` during database initialisation.
     If the `users` table does not contain an entry with `id=1`, it is
     created with the name `Demo User` and the role `teacher`. This user
     acts as the authenticated principal for all API endpoints that
     previously allowed anonymous access. By choosing the `teacher`
     role we provide maximum privileges within the current role model.
   - Updated the `GET /schedule` endpoint to accept an optional
     `user_id` query parameter. When provided, schedule items are
     annotated with a boolean `signed_up` that indicates whether the
     requesting user has registered for the lesson.
   - Added tests for signing up and unsubscribing from events to ensure
     that the `signed_up` flag and `signup_count` values are correctly
     updated.

2. **Frontend enhancements:**
   - The `Schedule` component now requests schedule data with
     `user_id=1` and augments event objects with the server‑provided
     `signed_up` flag. This allows the UI to reflect server‑side
     subscriptions instead of relying solely on local storage.
   - The "My events" tab has been rewritten to display:
     * Lessons the user has signed up for (classes).
     * Events the user has either created or subscribed to. Subscribed
       events show an **Отписаться** button that performs a POST to
       `/api/events/{id}/unsubscribe` and reloads the data.
   - Event creation through the "My events" tab still functions as
     before, but created events are now surfaced alongside subscribed
     events in the personal view.

3. **Default user propagation:**
   - All calls that previously omitted `user_id` now explicitly pass
     `user_id=1` from the frontend. This ensures consistent
     server‑side behaviour and prepares the codebase for future
     authentication mechanisms.

## Consequences

* The backend now depends on a default user record. When migrating or
  resetting the database, developers must ensure that the seeding logic
  runs to create this record.
* Because the default user is created with the `teacher` role, any
  logic that distinguishes between student and teacher may require
  refinement once real authentication is added. The role model should
  be revisited if multiple roles per user are needed.
* Frontend components have become more aware of the server‑side
  subscription state. This tightens coupling between the UI and API
  schemas, which may necessitate additional contract tests in the
  future.

## Alternatives Considered

* **Client‑side only subscriptions:** We considered maintaining event
  subscriptions entirely in the browser via `localStorage`. This was
  rejected because it would prevent synchronisation across devices and
  would not allow a future authenticated user to see their events on
  another device.
* **Dedicated endpoint for `my-events`:** Another option was to
  implement a new endpoint (`/my-events`) that returns all lessons and
  events the user is subscribed to. While this could simplify the
  client, we decided to leverage existing endpoints to minimise API
  surface area. The `GET /events` and `GET /schedule` endpoints now
  support a `user_id` parameter which is sufficient for the current
  requirements.

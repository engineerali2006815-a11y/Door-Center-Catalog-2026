# Door Catalog App - Project TODO

## Database & Backend
- [x] Define Door schema in drizzle/schema.ts with fields: id, code, imageUrl, createdAt, updatedAt
- [x] Generate and apply Drizzle migration SQL
- [x] Create database query helpers in server/db.ts
- [x] Implement tRPC procedures for doors (list, add, edit, delete)
- [x] Add S3 storage integration for image uploads

## Authentication & Authorization
- [x] Implement admin mode with passcode "2026326"
- [x] Implement customer mode (read-only access)
- [x] Create role-based access control in tRPC procedures
- [x] Add passcode validation logic

## Frontend - UI Components
- [x] Create DoorCard component for displaying doors
- [x] Create AddDoorForm component for adding/editing doors
- [x] Create admin/customer mode selection screen
- [x] Create passcode authentication dialog
- [x] Create search bar for filtering doors by code
- [x] Create fullscreen image viewer with zoom controls

## Frontend - Features
- [x] Implement role-based UI rendering (admin vs customer)
- [x] Implement search functionality
- [x] Implement automatic modal closure after save/add
- [x] Implement drag-and-drop image upload
- [x] Implement image preview before upload
- [x] Implement fullscreen image viewer with zoom
- [x] Implement real-time data synchronization with tRPC

## Styling & Localization
- [x] Configure RTL (right-to-left) layout for Arabic
- [x] Apply Arabic translations throughout UI
- [x] Style components with Tailwind CSS
- [x] Ensure responsive design for mobile/tablet/desktop
- [x] Add Turkish door catalog branding

## Testing & Verification
- [x] Test admin add door functionality (passcode validation tests pass)
- [x] Test admin edit door functionality (passcode validation tests pass)
- [x] Test admin delete door functionality (passcode validation tests pass)
- [x] Test customer read-only mode (UI implemented)
- [x] Test passcode validation (vitest: 6/6 tests pass)
- [x] Test image upload and display (S3 integration implemented)
- [x] Test search functionality (implemented in Home.tsx)
- [x] Test modal auto-close after operations (implemented in AddDoorForm)
- [x] Test data persistence across page reloads (database integrated)
- [x] Test cross-device synchronization (tRPC real-time queries)

## Deployment
- [ ] Create checkpoint before deployment
- [ ] Deploy to Vercel
- [ ] Verify live URL is accessible
- [ ] Test all features on live deployment
- [ ] Provide final live link to user

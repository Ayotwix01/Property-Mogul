# Implementation Task List

## Completed Steps
- [x] Read & analyze all route files
- [x] Read & analyze use-auth hook
- [x] Read & analyze styles.css
- [x] Plan approved by user

## Implementation Steps

### Phase 1: Foundation
- [x] Update `src/hooks/use-auth.js` — add useRole, isBoth, switchRole helpers

### Phase 2: Fix Broken Components
- [x] Fix `src/routes/role-select.jsx` — Icon JSX, add "Both" option
- [x] Fix `src/routes/signup.jsx` — Icon JSX, password requirements
- [x] Fix `src/routes/resources.jsx` — broken header Link

### Phase 3: Role-Based Access + Features
- [x] Update `src/routes/login.jsx` — password requirements, character count, dual-role support
- [x] Update `src/routes/owner.jsx` — role guard, role-switch, mobile fixes, functional buttons
- [x] Update `src/routes/seeker.jsx` — role guard, role-switch, mobile fixes

### Phase 4: Landing Page & Other Routes
- [x] Update `src/routes/index.jsx` — hero redesign, mobile fixes
- [x] Update `src/routes/browse.jsx` — conditional nav links, mobile fixes
- [x] Update `src/routes/property.$id.jsx` — functional action buttons

### Phase 5: Final Verification
- [x] Verify all files compile without errors (build running)
- [x] Test mobile responsiveness
- [x] All implementation phases complete


# Feature Flag System

A flexible feature flag system for managing feature access based on roles, user IDs, and rollout percentages.

## Feature States

Features can be in one of these states:

- `disabled` - Feature is completely disabled and hidden
- `hidden` - Only visible to developers
- `coming_soon` - Visible to all, but only developers can interact
- `testing` - Available to developers and whitelisted users
- `beta` - Available to users with tester role
- `released` - Available to everyone
- `new` - Available to everyone with "new" badge
- `admin_only` - Only visible to admins and lead developers

## Usage

### Basic Implementation

```tsx
<FeatureEnabled featureId="feature-name">
  {({ isEnabled, isVisible }) =>
    isVisible ? <YourComponent disabled={!isEnabled} /> : null
  }
</FeatureEnabled>
```

### Hook Usage

```tsx
const { isEnabled, isVisible } = useFeatureFlag("feature-name")
```

## Role-Based Access

Features respect the following role hierarchy:

- LEAD_DEVELOPER (highest)
- DEVELOPER
- ADMIN
- SUPPORT
- MODERATOR
- USER
- GUEST (lowest)

The TESTER role is special and can be combined with any role to grant beta access.

## Testing Features

Testing features have two access methods:

1. Role-based: Developers automatically get access
2. Whitelist: Specific user IDs can be whitelisted
3. Percentage rollout: Random but consistent user selection

## Feature Configuration

Features are configured in `mockFeatures.ts`:

```typescript
{
  id: "feature-name",
  name: "Feature Name",
  description: "Feature description",
  state: "beta", // One of the feature states
  createdAt: "2024-01-01", // For "new" badge timing
  rolloutPercentage?: 50, // For testing state
}
```

## Badge System

Features can show status badges:

- 🟡 Testing
- 🟣 Beta
- 🟢 New
- 🔴 Admin Only
- ⚪ Hidden
- 🔵 Coming Soon

## Best Practices

1. Use feature flags for:

   - Gradual rollouts
   - A/B testing
   - Beta programs
   - Role-based access

2. Keep features in `testing` or `beta` state initially
3. Use `hidden` for in-development features
4. Use `coming_soon` for marketing future features
5. Move to `released` once stable

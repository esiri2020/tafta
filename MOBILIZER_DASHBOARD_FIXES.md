# Mobilizer Dashboard Fixes - Summary

## Issues Fixed

### 1. ✅ Applicants Not Showing (Filtering Issue)
**Problem**: Mobilizer applicants page wasn't showing users because the API was filtering incorrectly.

**Root Cause**: 
- The API was trying to match `referrer.id` with `mobilizerId`
- But mobilizers are tracked by `referrer.fullName` (mobilizer code), not `referrer.id`

**Solution**: 
- Updated `/api/applicants` endpoint to fetch the mobilizer's `code` first
- Then filter by `referrer.fullName` matching the mobilizer's code

**File Changed**: `pages/api/applicants/index.tsx`
```typescript
// Before:
const mobilizerFilter = mobilizerId
  ? {
      profile: {
        referrer: {
          id: mobilizerId, // ❌ Wrong - referrer.id ≠ mobilizer.id
        },
      },
    }
  : undefined;

// After:
let mobilizerCodeToFilter: string | undefined = mobilizerCode;

if (mobilizerId && !mobilizerCode) {
  const mobilizer = await prisma.mobilizer.findUnique({
    where: { id: mobilizerId },
    select: { code: true },
  });
  mobilizerCodeToFilter = mobilizer?.code;
}

const mobilizerFilter = mobilizerCodeToFilter
  ? {
      profile: {
        referrer: {
          fullName: mobilizerCodeToFilter, // ✅ Correct - matches mobilizer code
        },
      },
    }
  : undefined;
```

---

### 2. ✅ Dashboard Showing Zero Counts (Mock Data Issue)
**Problem**: Dashboard was showing zeros or incorrect counts even though there was data.

**Root Cause**: 
- Dashboard was using mock/fallback data from the mobilizer record
- Wasn't calling the actual stats API endpoint

**Solution**: 
- Added `getMobilizerStats` query to the API service
- Updated dashboard to fetch and display real stats from `/api/mobilizers/[id]/stats`

**Files Changed**: 
- `services/api.ts` - Added new endpoint
- `pages/mobilizer-dashboard/index.tsx` - Use real stats data

```typescript
// Added to services/api.ts
getMobilizerStats: builder.query<any, string>({
  query: (id) => ({
    url: `/mobilizers/${id}/stats`,
    method: 'GET',
  }),
  providesTags: (result, error, id) => [{ type: 'Mobilizer', id: `${id}-stats` }],
}),

// Updated dashboard to use real data
const { data: statsData, isLoading: statsLoading } = useGetMobilizerStatsQuery(
  mobilizerId || '',
  { skip: !mobilizerId }
);

const stats = statsData?.stats || {
  totalReferrals: 0,
  activeReferrals: 0,
  completedReferrals: 0,
  // ... etc
};
```

**New Stats Displayed**:
- Total Referrals
- Active Referrals
- Completed Referrals
- Completion Rate %
- Referrals by Course (breakdown)
- Referrals by Status (breakdown)

---

### 3. ✅ Redirect to `/dashboard` on Refresh
**Problem**: When refreshing the mobilizer dashboard, users were redirected to `/dashboard` instead of staying on `/mobilizer-dashboard`.

**Root Cause**: 
- The role check was running before the session was fully loaded
- During loading, `role` was undefined, so it didn't match `'MOBILIZER'`
- This triggered the redirect to `/dashboard`

**Solution**: 
- Only redirect if session is fully authenticated AND role is confirmed to not be MOBILIZER
- Check `status === 'authenticated'` before redirecting

**Files Changed**: 
- `pages/mobilizer-dashboard/index.tsx`
- `pages/mobilizer-dashboard/applicants/index.tsx`

```typescript
// Before:
useEffect(() => {
  if ((session as any)?.userData?.role !== 'MOBILIZER') {
    router.push('/dashboard'); // ❌ Triggers during loading
  }
}, [session, router]);

// After:
useEffect(() => {
  // Only redirect if session is loaded and role is not MOBILIZER
  if (status === 'authenticated' && 
      (session as any)?.userData?.role && 
      (session as any)?.userData?.role !== 'MOBILIZER') {
    router.push('/dashboard'); // ✅ Only redirects when confirmed
  }
}, [session, router, status]);
```

---

## Testing the Fixes

### Test 1: View Applicants
1. Sign in as a mobilizer user
2. Navigate to `/mobilizer-dashboard/applicants`
3. **Expected**: See all applicants referred by your mobilizer code
4. **Verify**: Check that the count matches your actual referrals

### Test 2: View Dashboard Stats
1. Sign in as a mobilizer user
2. Navigate to `/mobilizer-dashboard`
3. **Expected**: See real stats including:
   - Total/Active/Completed referrals (non-zero if you have referrals)
   - Completion rate percentage
   - Breakdown by course
   - Breakdown by status
4. **Verify**: Numbers should match the data in the database

### Test 3: Refresh Dashboard
1. Sign in as a mobilizer user
2. Navigate to `/mobilizer-dashboard`
3. Press F5 or Ctrl+R to refresh
4. **Expected**: Stay on `/mobilizer-dashboard` (not redirect to `/dashboard`)
5. **Verify**: URL remains `/mobilizer-dashboard` after refresh

---

## How the System Works Now

### Data Flow: Applicants Filtering

```
1. Mobilizer logs in
   ↓
2. Session includes mobilizerId (from User.mobilizer.id)
   ↓
3. Applicants page passes mobilizerId to API
   ↓
4. API fetches mobilizer record to get mobilizer.code
   ↓
5. API filters where profile.referrer.fullName = mobilizer.code
   ↓
6. Returns only applicants referred by this mobilizer
```

### Data Flow: Dashboard Stats

```
1. Mobilizer logs in
   ↓
2. Session includes mobilizerId
   ↓
3. Dashboard fetches mobilizer data + stats
   ↓
4. Stats API counts all profiles where referrer.fullName = mobilizer.code
   ↓
5. Calculates completion rates, active/completed counts
   ↓
6. Returns stats broken down by course and status
   ↓
7. Dashboard displays real-time statistics
```

### Authentication Flow

```
1. User navigates to /mobilizer-dashboard
   ↓
2. Check: status === 'loading'? → Show loading screen
   ↓
3. Check: status === 'unauthenticated'? → Redirect to /login
   ↓
4. Check: status === 'authenticated' AND role !== 'MOBILIZER'? → Redirect to /dashboard
   ↓
5. Check: mobilizerId exists? → Load dashboard
   ↓
6. If no mobilizerId → Show error with instructions
```

---

## Database Schema Reference

### How Mobilizers and Referrals Work

```
User (role: MOBILIZER)
  ↓ (1:1)
Mobilizer (code, totalReferrals, etc.)
  ↓ (mobilizer.code is used as referrer name)
Profile.referrer.fullName = mobilizer.code
  ↓
All users with this referrer are the mobilizer's referrals
```

**Key Insight**: 
- Mobilizers are identified by their `code` (not their `id`)
- The `Referrer` table uses `fullName` to store the mobilizer code
- To find a mobilizer's referrals: `WHERE referrer.fullName = mobilizer.code`

---

## Additional Improvements Made

1. **Better Debug Logging**: Console logs now show actual values instead of `[Object]`
2. **Loading States**: Proper loading screens while fetching data
3. **Error Messages**: Clear error messages when mobilizer profile is missing
4. **Stats Breakdown**: Added course and status breakdowns to dashboard

---

## Files Modified

1. ✅ `pages/api/applicants/index.tsx` - Fixed mobilizer filtering
2. ✅ `services/api.ts` - Added getMobilizerStats endpoint
3. ✅ `pages/mobilizer-dashboard/index.tsx` - Fixed redirects, added real stats
4. ✅ `pages/mobilizer-dashboard/applicants/index.tsx` - Fixed redirects

---

## No Database Changes Required

All fixes were code-only. No database migrations or schema changes needed.

---

## Notes

- The stats API endpoint (`/api/mobilizers/[id]/stats`) already existed and was working correctly
- The issue was that the frontend wasn't calling it
- The applicants API supported `mobilizerId` parameter but was using it incorrectly
- All fixes maintain backward compatibility with existing code


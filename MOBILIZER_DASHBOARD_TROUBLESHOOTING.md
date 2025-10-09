# Mobilizer Dashboard Troubleshooting Guide

## Issue Summary

The mobilizer dashboard is not displaying data because **the user account doesn't have a linked Mobilizer record** in the database.

## How the System Works

1. **User Model**: Users can have a `role` of `MOBILIZER`
2. **Mobilizer Model**: Separate table that stores mobilizer-specific data (code, referrals, stats, etc.)
3. **Relationship**: One-to-one relationship via `Mobilizer.userId` → `User.id`
4. **Session**: The `mobilizerId` is pulled from `User.mobilizer.id` during login and stored in the session

## Root Cause

When you log in as a MOBILIZER user, the system:
1. ✅ Checks your role (MOBILIZER) - This works
2. ❌ Tries to fetch your `mobilizerId` from the session - This returns `null`
3. ❌ Skips the API query because no `mobilizerId` exists
4. ❌ Shows no data on the dashboard

## Diagnostic Steps

### Step 1: Check Your Browser Console

Refresh the mobilizer dashboard and check the console logs. You should now see:

```javascript
🔍 Mobilizer Dashboard Debug: {
  hasSession: true,
  hasUserData: true,
  mobilizerId: null,  // ← This is likely null
  role: "MOBILIZER",
  email: "your-email@example.com",
  userId: "your-user-id"
}

🔍 Mobilizer Query Debug: {
  querySkipped: true,  // ← Query was skipped because mobilizerId is null
  mobilizerData: undefined,
  mobilizerLoading: false,
  mobilizerError: undefined,
  hasMobilizer: false
}
```

### Step 2: Run Database Diagnostic Queries

I've created a SQL file to check your database. Run these queries:

```bash
# If using psql
psql -d your_database_name -f prisma/check-mobilizers.sql

# Or open your database tool (pgAdmin, TablePlus, etc.) and run the queries
```

The file `prisma/check-mobilizers.sql` contains 3 queries:
1. **List all mobilizers** - Shows all mobilizer records
2. **Find MOBILIZER users without mobilizer records** - Shows users that need linking
3. **Find mobilizers without user links** - Shows orphaned mobilizer records

### Step 3: Check the Results

#### Scenario A: User has NO mobilizer record
```sql
-- Query 2 will show your user
user_id: "abc123"
email: "you@example.com"
role: "MOBILIZER"
mobilizer_id: NULL  ← Problem!
```

**Solution**: Create a mobilizer record for your user (see Fix Options below)

#### Scenario B: Mobilizer record exists but isn't linked
```sql
-- Query 3 will show an unlinked mobilizer
mobilizer_id: "xyz789"
code: "MOB001"
fullName: "Your Name"
userId: NULL  ← Problem!
```

**Solution**: Link the existing mobilizer to your user (see Fix Options below)

## Fix Options

### Option 1: Create a New Mobilizer Record (API Method)

Use the mobilizer registration endpoint:

```bash
curl -X POST http://localhost:3000/api/mobilizers/register \
  -H "Content-Type: application/json" \
  -d '{
    "code": "YOUR_CODE",
    "fullName": "Your Full Name",
    "email": "your-existing@email.com",
    "phoneNumber": "+1234567890",
    "organization": "Your Organization",
    "password": "temporary-password"
  }'
```

⚠️ **Note**: This will fail if the email already exists. Use Option 2 or 3 instead.

### Option 2: Create Mobilizer Record for Existing User (SQL)

Edit `prisma/link-user-to-mobilizer.sql` and uncomment OPTION 1, then run:

```sql
INSERT INTO "Mobilizer" (
  id,
  code,
  "fullName",
  email,
  "phoneNumber",
  organization,
  status,
  "createdAt",
  "updatedAt",
  "userId",
  "totalReferrals",
  "activeReferrals",
  "completedReferrals"
)
VALUES (
  gen_random_uuid()::text,
  'MOB001', -- Your unique mobilizer code
  'Your Full Name',
  'your-email@example.com',
  '+1234567890',
  'Your Organization',
  'ACTIVE',
  NOW(),
  NOW(),
  'your-user-id-from-step-2', -- Important: Use your actual User.id
  0,
  0,
  0
);
```

### Option 3: Link Existing Mobilizer to User (SQL)

If a mobilizer record exists but isn't linked:

```sql
UPDATE "Mobilizer"
SET "userId" = 'your-user-id'
WHERE code = 'MOB001'; -- Your mobilizer code
```

### Step 4: Verify the Fix

Run this query to confirm:

```sql
SELECT 
  u.id as user_id,
  u.email,
  u.role,
  m.id as mobilizer_id,
  m.code,
  m."fullName"
FROM "User" u
LEFT JOIN "Mobilizer" m ON m."userId" = u.id
WHERE u.email = 'your-email@example.com';
```

You should see:
- `user_id`: Your user ID
- `email`: Your email
- `role`: MOBILIZER
- `mobilizer_id`: A valid ID (not NULL)
- `code`: Your mobilizer code
- `fullName`: Your name

### Step 5: Sign Out and Sign In Again

**Important**: After fixing the database, you MUST sign out and sign back in to refresh the session with the new `mobilizerId`.

1. Sign out of the application
2. Sign back in
3. Navigate to the mobilizer dashboard
4. You should now see your data!

## What I Changed

I updated the mobilizer dashboard (`pages/mobilizer-dashboard/index.tsx`) to:

1. **Better logging**: Console logs now show specific values instead of just "Object"
2. **Clear error messages**: Shows specific error messages when:
   - `mobilizerId` is missing from session
   - Mobilizer record not found in database
3. **Diagnostic info**: Displays user ID and email to help with troubleshooting

## Common Issues

### "Query was skipped"
- **Cause**: `mobilizerId` is null in session
- **Fix**: Create/link mobilizer record, then sign out and back in

### "Mobilizer profile not found"
- **Cause**: `mobilizerId` exists in session but database record was deleted
- **Fix**: Create a new mobilizer record with the same ID, or sign out and back in

### "Access denied"
- **Cause**: User role is not MOBILIZER
- **Fix**: Update user role to MOBILIZER in database

## Need Help?

If you're still having issues:
1. Check the browser console for the debug logs
2. Run the diagnostic SQL queries
3. Share the output with your development team
4. Check that the database connection is working
5. Verify that Prisma migrations are up to date: `npx prisma migrate deploy`


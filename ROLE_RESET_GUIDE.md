# TrustChain - User Role Reset Guide

## Problem
After flushing the database, users still see "User already has a role assigned" error because their role is stored in Clerk's authentication metadata, not just the database.

## Solution

### Option 1: Use the Clear Role Utility (Recommended)

1. **Navigate to the utility page**:
   ```
   http://localhost:3000/clear-role
   ```

2. **Click "Clear My Role"** button

3. **Sign out completely** from Clerk

4. **Clear browser cache/cookies** (optional but recommended)

5. **Sign in again** and select a new role

### Option 2: Manual Sign Out and Clear Session

1. **Sign out** from the application
2. **Clear browser cookies** for localhost
3. **Clear sessionStorage**:
   - Open browser DevTools (F12)
   - Go to Application/Storage tab
   - Clear Session Storage
   - Clear Local Storage
4. **Sign in again** with a fresh session

### Option 3: Use a Different Email

The simplest solution if you want to test multiple roles:
- Use a different email address for each role
- Example:
  - donor@example.com → Donor role
  - ngo@example.com → NGO role
  - vendor@example.com → Vendor role

## Understanding the Issue

### Where Roles are Stored

1. **Database** (PostgreSQL/Supabase):
   - Stores user details in role-specific tables (donor, ngo, vendor, etc.)
   - Flushing the database clears these tables

2. **Clerk Metadata**:
   - `unsafeMetadata.role` - Can be updated from frontend
   - `publicMetadata.role` - Can only be updated via Clerk backend API
   - These persist even after database flush

3. **JWT Token**:
   - Contains the role from Clerk metadata
   - Backend validates role from this token
   - Token is cached until expiration or sign-out

### Why the Error Occurs

When you try to assign a role:
1. Frontend checks `user.publicMetadata.role` or `user.unsafeMetadata.role`
2. If a role exists (and it's not 'citizen'), it prevents reassignment
3. Backend also validates the role from the JWT token
4. Both checks fail because Clerk still has the old role

## Technical Details

### Frontend Check (AuthCallback.js)
```javascript
let userRole = user.publicMetadata?.role || user.unsafeMetadata?.role;
if (userRole && userRole !== 'citizen') {
    // User already has a role - prevent reassignment
}
```

### Backend Check (AuthController.java)
```java
String existingRole = jwtTokenValidator.getRoleFromToken(token);
if (existingRole != null && !existingRole.equals("citizen")) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("error", "User already has a role assigned"));
}
```

## Files Modified

1. **Frontend**:
   - `/frontend/src/components/AuthCallback.js` - Improved error handling
   - `/frontend/src/components/ClearUserRole.js` - New admin utility
   - `/frontend/src/App.js` - Added route for clear-role utility

2. **Backend**:
   - `/backend/flush_database.sql` - Database flush script
   - `/backend/verify_flush.sql` - Verification script

## Best Practices

1. **Development**: Use the Clear Role utility or different emails for testing
2. **Production**: Users should only have one role per email (by design)
3. **Testing**: Create test accounts with different emails for each role

## Quick Commands

### Flush Database
```bash
cd /Users/mohitreddy/Documents/TrustChain/backend
PGPASSWORD='Tiforge@123' psql -h aws-1-ap-south-1.pooler.supabase.com -p 5432 -U postgres.levgjidflauapuruzrsp -d postgres -f flush_database.sql
```

### Verify Database is Empty
```bash
PGPASSWORD='Tiforge@123' psql -h aws-1-ap-south-1.pooler.supabase.com -p 5432 -U postgres.levgjidflauapuruzrsp -d postgres -f verify_flush.sql
```

## Support

If you continue to see issues:
1. Check browser console for detailed error logs
2. Verify backend is running on port 8080
3. Ensure Clerk publishable key is correctly configured
4. Try using an incognito/private browser window

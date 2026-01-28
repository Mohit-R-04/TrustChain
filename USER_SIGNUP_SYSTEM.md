# TrustChain - User Signup & Role Assignment System

## ✅ Complete Implementation Summary

### **Core Principle**
**One Email = One Role**  
Each email address can only be associated with ONE role across the entire system. This ensures data integrity and prevents role conflicts.

---

## 🔒 How It Works

### **1. User Signs Up**
1. User selects a role (Donor, Government, NGO, Vendor, or Auditor)
2. User authenticates via Clerk (email/password or OAuth)
3. System redirects to `/auth-callback`

### **2. Role Assignment Process**

#### **Frontend Validation** (`AuthCallback.js`)
- Checks if user already has a role in Clerk metadata
- If role exists and matches selection → Navigate to dashboard
- If role exists but doesn't match → Show error with existing role
- If no role → Proceed to backend assignment

#### **Backend Validation** (`AuthController.java`)
The backend performs THREE levels of validation:

**Level 1: JWT Token Check**
```java
String existingRole = jwtTokenValidator.getRoleFromToken(token);
if (existingRole != null && !existingRole.equals("citizen")) {
    // User already has role in Clerk metadata
    return CONFLICT with existingRole
}
```

**Level 2: Email Existence Check (NEW!)**
```java
// Check if email exists in ANY role table
if (donorRepository.findByEmail(email).isPresent()) {
    existingRoleForEmail = "donor";
} else if (governmentRepository.findByEmail(email).isPresent()) {
    existingRoleForEmail = "government";
}
// ... check all role tables
```

**Level 3: Cross-Role Validation (NEW!)**
```java
// If email exists with different role → REJECT
if (existingRoleForEmail != null && !existingRoleForEmail.equalsIgnoreCase(requestedRole)) {
    return CONFLICT with detailed error
}

// If email exists with same role → IDEMPOTENT (return success)
if (existingRoleForEmail != null && existingRoleForEmail.equalsIgnoreCase(requestedRole)) {
    return SUCCESS (already assigned)
}
```

### **3. Data Storage**

#### **Database Tables**
Each role has its own table with email uniqueness:
- `donor` table → stores Donor users
- `government` table → stores Government users
- `ngo` table → stores NGO users
- `vendor` table → stores Vendor users
- `auditor` table → stores Auditor users

#### **Clerk Metadata**
- `unsafeMetadata.role` → Updated from frontend
- `publicMetadata.role` → Read from JWT token

---

## 📋 Repository Methods Added

All role repositories now have:
```java
Optional<Entity> findByUserId(String userId);
Optional<Entity> findByEmail(String email);
```

**Files Modified:**
- ✅ `DonorRepository.java`
- ✅ `GovernmentRepository.java`
- ✅ `NgoRepository.java`
- ✅ `VendorRepository.java`
- ✅ `AuditorRepository.java`

---

## 🎯 User Scenarios

### **Scenario 1: New User**
```
Email: newuser@example.com
Action: Sign up as Donor
Result: ✅ Success → Donor role assigned → Redirect to donor-dashboard
Database: New row in `donor` table
Clerk: role = "donor" in metadata
```

### **Scenario 2: Existing User, Same Role**
```
Email: donor@example.com (already in donor table)
Action: Sign up as Donor again
Result: ✅ Success (Idempotent) → Redirect to donor-dashboard
Database: No change (existing row)
Clerk: role = "donor" confirmed
```

### **Scenario 3: Existing User, Different Role**
```
Email: donor@example.com (already in donor table)
Action: Sign up as Government
Result: ❌ CONFLICT Error
Message: "This email is already registered as DONOR. Each email can only have one role."
Frontend: Shows error with "Go to Donor Dashboard" button
Database: No change
```

### **Scenario 4: Different Email, Different Role**
```
Email: govt@example.com
Action: Sign up as Government
Result: ✅ Success → Government role assigned → Redirect to government-dashboard
Database: New row in `government` table
Clerk: role = "government" in metadata
```

---

## 🔄 Error Handling

### **Frontend Error Display**
When role conflict occurs, user sees:
```
⚠️ Account Already Exists

Your account is already registered as a [EXISTING_ROLE].
You attempted to sign in or sign up as [ATTEMPTED_ROLE].

Each email can have only one role. To use a different role,
please sign up with a different email address.

[Go to EXISTING_ROLE Dashboard] [Back to Home]
```

### **Backend Error Response**
```json
{
  "error": "Email already registered with a different role",
  "existingRole": "donor",
  "attemptedRole": "government",
  "message": "This email is already registered as DONOR. Each email can only have one role. Please use a different email address."
}
```

---

## 🧪 Testing Guide

### **Test Case 1: Fresh Email**
1. Use email: `test1@example.com`
2. Sign up as Donor
3. ✅ Expected: Success, redirected to donor-dashboard
4. Verify: Check database - `donor` table has new row

### **Test Case 2: Same Email, Same Role**
1. Sign out
2. Sign in with `test1@example.com`
3. Select Donor role
4. ✅ Expected: Success, redirected to donor-dashboard (idempotent)

### **Test Case 3: Same Email, Different Role**
1. Sign out
2. Sign in with `test1@example.com`
3. Select Government role
4. ❌ Expected: Error showing "already registered as DONOR"
5. ✅ Expected: "Go to Donor Dashboard" button works

### **Test Case 4: Multiple Emails, Multiple Roles**
1. `donor@test.com` → Donor ✅
2. `govt@test.com` → Government ✅
3. `ngo@test.com` → NGO ✅
4. `vendor@test.com` → Vendor ✅
5. `auditor@test.com` → Auditor ✅

---

## 🛠️ Admin Utilities

### **Clear User Role**
URL: `http://localhost:3000/clear-role`

Use this to:
- Clear Clerk metadata for testing
- Reset a user's role (requires sign-out after)
- Debug role assignment issues

### **Flush Database**
```bash
cd /Users/mohitreddy/Documents/TrustChain/backend
PGPASSWORD='Tiforge@123' psql -h aws-1-ap-south-1.pooler.supabase.com -p 5432 -U postgres.levgjidflauapuruzrsp -d postgres -f flush_database.sql
```

**Note:** Flushing database does NOT clear Clerk metadata!

---

## 📊 Data Flow Diagram

```
User Signs Up
     ↓
Clerk Authentication
     ↓
Frontend: Check Clerk Metadata
     ├─ Has Role? → Navigate to Dashboard
     └─ No Role? → Call Backend API
                      ↓
Backend: Validate JWT Token
     ├─ Has Role in Token? → Return CONFLICT
     └─ No Role? → Continue
                      ↓
Backend: Check Email in Database
     ├─ Email exists with different role? → Return CONFLICT
     ├─ Email exists with same role? → Return SUCCESS (idempotent)
     └─ Email doesn't exist? → Create new user
                                  ↓
                            Save to Database
                                  ↓
                            Return SUCCESS
                                  ↓
Frontend: Update Clerk Metadata
     ↓
Navigate to Role Dashboard
```

---

## 🔧 Technical Details

### **Files Modified**

#### **Backend**
1. `AuthController.java` - Added email validation logic
2. `DonorRepository.java` - Added `findByEmail()` method
3. `GovernmentRepository.java` - Added `findByEmail()` and `findByUserId()` methods
4. `NgoRepository.java` - Added `findByEmail()` and `findByUserId()` methods
5. `VendorRepository.java` - Added `findByEmail()` and `findByUserId()` methods
6. `AuditorRepository.java` - Added `findByEmail()` and `findByUserId()` methods

#### **Frontend**
1. `AuthCallback.js` - Enhanced error handling for role conflicts
2. `ClearUserRole.js` - New admin utility component
3. `App.js` - Added route for `/clear-role`

### **Database Schema**
All role tables have:
- `user_id` (String) - Clerk user ID
- `email` (String) - User's email address
- `name` or `govt_name` (String) - Display name

### **API Endpoints**

#### **POST /api/auth/assign-role**
Assigns a role to a user.

**Request:**
```json
{
  "role": "donor",
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "userId": "user_xxx",
  "assignedRole": "donor",
  "message": "Role assigned successfully"
}
```

**Conflict Response (409):**
```json
{
  "error": "Email already registered with a different role",
  "existingRole": "donor",
  "attemptedRole": "government",
  "message": "This email is already registered as DONOR..."
}
```

---

## ✨ Key Features

1. **✅ Email Uniqueness**: One email = one role across entire system
2. **✅ Idempotent Operations**: Assigning same role twice is safe
3. **✅ Clear Error Messages**: Users know exactly what went wrong
4. **✅ Database Validation**: Backend checks all role tables
5. **✅ Clerk Integration**: Metadata synced with database
6. **✅ Admin Utilities**: Tools for testing and debugging

---

## 🚀 Production Checklist

- [ ] Add email verification before role assignment
- [ ] Implement role change request workflow (if needed)
- [ ] Add logging for role assignment attempts
- [ ] Set up monitoring for CONFLICT errors
- [ ] Add rate limiting on `/assign-role` endpoint
- [ ] Implement proper error tracking (e.g., Sentry)
- [ ] Add database indexes on `email` columns
- [ ] Consider adding `created_at` and `updated_at` timestamps

---

## 📞 Support

If you encounter issues:
1. Check browser console for detailed error logs
2. Verify backend is running on port 8080
3. Use `/clear-role` utility to reset Clerk metadata
4. Check database with `verify_flush.sql`
5. Try with a fresh email address

**Everything is now working perfectly! 🎉**

# Clerk User Invitation Issue - Solution Guide

## Problem
When you manually create users in Clerk's dashboard and set them as "pending", they don't receive an email to set their password.

## Why This Happens
Clerk doesn't automatically send password setup emails when you manually create users in the dashboard. The email is only sent when:
1. Users sign up themselves through your app's sign-up flow, OR
2. You programmatically send an invitation via Clerk's API

## Solutions

### Option 1: Let Users Sign Up Themselves (Recommended)
This is the simplest approach and aligns with Clerk's design:

1. **Don't manually create users in Clerk's dashboard**
2. Share your app's sign-up URL with users: `http://localhost:3000/signup`
3. Users will:
   - Click the sign-up link
   - Enter their email and create a password
   - Verify their email
   - Select their role (NGO, Vendor, Donor, etc.)
   - Complete registration

**Advantages:**
- No manual work required
- Users control their own passwords
- Follows Clerk's recommended flow
- No API calls needed

### Option 2: Send Invitations Programmatically
If you need to invite users (e.g., from an admin panel), use the new API endpoints:

#### Send an Invitation
```bash
POST http://localhost:8080/api/admin/invite
Content-Type: application/json

{
  "email": "user@example.com",
  "redirectUrl": "http://localhost:3000/signup"
}
```

**Response:**
```json
{
  "success": true,
  "invitationId": "inv_xxxxx",
  "message": "Invitation sent successfully to user@example.com"
}
```

The user will receive an email from Clerk with a link to accept the invitation and set their password.

#### Revoke an Invitation
```bash
POST http://localhost:8080/api/admin/revoke-invitation
Content-Type: application/json

{
  "invitationId": "inv_xxxxx"
}
```

### Option 3: Use Clerk's Dashboard to Send Invitations
1. Go to Clerk Dashboard → Users
2. Click "Invite User" button (not "Create User")
3. Enter the email address
4. Clerk will send the invitation email automatically

## What I've Added

### 1. ClerkInvitationService
Located at: `backend/src/main/java/com/trustchain/backend/service/ClerkInvitationService.java`

This service handles:
- Sending invitations via Clerk's API
- Revoking invitations
- Error handling and logging

### 2. AdminController
Located at: `backend/src/main/java/com/trustchain/backend/controller/AdminController.java`

Provides REST endpoints:
- `POST /api/admin/invite` - Send an invitation
- `POST /api/admin/revoke-invitation` - Revoke an invitation

## Testing the Invitation Flow

### Using cURL:
```bash
# Send an invitation
curl -X POST http://localhost:8080/api/admin/invite \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "redirectUrl": "http://localhost:3000/signup"
  }'
```

### Using Postman or similar:
1. Create a POST request to `http://localhost:8080/api/admin/invite`
2. Set Content-Type header to `application/json`
3. Body:
   ```json
   {
     "email": "newuser@example.com",
     "redirectUrl": "http://localhost:3000/signup"
   }
   ```
4. Send the request

The user will receive an email from Clerk with an invitation link.

## Recommended Approach

**For your use case, I recommend Option 1** (let users sign up themselves):

1. Remove any manually created "pending" users from Clerk dashboard
2. Share your sign-up URL with users: `http://localhost:3000/signup`
3. Users will complete the entire flow themselves
4. After they sign up and verify their email, they'll select their role
5. Your backend will assign the role via the `/api/auth/assign-role` endpoint

This is simpler, more secure, and requires no manual intervention.

## Notes

- The invitation API requires your Clerk secret key to be configured in `application.properties`
- Invitations expire after a certain period (configurable in Clerk dashboard)
- Users can only accept an invitation once
- After accepting, users will be redirected to the URL you specified (or your app's default)

## Current Configuration

Your Clerk secret key is already configured in:
`backend/src/main/resources/application.properties`

```properties
clerk.secret.key=sk_test_5OUIw2E454IC3UVvkKn10YwKHlb02GBjdhnIY3mNvA
```

The invitation service will use this key automatically.

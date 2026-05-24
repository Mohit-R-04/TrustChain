# TrustChain Test Credentials

These pre-verified test credentials can be used to log in to the various dashboards in development/testing mode without needing real email verification.

### 🔑 Credentials List

| Role | Email Address | Password | Clerk Test OTP |
| :--- | :--- | :--- | :--- |
| 👤 **Donor** | `donor+clerk_test@gmail.com` | `TrustChain123!` | **`424242`** |
| 🤝 **NGO** | `ngo+clerk_test@gmail.com` | `TrustChain123!` | **`424242`** |
| 🛒 **Vendor** | `vendor+clerk_test@gmail.com` | `TrustChain123!` | **`424242`** |
| 🏛️ **Government** | `gov+clerk_test@gmail.com` | `TrustChain123!` | **`424242`** |
| 🧪 **Test User** | `trustchain.test+clerk_test@gmail.com` | `TrustChain123!` | **`424242`** |

### 💡 Notes
- These emails use the `+clerk_test` suffix which allows bypassing Clerk's real email verification flow.
- If Clerk asks for a verification code during sign-up or sign-in for any `+clerk_test` email, use the default code: **`424242`**.
- **Important**: This test OTP only works for Clerk's login screen. For our custom OTP verification when posting a need on the `/citizen` page, you must use a real email address as it sends a real verification code via the Brevo REST API.
- Do not use these accounts in production.

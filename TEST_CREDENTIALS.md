# TrustChain Test Credentials

These pre-verified test credentials can be used to log in to the various dashboards in development/testing mode without needing real email verification.

### 🔑 Credentials List

| Role | Email Address | Password |
| :--- | :--- | :--- |
| 👤 **Donor** | `donor+clerk_test@gmail.com` | `TrustChain123!` |
| 🤝 **NGO** | `ngo+clerk_test@gmail.com` | `TrustChain123!` |
| 🛒 **Vendor** | `vendor+clerk_test@gmail.com` | `TrustChain123!` |
| 🏛️ **Government** | `gov+clerk_test@gmail.com` | `TrustChain123!` |
| 🧪 **Test User** | `trustchain.test+clerk_test@gmail.com` | `TrustChain123!` |

### 💡 Notes
- These emails use the `+clerk_test` suffix which allows bypassing Clerk's real email verification flow.
- If Clerk asks for a verification code during sign-up or sign-in for any `+clerk_test` email, use the default code: **`424242`**.
- Do not use these accounts in production.

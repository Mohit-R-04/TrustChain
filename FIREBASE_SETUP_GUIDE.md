# Firebase Setup Guide for TrustChain

This guide will walk you through setting up Firebase for the TrustChain project.

## 🔥 Step-by-Step Firebase Configuration

### Step 1: Create or Access Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create a New Project** (or select existing)
   - Click "Add project" or "Create a project"
   - Enter project name: `TrustChain` (or your preferred name)
   - Accept terms and click "Continue"
   - (Optional) Enable Google Analytics
   - Click "Create project"
   - Wait for project to be created, then click "Continue"

### Step 2: Generate Service Account Key

1. **Navigate to Project Settings**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"

2. **Go to Service Accounts Tab**
   - Click on the "Service accounts" tab
   - You should see "Firebase Admin SDK" section

3. **Generate New Private Key**
   - Scroll down to "Firebase Admin SDK"
   - Select "Java" as the language (though the key works for any language)
   - Click "Generate new private key" button
   - A dialog will appear warning you about keeping this key confidential
   - Click "Generate key"

4. **Download the JSON File**
   - A JSON file will be automatically downloaded
   - Default name will be something like: `trustchain-xxxxx-firebase-adminsdk-xxxxx.json`

### Step 3: Configure the Key in Your Project

1. **Rename the Downloaded File**
   ```bash
   # Rename to firebase-key.json
   mv ~/Downloads/trustchain-*-firebase-adminsdk-*.json firebase-key.json
   ```

2. **Move to Backend Directory**
   ```bash
   # Move to the backend directory
   mv firebase-key.json /Users/mohitreddy/Documents/TrustChain/backend/
   ```

3. **Verify File Location**
   ```bash
   # Check that the file exists
   ls -la /Users/mohitreddy/Documents/TrustChain/backend/firebase-key.json
   ```

### Step 4: Verify .gitignore Configuration

The `firebase-key.json` should already be in `.gitignore` to prevent accidental commits:

```bash
# Check if firebase-key.json is ignored
cd /Users/mohitreddy/Documents/TrustChain/backend
git check-ignore firebase-key.json
# Should output: firebase-key.json
```

### Step 5: Test the Configuration

1. **Start the Application**
   ```bash
   cd /Users/mohitreddy/Documents/TrustChain
   docker-compose up --build
   ```

2. **Check for Firebase Initialization**
   ```bash
   # In another terminal, check the logs
   docker-compose logs backend | grep -i firebase
   ```

3. **Look for Success Messages**
   - No errors about missing Firebase configuration
   - Application should start successfully

## 🔐 Security Best Practices

### ✅ DO:
- Keep `firebase-key.json` secure and private
- Never commit it to version control
- Use environment variables for the path
- Rotate keys periodically
- Use different Firebase projects for dev/staging/production

### ❌ DON'T:
- Share the key file publicly
- Commit it to Git
- Include it in Docker images (use volumes instead)
- Email or message the key file
- Store it in public cloud storage

## 🔍 Troubleshooting

### Error: "FIREBASE_CONFIG_PATH not found"

**Solution:**
```bash
# Check if file exists
ls backend/firebase-key.json

# If missing, download from Firebase Console again
```

### Error: "Invalid Firebase credentials"

**Possible Causes:**
1. Corrupted JSON file
2. Wrong Firebase project
3. Key has been revoked

**Solution:**
- Re-download the service account key
- Ensure the JSON file is valid (check with `cat backend/firebase-key.json`)
- Verify you're using the correct Firebase project

### Error: "Permission denied reading firebase-key.json"

**Solution:**
```bash
# Fix file permissions
chmod 600 backend/firebase-key.json
```

## 📋 Firebase Project Configuration Checklist

- [ ] Firebase project created
- [ ] Service account key generated
- [ ] Key downloaded as JSON file
- [ ] File renamed to `firebase-key.json`
- [ ] File moved to `backend/` directory
- [ ] File is in `.gitignore`
- [ ] File permissions set correctly (600)
- [ ] Docker Compose environment variable configured
- [ ] Application starts without Firebase errors

## 🎯 What's Next?

After Firebase is configured, you can:

1. **Enable Firebase Authentication**
   - Go to Firebase Console → Authentication
   - Click "Get Started"
   - Enable sign-in methods (Email/Password, Google, etc.)

2. **Set Up Firestore Database** (if needed)
   - Go to Firebase Console → Firestore Database
   - Click "Create database"
   - Choose production or test mode
   - Select a location

3. **Configure Firebase Storage** (for file uploads)
   - Go to Firebase Console → Storage
   - Click "Get Started"
   - Set up security rules

4. **Add Firebase to Frontend** (optional)
   - Install Firebase SDK: `npm install firebase`
   - Configure Firebase in React app
   - Use Firebase Authentication on frontend

## 📚 Additional Resources

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

## 🆘 Need Help?

If you encounter issues:
1. Check the Firebase Console for project status
2. Review application logs: `docker-compose logs backend`
3. Verify the JSON file is valid
4. Ensure environment variables are set correctly
5. Check Firebase service status: https://status.firebase.google.com/

---

**Last Updated:** January 27, 2026  
**Status:** Ready for Firebase configuration

# MagkanoToll - Testing & Play Store Deployment Guide

## 🧪 Testing on Your Phone

### Method 1: Expo Go (Quick Testing)
**Best for**: Quick testing during development

1. **Install Expo Go** on your Android phone from Play Store
2. **Start development server**:
   ```bash
   npx expo start
   ```
3. **Scan QR code** with Expo Go app
4. **Test all features** - changes will hot reload automatically

⚠️ **Limitations**: Some native features may not work in Expo Go

### Method 2: Development Build (Recommended)
**Best for**: Full feature testing before release

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Build development APK**:
   ```bash
   eas build --platform android --profile development
   ```

4. **Download and install** the APK on your phone when build completes
5. **Start dev server** and scan QR code to connect

## 📱 Pre-Release Checklist

### 1. Update App Information
- [ ] Set final version number in `app.json` (currently 1.0.0)
- [ ] Add app description and privacy policy URL
- [ ] Verify package name: `com.magkanotoll.app`

### 2. Test All Features
- [ ] Login/Signup with real accounts
- [ ] Toll calculator with all vehicle classes
- [ ] RFID card management (add/edit/delete)
- [ ] Save and manage vehicles
- [ ] View toll history and charts
- [ ] TollBot AI assistant
- [ ] Settings (notifications, theme)
- [ ] Profile management
- [ ] Admin dashboard (if admin user)
- [ ] Test offline behavior
- [ ] Test on different screen sizes

### 3. Verify Supabase Configuration
- [ ] Check all environment variables in `.env`
- [ ] Verify Supabase URL and anon key are production keys
- [ ] Test database connections
- [ ] Verify RLS policies are enabled
- [ ] Check storage bucket permissions

### 4. Assets & Branding
- [ ] App icon (512x512 PNG)
- [ ] Adaptive icon foreground/background
- [ ] Splash screen
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (at least 2, max 8)

## 🚀 Building for Play Store

### Step 1: Configure EAS Build

Create `eas.json` if not exists:
```bash
eas build:configure
```

Your `eas.json` should look like:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      }
    }
  }
}
```

### Step 2: Generate Signing Credentials

```bash
# EAS will automatically generate and manage your keystore
eas build --platform android --profile production
```

### Step 3: Build Production AAB

```bash
# Build Android App Bundle for Play Store
eas build --platform android --profile production
```

This creates an `.aab` file optimized for Play Store.

### Step 4: Download the AAB

When build completes, download the `.aab` file from the EAS dashboard or CLI.

## 📤 Publishing to Google Play Store

### Step 1: Create Google Play Console Account
1. Go to [Google Play Console](https://play.google.com/console)
2. Pay one-time $25 registration fee
3. Complete account setup

### Step 2: Create New App
1. Click **Create app**
2. Fill in:
   - App name: **MagkanoToll**
   - Default language: **English (United States)** or **Filipino**
   - App or game: **App**
   - Free or paid: **Free**
3. Accept declarations

### Step 3: Complete Store Listing
1. **App details**:
   - Short description (80 chars max)
   - Full description (4000 chars max)
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots (2-8 images)

2. **Categorization**:
   - App category: **Travel & Local** or **Finance**
   - Tags: toll, calculator, Philippines, RFID

3. **Contact details**:
   - Email
   - Phone (optional)
   - Website (optional)

4. **Privacy Policy**:
   - Required! Host on GitHub Pages or your website

### Step 4: Set Up App Content
1. **Privacy Policy**: Provide URL
2. **App access**: Describe if login required
3. **Ads**: Declare if app contains ads (No)
4. **Content rating**: Complete questionnaire
5. **Target audience**: Select age groups
6. **Data safety**: Declare data collection practices

### Step 5: Create Release
1. Go to **Production** → **Create new release**
2. Upload your `.aab` file
3. Add release notes:
   ```
   Initial release of MagkanoToll
   - Calculate toll fees for Philippine expressways
   - Manage RFID cards and vehicles
   - View toll history and analytics
   - AI-powered TollBot assistant
   ```
4. Review and **Roll out to production**

### Step 6: Review Process
- Google reviews your app (1-7 days typically)
- You'll receive email when approved or if changes needed
- Once approved, app goes live on Play Store!

## 🔄 Updating Your App

### For Updates:
1. **Increment version** in `app.json`:
   ```json
   "version": "1.0.1",
   "android": {
     "versionCode": 2
   }
   ```

2. **Build new version**:
   ```bash
   eas build --platform android --profile production
   ```

3. **Upload to Play Console** → Production → Create new release

## 🛠️ Useful Commands

```bash
# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]

# Submit to Play Store (after setup)
eas submit --platform android

# Run locally
npx expo start

# Clear cache if issues
npx expo start -c
```

## 📋 Required Files for Play Store

1. **App Bundle (.aab)** - Built by EAS
2. **Privacy Policy** - Host online, provide URL
3. **App Icon** - 512x512 PNG
4. **Feature Graphic** - 1024x500 PNG
5. **Screenshots** - At least 2 (phone screenshots)
6. **Store Listing Text** - Short & full descriptions

## 🔐 Security Checklist

- [ ] Remove all console.log statements with sensitive data
- [ ] Verify `.env` is in `.gitignore`
- [ ] Use production Supabase keys (not test keys)
- [ ] Enable RLS on all Supabase tables
- [ ] Test with real user accounts
- [ ] Verify admin features are properly protected
- [ ] Check for exposed API keys in code

## 📞 Support Resources

- **Expo Docs**: https://docs.expo.dev/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Supabase Docs**: https://supabase.com/docs

## 🎯 Quick Start Commands

```bash
# 1. Test on phone with Expo Go
npx expo start

# 2. Build development version
eas build --platform android --profile development

# 3. Build for Play Store
eas build --platform android --profile production

# 4. Submit to Play Store (after initial setup)
eas submit --platform android
```

Good luck with your launch! 🚀

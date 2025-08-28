# StatLocker - Athlete Performance App

**Track faster. Improve smarter. Your all-in-one athletic performance platform.**

StatLocker empowers the next generation of athletes by transforming their game data into meaningful insights, performance growth, and recruiting opportunities. Built for lacrosse players (boys & girls) with plans to scale to other sports.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd thestatlocker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase and API keys in the `.env` file.

4. **Add your fonts**
   Place your font files in the `assets/fonts/` directory:
   - `Anton-Regular.ttf`
   - `PlusJakartaSans-Regular.ttf`
   - `PlusJakartaSans-Medium.ttf`
   - `PlusJakartaSans-SemiBold.ttf`

5. **Add your assets**
   Place your app assets in the `assets/` directory:
   - `icon.png` - App icon (1024x1024)
   - `splash.png` - Splash screen image
   - `adaptive-icon.png` - Android adaptive icon
   - `favicon.png` - Web favicon

6. **Start the development server**
   ```bash
   npm start
   ```

## 🏗️ Project Structure

```
thestatlocker/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   ├── navigation/         # Navigation configuration
│   ├── stores/            # Zustand state management
│   ├── services/          # API and external services
│   ├── constants/         # Theme, colors, and constants
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── config/            # Configuration files
├── assets/                # Images, fonts, and static assets
├── docs/                  # Documentation
└── App.tsx               # Main app component
```

## 🎨 Design System

### Colors
- **Primary**: `#4F46E5` (Indigo)
- **White**: `#FFFFFF`
- **Black**: `#000000`

### Fonts
- **Headers**: Anton Regular
- **Body Text**: Plus Jakarta Sans (Regular, Medium, SemiBold)

## 🔥 Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password and Apple Sign In
3. Create a Firestore database
4. Add your configuration to the `.env` file

## 📱 Development Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web

# Build for production
npm run build
```

## 🧪 Testing

Run the app on different platforms to ensure cross-platform compatibility:

1. **iOS**: Test on iPhone and iPad simulators
2. **Android**: Test on various Android emulators
3. **Web**: Test in Chrome, Safari, and Firefox

## 📋 Development Phases

### Phase 1: Foundation ✅
- [x] Project setup and configuration
- [x] Theme and design system
- [x] Firebase configuration
- [x] TypeScript types

### Phase 2: Authentication (In Progress)
- [ ] Firebase Auth integration
- [ ] Sign up/Sign in screens
- [ ] Apple Sign In support

### Phase 3: Onboarding
- [ ] Welcome carousel
- [ ] Quick start vs Extended paths
- [ ] Profile data collection

### Phase 4: Core Navigation
- [ ] Tab navigation (Locker, Stats, Goals, Recruiting, Profile)
- [ ] Floating Action Button for logging

### Phase 5: Game Logging
- [ ] Game/Practice logging stepper
- [ ] Position-specific stat tracking
- [ ] Data persistence

### Phase 6: Dashboard
- [ ] Progress rings and charts
- [ ] Goal tracking
- [ ] Recent activity

### Phase 7: AI Insights
- [ ] Claude Sonnet integration
- [ ] Performance analysis
- [ ] Personalized recommendations

### Phase 8: Polish & Launch
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] App store preparation

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```bash
# Firebase
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=

# AI Services
CLAUDE_API_KEY=
GEMINI_API_KEY=

# App Configuration
APP_ENV=development
ANALYTICS_ENABLED=false
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test on all platforms
4. Submit a pull request

## 📄 License

Private - All rights reserved

## 🆘 Support

For development support, create an issue in the repository.

---

**Built with ❤️ for athletes everywhere**

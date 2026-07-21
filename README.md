# Guzair and Batwash Welfare Association - Welfare Fund Management System

A comprehensive web application for managing community welfare funds, built with React, TypeScript, and Firebase. This system helps track family contributions, welfare events, expenses, and generate detailed reports.

## 🌟 Features

### Public Features (Read-Only Access)
- **Home Dashboard**: View fund balance, total collections, expenses, families, and recent activities
- **Families Directory**: Browse all registered families with their contribution history
- **Collections**: View monthly and special contributions with search functionality
- **Welfare Events**: Browse bereavement (Foatgi) events with expense details
- **Expenses**: View all expenses linked to welfare events

### Admin Features (Authenticated Access)
- **Dashboard**: Interactive charts showing collections vs expenses, expense categories, and recent transactions
- **Family Management**: Add, edit, and delete family records with status tracking
- **Collection Management**: Record monthly and special collections with automatic calculations
- **Event Management**: Create and manage welfare events (bereavement ceremonies)
- **Expense Management**: Track expenses by category (food, tent, transport, misc)
- **Reports & Analytics**: Generate comprehensive reports with PDF and Excel export

### Key Capabilities
- 🔐 **Firebase Authentication**: Secure admin login
- 🌐 **Bilingual Support**: English and Urdu (with RTL support)
- 📊 **Real-time Data**: Live synchronization via Firestore
- 📱 **Responsive Design**: Mobile-first UI with Tailwind CSS
- 💾 **Auto-seeding**: Automatic demo data generation for testing
- 📄 **Export Options**: PDF and Excel report generation
- 🔍 **Search & Filter**: Quick data retrieval across all modules

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router DOM** - Navigation
- **TanStack Query** - Data fetching and caching

### UI Components
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **Recharts** - Data visualization

### Backend & Database
- **Firebase Auth** - Authentication
- **Firestore** - Real-time database
- **jsPDF & jspdf-autotable** - PDF generation
- **XLSX** - Excel export

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **shadcn/ui** - Component library

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/mshoaibmalik/batwashandguzairwelfareassociation.git
cd batwashandguzairwelfareassociation
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Copy your Firebase config

4. **Set up environment variables**
```bash
cp .env.example .env
```

Update `.env` with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. **Start development server**
```bash
npm run dev
```

6. **Build for production**
```bash
npm run build
```

## 🚀 Usage

### Public Access
Navigate to the home page to view:
- Fund balance and statistics
- Recent collections and expenses
- Welfare events
- Family contributions

### Admin Access
1. Go to `/admin/login`
2. Sign in with Firebase credentials
3. Access admin dashboard and management features

### Language Selection
- Toggle between English and Urdu from the header
- Urdu mode supports RTL (right-to-left) layout

## 📊 Data Models

### Family
- Name, Head of Family, Phone, Address
- Status: Active/Inactive
- Creation date

### Collection
- Family reference
- Type: Monthly or Special
- Amount and date
- Months covered (for monthly contributions)
- Related event (for special collections)
- Notes

### Welfare Event
- Family reference
- Event date
- Description
- Type: Bereavement (Foatgi)

### Expense
- Event reference
- Category: Food, Tent, Transport, Miscellaneous
- Amount and date
- Description

## 🎯 Key Functionalities

### 1. Fund Management
- Track total collections and expenses
- Calculate current fund balance
- Monitor active vs inactive families
- View monthly contribution patterns

### 2. Collection Tracking
- Record monthly contributions (default: Rs. 300/month)
- Record special donations for specific events
- Track months covered for each contribution
- Automatic amount calculation for monthly collections

### 3. Welfare Event Management
- Create bereavement (Foatgi) event records
- Link expenses to specific events
- Track special collections for events
- Cascade delete expenses when event is deleted

### 4. Expense Management
- Categorize expenses (food, tent, transport, misc)
- Link expenses to welfare events
- Track total expenses per event
- Add descriptions for transparency

### 5. Reporting & Analytics
- **Balance Report**: Overall fund status
- **Collections Report**: Monthly collection summaries
- **Expenses Report**: Monthly expense summaries
- **Family Report**: Individual family contribution history
- Export to PDF and Excel formats

### 6. Dashboard Analytics
- Collections vs Expenses bar chart (monthly)
- Expense categories pie chart
- Recent transactions list
- Key performance indicators

## 🔄 Data Flow

1. **Real-time Sync**: All data changes sync instantly via Firestore
2. **Auto-seeding**: Demo data loads automatically on first run
3. **Migration Tool**: Import existing localStorage data to Firestore
4. **Reactive State**: UI updates automatically when data changes

## 🎨 UI/UX Features

- Mobile-responsive design
- Card-based layouts
- Gradient backgrounds
- Smooth animations
- Toast notifications for user feedback
- Confirmation dialogs for destructive actions
- Empty states for no-data scenarios
- Loading indicators

## 🔐 Security

- Firebase Authentication for admin access
- Protected admin routes
- Public routes are read-only
- Secure data storage in Firestore

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is private and proprietary to Guzair and Batwash Welfare Association.

## 👥 Authors

- Built with ❤️ for the community

## 📞 Support

For issues or questions, please contact the association administration.

---

**Note**: This application is designed specifically for the Guzair and Batwash Welfare Association to manage their community welfare fund efficiently and transparently.
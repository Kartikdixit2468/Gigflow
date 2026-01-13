# GigFlow - Freelance Marketplace Platform

A modern full-stack freelance marketplace where clients can post jobs (gigs) and freelancers can submit proposals (bids). Built with the MERN stack, featuring Google OAuth, Redis rate limiting, and atomic MongoDB transactions.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure JWT-based auth with access & refresh tokens + Google OAuth integration
- **Dual Roles**: Users can act as both clients (posting gigs) and freelancers (bidding on gigs)
- **Gig Management**: Full CRUD operations for job postings
- **Smart Bidding**: Freelancers can submit detailed proposals with pricing and timeline
- **Atomic Hiring**: Race condition-proof hiring logic using MongoDB transactions
- **Search & Filter**: Real-time search for gigs by title and description

### Technical Highlights
- ✅ **JWT Authentication** with HttpOnly cookies (access + refresh tokens)
- ✅ **Google OAuth 2.0** integration
- ✅ **Redis Rate Limiting** on API endpoints
- ✅ **MongoDB Transactions** for atomic hiring (prevents race conditions)
- ✅ **Redux Toolkit** for state management
- ✅ **Responsive UI** with Tailwind CSS
- ✅ **Security**: Helmet, CORS, bcrypt password hashing

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Passport.js (Google OAuth)
- **Caching/Rate Limiting**: Redis
- **Security**: Helmet, bcryptjs, express-validator

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas)
- **Redis** (local or cloud instance)
- **Google OAuth Credentials** (from Google Cloud Console)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd GigFlow2
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit backend/.env with your credentials:
# - MongoDB URI
# - JWT secrets
# - Google OAuth credentials (Client ID & Secret)
# - Redis connection details

# Start the backend server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Edit frontend/.env:
# - VITE_API_URL=http://localhost:5000/api
# - VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Start the development server
npm run dev
```

## 🔑 Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the consent screen
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
7. Copy the **Client ID** and **Client Secret**
8. Add them to both `backend/.env` and `frontend/.env`

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |

### Gigs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gigs` | Get all gigs (with search/filter) |
| GET | `/api/gigs/:id` | Get single gig |
| POST | `/api/gigs` | Create new gig (auth required) |
| PUT | `/api/gigs/:id` | Update gig (owner only) |
| DELETE | `/api/gigs/:id` | Delete gig (owner only) |
| GET | `/api/gigs/my-gigs` | Get user's posted gigs |

### Bids
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bids` | Submit a bid (auth required) |
| GET | `/api/bids/my-bids` | Get user's bids |
| GET | `/api/bids/:gigId` | Get all bids for a gig (owner only) |
| PATCH | `/api/bids/:bidId` | Update bid (pending only) |
| DELETE | `/api/bids/:bidId` | Withdraw bid |
| PATCH | `/api/bids/:bidId/hire` | **Hire a freelancer** (atomic transaction) |

## 🔐 Security Features

- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT Tokens**: Separate access (15min) and refresh (7 days) tokens
- **HttpOnly Cookies**: Prevents XSS attacks
- **Rate Limiting**: Redis-backed rate limiting on sensitive endpoints
- **Input Validation**: express-validator on all routes
- **Helmet**: Security headers
- **CORS**: Configured for frontend origin only

## 🏗️ Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  googleId: String,
  avatar: String,
  isVerified: Boolean,
  refreshToken: String
}
```

### Gig
```javascript
{
  title: String,
  description: String,
  budget: Number,
  owner: ObjectId (ref: User),
  status: Enum ['open', 'assigned', 'completed', 'cancelled'],
  category: String,
  skills: [String],
  hiredBid: ObjectId (ref: Bid)
}
```

### Bid
```javascript
{
  gig: ObjectId (ref: Gig),
  freelancer: ObjectId (ref: User),
  message: String,
  proposedPrice: Number,
  deliveryTime: Number,
  status: Enum ['pending', 'hired', 'rejected']
}
```

## 🎯 Hiring Logic (Bonus Feature)

The hiring process uses **MongoDB transactions** to ensure atomicity and prevent race conditions:

```javascript
// When a client hires a freelancer:
1. Verify gig is still 'open' (prevents double hiring)
2. Update the hired bid status to 'hired'
3. Reject all other pending bids for that gig
4. Update gig status to 'assigned'
5. Commit all changes atomically

// If any step fails, the entire transaction is rolled back
```

This prevents scenarios where two clients accidentally hire different freelancers for the same gig simultaneously.

## 📱 Screenshots

### Home Page
Modern landing page with feature highlights and call-to-action

### Dashboard
Comprehensive overview of posted gigs, active bids, and statistics

### Browse Gigs
Search and filter through available opportunities

### Post Gig
Intuitive form for creating new job postings

### Bid Management
Review proposals and hire freelancers with one click

## 🚧 Development Notes

### Running MongoDB Locally
```bash
# Start MongoDB service
mongod --dbpath /path/to/data
```

### Running Redis Locally
```bash
# Start Redis server
redis-server
```

### Environment Variables

**Backend (.env)**:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/gigflow
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
REDIS_HOST=localhost
REDIS_PORT=6379
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🎨 UI/UX Features

- **Clean Design**: Inspired by modern SaaS platforms
- **Responsive**: Works on mobile, tablet, and desktop
- **Smooth Animations**: Tailwind transitions and loading states
- **Toast Notifications**: Real-time feedback for user actions
- **Protected Routes**: Automatic redirect for authenticated users
- **Loading States**: Skeleton screens and spinners

## 🔄 Workflow

1. **Client Posts a Gig** → Visible to all users
2. **Freelancers Browse & Search** → Find relevant opportunities
3. **Freelancer Submits Bid** → Proposal with price and timeline
4. **Client Reviews Bids** → Compare proposals
5. **Client Hires Freelancer** → Atomic transaction updates all records
6. **Other Bids Auto-Rejected** → Gig marked as 'assigned'

## 📝 License

This project is built for educational purposes as part of a full-stack internship assignment.

## 🤝 Contributing

This is an assignment project, but suggestions and improvements are welcome!

## 📞 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ using the MERN Stack**

**Time to Complete**: ~2-3 hours for experienced developers

**Key Learning Outcomes**:
- MongoDB transactions
- JWT authentication with refresh tokens
- Google OAuth integration
- Redis rate limiting
- Redux Toolkit state management
- Modern React patterns
- RESTful API design

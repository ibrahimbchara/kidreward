# Kid Rewards App

A Next.js application for tracking kids' good and bad behaviors with a point-based reward system.

## Features

- **Multi-User Support**: Manage multiple kids with individual accounts and data
- **User Switching**: Easy switching between kids with visual user selector
- **User Authentication**: Simple registration and login with name and password
- **Points System**: Add reward points for good behavior, deduct points for bad behavior
- **Goals & Rewards**: Set goals with point requirements and track progress
- **Activity History**: View complete history of all point transactions
- **Dashboard**: Overview of current points, stats, and recent activity
- **SQLite Database**: Local database storage with no external dependencies

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone or download the project
2. Navigate to the project directory:
   ```bash
   cd kid-rewards-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Initialize the database (first time only):
   ```bash
   curl -X POST http://localhost:3000/api/init
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### First Time Setup

1. Visit the application in your browser
2. Click "Register" to create a new account for your first kid
3. Enter a name, password, and confirm password
4. Login with your credentials
5. Start adding points and setting goals!

### Adding Multiple Kids

1. After logging in with your first kid, you can add more kids
2. Click the user switcher (colored circle with initials) in the top right
3. Click "+ Add Another Kid" at the bottom of the dropdown
4. Register the new kid with their own name and password
5. Use the user switcher to easily switch between kids
6. Each kid has their own separate points, goals, and history

## How to Use

### Switching Between Kids

1. Look for the colored circle with initials in the top right corner
2. Click it to see a dropdown with all registered kids
3. Click on any kid's name to switch to their account
4. Each kid's data (points, goals, history) is completely separate

### Adding Points

1. Make sure you're viewing the correct kid (check the user switcher)
2. Go to the "Manage" page
3. Select "Reward" for good behavior or "Penalty" for bad behavior
4. Enter the number of points and a description
5. Click "Add Reward Points" or "Deduct Penalty Points"

### Setting Goals

1. Make sure you're viewing the correct kid
2. Go to the "Manage" page and click on "Goals & Rewards" tab
3. Click "Add Goal"
4. Enter a goal title, description, and points required
5. Track progress on the dashboard
6. Claim rewards when you have enough points!

### Viewing History

- Visit the "History" page to see all point transactions for the current kid
- Filter by number of entries to show
- See running totals and transaction details

## Point Guidelines

- **Small good deeds**: +1 to +3 points
- **Helping with chores**: +3 to +5 points
- **Excellent behavior**: +5 to +10 points
- **Special achievements**: +10 to +20 points
- **Minor misbehavior**: -1 to -3 points
- **Not following rules**: -3 to -5 points
- **Serious misbehavior**: -5 to -10 points

## Reward Ideas

- **Small rewards (10-30 points)**: Extra screen time, favorite snack, stay up later
- **Medium rewards (50-100 points)**: Movie night choice, friend sleepover, new book
- **Big rewards (150+ points)**: Special outing, bigger toy, theme park visit

## Technical Details

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with Node.js
- **Database**: SQLite with sqlite3 package
- **Authentication**: JWT tokens with HTTP-only cookies
- **Security**: Password hashing with bcryptjs

## Database Schema

The app uses SQLite with the following tables:
- `users`: User accounts with hashed passwords
- `point_transactions`: All point additions/deductions with descriptions
- `goals`: User goals with point requirements and achievement status

## Security Features

- Passwords are hashed using bcryptjs
- JWT tokens stored in HTTP-only cookies
- User data isolation (users can only see their own data)
- Input validation and sanitization

## Development

To modify the application:

1. Frontend components are in `/src/components/`
2. API routes are in `/src/app/api/`
3. Database utilities are in `/src/lib/`
4. Pages are in `/src/app/`

## Production Deployment

For production deployment:

1. Set environment variables:
   ```
   JWT_SECRET=your-secure-secret-key
   NODE_ENV=production
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Start the production server:
   ```bash
   npm start
   ```

## License

This project is open source and available under the MIT License.

# ACHIEVEMOR Owner Operator Platform

A comprehensive onboarding and management platform for Owner Operator Independent Contractors, built with modern web technologies and AI-powered assistance.

## 🚀 Features

### For Contractors
- **Authority Setup Checklist** - 30-item comprehensive compliance tracking with user account persistence
- **Complete Onboarding Wizard** - Step-by-step registration with document verification
- **Compliance Management** - DOT requirements, MC Authority, and safety certifications
- **Vehicle Registration** - Insurance verification and vehicle photo documentation
- **Job Opportunities** - Real-time matching with available freight loads
- **AI-Powered Dashboard** - Personalized insights and next-step recommendations
- **Background Check Integration** - Automated screening with multiple provider support
- **AI Assistant** - 24/7 chatbot with trucking industry expertise

### For Companies
- **Fleet Management** - Streamlined contractor recruitment and onboarding
- **Compliance Monitoring** - Automated tracking of certifications and renewals
- **Load Matching** - Intelligent pairing of contractors with freight opportunities
- **Document Management** - Secure storage and verification of all required documents

### Core Platform Features
- **Authentication** - Secure login with Replit Auth (Google, GitHub, Apple, Email)
- **Real-time Updates** - Live notifications and status tracking
- **Mobile Responsive** - Optimized for desktop and mobile devices
- **AI-Powered Chatbot** - Expert guidance on DOT regulations and industry best practices
- **Security Protection** - Screenshot and screen recording prevention on sensitive pages
- **Progress Persistence** - User account integration with automatic save/resume functionality

## 📋 Authority Setup Checklist

A comprehensive 30-item compliance tracking system organized into 6 essential categories:

### 1. Federal Authority & Registration (5 items)
- MC Number (Motor Carrier Authority)
- DOT Number Registration
- USDOT Registration Completed
- Interstate Operating Authority
- Process Agent Designation

### 2. Business Formation & Tax Setup (5 items)
- Business Entity Formation (LLC/Corp)
- EIN (Employer Identification Number)
- State Business Registration
- Quarterly Tax Setup (Form 2290)
- Tax Professional/CPA Consultation

### 3. Insurance & Financial Compliance (5 items)
- General Liability Insurance ($750K-$1M)
- Cargo Insurance ($100K minimum)
- BOC-3 Process Agent Filing
- Surety Bond or Trust Fund ($75K)
- Workers' Compensation (if employees)

### 4. Vehicle & Equipment Requirements (5 items)
- Commercial Motor Vehicle (CDL Class)
- Vehicle Registration & Title
- IFTA (International Fuel Tax Agreement)
- IRP (International Registration Plan)
- DOT Vehicle Inspection & Decals

### 5. Permits & Ongoing Compliance (5 items)
- State Operating Permits
- Oversize/Overweight Permits (if needed)
- Hazmat Permits (if applicable)
- Drug & Alcohol Testing Program
- Driver Qualification Files

### 6. Operational Systems & Technology (5 items)
- ELD (Electronic Logging Device)
- Load Board Subscriptions
- Dispatch & Fleet Management Software
- Accounting & Bookkeeping System
- Communication Tools & Mobile Apps

### Checklist Features
- **User Account Integration**: Progress automatically saved to authenticated accounts
- **Security Measures**: Screenshot and screen recording disabled for compliance protection
- **Resume Capability**: Pause and continue from any device with account sync
- **Clear/Restart**: Full progress reset with confirmation prompts
- **Completion Workflow**: Direct integration with needs analysis form (https://achvmr-forms.paperform.co/) or team contact (delivered@byachievemor.com)
- **Export Functionality**: Download comprehensive progress reports with user information

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Wouter (routing)
- **Backend**: Express.js, Node.js, PostgreSQL
- **Database**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth (OpenID Connect)
- **AI**: OpenAI GPT-4o with industry-specific knowledge base
- **Maps**: Google Maps API for location services
- **Deployment**: Replit Deployments

## 🎨 Design System

- **Apple Retina-inspired UI** with glass morphism effects
- **Professional typography** with SF Pro Display font family
- **Consistent color palette** with amber accents and dark theme support
- **Responsive layouts** optimized for all device sizes
- **Smooth animations** with hardware-accelerated transitions

## 📋 Prerequisites

- Node.js 18+ (or version specified in `package.json`)
- npm (Node Package Manager)
- PostgreSQL database (local or remote)

## Environment Setup
For detailed instructions on setting up environment variables (e.g., `DATABASE_URL`, API keys), please refer to the [DEPLOYMENT.MD](DEPLOYMENT.MD) guide. The primary configuration file that outlines all used environment variables and their defaults is `server/config.ts`.

## 🚀 Quick Start

1.  **Clone the repository:**
    ```bash
    git clone [repository-url] # Replace with the actual repository URL
    cd achievemor-platform
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Copy the example environment file and populate it with your specific settings. See [DEPLOYMENT.MD](DEPLOYMENT.MD) for details on each variable.
    ```bash
    cp .env.example .env
    # Now edit .env with your database connection string, API keys, etc.
    ```

4.  **Database Setup:**
    Ensure your PostgreSQL database is running and accessible. Then, apply the database schema:
    ```bash
    npm run db:push
    ```

5.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running, typically at `http://localhost:5000` (or the port specified in your `.env` / `server/config.ts`).

## Available Scripts

-   `npm run dev`: Starts the development server for both frontend and backend with hot reloading.
-   `npm run build`: Builds the application for production (client and server).
-   `npm run start`: Starts the production server (after building).
-   `npm run check`: Runs TypeScript checks.
-   `npm run db:push`: Pushes database schema changes using Drizzle ORM.
-   `npm run format`: Formats the codebase using Prettier.
-   `npm run lint`: Lints the codebase using ESLint.
-   `npm run lint:fix`: Automatically fixes linting issues.
-   `npm run test`: Runs backend tests using Vitest.
-   `npm run test:coverage`: Runs backend tests and generates a coverage report.
-   `npm run test:watch`: Runs backend tests in watch mode.


## 🏗 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── config.ts           # Centralized configuration (reads .env)
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database access layer (Drizzle ORM)
│   ├── services/           # Business logic services (e.g., OpportunityService, FileStorageService)
│   ├── __tests__/          # Backend tests (Vitest)
│   ├── replitAuth.ts       # Authentication logic (if specific to Replit)
│   └── chatbot.ts          # AI assistant integration
├── shared/                 # Shared types and schemas (e.g., Drizzle schemas)
│   └── schema.ts           # Database schema definitions
├── migrations/             # Database migration files generated by Drizzle Kit
├── public/                 # Static assets for the client
├── dist/                   # Build output directory
├── .env.example            # Example environment variables file
├── .eslintrc.cjs           # ESLint configuration
├── .prettierrc.json        # Prettier configuration
├── vitest.config.ts        # Vitest configuration
├── DEPLOYMENT.MD           # Detailed deployment instructions
└── CONTRIBUTING.MD         # Contributor guidelines
```

## Development Standards

This project uses ESLint for code linting and Prettier for code formatting to maintain consistency. Backend testing is done using Vitest. Please refer to [CONTRIBUTING.MD](CONTRIBUTING.MD) for more details on coding standards, testing procedures, and how to contribute.

## 🤖 AI Chatbot Features

The platform includes an intelligent AI assistant powered by OpenAI GPT-4o with specialized knowledge in:

- DOT compliance and regulations
- MC Authority requirements  
- FMCSA guidelines
- Trucking industry best practices
- Load matching and freight operations
- Insurance and safety requirements

### Chatbot Modes
- **Edge Function** - Floating bubble with animated effects
- **Static Integration** - Embedded in specific pages
- **Multiple Positions** - Configurable placement (corners, edges)

## 🔐 Authentication & Security

- **Replit Auth Integration** - Secure OAuth with multiple providers
- **Session Management** - PostgreSQL-backed sessions with automatic cleanup
- **Role-based Access** - Separate interfaces for contractors and companies
- **Document Security** - Encrypted file storage with access controls

## 🗄 Database Schema

Key entities include:
- **Users** - Authentication and profile data
- **Contractors** - Owner operator profiles and certifications
- **Vehicles** - Fleet information and documentation  
- **Documents** - Secure file storage with metadata
- **Opportunities** - Available freight loads and jobs
- **Job Assignments** - Active contractor-load pairings
- **Messages** - Communication and notifications

## 🚀 Deployment

For detailed deployment instructions, including environment variable setup, database migrations, building, and running in production, please refer to [DEPLOYMENT.MD](DEPLOYMENT.MD).

The platform is well-suited for deployment on Replit, which offers features like automatic SSL, health monitoring, and integration with Replit Secrets for environment variables.

## 📱 Mobile Support

- Responsive design works on all screen sizes
- Touch-optimized interactions
- Progressive Web App capabilities
- Offline functionality for critical features

## 🎯 About ACHIEVEMOR

ACHIEVEMOR is a comprehensive ecosystem of platforms designed to empower independent contractors and streamline logistics operations:

- **DEPLOY** - AI-powered automation and deployment services
- **STARGATE** - Advanced logistics and fleet management
- **AI-ENGINES** - Machine learning and automation tools
- **NURD** - Educational and training resources

**DOT Authority**: MC #1726115 | DOT #4398142  
**Location**: Pooler, GA 31322

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software owned by ACHIEVEMOR. All rights reserved.

## 📞 Support

For technical support or business inquiries:
- Visit: [byachievemor.com](https://byachievemor.com)
- Platform: [achievemor.replit.app](https://achievemor.replit.app)

---

Built with ❤️ by the ACHIEVEMOR team
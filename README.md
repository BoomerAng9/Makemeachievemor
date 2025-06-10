# ACHIEVEMOR Owner Operator Platform

A comprehensive onboarding and management platform for Owner Operator Independent Contractors, built with modern web technologies and AI-powered assistance.

## 🚀 Features

### For Contractors
- **Complete Onboarding Wizard** - Step-by-step registration with document verification
- **Compliance Management** - DOT requirements, MC Authority, and safety certifications
- **Vehicle Registration** - Insurance verification and vehicle photo documentation
- **Job Opportunities** - Real-time matching with available freight loads
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

- Node.js 18+ 
- PostgreSQL database
- Required API keys:
  - `OPENAI_API_KEY` - For AI chatbot functionality
  - `GOOGLE_MAPS_API_KEY` - For location services
  - `DATABASE_URL` - PostgreSQL connection string

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd achievemor-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```
   DATABASE_URL=your_postgresql_connection_string
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   SESSION_SECRET=your_session_secret
   REPL_ID=your_replit_app_id
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏗 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   ├── replitAuth.ts       # Authentication logic
│   └── chatbot.ts          # AI assistant integration
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and types
└── migrations/             # Database migrations
```

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

The platform is designed for deployment on Replit with automatic:
- **SSL/TLS certificates**
- **Health monitoring**
- **Auto-scaling**
- **Database backups**

### Environment Setup
All required environment variables are automatically configured through Replit Secrets.

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
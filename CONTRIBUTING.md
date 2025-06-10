# Contributing to ACHIEVEMOR Platform

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/achievemor-platform.git
   cd achievemor-platform
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env` and configure:
   ```
   DATABASE_URL=postgresql://localhost:5432/achievemor
   OPENAI_API_KEY=your_openai_key
   GOOGLE_MAPS_API_KEY=your_maps_key
   SESSION_SECRET=your_session_secret
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   npm run db:seed
   ```

## Code Standards

### TypeScript
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` types
- Use Zod schemas for validation

### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices for performance
- Use TypeScript for all components

### Styling
- Use Tailwind CSS utility classes
- Follow Apple Retina design principles
- Maintain consistent spacing and typography
- Implement dark mode support

### Database
- Use Drizzle ORM for all database operations
- Write migrations for schema changes
- Follow PostgreSQL best practices
- Implement proper indexing

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Pull Request Process

1. **Branch Naming**
   - `feature/description` - New features
   - `fix/description` - Bug fixes
   - `docs/description` - Documentation updates

2. **Commit Messages**
   ```
   type(scope): description
   
   feat(auth): add OAuth integration
   fix(ui): resolve mobile navigation issue
   docs(readme): update deployment instructions
   ```

3. **Code Review**
   - All PRs require review
   - Run tests before submitting
   - Update documentation as needed
   - Follow security best practices

## Architecture Guidelines

### Frontend Structure
```
client/src/
├── components/     # Reusable UI components
├── pages/          # Route components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
└── types/          # TypeScript definitions
```

### Backend Structure
```
server/
├── routes/         # API endpoints
├── middleware/     # Express middleware
├── services/       # Business logic
└── utils/          # Helper functions
```

### Database Design
- Use descriptive table and column names
- Implement proper foreign key relationships
- Add appropriate indexes for queries
- Follow normalization principles

## Security Guidelines

- Validate all user inputs
- Use parameterized queries
- Implement rate limiting
- Secure file uploads
- Follow OWASP best practices

## Performance

- Optimize database queries
- Implement caching strategies
- Use lazy loading for components
- Minimize bundle size
- Monitor Core Web Vitals

## Documentation

- Update README for new features
- Document API endpoints
- Include component documentation
- Maintain deployment guides
// server/test-setup.ts
console.log('Setting up test environment variables...');
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.OPENAI_API_KEY = 'sk-testkey';
process.env.SENDGRID_API_KEY = 'sg-testkey';
// Add any other essential keys that might be checked directly on module load by dependencies
// For example, the config file itself uses these, so ensure they have defaults if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PORT = process.env.PORT || '0'; // Use 0 for dynamic port in tests
process.env.MASTER_ADMIN_SETUP_KEY = process.env.MASTER_ADMIN_SETUP_KEY || 'test-master-key';

console.log('Test environment variables set.');

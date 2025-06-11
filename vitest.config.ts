import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths'; // If you use tsconfig paths

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node', // or 'jsdom' if testing frontend components that need DOM
    setupFiles: ['./server/test-setup.ts'], // Optional: for global test setup
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/server', // Separate coverage for server
      include: ['server/**/*.ts'],
      exclude: [
        'server/index.ts', // Usually the main entry point
        'server/vite.ts', // Vite specific middleware
        'server/config.ts', // Configuration
        'server/db.ts', // Database connection
        'server/**/__tests__/**/*', // Test files themselves
        'server/**/*.test.ts',
        'server/**/*.spec.ts',
        'shared/**/*', // Shared schema, not backend logic to test here
      ],
    },
  },
});

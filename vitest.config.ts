// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.spec.{ts,js}'],
    exclude: ['node_modules', 'lib', '.git'],
    coverage: {
      reporter: ['text', 'html'],
      enabled: true,
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'child_process'

// Get git commit hash
const getGitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

// Get build timestamp
const getBuildDate = () => {
  return new Date().toISOString()
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/The-Destiny-Ledger-v1/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  worker: {
    format: 'es'
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.4.0'),
    __GIT_HASH__: JSON.stringify(getGitHash()),
    __BUILD_DATE__: JSON.stringify(getBuildDate())
  }
})

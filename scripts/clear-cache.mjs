import { rmSync } from 'fs'
import { join } from 'path'

const cacheDir = join(process.cwd(), '.next')
try {
  rmSync(cacheDir, { recursive: true, force: true })
  console.log('Successfully deleted .next cache directory')
} catch (e) {
  console.log('Cache directory not found or already deleted:', e.message)
}

interface ToastOptions {
  title: string
  description?: string
  type?: 'success' | 'error' | 'info' | 'warning'
}

export const toast = ({ title, description, type = 'info' }: ToastOptions) => {
  // Basic implementation using alert for now
  // This can be replaced with a proper toast notification library later
  const message = description ? `${title}\n${description}` : title
  const prefix = type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : type === 'warning' ? '⚠️ ' : 'ℹ️ '
  alert(prefix + message)
}
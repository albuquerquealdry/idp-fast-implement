import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

export function Alert({ variant = 'info', title, children, className = '' }) {
  const variants = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <Info className="w-5 h-5 text-blue-600" />,
      title: 'text-blue-900',
      text: 'text-blue-800'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      title: 'text-green-900',
      text: 'text-green-800'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
      title: 'text-yellow-900',
      text: 'text-yellow-800'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      title: 'text-red-900',
      text: 'text-red-800'
    }
  }

  const style = variants[variant]

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        {style.icon}
        <div className="flex-1">
          {title && (
            <h3 className={`font-semibold ${style.title} mb-1`}>{title}</h3>
          )}
          <div className={`text-sm ${style.text}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

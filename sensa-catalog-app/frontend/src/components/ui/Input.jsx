export function Input({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  icon,
  ...props
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          block w-full rounded-lg border border-gray-300 
          ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2
          text-gray-900 placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${className}
        `}
        {...props}
      />
    </div>
  )
}

export function Select({ 
  value,
  onChange,
  options = [],
  placeholder = 'Selecione...',
  className = ''
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`
        block w-full rounded-lg border border-gray-300 
        px-4 py-2
        text-gray-900
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${className}
      `}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

interface FormFieldProps {
  label: string
  children: React.ReactNode
  error?: string
}

export default function FormField({
  label,
  children,
  error,
}: FormFieldProps) {
  return (
    <label className="block space-y-2 text-sm text-slate-700">
      <span className="font-medium text-slate-900">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="block text-sm text-rose-600">
          {error}
        </span>
      ) : null}
    </label>
  )
}

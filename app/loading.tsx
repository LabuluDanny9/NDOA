export default function Loading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-slate-50"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
        <p className="mt-4 text-sm font-medium text-slate-600">
          Chargement de NDOA…
        </p>
      </div>
    </main>
  )
}

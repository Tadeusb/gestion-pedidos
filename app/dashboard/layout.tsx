export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">🍽️ El Buen Sabor</h1>
          <div className="flex gap-4">
            <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Inicio</a>
            <a href="/dashboard/menu" className="text-gray-600 hover:text-gray-900">Menú</a>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
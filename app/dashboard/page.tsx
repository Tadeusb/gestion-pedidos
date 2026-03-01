export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Panel de Administración</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Pedidos hoy</p>
          <p className="text-4xl font-bold text-gray-800 mt-1">0</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Ventas hoy</p>
          <p className="text-4xl font-bold text-green-600 mt-1">$0</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Productos activos</p>
          <p className="text-4xl font-bold text-gray-800 mt-1">0</p>
        </div>
      </div>
    </div>
  )
}
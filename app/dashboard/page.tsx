'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    pedidosHoy: 0,
    ventasHoy: 0,
    entregados: 0,
    cancelados: 0,
  })

  useEffect(() => {
    async function cargarStats() {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      const { data } = await supabase
        .from('orders')
        .select('status, total')
        .gte('created_at', hoy.toISOString())

      if (data) {
        const pedidosHoy = data.length
        const ventasHoy = data
          .filter(p => p.status !== 'cancelled')
          .reduce((acc, p) => acc + p.total, 0)
        const entregados = data.filter(p => p.status === 'delivered').length
        const cancelados = data.filter(p => p.status === 'cancelled').length

        setStats({ pedidosHoy, ventasHoy, entregados, cancelados })
      }
    }

    cargarStats()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Panel de Administración</h2>
      
      <p className="text-sm text-gray-500 mb-4">
        📅 {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Pedidos hoy</p>
          <p className="text-4xl font-bold text-gray-800 mt-1">{stats.pedidosHoy}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Ventas hoy</p>
          <p className="text-4xl font-bold text-green-600 mt-1">${stats.ventasHoy.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Entregados</p>
          <p className="text-4xl font-bold text-blue-600 mt-1">{stats.entregados}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Cancelados</p>
          <p className="text-4xl font-bold text-red-500 mt-1">{stats.cancelados}</p>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function MenuPage() {
  const [products, setProducts] = useState<any[]>([])

  async function cargarProductos() {
    const { data } = await supabase
      .from('products')
      .select(`*, categories (name)`)
    setProducts(data || [])
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  async function eliminarProducto(id: string) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return
    await supabase.from('products').delete().eq('id', id)
    cargarProductos()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Menú</h2>
        <a href="/dashboard/menu/nuevo" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Nuevo producto
        </a>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Producto</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Categoría</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Precio</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Disponible</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.description}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {product.categories?.name}
                </td>
                <td className="px-6 py-4 text-gray-800 font-medium">
                  ${product.price.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.is_available
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {product.is_available ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-3">
                  <a href={`/dashboard/menu/editar/${product.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Editar
                  </a>
                  <button
                    onClick={() => eliminarProducto(product.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
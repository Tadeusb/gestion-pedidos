'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<any[]>([])
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [editando, setEditando] = useState<any | null>(null)

  async function cargarCategorias() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')
    setCategorias(data || [])
  }

  useEffect(() => {
    cargarCategorias()
  }, [])

  async function handleGuardar() {
    if (!nombre.trim()) return
    setLoading(true)

    if (editando) {
      await supabase
        .from('categories')
        .update({ name: nombre })
        .eq('id', editando.id)
    } else {
      const businessId = (await supabase.from('businesses').select('id').single()).data?.id
      await supabase.from('categories').insert({
        name: nombre,
        business_id: businessId,
        sort_order: categorias.length + 1,
      })
    }

    setNombre('')
    setEditando(null)
    setLoading(false)
    cargarCategorias()
  }

  async function handleEliminar(id: string) {
    if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return
    await supabase.from('categories').delete().eq('id', id)
    cargarCategorias()
  }

  function handleEditar(categoria: any) {
    setEditando(categoria)
    setNombre(categoria.name)
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Categorías</h2>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="font-medium text-gray-700 mb-3">
          {editando ? 'Editar categoría' : 'Nueva categoría'}
        </h3>
        <div className="flex gap-2">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Combos, Bebidas, Postres"
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleGuardar}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {editando ? 'Guardar' : 'Agregar'}
          </button>
          {editando && (
            <button
              onClick={() => { setEditando(null); setNombre('') }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {categorias.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay categorías todavía</p>
        ) : (
          <ul>
            {categorias.map((cat, i) => (
              <li key={cat.id} className={`flex items-center justify-between px-6 py-4 ${i % 2 === 0 ? '' : 'bg-gray-50'} border-b`}>
                <span className="font-medium text-gray-800">{cat.name}</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditar(cat)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(cat.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

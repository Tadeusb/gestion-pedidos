'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NuevoProductoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imagen, setImagen] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImagen(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    let image_url = null

    if (imagen) {
      const nombreArchivo = `${Date.now()}-${imagen.name}`
      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(nombreArchivo, imagen)

      if (uploadError) {
        alert('Error subiendo imagen: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('productos')
        .getPublicUrl(nombreArchivo)

      image_url = urlData.publicUrl
    }

    const { error } = await supabase.from('products').insert({
      name: form.name,
      description: form.description,
      price: Number(form.price),
      business_id: (await supabase.from('businesses').select('id').single()).data?.id,
      is_available: true,
      image_url,
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      router.push('/dashboard/menu')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <a href="/dashboard/menu" className="text-gray-500 hover:text-gray-700">← Volver</a>
        <h2 className="text-2xl font-bold text-gray-800">Nuevo Producto</h2>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del producto
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Combo Familiar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Incluye sopa, seco y bebida"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio
            </label>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              type="number"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 15000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto del producto
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImagen}
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-600"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-2 w-full h-48 object-cover rounded-lg border"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar producto'}
          </button>
        </form>
      </div>
    </div>
  )
}
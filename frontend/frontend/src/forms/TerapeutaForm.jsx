import React, { useState, useEffect } from "react"
import InputField from "../components/InputField"

const estadoInicial = { usuario: "", contrasenia: "" }

function TerapeutaForm({ onTerapeutaCreado, terapeuta }) {
  const [form, setForm] = useState(estadoInicial)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")

  const esEdicion = Boolean(terapeuta && terapeuta.id)

  useEffect(() => {
    if (esEdicion) {
      setForm({
        usuario: terapeuta.usuario || "",
        contrasenia: terapeuta.contrasenia || ""
      })
    }
  }, [esEdicion, terapeuta])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError("")
    setMensaje("")
    setEnviando(true)
    try {
      const url = esEdicion ? `/terapeutas/${terapeuta.id}` : "/terapeutas"
      const method = esEdicion ? "PUT" : "POST"

      const token = localStorage.getItem("token")
      const headers = { "Content-Type": "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al guardar terapeuta")
      setMensaje(esEdicion ? "Terapeuta actualizado correctamente" : "Terapeuta agregado correctamente")
      setForm(estadoInicial)
      if (onTerapeutaCreado) onTerapeutaCreado()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <InputField
        label="Usuario"
        name="usuario"
        value={form.usuario}
        onChange={handleChange}
      />
      <InputField
        label="Contraseña"
        name="contrasenia"
        type="password"
        value={form.contrasenia}
        onChange={handleChange}
      />

      <div className="flex flex-col items-end gap-1 pt-2 max-w-md mx-auto">
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex justify-center px-5 py-2 rounded-full border border-[#cfe3f1] bg-[#e8f3fb] text-[#12263a] font-medium hover:bg-[#d6e8f7] disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {enviando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Guardar terapeuta"}
        </button>
        {error && <p className="text-sm text-[#ffd1d1]">{error}</p>}
        {mensaje && <p className="text-sm text-[#b9ffd2]">{mensaje}</p>}
      </div>
    </form>
  )
}

export default TerapeutaForm

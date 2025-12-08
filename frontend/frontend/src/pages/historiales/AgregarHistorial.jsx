import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import InputField from "../../components/InputField"

function AgregarHistorial({ pacientes, terapeutaActual, onHistorialCreado }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const paciente = pacientes.find(p => String(p.id) === id)

  const hoy = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    fecha: hoy,
    descripcion: "",
    tipoRegistro: ""
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")

  if (!paciente || !terapeutaActual) {
    return <p className="text-[#ffd1d1]">No se encontró paciente o terapeuta.</p>
  }

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
      const token = localStorage.getItem("token")
      const headers = { "Content-Type": "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`

      const body = {
        pacienteId: paciente.id,
        terapeutaId: terapeutaActual.id,
        fecha: form.fecha,
        descripcion: form.descripcion,
        tipoRegistro: form.tipoRegistro
      }
      const res = await fetch("/historiales", {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al guardar historial")
      if (onHistorialCreado) onHistorialCreado()
      setMensaje("Historial agregado correctamente")
      navigate(`/pacientes/${paciente.id}/historial`)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="bg-[#3c5a85] rounded-[14px] p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
      <h1 className="text-2xl font-semibold mb-2 text-center text-[#edf8f9]">
        Nuevo historial
      </h1>
      <p className="text-center text-sm text-[#edf8f9cc] mb-6">
        Paciente: {paciente.nombre} {paciente.apellido}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <InputField
          label="Fecha"
          name="fecha"
          type="date"
          value={form.fecha}
          onChange={handleChange}
        />

        <div className="flex flex-col gap-1 max-w-md mx-auto">
          <label className="text-sm font-medium text-[#edf8f9] text-left">
            Tipo de registro
          </label>
          <select
            name="tipoRegistro"
            value={form.tipoRegistro}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl border-2 border-[#edf8f9] bg-[#3d5a80] text-[#edf8f9] outline-none focus:ring-2 focus:ring-[#edf8f9] focus:ring-offset-2 focus:ring-offset-[#3c5a85]"
          >
            <option value="">Seleccionar tipo</option>
            <option value="Sesión">Sesión</option>
            <option value="Primera entrevista">Primera entrevista</option>
            <option value="Reunión con familia">Reunión con familia</option>
            <option value="Reunión con terapeutas">Reunión con terapeutas</option>
            <option value="Reunión con escuela">Reunión con escuela</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 max-w-md mx-auto">
          <label className="text-sm font-medium text-[#edf8f9] text-left">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl border-2 border-[#edf8f9] bg-[#3d5a80] text-[#edf8f9] placeholder:text-[#edf8f9aa] outline-none transition resize-none h-32 focus:ring-2 focus:ring-[#edf8f9] focus:ring-offset-2 focus:ring-offset-[#3c5a85]"
          />
        </div>

        <div className="flex flex-col items-end gap-1 pt-2 max-w-md mx-auto">
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex justify-center px-5 py-2 rounded-full border border-[#cfe3f1] bg-[#e8f3fb] text-[#12263a] font-medium hover:bg-[#d6e8f7] disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {enviando ? "Guardando..." : "Guardar historial"}
          </button>
          {error && <p className="text-sm text-[#ffd1d1]">{error}</p>}
          {mensaje && <p className="text-sm text-[#b9ffd2]">{mensaje}</p>}
        </div>
      </form>
    </div>
  )
}

export default AgregarHistorial

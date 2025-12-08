import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import InputField from "../components/InputField"

const estadoInicial = {
  nombre: "",
  apellido: "",
  dni: "",
  telefono: "",
  fechaNac: "",
  motivoConsulta: "",
  nivelEducativo: "",
  gradoCurso: "",
  genero: ""
}

function PacienteForm({ onPacienteCreado, paciente }) {
  const [form, setForm] = useState(estadoInicial)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [mostrarPopup, setMostrarPopup] = useState(false)
  const [nuevoId, setNuevoId] = useState(null)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const navigate = useNavigate()

  const esEdicion = Boolean(paciente && paciente.id)

  useEffect(() => {
    if (esEdicion) {
      setForm({
        nombre: paciente.nombre || "",
        apellido: paciente.apellido || "",
        dni: paciente.dni || "",
        telefono: paciente.telefono || "",
        fechaNac: paciente.fechaNac || "",
        motivoConsulta: paciente.motivoConsulta || "",
        nivelEducativo: paciente.nivelEducativo || "",
        gradoCurso: paciente.gradoCurso || "",
        genero: paciente.genero || ""
      })
    }
  }, [esEdicion, paciente])

  const handleChange = e => {
    const { name, value } = e.target
    if ((name === "dni" || name === "telefono") && /[^0-9]/.test(value)) return
    if (name === "gradoCurso" && value !== "" && (value < 1 || value > 7)) return
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const guardarPaciente = async () => {
    setError("")
    setMensaje("")
    setEnviando(true)
    try {
      const url = esEdicion ? `/pacientes/${paciente.id}` : "/pacientes"
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
      if (!res.ok) throw new Error(data.error || "Error al guardar el paciente")

      if (!esEdicion) {
        setForm(estadoInicial)
        setNuevoId(data.id)
      } else {
        setNuevoId(data.id || paciente.id)
      }
      setMostrarPopup(true)

      if (onPacienteCreado) onPacienteCreado()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (esEdicion) {
      setMostrarConfirmacion(true)
    } else {
      await guardarPaciente()
    }
  }

  const irADetalle = () => {
    if (nuevoId) {
      navigate(`/pacientes/detalle/${nuevoId}`)
    }
  }

  const campos = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "dni", label: "DNI" },
    { key: "telefono", label: "Teléfono" },
    { key: "fechaNac", label: "Fecha de nacimiento" },
    { key: "nivelEducativo", label: "Nivel educativo" },
    { key: "gradoCurso", label: "Grado/Curso" },
    { key: "genero", label: "Género" },
    { key: "motivoConsulta", label: "Motivo de consulta" }
  ]

  const cambios = esEdicion
    ? campos.filter(c => String(paciente?.[c.key] ?? "") !== String(form[c.key] ?? ""))
    : []

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <InputField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} />
        <InputField label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} />
        <InputField label="DNI" name="dni" type="text" value={form.dni} onChange={handleChange} />
        <InputField
          label="Teléfono"
          name="telefono"
          type="text"
          value={form.telefono}
          onChange={handleChange}
        />
        <InputField
          label="Fecha de nacimiento"
          name="fechaNac"
          type="date"
          value={form.fechaNac}
          onChange={handleChange}
        />

        <div className="flex flex-col gap-1 max-w-md mx-auto">
          <label className="text-sm font-medium text-[#edf8f9] text-left">
            Nivel educativo
          </label>
          <select
            name="nivelEducativo"
            value={form.nivelEducativo}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl border-2 border-[#edf8f9] bg-[#3d5a80] text-[#edf8f9] outline-none focus:ring-2 focus:ring-[#edf8f9] focus:ring-offset-2 focus:ring-offset-[#3c5a85]"
          >
            <option value="">Seleccionar nivel</option>
            <option value="Inicial (en curso)">Inicial (en curso)</option>
            <option value="Inicial (completo)">Inicial (completo)</option>
            <option value="Inicial (abandonado)">Inicial (abandonado)</option>
            <option value="Primario (en curso)">Primario (en curso)</option>
            <option value="Primario (completo)">Primario (completo)</option>
            <option value="Primario (abandonado)">Primario (abandonado)</option>
            <option value="Secundario (en curso)">Secundario (en curso)</option>
            <option value="Secundario (completo)">Secundario (completo)</option>
            <option value="Secundario (abandonado)">Secundario (abandonado)</option>
            <option value="Terciario (en curso)">Terciario (en curso)</option>
            <option value="Terciario (completo)">Terciario (completo)</option>
            <option value="Terciario (abandonado)">Terciario (abandonado)</option>
            <option value="Universitario (en curso)">Universitario (en curso)</option>
            <option value="Universitario (completo)">Universitario (completo)</option>
            <option value="Universitario (abandonado)">Universitario (abandonado)</option>
            <option value="Posgrado (en curso)">Posgrado (en curso)</option>
            <option value="Posgrado (completo)">Posgrado (completo)</option>
            <option value="Posgrado (abandonado)">Posgrado (abandonado)</option>
          </select>
        </div>

        <InputField
          label="Grado/Curso"
          name="gradoCurso"
          type="number"
          value={form.gradoCurso}
          onChange={handleChange}
        />

        <div className="flex flex-col gap-1 max-w-md mx-auto">
          <label className="text-sm font-medium text-[#edf8f9] text-left">
            Género
          </label>
          <select
            name="genero"
            value={form.genero}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl border-2 border-[#edf8f9] bg-[#3d5a80] text-[#edf8f9] outline-none focus:ring-2 focus:ring-[#edf8f9] focus:ring-offset-2 focus:ring-offset-[#3c5a85]"
          >
            <option value="">Seleccionar género</option>
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
            <option value="No contesta">No contesta</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 max-w-md mx-auto">
          <label className="text-sm font-medium text-[#edf8f9] text-left">
            Motivo de consulta
          </label>
          <textarea
            name="motivoConsulta"
            value={form.motivoConsulta}
            onChange={handleChange}
            maxLength={500}
            className="w-full px-3 py-2 rounded-xl border-2 border-[#edf8f9] bg-[#3d5a80] text-[#edf8f9] placeholder:text-[#edf8f9aa] outline-none transition resize-none h-32 focus:ring-2 focus:ring-[#edf8f9] focus:ring-offset-2 focus:ring-offset-[#3c5a85]"
          />
        </div>

        <div className="flex flex-col items-end gap-1 pt-2 max-w-md mx-auto">
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex justify-center px-5 py-2 rounded-full border border-[#cfe3f1] bg-[#e8f3fb] text-[#12263a] font-medium hover:bg-[#d6e8f7] disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {enviando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Guardar paciente"}
          </button>
          {error && <p className="text-sm text-[#ffd1d1]">{error}</p>}
          {mensaje && <p className="text-sm text-[#b9ffd2]">{mensaje}</p>}
        </div>
      </form>

      {mostrarConfirmacion && esEdicion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-[#12263a] p-6 rounded-xl w-96 max-h-[80vh] flex flex-col">
            <h2 className="text-lg font-semibold mb-2 text-center">
              Confirmar edición
            </h2>
            <p className="text-sm mb-3 text-center">
              Revisá los datos modificados antes de guardar.
            </p>
            <div className="flex-1 overflow-y-auto text-sm space-y-2">
              {cambios.length === 0 ? (
                <p className="text-xs text-center text-gray-500">
                  No se detectaron cambios en los datos.
                </p>
              ) : (
                cambios.map(c => (
                  <div
                    key={c.key}
                    className="border-b border-gray-200 pb-1 mb-1 last:border-b-0 last:pb-0 last:mb-0"
                  >
                    <p className="font-semibold">{c.label}</p>
                    <p className="text-xs">
                      Anterior: {paciente?.[c.key] || "-"}
                    </p>
                    <p className="text-xs">
                      Nuevo: {form[c.key] || "-"}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setMostrarConfirmacion(false)}
                className="px-4 py-2 rounded-full border border-gray-300 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setMostrarConfirmacion(false)
                  await guardarPaciente()
                }}
                className="px-4 py-2 rounded-full bg-[#3c5a85] text-white text-sm hover:bg-[#2d4668]"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-[#12263a] p-6 rounded-xl w-80 text-center space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold">
              {esEdicion ? "Paciente actualizado con éxito" : "Paciente cargado con éxito"}
            </h2>
            <button
              onClick={irADetalle}
              className="px-4 py-2 bg-[#3c5a85] text-white rounded-full hover:bg-[#2d4668] transition"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default PacienteForm

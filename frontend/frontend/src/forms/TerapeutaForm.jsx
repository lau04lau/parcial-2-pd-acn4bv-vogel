import React, { useState, useEffect } from "react"
import InputField from "../components/InputField"

const estadoInicial = { usuario: "", contrasenia: "", esAdmin: false }

function TerapeutaForm({ onTerapeutaCreado, terapeuta }) {
  const [form, setForm] = useState(estadoInicial)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [original, setOriginal] = useState(null)

  const esEdicion = Boolean(terapeuta && terapeuta.id)

  useEffect(() => {
    if (esEdicion) {
      const base = {
        usuario: terapeuta.usuario || "",
        esAdmin: terapeuta.esAdmin || false
      }
      setForm({
        usuario: base.usuario,
        contrasenia: "",
        esAdmin: base.esAdmin
      })
      setOriginal(base)
    } else {
      setForm(estadoInicial)
      setOriginal(null)
    }
  }, [esEdicion, terapeuta])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    setError("")
    setMensaje("")
    setMostrarConfirmacion(true)
  }

  const confirmarOperacion = async () => {
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
      setMostrarConfirmacion(false)
    } catch (err) {
      setError(err.message)
      setMostrarConfirmacion(false)
    } finally {
      setEnviando(false)
    }
  }

  const cancelarConfirmacion = () => {
    setMostrarConfirmacion(false)
  }

  const hayCambios =
    esEdicion &&
    original &&
    (original.usuario !== form.usuario || original.esAdmin !== form.esAdmin)

  return (
    <>
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

        <div className="flex items-center gap-2 text-[#edf8f9]">
          <input
            type="checkbox"
            name="esAdmin"
            checked={form.esAdmin}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <label>Administrador</label>
        </div>

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

      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-[#12263a] p-6 rounded-xl w-full max-w-md shadow-lg space-y-4">
            <h2 className="text-lg font-semibold text-center">
              {esEdicion ? "Confirmar edición de terapeuta" : "Confirmar nuevo terapeuta"}
            </h2>

            {!esEdicion && (
              <div className="text-sm space-y-1">
                <p>
                  Vas a crear el terapeuta:
                </p>
                <p>
                  <strong>Usuario:</strong> {form.usuario || "(sin usuario)"}
                </p>
                <p>
                  <strong>Administrador:</strong> {form.esAdmin ? "Sí" : "No"}
                </p>
              </div>
            )}

            {esEdicion && (
              <div className="text-sm space-y-2">
                <p>Revisá los cambios antes de guardar:</p>
                <div className="border border-[#e0e6ef] rounded-lg p-3 space-y-1 bg-[#f7f9fc]">
                  <p>
                    <strong>Usuario:</strong>{" "}
                    {original?.usuario === form.usuario
                      ? form.usuario
                      : `${original?.usuario} → ${form.usuario || "(vacío)"}`}
                  </p>
                  <p>
                    <strong>Administrador:</strong>{" "}
                    {original?.esAdmin === form.esAdmin
                      ? form.esAdmin ? "Sí" : "No"
                      : `${original?.esAdmin ? "Sí" : "No"} → ${form.esAdmin ? "Sí" : "No"}`}
                  </p>
                </div>
                {!hayCambios && (
                  <p className="text-xs text-[#777]">
                    No se detectan cambios con respecto a los datos actuales.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={cancelarConfirmacion}
                className="px-4 py-2 rounded-full border border-gray-400 text-sm hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarOperacion}
                disabled={enviando}
                className="px-4 py-2 rounded-full bg-[#3c5a85] text-white text-sm hover:bg-[#2d456f] disabled:opacity-60"
              >
                {enviando ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TerapeutaForm

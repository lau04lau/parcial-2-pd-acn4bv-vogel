import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

function DetallePaciente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const obtenerPaciente = async () => {
      try {
        const res = await fetch(`/pacientes/${id}`)
        if (!res.ok) throw new Error("No se pudo obtener la información del paciente")
        const data = await res.json()
        setPaciente(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setCargando(false)
      }
    }

    obtenerPaciente()
  }, [id])

  if (cargando) {
    return <p className="text-[#edf8f9] text-center">Cargando datos del paciente...</p>
  }

  if (error) {
    return <p className="text-[#ffd1d1] text-center">{error}</p>
  }

  if (!paciente) {
    return <p className="text-[#ffd1d1] text-center">Paciente no encontrado.</p>
  }

  return (
    <div className="bg-[#3c5a85] rounded-[14px] p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)] space-y-6">
      <h1 className="text-2xl font-semibold mb-2 text-center text-[#edf8f9]">
        Detalle del paciente
      </h1>

      <div className="bg-[#ffffff] text-[#12263a] rounded-[12px] p-5 space-y-2">
        <p><span className="font-semibold">Nombre:</span> {paciente.nombre} {paciente.apellido}</p>
        <p><span className="font-semibold">DNI:</span> {paciente.dni}</p>
        <p><span className="font-semibold">Teléfono:</span> {paciente.telefono}</p>
        <p><span className="font-semibold">Fecha de nacimiento:</span> {paciente.fechaNac}</p>
        <p><span className="font-semibold">Género:</span> {paciente.genero}</p>
        <p><span className="font-semibold">Nivel educativo:</span> {paciente.nivelEducativo}</p>
        <p><span className="font-semibold">Grado/Curso:</span> {paciente.gradoCurso}</p>
        <p><span className="font-semibold">Motivo de consulta:</span></p>
        <p className="whitespace-pre-line">{paciente.motivoConsulta}</p>
      </div>

      <div className="flex justify-between items-center">
        <button
          className="px-4 py-2 rounded-full bg-[#e8f3fb] text-[#12263a] border border-[#cfe3f1] hover:bg-[#d6e8f7] text-sm transition"
          onClick={() => navigate(`/pacientes/${paciente.id}/historial`)}
        >
          Ver historial
        </button>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-full bg-[#e8f3fb] text-[#12263a] border border-[#cfe3f1] hover:bg-[#d6e8f7] text-sm transition"
            onClick={() => navigate(`/pacientes/editar/${paciente.id}`)}
          >
            Editar
          </button>
          <button
            className="px-4 py-2 rounded-full bg-[#e8f3fb] text-[#12263a] border border-[#cfe3f1] hover:bg-[#d6e8f7] text-sm transition"
            onClick={() => navigate("/pacientes")}
          >
            Volver al listado
          </button>
        </div>
      </div>
    </div>
  )
}

export default DetallePaciente

import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

function HistorialPaciente({ pacientes, historiales, terapeutaActual }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const paciente = pacientes.find(p => String(p.id) === id)
  const [paginaActual, setPaginaActual] = useState(1)
  const [filtroTipo, setFiltroTipo] = useState("")
  const porPagina = 5

  if (!paciente || !terapeutaActual) {
    return <p className="text-[#ffd1d1]">No se encontró paciente o terapeuta.</p>
  }

  const historialesBase = historiales.filter(
    h =>
      String(h.pacienteId) === String(paciente.id) &&
      String(h.terapeutaId) === String(terapeutaActual.id)
  )

  const historialesOrdenados = [...historialesBase].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  )

  const historialesFiltrados = filtroTipo
    ? historialesOrdenados.filter(h => h.tipoRegistro === filtroTipo)
    : historialesOrdenados

  const totalPaginas = Math.ceil(historialesFiltrados.length / porPagina) || 1
  const paginaSegura = Math.min(paginaActual, totalPaginas)
  const inicio = (paginaSegura - 1) * porPagina
  const historialesPagina = historialesFiltrados.slice(inicio, inicio + porPagina)

  const cambiarPagina = pagina => {
    if (pagina < 1 || pagina > totalPaginas) return
    setPaginaActual(pagina)
  }

  const handleFiltroChange = e => {
    setFiltroTipo(e.target.value)
    setPaginaActual(1)
  }

  return (
    <div className="bg-[#3c5a85] rounded-[14px] p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)] space-y-5">
      <h1 className="text-2xl font-semibold text-center text-[#edf8f9]">
        Historial del paciente
      </h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p className="text-sm text-[#edf8f9cc]">
          Paciente: {paciente.nombre} {paciente.apellido}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#edf8f9cc]">Filtrar por tipo</span>
          <select
            value={filtroTipo}
            onChange={handleFiltroChange}
            className="px-3 py-1 rounded-full border border-[#edf8f9] bg-[#3d5a80] text-[#edf8f9] text-xs outline-none focus:ring-2 focus:ring-[#edf8f9] focus:ring-offset-2 focus:ring-offset-[#3c5a85]"
          >
            <option value="">Todos</option>
            <option value="Sesión">Sesión</option>
            <option value="Primera entrevista">Primera entrevista</option>
            <option value="Reunión con familia">Reunión con familia</option>
            <option value="Reunión con terapeutas">Reunión con terapeutas</option>
            <option value="Reunión con escuela">Reunión con escuela</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          className="px-4 py-2 rounded-full bg-[#e8f3fb] text-[#12263a] border border-[#cfe3f1] hover:bg-[#d6e8f7] text-sm transition"
          onClick={() => navigate(`/pacientes/${paciente.id}/historial/nuevo`)}
        >
          Agregar historial
        </button>
        <button
          className="px-4 py-2 rounded-full bg-[#e8f3fb] text-[#12263a] border border-[#cfe3f1] hover:bg-[#d6e8f7] text-sm transition"
          onClick={() => navigate(`/pacientes/detalle/${paciente.id}`)}
        >
          Volver al detalle
        </button>
      </div>

      <div className="bg-[#ffffff] text-[#12263a] rounded-[12px] p-5">
        {historialesFiltrados.length === 0 ? (
          <p className="text-sm text-[#555]">
            No hay historiales para este paciente con el terapeuta actual.
          </p>
        ) : (
          <>
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {historialesPagina.map(h => (
                <li
                  key={h.id}
                  className="border border-[#e0e6ef] rounded-lg px-3 py-2 bg-[#f7f9fc]"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold">{h.fecha}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#dce9f8] text-[#12263a]">
                      {h.tipoRegistro}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{h.descripcion}</p>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between mt-4 text-xs">
              <span>
                Página {paginaSegura} de {totalPaginas}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => cambiarPagina(paginaSegura - 1)}
                  disabled={paginaSegura === 1}
                  className={`${
                    paginaSegura === 1
                      ? "text-[#a0a0a0] cursor-default"
                      : "text-[#3c5a85] hover:underline cursor-pointer"
                  } bg-transparent border-none outline-none`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => cambiarPagina(paginaSegura + 1)}
                  disabled={paginaSegura === totalPaginas}
                  className={`${
                    paginaSegura === totalPaginas
                      ? "text-[#a0a0a0] cursor-default"
                      : "text-[#3c5a85] hover:underline cursor-pointer"
                  } bg-transparent border-none outline-none`}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default HistorialPaciente

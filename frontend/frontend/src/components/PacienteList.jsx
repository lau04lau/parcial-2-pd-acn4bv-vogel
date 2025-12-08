import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"

function PacienteList({ pacientes, onEliminar }) {
  const navigate = useNavigate()
  const [paginaActual, setPaginaActual] = useState(1)
  const [busqueda, setBusqueda] = useState("")
  const [pacienteAEliminar, setPacienteAEliminar] = useState(null)
  const porPagina = 5

  if (!pacientes.length) {
    return <p className="text-sm text-[#edf8f9]">No hay pacientes cargados.</p>
  }

  const pacientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return pacientes
    return pacientes.filter(p => {
      const nombre = `${p.nombre || ""}`.toLowerCase()
      const apellido = `${p.apellido || ""}`.toLowerCase()
      const dni = `${p.dni || ""}`.toLowerCase()
      return (
        nombre.includes(termino) ||
        apellido.includes(termino) ||
        dni.includes(termino)
      )
    })
  }, [busqueda, pacientes])

  const totalPaginas = Math.ceil(pacientesFiltrados.length / porPagina) || 1
  const paginaSegura = Math.min(paginaActual, totalPaginas)
  const inicio = (paginaSegura - 1) * porPagina
  const pacientesPagina = pacientesFiltrados.slice(inicio, inicio + porPagina)

  const cambiarPagina = pagina => {
    if (pagina < 1 || pagina > totalPaginas) return
    setPaginaActual(pagina)
  }

  const handleBusquedaChange = e => {
    setBusqueda(e.target.value)
    setPaginaActual(1)
  }

  const cancelarEliminar = () => {
    setPacienteAEliminar(null)
  }

  const confirmarEliminar = () => {
    if (pacienteAEliminar) {
      onEliminar(pacienteAEliminar.id)
      setPacienteAEliminar(null)
    }
  }

  return (
    <>
      <div className="bg-[#ffffff] text-[#12263a] rounded-[12px] shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
        <div className="flex justify-between items-center px-4 pt-3 pb-2 gap-3">
          <h2 className="text-base font-semibold">Listado de pacientes</h2>
          <div className="max-w-xs w-full">
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o DNI"
              value={busqueda}
              onChange={handleBusquedaChange}
              className="w-full px-3 py-1.5 rounded-full border border-[#cfe3f1] text-sm outline-none bg-[#f5f8fc] focus:bg-white focus:ring-2 focus:ring-[#3c5a85]"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {pacientesFiltrados.length === 0 ? (
            <p className="text-sm text-[#555] px-4 py-3">
              No hay pacientes que coincidan con la búsqueda.
            </p>
          ) : (
            <table className="min-w-full text-sm table-fixed">
              <thead>
                <tr className="bg-[#f2f6fb]">
                  <th className="px-3 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-left">DNI</th>
                  <th className="px-3 py-2 text-left">Teléfono</th>
                  <th className="px-3 py-2 text-left">Nivel</th>
                  <th className="px-3 py-2 text-left w-40">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientesPagina.map(p => (
                  <tr key={p.id} className="border-b border-[#e9eef3] last:border-b-0">
                    <td className="px-3 py-2 truncate">
                      <button
                        className="text-left text-[#3c5a85] hover:underline"
                        onClick={() => navigate(`/pacientes/detalle/${p.id}`)}
                      >
                        {p.nombre} {p.apellido}
                      </button>
                    </td>
                    <td className="px-3 py-2 truncate">{p.dni}</td>
                    <td className="px-3 py-2 truncate">{p.telefono}</td>
                    <td className="px-3 py-2 truncate">{p.nivelEducativo}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 rounded-full text-xs bg-[#e8f3fb] text-[#12263a] border border-[#cfe3f1] hover:bg-[#d6e8f7] transition"
                          onClick={() => navigate(`/pacientes/editar/${p.id}`)}
                        >
                          Editar
                        </button>
                        <button
                          className="px-3 py-1 rounded-full text-xs bg-[#ffd1d1] text-[#12263a] border border-[#f5aaaa] hover:bg-[#f7b9b9] transition"
                          onClick={() => setPacienteAEliminar(p)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 text-xs">
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
      </div>

      {pacienteAEliminar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-[#12263a] p-6 rounded-xl w-80 shadow-lg space-y-4 text-center">
            <h2 className="text-lg font-semibold">
              ¿Eliminar paciente?
            </h2>
            <p className="text-sm">
              Estás por eliminar a{" "}
              <strong>
                {pacienteAEliminar.nombre} {pacienteAEliminar.apellido}
              </strong>
              .
              <br />
              ¿Deseás continuar?
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={cancelarEliminar}
                className="px-4 py-2 rounded-full border border-gray-400 text-sm hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                className="px-4 py-2 bg-[#c0392b] text-white rounded-full text-sm hover:bg-[#a5281d]"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PacienteList

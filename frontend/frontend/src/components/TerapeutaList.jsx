import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

function TerapeutaList({ terapeutas, onEliminar }) {
  const navigate = useNavigate()
  const [paginaActual, setPaginaActual] = useState(1)
  const [terapeutaAEliminar, setTerapeutaAEliminar] = useState(null)
  const porPagina = 5

  if (!terapeutas.length) {
    return <p className="text-sm text-[#edf8f9]">No hay terapeutas cargados.</p>
  }

  const totalPaginas = Math.ceil(terapeutas.length / porPagina)
  const inicio = (paginaActual - 1) * porPagina
  const terapeutasPagina = terapeutas.slice(inicio, inicio + porPagina)

  const cambiarPagina = pagina => {
    if (pagina < 1 || pagina > totalPaginas) return
    setPaginaActual(pagina)
  }

  const cancelarEliminar = () => {
    setTerapeutaAEliminar(null)
  }

  const confirmarEliminar = () => {
    if (terapeutaAEliminar) {
      onEliminar(terapeutaAEliminar.id)
      setTerapeutaAEliminar(null)
    }
  }

  return (
    <>
      <div className="bg-[#ffffff] text-[#12263a] rounded-[12px] shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
        <h2 className="text-lg font-semibold text-center text-[#12263a] py-3 border-b border-[#e9eef3] bg-[#f2f6fb] rounded-t-[12px]">
          Listado de terapeutas
        </h2>

        <div className="max-h-80 overflow-y-auto">
          <table className="min-w-full text-sm table-fixed">
            <thead>
              <tr className="bg-[#f2f6fb]">
                <th className="px-3 py-2 text-left w-1/2">Usuario</th>
                <th className="px-3 py-2 text-left w-1/2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {terapeutasPagina.map(t => (
                <tr key={t.id} className="border-b border-[#e9eef3] last:border-b-0">
                  <td className="px-3 py-2 truncate">
                    <button
                      className="text-left text-[#3c5a85] hover:underline"
                      onClick={() => navigate(`/terapeutas/detalle/${t.id}`)}
                    >
                      {t.usuario}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-start gap-2">
                      <button
                        className="px-3 py-1 rounded-full text-xs bg-[#e8f3fb] text-[#12263a] border border-[#cfe3f1] hover:bg-[#d6e8f7] transition"
                        onClick={() => navigate(`/terapeutas/editar/${t.id}`)}
                      >
                        Editar
                      </button>
                      <button
                        className="px-3 py-1 rounded-full text-xs bg-[#ffd1d1] text-[#12263a] border border-[#f5aaaa] hover:bg-[#f7b9b9] transition"
                        onClick={() => setTerapeutaAEliminar(t)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-2 text-xs">
          <span>
            Página {paginaActual} de {totalPaginas}
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className={`${
                paginaActual === 1
                  ? "text-[#a0a0a0] cursor-default"
                  : "text-[#3c5a85] hover:underline cursor-pointer"
              } bg-transparent border-none outline-none`}
            >
              Anterior
            </button>
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className={`${
                paginaActual === totalPaginas
                  ? "text-[#a0a0a0] cursor-default"
                  : "text-[#3c5a85] hover:underline cursor-pointer"
              } bg-transparent border-none outline-none`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {terapeutaAEliminar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-[#12263a] p-6 rounded-xl w-80 shadow-lg space-y-4 text-center">
            <h2 className="text-lg font-semibold">
              ¿Eliminar terapeuta?
            </h2>
            <p className="text-sm">
              Estás por eliminar al terapeuta{" "}
              <strong>{terapeutaAEliminar.usuario}</strong>.
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

export default TerapeutaList

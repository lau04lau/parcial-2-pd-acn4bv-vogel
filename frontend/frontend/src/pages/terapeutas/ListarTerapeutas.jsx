import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import TerapeutaList from "../../components/TerapeutaList"

function ListarTerapeutas({ terapeutas, cargando, error, onEliminar }) {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/acceso-denegado")
      return
    }
    try {
      const [, payloadBase64] = token.split(".")
      const payloadJson = atob(payloadBase64)
      const payload = JSON.parse(payloadJson)
      if (!payload.esAdmin) {
        navigate("/acceso-denegado")
      }
    } catch (e) {
      navigate("/acceso-denegado")
    }
  }, [navigate])

  return (
    <div className="bg-[#3c5a85] rounded-[14px] p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
      <h2 className="text-lg font-semibold mb-4 text-[#edf8f9]">Listado de terapeutas</h2>
      {cargando && <p className="mb-2 text-[#edf8f9]">Cargando...</p>}
      {error && <p className="mb-2 text-[#ffd1d1]">{error}</p>}
      <TerapeutaList terapeutas={terapeutas} onEliminar={onEliminar} />
    </div>
  )
}

export default ListarTerapeutas

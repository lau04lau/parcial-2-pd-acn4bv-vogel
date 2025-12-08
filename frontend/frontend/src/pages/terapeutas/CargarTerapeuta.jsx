import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import TerapeutaForm from "../../forms/TerapeutaForm"

function CargarTerapeuta({ onTerapeutaCreado }) {
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
      <h1 className="text-2xl font-semibold mb-6 text-center text-[#edf8f9]">
        Nuevo terapeuta
      </h1>
      <TerapeutaForm onTerapeutaCreado={onTerapeutaCreado} />
    </div>
  )
}

export default CargarTerapeuta

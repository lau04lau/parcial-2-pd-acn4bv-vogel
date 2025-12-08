import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import InputField from "../components/InputField"

function LoginTerapeuta({ onLoginExitoso }) {
  const [form, setForm] = useState({ usuario: "", contrasenia: "" })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")
  const navigate = useNavigate()

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
      const res = await fetch("/login-terapeuta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Credenciales inválidas")
      }
      if (data.token) {
        localStorage.setItem("token", data.token)
      }
      if (onLoginExitoso) onLoginExitoso(data.terapeuta)
      setMensaje("Inicio de sesión correcto")
      navigate("/pacientes")
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="bg-[#3c5a85] rounded-[14px] p-6 md:p-8 shadow-[0_6px_16px_rgba(0,0,0,0.12)] max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-center text-[#edf8f9]">
        Login terapeuta
      </h1>
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
        <div className="flex flex-col items-end gap-1 pt-2">
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex justify-center px-5 py-2 rounded-full border border-[#cfe3f1] bg-[#e8f3fb] text-[#12263a] font-medium hover:bg-[#d6e8f7] disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {enviando ? "Ingresando..." : "Ingresar"}
          </button>
          {error && <p className="text-sm text-[#ffd1d1]">{error}</p>}
          {mensaje && <p className="text-sm text-[#b9ffd2]">{mensaje}</p>}
        </div>
      </form>
    </div>
  )
}

export default LoginTerapeuta

import React, { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

function NavBar({ terapeutaActual, onLogout }) {
  const navigate = useNavigate()
  const [openPacientes, setOpenPacientes] = useState(false)
  const [openTerapeutas, setOpenTerapeutas] = useState(false)

  const handleLogout = () => {
    if (window.confirm("¿Deseás cerrar sesión?")) {
      onLogout()
    }
  }

  const irAPacientes = ruta => {
    navigate(ruta)
    setOpenPacientes(false)
  }

  const irATerapeutas = ruta => {
    navigate(ruta)
    setOpenTerapeutas(false)
  }

  const esAdmin = terapeutaActual && terapeutaActual.esAdmin

  return (
    <div className="w-full bg-[#12263a] shadow-md">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 rounded-full border-2 border-[#e8f3fb] object-cover"
          />
          <span className="text-[#e8f3fb] font-semibold text-lg">
            Gestor Psicopedagógico
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm md:text-base">
          <div className="flex items-center gap-3">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-full transition ${
                  isActive
                    ? "bg-[#e8f3fb] text-[#12263a]"
                    : "text-[#e8f3fb] hover:bg-[#3c5a85]"
                }`
              }
            >
              Inicio
            </NavLink>

            {terapeutaActual && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setOpenPacientes(prev => !prev)
                    setOpenTerapeutas(false)
                  }}
                  className="px-4 py-2 rounded-full bg-[#e8f3fb] text-[#12263a] font-medium hover:bg-[#d6e8f7] transition flex items-center gap-1"
                >
                  Pacientes
                  <span className="text-xs">▾</span>
                </button>
                {openPacientes && (
                  <div className="absolute right-0 mt-2 w-40 rounded-lg bg-[#12263a] border border-[#3c5a85] shadow-lg z-20">
                    <button
                      className="w-full text-left px-4 py-2 text-[#e8f3fb] hover:bg-[#3c5a85] text-sm"
                      onClick={() => irAPacientes("/pacientes/nuevo")}
                    >
                      Agregar
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-[#e8f3fb] hover:bg-[#3c5a85] text-sm"
                      onClick={() => irAPacientes("/pacientes")}
                    >
                      Listado
                    </button>
                  </div>
                )}
              </div>
            )}

            {terapeutaActual && esAdmin && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setOpenTerapeutas(prev => !prev)
                    setOpenPacientes(false)
                  }}
                  className="px-4 py-2 rounded-full bg-[#e8f3fb] text-[#12263a] font-medium hover:bg-[#d6e8f7] transition flex items-center gap-1"
                >
                  Terapeutas
                  <span className="text-xs">▾</span>
                </button>
                {openTerapeutas && (
                  <div className="absolute right-0 mt-2 w-44 rounded-lg bg-[#12263a] border border-[#3c5a85] shadow-lg z-20">
                    <button
                      className="w-full text-left px-4 py-2 text-[#e8f3fb] hover:bg-[#3c5a85] text-sm"
                      onClick={() => irATerapeutas("/terapeutas/nuevo")}
                    >
                      Agregar
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-[#e8f3fb] hover:bg-[#3c5a85] text-sm"
                      onClick={() => irATerapeutas("/terapeutas")}
                    >
                      Listado
                    </button>
                  </div>
                )}
              </div>
            )}

            {!terapeutaActual ? (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full transition ${
                    isActive
                      ? "bg-[#e8f3fb] text-[#12263a]"
                      : "text-[#e8f3fb] hover:bg-[#3c5a85]"
                  }`
                }
              >
                Login
              </NavLink>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-[#e8f3fb] text-[#12263a] font-medium hover:bg-[#d6e8f7] transition"
              >
                Logout
              </button>
            )}
          </div>

          {terapeutaActual && (
            <span className="text-xs md:text-sm text-[#e8f3fbcc] font-medium">
              {terapeutaActual.usuario}
              {esAdmin ? " (admin)" : ""}
            </span>
          )}
        </div>
      </nav>
    </div>
  )
}

export default NavBar

import React, { useEffect, useState } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import NavBar from "./components/NavBar"
import Bienvenida from "./pages/Bienvenida"
import CargarPaciente from "./pages/pacientes/CargarPaciente"
import ListarPacientes from "./pages/pacientes/ListarPacientes"
import EditarPaciente from "./pages/pacientes/EditarPaciente"
import DetallePaciente from "./pages/pacientes/DetallePaciente"
import CargarTerapeuta from "./pages/terapeutas/CargarTerapeuta"
import ListarTerapeutas from "./pages/terapeutas/ListarTerapeutas"
import EditarTerapeuta from "./pages/terapeutas/EditarTerapeuta"
import DetalleTerapeuta from "./pages/terapeutas/DetalleTerapeuta"
import LoginTerapeuta from "./pages/LoginTerapeuta"
import ProtectedRoute from "./components/ProtectedRoute"
import AgregarHistorial from "./pages/historiales/AgregarHistorial"
import HistorialPaciente from "./pages/historiales/HistorialPaciente"

function App() {
  const [pacientes, setPacientes] = useState([])
  const [terapeutas, setTerapeutas] = useState([])
  const [historiales, setHistoriales] = useState([])
  const [cargandoPacientes, setCargandoPacientes] = useState(false)
  const [errorPacientes, setErrorPacientes] = useState("")
  const [cargandoTerapeutas, setCargandoTerapeutas] = useState(false)
  const [errorTerapeutas, setErrorTerapeutas] = useState("")
  const [terapeutaActual, setTerapeutaActual] = useState(null)
  const [cargandoHistoriales, setCargandoHistoriales] = useState(false)
  const [errorHistoriales, setErrorHistoriales] = useState("")
  const navigate = useNavigate()

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    if (token) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    }
    return {
      "Content-Type": "application/json"
    }
  }

  const cargarPacientes = async () => {
    try {
      setCargandoPacientes(true)
      setErrorPacientes("")
      const res = await fetch("/pacientes", { headers: getAuthHeaders() })
      if (!res.ok) throw new Error("No se pudieron obtener los pacientes")
      const data = await res.json()
      setPacientes(data)
    } catch (err) {
      setErrorPacientes(err.message)
    } finally {
      setCargandoPacientes(false)
    }
  }

  const cargarTerapeutas = async () => {
    try {
      setCargandoTerapeutas(true)
      setErrorTerapeutas("")
      const res = await fetch("/terapeutas", { headers: getAuthHeaders() })
      if (!res.ok) throw new Error("No se pudieron obtener los terapeutas")
      const data = await res.json()
      setTerapeutas(data)
    } catch (err) {
      setErrorTerapeutas(err.message)
    } finally {
      setCargandoTerapeutas(false)
    }
  }

  const cargarHistoriales = async () => {
    try {
      setCargandoHistoriales(true)
      setErrorHistoriales("")
      const res = await fetch("/historiales", { headers: getAuthHeaders() })
      if (!res.ok) throw new Error("No se pudieron obtener los historiales")
      const data = await res.json()
      setHistoriales(data)
    } catch (err) {
      setErrorHistoriales(err.message)
    } finally {
      setCargandoHistoriales(false)
    }
  }

  useEffect(() => {
    if (terapeutaActual) {
      cargarPacientes()
      cargarHistoriales()
      if (terapeutaActual.esAdmin) {
        cargarTerapeutas()
      }
    }
  }, [terapeutaActual])

  const manejarPacienteGuardado = () => cargarPacientes()

  const manejarEliminarPaciente = async id => {
    try {
      const res = await fetch(`/pacientes/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "No se pudo eliminar")
      cargarPacientes()
    } catch (err) {
      alert(err.message)
    }
  }

  const manejarTerapeutaGuardado = () => cargarTerapeutas()

  const manejarEliminarTerapeuta = async id => {
    try {
      const res = await fetch(`/terapeutas/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "No se pudo eliminar")
      cargarTerapeutas()
    } catch (err) {
      alert(err.message)
    }
  }

  const manejarHistorialGuardado = () => cargarHistoriales()

  const manejarLoginExitoso = terapeuta => {
    setTerapeutaActual(terapeuta)
  }

  const manejarLogout = () => {
    localStorage.removeItem("token")
    setTerapeutaActual(null)
    setPacientes([])
    setTerapeutas([])
    setHistoriales([])
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-[#eef7fa] text-[#12263a] flex flex-col">
      <NavBar terapeutaActual={terapeutaActual} onLogout={manejarLogout} />

      <main className="flex-grow flex justify-center items-start px-4 py-8">
        <div className="w-full max-w-5xl bg-[#344f74] text-[#edf8f9] rounded-[14px] shadow-[0_6px_16px_rgba(0,0,0,0.08)] p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Bienvenida />} />

            <Route
              path="/login"
              element={<LoginTerapeuta onLoginExitoso={manejarLoginExitoso} />}
            />

            <Route
              path="/terapeutas/nuevo"
              element={
                <ProtectedRoute isAuth={!!(terapeutaActual && terapeutaActual.esAdmin)}>
                  <CargarTerapeuta onTerapeutaCreado={manejarTerapeutaGuardado} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pacientes"
              element={
                <ProtectedRoute isAuth={!!terapeutaActual}>
                  <ListarPacientes
                    pacientes={pacientes}
                    cargando={cargandoPacientes}
                    error={errorPacientes}
                    onEliminar={manejarEliminarPaciente}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pacientes/nuevo"
              element={
                <ProtectedRoute isAuth={!!terapeutaActual}>
                  <CargarPaciente onPacienteCreado={manejarPacienteGuardado} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pacientes/editar/:id"
              element={
                <ProtectedRoute isAuth={!!terapeutaActual}>
                  <EditarPaciente
                    pacientes={pacientes}
                    onPacienteGuardado={manejarPacienteGuardado}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pacientes/detalle/:id"
              element={
                <ProtectedRoute isAuth={!!terapeutaActual}>
                  <DetallePaciente pacientes={pacientes} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pacientes/:id/historial"
              element={
                <ProtectedRoute isAuth={!!terapeutaActual}>
                  <HistorialPaciente
                    pacientes={pacientes}
                    historiales={historiales}
                    terapeutaActual={terapeutaActual}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pacientes/:id/historial/nuevo"
              element={
                <ProtectedRoute isAuth={!!terapeutaActual}>
                  <AgregarHistorial
                    pacientes={pacientes}
                    terapeutaActual={terapeutaActual}
                    onHistorialCreado={manejarHistorialGuardado}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/terapeutas"
              element={
                <ProtectedRoute isAuth={!!(terapeutaActual && terapeutaActual.esAdmin)}>
                  <ListarTerapeutas
                    terapeutas={terapeutas}
                    cargando={cargandoTerapeutas}
                    error={errorTerapeutas}
                    onEliminar={manejarEliminarTerapeuta}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/terapeutas/editar/:id"
              element={
                <ProtectedRoute isAuth={!!(terapeutaActual && terapeutaActual.esAdmin)}>
                  <EditarTerapeuta
                    terapeutas={terapeutas}
                    onTerapeutaGuardado={manejarTerapeutaGuardado}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/terapeutas/detalle/:id"
              element={
                <ProtectedRoute isAuth={!!(terapeutaActual && terapeutaActual.esAdmin)}>
                  <DetalleTerapeuta terapeutas={terapeutas} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App

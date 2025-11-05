const express = require("express")
const fs = require("fs")
const path = require("path")

const app = express()
app.use(express.json())

const dataDir = path.join(__dirname, "data")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir)
}

const pacientesFile = path.join(dataDir, "pacientes.json")
const terapeutasFile = path.join(dataDir, "terapeutas.json")
const historialesFile = path.join(dataDir, "historiales.json")
const tiposRegistroFile = path.join(dataDir, "tiposRegistro.json")
const nivelesEducativosFile = path.join(dataDir, "nivelesEducativos.json")

function readJson(file) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]")
  const content = fs.readFileSync(file, "utf8") || "[]"
  return JSON.parse(content)
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function validarPaciente(req, res, next) {
  const { nombre, apellido, dni, telefono, fechaNac, motivoConsulta, nivelEducativo, gradoCurso, genero } = req.body
  if (!nombre || !apellido || !dni || !telefono || !fechaNac || !motivoConsulta || !nivelEducativo || !gradoCurso || !genero) {
    return res.status(400).json({ error: "Todos los campos del paciente son obligatorios" })
  }
  next()
}

function validarTerapeuta(req, res, next) {
  const { usuario, contrasenia } = req.body
  if (!usuario || !contrasenia) {
    return res.status(400).json({ error: "Usuario y contraseña son obligatorios" })
  }
  next()
}

function validarHistorial(req, res, next) {
  const { pacienteId, terapeutaId, fecha, descripcion, tipoRegistro } = req.body
  if (!pacienteId || !terapeutaId || !fecha || !descripcion || !tipoRegistro) {
    return res.status(400).json({ error: "Todos los campos del historial son obligatorios" })
  }
  next()
}

function validarTipoRegistro(req, res, next) {
  const { nombre } = req.body
  if (!nombre) {
    return res.status(400).json({ error: "El nombre del tipo de registro es obligatorio" })
  }
  next()
}

function validarNivelEducativo(req, res, next) {
  const { nombre } = req.body
  if (!nombre) {
    return res.status(400).json({ error: "El nombre del nivel educativo es obligatorio" })
  }
  next()
}

app.get("/pacientes", (req, res) => {
  const data = readJson(pacientesFile)
  res.json(data)
})

app.post("/pacientes", validarPaciente, (req, res) => {
  const data = readJson(pacientesFile)
  const nuevo = {
    id: Date.now(),
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    dni: req.body.dni,
    telefono: req.body.telefono,
    fechaNac: req.body.fechaNac,
    motivoConsulta: req.body.motivoConsulta,
    nivelEducativo: req.body.nivelEducativo,
    gradoCurso: req.body.gradoCurso,
    genero: req.body.genero
  }
  data.push(nuevo)
  writeJson(pacientesFile, data)
  res.status(201).json(nuevo)
})

app.get("/terapeutas", (req, res) => {
  const data = readJson(terapeutasFile)
  res.json(data)
})

app.post("/terapeutas", validarTerapeuta, (req, res) => {
  const data = readJson(terapeutasFile)
  const nuevo = {
    id: Date.now(),
    usuario: req.body.usuario,
    contrasenia: req.body.contrasenia
  }
  data.push(nuevo)
  writeJson(terapeutasFile, data)
  res.status(201).json(nuevo)
})

app.get("/historiales", (req, res) => {
  const data = readJson(historialesFile)
  res.json(data)
})

app.post("/historiales", validarHistorial, (req, res) => {
  const data = readJson(historialesFile)
  const nuevo = {
    id: Date.now(),
    pacienteId: req.body.pacienteId,
    terapeutaId: req.body.terapeutaId,
    fecha: req.body.fecha,
    descripcion: req.body.descripcion,
    tipoRegistro: req.body.tipoRegistro
  }
  data.push(nuevo)
  writeJson(historialesFile, data)
  res.status(201).json(nuevo)
})

app.get("/tipos-registro", (req, res) => {
  const data = readJson(tiposRegistroFile)
  res.json(data)
})

app.post("/tipos-registro", validarTipoRegistro, (req, res) => {
  const data = readJson(tiposRegistroFile)
  const nuevo = {
    id: Date.now(),
    nombre: req.body.nombre
  }
  data.push(nuevo)
  writeJson(tiposRegistroFile, data)
  res.status(201).json(nuevo)
})

app.get("/niveles-educativos", (req, res) => {
  const data = readJson(nivelesEducativosFile)
  res.json(data)
})

app.post("/niveles-educativos", validarNivelEducativo, (req, res) => {
  const data = readJson(nivelesEducativosFile)
  const nuevo = {
    id: Date.now(),
    nombre: req.body.nombre
  }
  data.push(nuevo)
  writeJson(nivelesEducativosFile, data)
  res.status(201).json(nuevo)
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})

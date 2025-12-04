const express = require("express")
const fs = require("fs")
const path = require("path")
const bcrypt = require("bcrypt")

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

function cifrarContrasenia(contrasenia) {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(contrasenia, salt)
}

function validarDatosPaciente(body, pacientes, esEdicion, idEditar) {
  const ahora = new Date()
  const nombre = (body.nombre || "").trim()
  const apellido = (body.apellido || "").trim()
  const dni = (body.dni || "").trim()
  const telefono = (body.telefono || "").trim()
  const fechaNacStr = (body.fechaNac || "").trim()
  const motivoConsulta = (body.motivoConsulta || "").trim()
  const nivelEducativo = (body.nivelEducativo || "").trim()
  const gradoCursoStr = (body.gradoCurso || "").toString().trim()
  const genero = (body.genero || "").trim()

  const errores = []

  if (!nombre) errores.push("El nombre no debe estar vacío")
  if (!apellido) errores.push("El apellido no debe estar vacío")

  if (!dni || dni.length < 8) {
    errores.push("El DNI debe tener al menos 8 caracteres")
  } else {
    const existe = pacientes.some(p => String(p.dni) === dni && (!esEdicion || p.id !== idEditar))
    if (existe) errores.push("El DNI ya se encuentra registrado")
  }

  if (!telefono) errores.push("El teléfono no debe estar vacío")

  if (!fechaNacStr) {
    errores.push("La fecha de nacimiento es obligatoria")
  } else {
    const fechaNac = new Date(fechaNacStr)
    if (isNaN(fechaNac.getTime())) {
      errores.push("La fecha de nacimiento no es válida")
    } else if (fechaNac >= ahora) {
      errores.push("La fecha de nacimiento debe ser anterior a la fecha actual")
    }
  }

  if (motivoConsulta.length > 500) {
    errores.push("El motivo de consulta no debe superar los 500 caracteres")
  }

  if (!nivelEducativo) errores.push("El nivel educativo no debe estar vacío")

  const gradoNumero = parseInt(gradoCursoStr, 10)
  if (isNaN(gradoNumero) || gradoNumero < 1 || gradoNumero > 7) {
    errores.push("El grado/curso debe ser un número entre 1 y 7")
  }

  if (!genero) errores.push("El género no debe estar vacío")

  return errores
}

function validarPacienteCrear(req, res, next) {
  const pacientes = readJson(pacientesFile)
  const errores = validarDatosPaciente(req.body, pacientes, false, null)
  if (errores.length > 0) {
    return res.status(400).json({ error: errores.join(" | ") })
  }
  next()
}

function validarPacienteEditar(req, res, next) {
  const pacientes = readJson(pacientesFile)
  const idEditar = Number(req.params.id)
  const errores = validarDatosPaciente(req.body, pacientes, true, idEditar)
  if (errores.length > 0) {
    return res.status(400).json({ error: errores.join(" | ") })
  }
  next()
}

function validarTerapeuta(req, res, next) {
  const usuario = (req.body.usuario || "").trim()
  const contrasenia = (req.body.contrasenia || "").trim()
  if (!usuario || !contrasenia) {
    return res.status(400).json({ error: "Usuario y contraseña son obligatorios" })
  }
  next()
}

function validarHistorial(req, res, next) {
  const pacienteId = req.body.pacienteId
  const terapeutaId = req.body.terapeutaId
  const fecha = (req.body.fecha || "").trim()
  const descripcion = (req.body.descripcion || "").trim()
  const tipoRegistro = (req.body.tipoRegistro || "").trim()
  if (!pacienteId || !terapeutaId || !fecha || !descripcion || !tipoRegistro) {
    return res.status(400).json({ error: "Todos los campos del historial son obligatorios" })
  }
  next()
}

function validarTipoRegistro(req, res, next) {
  const nombre = (req.body.nombre || "").trim()
  if (!nombre) {
    return res.status(400).json({ error: "El nombre del tipo de registro es obligatorio" })
  }
  next()
}

function validarNivelEducativo(req, res, next) {
  const nombre = (req.body.nombre || "").trim()
  if (!nombre) {
    return res.status(400).json({ error: "El nombre del nivel educativo es obligatorio" })
  }
  next()
}

app.get("/pacientes", (req, res) => {
  const data = readJson(pacientesFile)
  res.json(data)
})
app.get("/pacientes/:id", (req, res) => {
  const data = readJson(pacientesFile)
  const id = Number(req.params.id)

  const paciente = data.find(p => p.id === id)

  if (!paciente) {
    return res.status(404).json({ error: "Paciente no encontrado" })
  }

  res.json(paciente)
})


app.post("/pacientes", validarPacienteCrear, (req, res) => {
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

app.put("/pacientes/:id", validarPacienteEditar, (req, res) => {
  const data = readJson(pacientesFile)
  const id = Number(req.params.id)
  const index = data.findIndex(p => p.id === id)
  if (index === -1) {
    return res.status(404).json({ error: "Paciente no encontrado" })
  }
  const actualizado = {
    ...data[index],
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
  data[index] = actualizado
  writeJson(pacientesFile, data)
  res.json(actualizado)
})

app.delete("/pacientes/:id", (req, res) => {
  const data = readJson(pacientesFile)
  const id = Number(req.params.id)
  const existe = data.some(p => p.id === id)
  if (!existe) {
    return res.status(404).json({ error: "Paciente no encontrado" })
  }
  const filtrados = data.filter(p => p.id !== id)
  writeJson(pacientesFile, filtrados)
  res.json({ ok: true })
})

app.get("/terapeutas", (req, res) => {
  const data = readJson(terapeutasFile)
  res.json(data)
})

app.post("/terapeutas", validarTerapeuta, (req, res) => {
  const data = readJson(terapeutasFile)
  const contraseniaCifrada = cifrarContrasenia(req.body.contrasenia)
  const nuevo = {
    id: Date.now(),
    usuario: req.body.usuario,
    contrasenia: contraseniaCifrada
  }
  data.push(nuevo)
  writeJson(terapeutasFile, data)
  res.status(201).json(nuevo)
})

app.put("/terapeutas/:id", validarTerapeuta, (req, res) => {
  const data = readJson(terapeutasFile)
  const id = Number(req.params.id)
  const index = data.findIndex(t => t.id === id)
  if (index === -1) {
    return res.status(404).json({ error: "Terapeuta no encontrado" })
  }
  const contraseniaCifrada = cifrarContrasenia(req.body.contrasenia)
  const actualizado = {
    ...data[index],
    usuario: req.body.usuario,
    contrasenia: contraseniaCifrada
  }
  data[index] = actualizado
  writeJson(terapeutasFile, data)
  res.json(actualizado)
})

app.delete("/terapeutas/:id", (req, res) => {
  const data = readJson(terapeutasFile)
  const id = Number(req.params.id)
  const existe = data.some(t => t.id === id)
  if (!existe) {
    return res.status(404).json({ error: "Terapeuta no encontrado" })
  }
  const filtrados = data.filter(t => t.id !== id)
  writeJson(terapeutasFile, filtrados)
  res.json({ ok: true })
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


app.post("/login-terapeuta", (req, res) => {
  const usuario = (req.body.usuario || "").trim()
  const contrasenia = (req.body.contrasenia || "").trim()

  if (!usuario || !contrasenia) {
    return res.status(400).json({ error: "Usuario y contraseña son obligatorios" })
  }

  const terapeutas = readJson(terapeutasFile)
  const terapeuta = terapeutas.find(t => t.usuario === usuario)

  if (!terapeuta) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" })
  }

  const coincide = bcrypt.compareSync(contrasenia, terapeuta.contrasenia)
  if (!coincide) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" })
  }

  res.json({
    ok: true,
    terapeuta: {
      id: terapeuta.id,
      usuario: terapeuta.usuario
    }
  })
})



const PORT = 3001
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})



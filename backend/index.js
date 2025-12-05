const express = require("express")
const bcrypt = require("bcrypt")
<<<<<<< HEAD
const db = require("./db")
const pacienteModel = require("./models/pacienteModel")
const terapeutaModel = require("./models/terapeutaModel")
const historialModel = require("./models/historialModel")
=======
const sqlite3 = require("sqlite3").verbose()
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52

const app = express()
app.use(express.json())

<<<<<<< HEAD
=======
const dataDir = path.join(__dirname, "data")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir)
}

const dbPath = path.join(dataDir, "database.sqlite")
const db = new sqlite3.Database(dbPath)

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      dni TEXT NOT NULL UNIQUE,
      telefono TEXT NOT NULL,
      fechaNac TEXT NOT NULL,
      motivoConsulta TEXT,
      nivelEducativo TEXT NOT NULL,
      gradoCurso INTEGER NOT NULL,
      genero TEXT NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS terapeutas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT NOT NULL UNIQUE,
      contrasenia TEXT NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS historiales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pacienteId INTEGER NOT NULL,
      terapeutaId INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      tipoRegistro TEXT NOT NULL,
      FOREIGN KEY (pacienteId) REFERENCES pacientes(id),
      FOREIGN KEY (terapeutaId) REFERENCES terapeutas(id)
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS tipos_registro (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS niveles_educativos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
    )
  `)
})

>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52
function normalizarYValidarPaciente(body) {
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
  if (!dni || dni.length < 8) errores.push("El DNI debe tener al menos 8 caracteres")
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

  return {
    errores,
    paciente: {
      nombre,
      apellido,
      dni,
      telefono,
      fechaNac: fechaNacStr,
      motivoConsulta,
      nivelEducativo,
      gradoCurso: gradoNumero,
      genero
    }
  }
}

function validarPacienteCrear(req, res, next) {
  const { errores, paciente } = normalizarYValidarPaciente(req.body)
  if (errores.length > 0) {
    return res.status(400).json({ error: errores.join(" | ") })
  }
<<<<<<< HEAD
  pacienteModel.findByDni(paciente.dni, (err, row) => {
    if (err) return res.status(500).json({ error: "Error al validar paciente" })
    if (row) return res.status(400).json({ error: "El DNI ya se encuentra registrado" })
    req.pacienteNormalizado = paciente
    next()
  })
=======
  db.get(
    "SELECT id FROM pacientes WHERE dni = ?",
    [paciente.dni],
    (err, row) => {
      if (err) return res.status(500).json({ error: "Error al validar paciente" })
      if (row) return res.status(400).json({ error: "El DNI ya se encuentra registrado" })
      req.pacienteNormalizado = paciente
      next()
    }
  )
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52
}

function validarPacienteEditar(req, res, next) {
  const { errores, paciente } = normalizarYValidarPaciente(req.body)
  if (errores.length > 0) {
    return res.status(400).json({ error: errores.join(" | ") })
  }
  const idEditar = Number(req.params.id)
<<<<<<< HEAD
  pacienteModel.findByDniExcludingId(paciente.dni, idEditar, (err, row) => {
    if (err) return res.status(500).json({ error: "Error al validar paciente" })
    if (row) return res.status(400).json({ error: "El DNI ya se encuentra registrado" })
    req.pacienteNormalizado = paciente
    next()
  })
=======
  db.get(
    "SELECT id FROM pacientes WHERE dni = ? AND id <> ?",
    [paciente.dni, idEditar],
    (err, row) => {
      if (err) return res.status(500).json({ error: "Error al validar paciente" })
      if (row) return res.status(400).json({ error: "El DNI ya se encuentra registrado" })
      req.pacienteNormalizado = paciente
      next()
    }
  )
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52
}

function validarTerapeuta(req, res, next) {
  const usuario = (req.body.usuario || "").trim()
  const contrasenia = (req.body.contrasenia || "").trim()
  if (!usuario || !contrasenia) {
    return res.status(400).json({ error: "Usuario y contraseña son obligatorios" })
  }
  req.terapeutaNormalizado = { usuario, contrasenia }
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
  req.historialNormalizado = { pacienteId, terapeutaId, fecha, descripcion, tipoRegistro }
  next()
}

function validarTipoRegistro(req, res, next) {
  const nombre = (req.body.nombre || "").trim()
  if (!nombre) {
    return res.status(400).json({ error: "El nombre del tipo de registro es obligatorio" })
  }
  req.tipoRegistroNormalizado = { nombre }
  next()
}

function validarNivelEducativo(req, res, next) {
  const nombre = (req.body.nombre || "").trim()
  if (!nombre) {
    return res.status(400).json({ error: "El nombre del nivel educativo es obligatorio" })
  }
  req.nivelEducativoNormalizado = { nombre }
  next()
}

app.get("/pacientes", (req, res) => {
<<<<<<< HEAD
  pacienteModel.getAll((err, rows) => {
=======
  db.all("SELECT * FROM pacientes", [], (err, rows) => {
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52
    if (err) return res.status(500).json({ error: "Error al obtener pacientes" })
    res.json(rows)
  })
})

app.get("/pacientes/:id", (req, res) => {
  const id = Number(req.params.id)
<<<<<<< HEAD
  pacienteModel.getById(id, (err, row) => {
=======
  db.get("SELECT * FROM pacientes WHERE id = ?", [id], (err, row) => {
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52
    if (err) return res.status(500).json({ error: "Error al obtener paciente" })
    if (!row) return res.status(404).json({ error: "Paciente no encontrado" })
    res.json(row)
  })
})

app.post("/pacientes", validarPacienteCrear, (req, res) => {
  const p = req.pacienteNormalizado
<<<<<<< HEAD
  pacienteModel.create(p, (err, nuevo) => {
    if (err) return res.status(500).json({ error: "Error al guardar paciente" })
    res.status(201).json(nuevo)
  })
=======
  db.run(
    `
    INSERT INTO pacientes (nombre, apellido, dni, telefono, fechaNac, motivoConsulta, nivelEducativo, gradoCurso, genero)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [p.nombre, p.apellido, p.dni, p.telefono, p.fechaNac, p.motivoConsulta, p.nivelEducativo, p.gradoCurso, p.genero],
    function (err) {
      if (err) return res.status(500).json({ error: "Error al guardar paciente" })
      res.status(201).json({ id: this.lastID, ...p })
    }
  )
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52
})

app.put("/pacientes/:id", validarPacienteEditar, (req, res) => {
  const id = Number(req.params.id)
  const p = req.pacienteNormalizado
<<<<<<< HEAD
  pacienteModel.update(id, p, (err, changes) => {
    if (err) return res.status(500).json({ error: "Error al actualizar paciente" })
    if (changes === 0) return res.status(404).json({ error: "Paciente no encontrado" })
    res.json({ id, ...p })
  })
=======
  db.run(
    `
    UPDATE pacientes
    SET nombre = ?, apellido = ?, dni = ?, telefono = ?, fechaNac = ?, motivoConsulta = ?, nivelEducativo = ?, gradoCurso = ?, genero = ?
    WHERE id = ?
  `,
    [p.nombre, p.apellido, p.dni, p.telefono, p.fechaNac, p.motivoConsulta, p.nivelEducativo, p.gradoCurso, p.genero, id],
    function (err) {
      if (err) return res.status(500).json({ error: "Error al actualizar paciente" })
      if (this.changes === 0) return res.status(404).json({ error: "Paciente no encontrado" })
      res.json({ id, ...p })
    }
  )
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52
})

app.delete("/pacientes/:id", (req, res) => {
  const id = Number(req.params.id)
<<<<<<< HEAD
  pacienteModel.remove(id, (err, changes) => {
    if (err) return res.status(500).json({ error: "Error al eliminar paciente" })
    if (changes === 0) return res.status(404).json({ error: "Paciente no encontrado" })
=======
  db.run("DELETE FROM pacientes WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: "Error al eliminar paciente" })
    if (this.changes === 0) return res.status(404).json({ error: "Paciente no encontrado" })
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52
    res.json({ ok: true })
  })
})

app.get("/terapeutas", (req, res) => {
<<<<<<< HEAD
  terapeutaModel.getAllPublic((err, rows) => {
=======
  db.all("SELECT id, usuario FROM terapeutas", [], (err, rows) => {
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52
    if (err) return res.status(500).json({ error: "Error al obtener terapeutas" })
    res.json(rows)
  })
})

app.post("/terapeutas", validarTerapeuta, (req, res) => {
  const t = req.terapeutaNormalizado
  const hash = bcrypt.hashSync(t.contrasenia, 10)
<<<<<<< HEAD
  terapeutaModel.create(t.usuario, hash, (err, nuevo) => {
    if (err) {
      if (err.code === "SQLITE_CONSTRAINT") {
        return res.status(400).json({ error: "El usuario ya está registrado" })
      }
      return res.status(500).json({ error: "Error al guardar terapeuta" })
    }
    res.status(201).json(nuevo)
  })
=======
  db.run(
    "INSERT INTO terapeutas (usuario, contrasenia) VALUES (?, ?)",
    [t.usuario, hash],
    function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
          return res.status(400).json({ error: "El usuario ya está registrado" })
        }
        return res.status(500).json({ error: "Error al guardar terapeuta" })
      }
      res.status(201).json({ id: this.lastID, usuario: t.usuario })
    }
  )
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52
})

app.put("/terapeutas/:id", validarTerapeuta, (req, res) => {
  const id = Number(req.params.id)
  const t = req.terapeutaNormalizado
  const hash = bcrypt.hashSync(t.contrasenia, 10)
<<<<<<< HEAD
  terapeutaModel.update(id, t.usuario, hash, (err, changes) => {
    if (err) {
      if (err.code === "SQLITE_CONSTRAINT") {
        return res.status(400).json({ error: "El usuario ya está registrado" })
      }
      return res.status(500).json({ error: "Error al actualizar terapeuta" })
    }
    if (changes === 0) return res.status(404).json({ error: "Terapeuta no encontrado" })
    res.json({ id, usuario: t.usuario })
  })
=======
  db.run(
    "UPDATE terapeutas SET usuario = ?, contrasenia = ? WHERE id = ?",
    [t.usuario, hash, id],
    function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
          return res.status(400).json({ error: "El usuario ya está registrado" })
        }
        return res.status(500).json({ error: "Error al actualizar terapeuta" })
      }
      if (this.changes === 0) return res.status(404).json({ error: "Terapeuta no encontrado" })
      res.json({ id, usuario: t.usuario })
    }
  )
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52
})

app.delete("/terapeutas/:id", (req, res) => {
  const id = Number(req.params.id)
<<<<<<< HEAD
  terapeutaModel.remove(id, (err, changes) => {
    if (err) return res.status(500).json({ error: "Error al eliminar terapeuta" })
    if (changes === 0) return res.status(404).json({ error: "Terapeuta no encontrado" })
=======
  db.run("DELETE FROM terapeutas WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: "Error al eliminar terapeuta" })
    if (this.changes === 0) return res.status(404).json({ error: "Terapeuta no encontrado" })
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52
    res.json({ ok: true })
  })
})

app.post("/login-terapeuta", (req, res) => {
  const usuario = (req.body.usuario || "").trim()
  const contrasenia = (req.body.contrasenia || "").trim()
  if (!usuario || !contrasenia) {
    return res.status(400).json({ error: "Usuario y contraseña son obligatorios" })
  }
<<<<<<< HEAD
  terapeutaModel.getByUsuario(usuario, (err, row) => {
=======
  db.get("SELECT * FROM terapeutas WHERE usuario = ?", [usuario], (err, row) => {
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52
    if (err) return res.status(500).json({ error: "Error al iniciar sesión" })
    if (!row) return res.status(401).json({ error: "Usuario o contraseña incorrectos" })
    const coincide = bcrypt.compareSync(contrasenia, row.contrasenia)
    if (!coincide) return res.status(401).json({ error: "Usuario o contraseña incorrectos" })
    res.json({ ok: true, terapeuta: { id: row.id, usuario: row.usuario } })
  })
})

app.get("/historiales", (req, res) => {
<<<<<<< HEAD
  historialModel.getAll((err, rows) => {
=======
  db.all("SELECT * FROM historiales", [], (err, rows) => {
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52
    if (err) return res.status(500).json({ error: "Error al obtener historiales" })
    res.json(rows)
  })
})

app.post("/historiales", validarHistorial, (req, res) => {
  const h = req.historialNormalizado
<<<<<<< HEAD
  historialModel.create(h, (err, nuevo) => {
    if (err) return res.status(500).json({ error: "Error al guardar historial" })
    res.status(201).json(nuevo)
  })
=======
  db.run(
    `
    INSERT INTO historiales (pacienteId, terapeutaId, fecha, descripcion, tipoRegistro)
    VALUES (?, ?, ?, ?, ?)
  `,
    [h.pacienteId, h.terapeutaId, h.fecha, h.descripcion, h.tipoRegistro],
    function (err) {
      if (err) return res.status(500).json({ error: "Error al guardar historial" })
      res.status(201).json({ id: this.lastID, ...h })
    }
  )
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52
})

app.get("/tipos-registro", (req, res) => {
  db.all("SELECT * FROM tipos_registro", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener tipos de registro" })
    res.json(rows)
  })
})

app.post("/tipos-registro", validarTipoRegistro, (req, res) => {
  const t = req.tipoRegistroNormalizado
  db.run(
    "INSERT INTO tipos_registro (nombre) VALUES (?)",
    [t.nombre],
    function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
          return res.status(400).json({ error: "El tipo de registro ya existe" })
        }
        return res.status(500).json({ error: "Error al guardar tipo de registro" })
      }
      res.status(201).json({ id: this.lastID, nombre: t.nombre })
    }
  )
})

app.get("/niveles-educativos", (req, res) => {
  db.all("SELECT * FROM niveles_educativos", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener niveles educativos" })
    res.json(rows)
  })
})

app.post("/niveles-educativos", validarNivelEducativo, (req, res) => {
  const n = req.nivelEducativoNormalizado
  db.run(
    "INSERT INTO niveles_educativos (nombre) VALUES (?)",
    [n.nombre],
    function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
          return res.status(400).json({ error: "El nivel educativo ya existe" })
        }
        return res.status(500).json({ error: "Error al guardar nivel educativo" })
      }
      res.status(201).json({ id: this.lastID, nombre: n.nombre })
    }
  )
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
<<<<<<< HEAD

=======
>>>>>>> 2951dc39c57b41afa55b85a85592f8307850fb52

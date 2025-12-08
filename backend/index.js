const express = require("express")
const bcrypt = require("bcrypt")
const { body, validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
const db = require("./db")
const pacienteModel = require("./models/pacienteModel")
const terapeutaModel = require("./models/terapeutaModel")
const historialModel = require("./models/historialModel")

const app = express()
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || "2tW5Hk8jRzM9pG7f"

const manejarValidacion = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors
        .array()
        .map(e => e.msg)
        .join(" | ")
    })
  }
  next()
}

const autenticarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]
  if (!token) {
    return res.status(401).json({ error: "Token requerido" })
  }
  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido o expirado" })
    }
    req.usuario = usuario
    next()
  })
}

const soloAdmin = (req, res, next) => {
  if (!req.usuario || !req.usuario.esAdmin) {
    return res.status(403).json({ error: "Acceso solo para administradores" })
  }
  next()
}

const validacionesPaciente = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre no debe estar vacío"),
  body("apellido")
    .trim()
    .notEmpty()
    .withMessage("El apellido no debe estar vacío"),
  body("dni")
    .trim()
    .isLength({ min: 8 })
    .withMessage("El DNI debe tener al menos 8 caracteres"),
  body("telefono")
    .trim()
    .notEmpty()
    .withMessage("El teléfono no debe estar vacío"),
  body("fechaNac")
    .trim()
    .notEmpty()
    .withMessage("La fecha de nacimiento es obligatoria")
    .isISO8601()
    .withMessage("La fecha de nacimiento no es válida")
    .custom(value => {
      const fecha = new Date(value)
      const hoy = new Date()
      if (fecha >= hoy) {
        throw new Error("La fecha de nacimiento debe ser anterior a la fecha actual")
      }
      return true
    }),
  body("motivoConsulta")
    .optional()
    .isLength({ max: 500 })
    .withMessage("El motivo de consulta no debe superar los 500 caracteres"),
  body("nivelEducativo")
    .trim()
    .notEmpty()
    .withMessage("El nivel educativo no debe estar vacío"),
  body("gradoCurso")
    .toInt()
    .isInt({ min: 1, max: 7 })
    .withMessage("El grado/curso debe ser un número entre 1 y 7"),
  body("genero")
    .trim()
    .notEmpty()
    .withMessage("El género no debe estar vacío")
]

const validacionesTerapeuta = [
  body("usuario")
    .trim()
    .notEmpty()
    .withMessage("El usuario no debe estar vacío"),
  body("contrasenia")
    .trim()
    .isLength({ min: 4 })
    .withMessage("La contraseña debe tener al menos 4 caracteres")
]

const validacionesHistorial = [
  body("pacienteId")
    .toInt()
    .isInt({ min: 1 })
    .withMessage("El paciente es obligatorio"),
  body("terapeutaId")
    .toInt()
    .isInt({ min: 1 })
    .withMessage("El terapeuta es obligatorio"),
  body("fecha")
    .trim()
    .notEmpty()
    .withMessage("La fecha es obligatoria"),
  body("descripcion")
    .trim()
    .notEmpty()
    .withMessage("La descripción es obligatoria"),
  body("tipoRegistro")
    .trim()
    .notEmpty()
    .withMessage("El tipo de registro es obligatorio")
]

const validacionesTipoRegistro = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre del tipo de registro es obligatorio")
]

const validacionesNivelEducativo = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre del nivel educativo es obligatorio")
]

const validacionesLogin = [
  body("usuario")
    .trim()
    .notEmpty()
    .withMessage("El usuario es obligatorio"),
  body("contrasenia")
    .trim()
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
]

const validarDniUnicoCrear = (req, res, next) => {
  const dni = (req.body.dni || "").trim()
  pacienteModel.findByDni(dni, (err, row) => {
    if (err) return res.status(500).json({ error: "Error al validar paciente" })
    if (row) return res.status(400).json({ error: "El DNI ya se encuentra registrado" })
    next()
  })
}

const validarDniUnicoEditar = (req, res, next) => {
  const dni = (req.body.dni || "").trim()
  const idEditar = Number(req.params.id)
  pacienteModel.findByDniExcludingId(dni, idEditar, (err, row) => {
    if (err) return res.status(500).json({ error: "Error al validar paciente" })
    if (row) return res.status(400).json({ error: "El DNI ya se encuentra registrado" })
    next()
  })
}

app.get("/pacientes", autenticarToken, (req, res) => {
  pacienteModel.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener pacientes" })
    res.json(rows)
  })
})

app.get("/pacientes/:id", autenticarToken, (req, res) => {
  const id = Number(req.params.id)
  pacienteModel.getById(id, (err, row) => {
    if (err) return res.status(500).json({ error: "Error al obtener paciente" })
    if (!row) return res.status(404).json({ error: "Paciente no encontrado" })
    res.json(row)
  })
})

app.post(
  "/pacientes",
  autenticarToken,
  validacionesPaciente,
  manejarValidacion,
  validarDniUnicoCrear,
  (req, res) => {
    const paciente = {
      nombre: req.body.nombre.trim(),
      apellido: req.body.apellido.trim(),
      dni: req.body.dni.trim(),
      telefono: req.body.telefono.trim(),
      fechaNac: req.body.fechaNac.trim(),
      motivoConsulta: (req.body.motivoConsulta || "").trim(),
      nivelEducativo: req.body.nivelEducativo.trim(),
      gradoCurso: Number(req.body.gradoCurso),
      genero: req.body.genero.trim()
    }
    pacienteModel.create(paciente, (err, nuevo) => {
      if (err) return res.status(500).json({ error: "Error al guardar paciente" })
      res.status(201).json(nuevo)
    })
  }
)

app.put(
  "/pacientes/:id",
  autenticarToken,
  validacionesPaciente,
  manejarValidacion,
  validarDniUnicoEditar,
  (req, res) => {
    const id = Number(req.params.id)
    const paciente = {
      nombre: req.body.nombre.trim(),
      apellido: req.body.apellido.trim(),
      dni: req.body.dni.trim(),
      telefono: req.body.telefono.trim(),
      fechaNac: req.body.fechaNac.trim(),
      motivoConsulta: (req.body.motivoConsulta || "").trim(),
      nivelEducativo: req.body.nivelEducativo.trim(),
      gradoCurso: Number(req.body.gradoCurso),
      genero: req.body.genero.trim()
    }
    pacienteModel.update(id, paciente, (err, changes) => {
      if (err) return res.status(500).json({ error: "Error al actualizar paciente" })
      if (changes === 0) return res.status(404).json({ error: "Paciente no encontrado" })
      res.json({ id, ...paciente })
    })
  }
)

app.delete("/pacientes/:id", autenticarToken, (req, res) => {
  const id = Number(req.params.id)
  pacienteModel.remove(id, (err, changes) => {
    if (err) return res.status(500).json({ error: "Error al eliminar paciente" })
    if (changes === 0) return res.status(404).json({ error: "Paciente no encontrado" })
    res.json({ ok: true })
  })
})

app.get("/terapeutas", autenticarToken, soloAdmin, (req, res) => {
  terapeutaModel.getAllPublic((err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener terapeutas" })
    res.json(rows)
  })
})

app.post(
  "/terapeutas",
  autenticarToken,
  soloAdmin,
  validacionesTerapeuta,
  manejarValidacion,
  (req, res) => {
    const usuario = req.body.usuario.trim()
    const contrasenia = req.body.contrasenia.trim()
    const esAdmin = !!req.body.esAdmin
    const hash = bcrypt.hashSync(contrasenia, 10)
    terapeutaModel.create(usuario, hash, esAdmin, (err, nuevo) => {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
          return res.status(400).json({ error: "El usuario ya está registrado" })
        }
        return res.status(500).json({ error: "Error al guardar terapeuta" })
      }
      res.status(201).json(nuevo)
    })
  }
)

app.put(
  "/terapeutas/:id",
  autenticarToken,
  soloAdmin,
  validacionesTerapeuta,
  manejarValidacion,
  (req, res) => {
    const id = Number(req.params.id)
    const usuario = req.body.usuario.trim()
    const contrasenia = req.body.contrasenia.trim()
    const esAdmin = !!req.body.esAdmin
    const hash = bcrypt.hashSync(contrasenia, 10)
    terapeutaModel.update(id, usuario, hash, esAdmin, (err, changes) => {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
          return res.status(400).json({ error: "El usuario ya está registrado" })
        }
        return res.status(500).json({ error: "Error al actualizar terapeuta" })
      }
      if (changes === 0) return res.status(404).json({ error: "Terapeuta no encontrado" })
      res.json({ id, usuario, esAdmin })
    })
  }
)

app.delete("/terapeutas/:id", autenticarToken, soloAdmin, (req, res) => {
  const id = Number(req.params.id)
  terapeutaModel.remove(id, (err, changes) => {
    if (err) return res.status(500).json({ error: "Error al eliminar terapeuta" })
    if (changes === 0) return res.status(404).json({ error: "Terapeuta no encontrado" })
    res.json({ ok: true })
  })
})

app.post(
  "/login-terapeuta",
  validacionesLogin,
  manejarValidacion,
  (req, res) => {
    const usuario = req.body.usuario.trim()
    const contrasenia = req.body.contrasenia.trim()
    terapeutaModel.getByUsuario(usuario, (err, row) => {
      if (err) return res.status(500).json({ error: "Error al iniciar sesión" })
      if (!row) return res.status(401).json({ error: "Usuario o contraseña incorrectos" })
      const coincide = bcrypt.compareSync(contrasenia, row.contrasenia)
      if (!coincide) return res.status(401).json({ error: "Usuario o contraseña incorrectos" })
      const esAdmin = row.esAdmin === 1
      const token = jwt.sign(
        { id: row.id, usuario: row.usuario, esAdmin },
        JWT_SECRET,
        { expiresIn: "8h" }
      )
      res.json({
        ok: true,
        token,
        terapeuta: { id: row.id, usuario: row.usuario, esAdmin }
      })
    })
  }
)

app.get("/historiales", autenticarToken, (req, res) => {
  historialModel.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener historiales" })
    res.json(rows)
  })
})

app.post(
  "/historiales",
  autenticarToken,
  validacionesHistorial,
  manejarValidacion,
  (req, res) => {
    const historial = {
      pacienteId: Number(req.body.pacienteId),
      terapeutaId: Number(req.body.terapeutaId),
      fecha: req.body.fecha.trim(),
      descripcion: req.body.descripcion.trim(),
      tipoRegistro: req.body.tipoRegistro.trim()
    }
    historialModel.create(historial, (err, nuevo) => {
      if (err) return res.status(500).json({ error: "Error al guardar historial" })
      res.status(201).json(nuevo)
    })
  }
)

app.get("/tipos-registro", autenticarToken, (req, res) => {
  db.all("SELECT * FROM tipos_registro", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener tipos de registro" })
    res.json(rows)
  })
})

app.post(
  "/tipos-registro",
  autenticarToken,
  validacionesTipoRegistro,
  manejarValidacion,
  (req, res) => {
    const nombre = req.body.nombre.trim()
    db.run(
      "INSERT INTO tipos_registro (nombre) VALUES (?)",
      [nombre],
      function (err) {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT") {
            return res.status(400).json({ error: "El tipo de registro ya existe" })
          }
          return res.status(500).json({ error: "Error al guardar tipo de registro" })
        }
        res.status(201).json({ id: this.lastID, nombre })
      }
    )
  }
)

app.get("/niveles-educativos", autenticarToken, (req, res) => {
  db.all("SELECT * FROM niveles_educativos", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener niveles educativos" })
    res.json(rows)
  })
})

app.post(
  "/niveles-educativos",
  autenticarToken,
  validacionesNivelEducativo,
  manejarValidacion,
  (req, res) => {
    const nombre = req.body.nombre.trim()
    db.run(
      "INSERT INTO niveles_educativos (nombre) VALUES (?)",
      [nombre],
      function (err) {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT") {
            return res.status(400).json({ error: "El nivel educativo ya existe" })
          }
          return res.status(500).json({ error: "Error al guardar nivel educativo" })
        }
        res.status(201).json({ id: this.lastID, nombre })
      }
    )
  }
)

const inicializarTerapeutaAdmin = () => {
  db.run(
    "ALTER TABLE terapeutas ADD COLUMN es_admin INTEGER NOT NULL DEFAULT 0",
    err => {
      if (err && !String(err.message || "").includes("duplicate column name")) {
        console.error("Error al agregar columna es_admin en terapeutas:", err.message)
      }
      db.get("SELECT COUNT(*) as total FROM terapeutas", [], (err2, row) => {
        if (err2) {
          console.error("Error al contar terapeutas:", err2.message)
          return
        }
        if (row && row.total === 0) {
          const hash = bcrypt.hashSync("4545", 10)
          db.run(
            "INSERT INTO terapeutas (usuario, contrasenia, es_admin) VALUES (?, ?, 1)",
            ["laura861", hash],
            err3 => {
              if (err3) {
                console.error("Error al crear terapeuta admin inicial:", err3.message)
              } else {
                console.log("Terapeuta administrador inicial creado: usuario laura861")
              }
            }
          )
        }
      })
    }
  )
}

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
  inicializarTerapeutaAdmin()
})

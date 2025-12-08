const db = require("../db")

function getAll(callback) {
  db.all("SELECT * FROM historiales ORDER BY fecha", [], callback)

}

function create(historial, callback) {
  db.run(
    `
    INSERT INTO historiales (pacienteId, terapeutaId, fecha, descripcion, tipoRegistro)
    VALUES (?, ?, ?, ?, ?)
  `,
    [
      historial.pacienteId,
      historial.terapeutaId,
      historial.fecha,
      historial.descripcion,
      historial.tipoRegistro
    ],
    function (err) {
      if (err) return callback(err)
      callback(null, { id: this.lastID, ...historial })
    }
  )
}

module.exports = {
  getAll,
  create
}

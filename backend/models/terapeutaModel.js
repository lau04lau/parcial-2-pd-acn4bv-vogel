const db = require("../db")

function getAllPublic(callback) {
  db.all("SELECT id, usuario, es_admin as esAdmin FROM terapeutas", [], callback)
}

function getByUsuario(usuario, callback) {
  db.get(
    "SELECT id, usuario, contrasenia, es_admin as esAdmin FROM terapeutas WHERE usuario = ?",
    [usuario],
    callback
  )
}

function create(usuario, hash, esAdmin, callback) {
  db.run(
    "INSERT INTO terapeutas (usuario, contrasenia, es_admin) VALUES (?, ?, ?)",
    [usuario, hash, esAdmin ? 1 : 0],
    function (err) {
      if (err) return callback(err)
      callback(null, { id: this.lastID, usuario, esAdmin: esAdmin ? 1 : 0 })
    }
  )
}

function update(id, usuario, hash, esAdmin, callback) {
  db.run(
    "UPDATE terapeutas SET usuario = ?, contrasenia = ?, es_admin = ? WHERE id = ?",
    [usuario, hash, esAdmin ? 1 : 0, id],
    function (err) {
      if (err) return callback(err)
      callback(null, this.changes)
    }
  )
}

function remove(id, callback) {
  db.run("DELETE FROM terapeutas WHERE id = ?", [id], function (err) {
    if (err) return callback(err)
    callback(null, this.changes)
  })
}

module.exports = {
  getAllPublic,
  getByUsuario,
  create,
  update,
  remove
}

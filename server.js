const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "loginencriptado",
});

try {
  db.connect();
  console.log("Conectadorl");
} catch (error) {
  console.log("No Conectadorl: " + error);
}

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, (err, contraEncriptada) => {
    if (err) {
      console.log("Errror al encriptar la contraseña: " + err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      db.query(
        "INSERT INTO usuarios (username,password) VALUES (?,?)",
        [username, contraEncriptada],
        (err, result) => {
            if (err) {
                console.log('Error en el registro: '+err);
                res.status(500).json({error:'Error interno en el registro'});
            } else {
                res.status(201).json({message:'Usuario registrado'});
            }
        }
      );
    }
  });
});


app.post('/login',(req,res)=>{
  const {username,password} = req.body;
  db.query('SELECT * FROM usuarios WHERE username = ?',[username],(err,result)=>{
    if (err) {
      console.log('Error al buscar al usuario: '+err);
      res.status(500).json({message: 'Error en el servidor'})
    }else if(result.length === 0){
      res.json({message: 'Usuario no encontrado'})
    }else{
      let contrasenaHasheada = result[0].password;
      bcrypt.compare(password,contrasenaHasheada,(err,match)=>{
        if (err) {
          console.log('Error al comparar contraseñas: '+err);
          res.status(500).json({message: 'Error en el servidor'})
        }else if(match){
          res.status(200).json({message: 'Inicio de sesion exitoso, entrando...'});
        }else{
          res.json({message: 'Contraseña incorrecta'});
        }
      });
    }
  })

});

app.listen(process.env.PORT, () => console.log("Al cielo con ella"));

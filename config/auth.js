const localStrategy = require("passport-local")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")


//Model de Usuário
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

module.exports = function(passport){
  passport.use(new localStrategy({usernameField:"email", passwordField:"senha"}, (email, senha, done)=>{
    Usuario.findOne({email: email}).lean().then((usuario)=>{
      if(!usuario){
        return done(null,false,{message:"Esta conta não existe"})
      }else{
        bcrypt.compare(senha, usuario.senha, (error,batem)=>{
          if(batem){
            return done(null,usuario)
          }else{
            return done(null,false,{message:"Senha Incorreta"})
          }
        })
      }
    })
  }))

  passport.serializeUser((usuario, done)=>{
    done(null, usuario._id)
  })

  passport.deserializeUser((id, done)=>{
    Usuario.findById(id,(error,usuario)=>{
      done(error,usuario)
    })
  })


}

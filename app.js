//Carregando módulos
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin")
const path = require("path")
const mongoose = require("mongoose");
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagem")
require("./models/Categoria")
const Postagem = mongoose.model("postagens")
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")(passport)

//Configurações
  //Sessões
app.use(session({
    secret:"cursodenode",
    resave:true,
    saveUninitialized: true
  }))


  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())
  //Middleware
  app.use(( req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next()
  })
  // Body parser
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
  //handlebars
app.engine('handlebars', handlebars({defaultLayout:'main'}))
app.set('view engine', 'handlebars')
  //mongoose
mongoose.connect("mongodb://localhost/blogjs")
  .then(function(){
    console.log("Conectado ao mongo")
  })
  .catch(function(erro){
    console.log("Erro ao conectar ao banco")
  })
//Public
app.use(express.static(path.join(__dirname,"public")))

//Rotas

app.get('/', (req,res)=>{
  Postagem.find().populate("categoria").sort({data:"desc"}).then((postagens) =>{
      res.render("index", {postagens: postagens.map(post => post.toJSON())})
  }).catch((erro)=>{
    req.flash("error_msg", "Houve um erro interno")
    console.log("Erro: " + erro)
    res.redirect("/404")
  })

})

  app.get("/postagem/:slug", (req,res)=>{
    Postagem.findOne({slug:req.params.slug}).lean().then((postagem) =>{
      if(postagem){
        res.render("postagem/index", {postagem: postagem})
      }else{
        req.flash("error_msg", "Esta postagem não existe")
        res.redirect("/")
      }
    }).catch((erro) =>{
      req.flash("error_msg", "Houve um erro interno")
      console.log("Erro: " + erro)
      res.redirect("/")
    })
  })



app.get("/categorias", (req,res)=>{
Categoria.find().lean().then((categorias)=>{
  res.render("categorias/index", {categorias:categorias})
}).catch((erro)=>{
  req.flash("error_msg", "Houve um ao listar as categorias")
  console.log("Erro: " + erro)
  res.redirect("/")
  })
})

app.get("/categorias/:slug", (req,res)=>{
  Categoria.findOne({slug:req.params.slug}).lean().then((categoria)=>{
  if(categoria){
    Postagem.find({categoria:categoria._id}).lean().then((postagens)=>{
      res.render("categorias/postagens", {postagens:postagens, categoria:categoria})
    }).catch((erro) =>{
      req.flash("error_msg", "Erro ao buscar os posts")
      console.log("Erro: " + erro)
      res.redirect("/")
    })
  }else {
    req.flash("error_msg", "Esta categoria não existe")
    console.log("Erro: " + erro)
    res.redirect("/")
  }
  }).catch((erro)=>{
    req.flash("error_msg", "Houve um ao listar as categorias")
    console.log("Erro: " + erro)
    res.redirect("/")
  })
})


app.get("/404", (req,res)=>{
  res.send("Erro 404")
})

app.get('/posts',(req,res)=>{
  res.send("Lista de Posts")
})

  app.use("/usuarios", usuarios)
  app.use('/admin',admin)




//Outros
const PORT = 8081
app.listen(PORT,() => {
  console.log("Servidor rodando...")
})

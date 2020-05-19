const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")

router.get('/', (req, res) => {
  if(eAdmin){
    res.render('admin/index')
  }else{
    req.flash("error_msg", "Você precisa de permissão")
    res.redirect("/")
  }

})

router.get('/posts', (req,res) =>{
  res.render('admin/posts')
})


router.get('/categorias', (req,res) =>{
    if(eAdmin){
    Categoria.find().then((categorias) => {
      res.render('./admin/categorias', {categorias: categorias.map(category => category.toJSON())})
  //Essa linha acima salvou o mundo, pois nao e mais permitido passar diretamente o parametro para ser acessado na view, por questoes de seguranca.
    })
      .catch(function(error){
        console.log("Erro: " + error)
        req.flash("error_msg", "Erro ao listar as categorias")
        res.redirect("/admin")
      })
    }else{
      req.flash("error_msg", "Você precisa de permissão")
      res.redirect("/")
    }
})

router.get('/categorias/add',  (req,res) =>{
  if(eAdmin){
    res.render("admin/addcategorias")
  }else{
    req.flash("error_msg", "Você precisa de permissão")
    res.redirect("/")
  }
})

router.post('/categorias/nova',  (req,res) =>{
    if(eAdmin){
    var erros = []
    if(!req.body.nome || typeof req.body.nome==undefined || req.body.nome ==null){
      erros.push({texto:"Nome Inválido"})
    }
    if(!req.body.slug || typeof req.body.slug==undefined || req.body.slug ==null){
      erros.push({texto:"Slug Inválido"})
    }
    if(erros.lenght>0){
      res.render("admin/addcategorias", {erros:erros})
    }else{
      const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
      }

      new Categoria(novaCategoria).save()
        .then(function(){
          req.flash("success_msg", "Categoria criada com sucesso")
          res.redirect("/admin/categorias")
        })
        .catch(function(erro){
          req.flash("error_msg", "Erro ao salvar a categoria")
          res.redirect("/admin")
        })
    }
  }else{
    req.flash("error_msg", "Você precisa de permissão")
    res.redirect("/")
  }

})


router.get("/categorias/edit/:id",  (req,res) =>{
    if(eAdmin){
      Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render("admin/editCategorias",{categoria:categoria})
      }).catch((erro) =>{
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias")
      })
    }else{
      req.flash("error_msg", "Você precisa de permissão")
      res.redirect("/")
    }

})

router.post('/categorias/edit',  (req, res) => {
if(eAdmin){
    let filter = { _id: req.body.id }
    let update = { nome: req.body.nome, slug: req.body.slug }

    Categoria.findOneAndUpdate(filter, update).then(() => {
        req.flash("success_msg", "Categoria atualizada")
        res.redirect('/admin/categorias')
    }).catch(err => {
        req.flash("error_msg", "Erro ao atualizar categoria")
    })
  }else{
    req.flash("error_msg", "Você precisa de permissão")
    res.redirect("/")
  }
})

router.post("/categorias/deletar",  (req,res) =>{
  if(eAdmin){
    Categoria.remove({_id:req.body.id}).then(()=>{
      req.flash("success_msg", "Deletado com sucesso")
      res.redirect("/admin/categorias")
    }).catch((erro) =>{
      req.flash("error_msg", "Erro ao deletar")
      res.redirect("/admin/categorias")
    })
  }else{
    req.flash("error_msg", "Você precisa de permissão")
    res.redirect("/")
  }
})

router.get("/postagens",  (req, res)=>{
  if(eAdmin){
  Postagem.find().populate("categoria").sort({data:"desc"})
    .then((postagens) =>{
      res.render("admin/postagens", {postagens: postagens.map(post => post.toJSON())})
    }).catch((erro) =>{
      req.flash("error_msg", "Erro ao listar as postagens")
      res.render("/admin")
    })
  }else{
    req.flash("error_msg", "Você precisa de permissão")
    res.redirect("/")
  }
})


router.get("/postagens/add",  (req, res)=>{
  if(eAdmin){
    Categoria.find().lean().then((categorias) =>{
      res.render("admin/addpostagem", {categorias:categorias})
    }).catch((erro)=>{
      req.flash("error_msg", "Erro ao carregar as categorias")
      res.redirect("/admin")
    })
  }else{
    req.flash("error_msg", "Você precisa de permissão")
    res.redirect("/")
  }
})

router.post("/postagens/nova",  (req,res) =>{
  if(eAdmin){
    var erros = []

    if(req.body.categoria == "0"){
      erros.push({texto: "Categoria Inválida"})
    }

    if(erros.lenght > 0){
      res.render("admin/addpostagem", {erros:erros})
    }else{
      const novaPostagem = {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        conteudo: req.body.conteudo,
        categoria: req.body.categoria,
        slug: req.body.slug
      }

      new Postagem(novaPostagem).save()
        .then(function(){
          req.flash("success_msg", "Postagem criada com sucesso")
          res.redirect("/admin/postagens")
        })
        .catch(function(erro){
          req.flash("error_msg", "Erro ao salvar a Postagem: "+ erro)
          res.redirect("/admin/postagens")
        })
    }
  }else{
    req.flash("error_msg", "Você precisa de permissão")
    res.redirect("/")
  }

})

router.get("/postagens/edit/:id",  (req, res) =>{
  if(eAdmin){
    Postagem.findOne({_id:req.params.id}).lean().then((postagem)=>{
      Categoria.find().lean().then((categorias)=>{
        res.render("admin/editpostagens",{categorias:categorias, postagem:postagem})
      }).catch((erro) =>{
        req.flash("error_msg", "Esta carregar as categorias")
          res.redirect("/admin/postagens")
      })

    }).catch((erro) =>{
      req.flash("error_msg", "Esta postagem não existe")
      res.redirect("/admin/postagens")
    })
  }else{
    req.flash("error_msg", "Você precisa de permissão")
    res.redirect("/")
  }
})


router.post("/postagem/edit",  (req, res) =>{
  if(eAdmin){
    let filter = { _id: req.body.id }
    let update = { titulo: req.body.titulo,
      slug: req.body.slug,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria}

    Postagem.findOneAndUpdate(filter, update).then(() => {
        req.flash("success_msg", "Postagem editada com sucesso")
        res.redirect("/admin/postagens")
      }).catch((erro) =>{
        req.flash("error_msg", "Erro ao editar postagem: " + erro)
        res.redirect("/admin/postagens")
      })
    }else{
      req.flash("error_msg", "Você precisa de permissão")
      res.redirect("/")
    }
})

router.post("/postagens/deletar", (req,res)=>{
  if(eAdmin){
    Postagem.remove({_id:req.body.id}).then(()=>{
      req.flash("success_msg", "Postagem deletada com sucesso")
      res.redirect("/admin/postagens")
    }).catch((erro) =>{
      req.flash("error_msg", "Erro ao deletar postagem")
      res.redirect("/admin/postagens")
    })
  }else{
    req.flash("error_msg", "Você precisa de permissão")
    res.redirect("/")
  }
})
module.exports = router

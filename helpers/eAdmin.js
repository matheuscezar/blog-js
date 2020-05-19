module.export = {
  eAdmin: function(req, res, next){

    if(req.isAuthenticated() && req.user.eAdmin == 1){
      return true
      console.log("eh admin")//next();
    }else{
      console.log("nao eh admin");
      return false
    }
    req.flash("error_msg", "Você precisa de permissão")
    res.redirect("/")
  }
}

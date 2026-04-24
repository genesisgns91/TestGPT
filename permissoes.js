const Permissoes = {

user:null,
role:"user",

async init(auth,db){

return new Promise(resolve=>{

auth.onAuthStateChanged(async user=>{

if(!user){
window.location.href="index.html"
return
}

this.user = user

let doc = await db.collection("usuarios")
.doc(user.uid)
.get()

if(doc.exists){
this.role = doc.data().role || "user"
}

resolve()

})

})

},

isAdmin(){
return this.role === "admin"
},

somenteAdmin(){

if(!this.isAdmin()){
alert("Apenas administrador")
throw "sem permissao"
}

},

aplicar(){

if(!this.isAdmin()){

document.querySelectorAll(".admin")
.forEach(el=>el.style.display="none")

}

}

}

const Permissoes = {

user:null,
role:"user",
loaded:false,

async init(auth,db){

if(this.loaded) return

return new Promise(resolve=>{

auth.onAuthStateChanged(async user=>{

if(!user){
window.location.href="index.html"
return
}

Permissoes.user = user

let doc = await db
.collection("usuarios")
.doc(user.uid)
.get()

if(doc.exists){
Permissoes.role = doc.data().role || "user"
}else{
Permissoes.role = "user"
}

Permissoes.loaded = true

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
throw new Error("Sem permissão")
}

},

aplicar(){

if(!this.isAdmin()){

document
.querySelectorAll(".admin")
.forEach(el=>{
el.style.display="none"
})

}

}

}

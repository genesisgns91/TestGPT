// core.js
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "./firebase.js";


// LOGIN
async function doLogin() {
  const email = document.getElementById("loginEmail").value;
  const pwd   = document.getElementById("loginPwd").value;

  try {
    await signInWithEmailAndPassword(auth, email, pwd);
    window.location.href = "app.html"; // sucesso → vai pro app
  } catch (err) {
    document.getElementById("loginErr").innerText = err.message;
  }
}
window.doLogin = doLogin;


// CADASTRO
async function doCadastro() {
  const nome  = document.getElementById("cadNome").value;
  const email = document.getElementById("cadEmail").value;
  const pwd   = document.getElementById("cadPwd").value;

  try {
    await createUserWithEmailAndPassword(auth, email, pwd);
    window.location.href = "app.html"; // após criar conta
  } catch (err) {
    document.getElementById("cadErr").innerText = err.message;
  }
}
window.doCadastro = doCadastro;


// RECUPERAR SENHA
async function doRecover() {
  const email = document.getElementById("recoverEmail").value;

  try {
    await sendPasswordResetEmail(auth, email);
    document.getElementById("recoverErr").innerText =
      "E-mail enviado! Verifique sua caixa de entrada.";
  } catch (err) {
    document.getElementById("recoverErr").innerText = err.message;
  }
}
window.doRecover = doRecover;


// SE JÁ ESTIVER LOGADO → manda pro app
onAuthStateChanged(auth, user => {
  if (user) {
    window.location.href = "app.html";
  }
});

function switchAuthTab(tab) {
  document.querySelectorAll(".auth-form").forEach(el => el.classList.remove("active"));
  document.getElementById("auth" + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add("active");

  document.querySelectorAll(".auth-tab").forEach(el => el.classList.remove("active"));
  event.target.classList.add("active");
}

window.switchAuthTab = switchAuthTab;

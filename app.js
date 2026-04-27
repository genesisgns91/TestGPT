import { auth, onAuthStateChanged } from "./firebase.js";

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html"; // não logado → volta pro login
  }
});

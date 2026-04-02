// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBZU2iooLFO1eR_aIs7OAban3HtPDybiDE",
    authDomain: "mohitsingh-2bc1b.firebaseapp.com",
    projectId: "mohitsingh-2bc1b",
    storageBucket: "mohitsingh-2bc1b.firebasestorage.app",
    messagingSenderId: "291814517608",
    appId: "1:291814517608:web:17510db9e190cd1258c4dd"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔐 LOGIN
window.loginAdmin = function() {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPass").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      document.getElementById("adminAuth").classList.add("hidden");
      document.getElementById("adminForm").classList.remove("hidden");
    })
    .catch((err) => {
      alert("Login failed ❌ " + err.message);
    });
};

// 🔄 SESSION CHECK
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("adminAuth").classList.add("hidden");
    document.getElementById("adminForm").classList.remove("hidden");
  }
});

// 🚪 LOGOUT
window.logoutAdmin = function() {
  signOut(auth).then(() => {
    location.reload();
  });
};
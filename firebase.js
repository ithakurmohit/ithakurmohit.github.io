// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { setPersistence, browserSessionPersistence, getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut} 
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
setPersistence(auth, browserSessionPersistence);

// 🔐 LOGIN
window.loginAdmin = function() {
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPass").value.trim();

  const btnText = document.getElementById("btnText");
  const btnLoader = document.getElementById("btnLoader");
  const errorEl = document.getElementById("authError");

  // 🔁 reset state
  errorEl.classList.add("hidden");

  if (!email || !password) {
    errorEl.textContent = "Email aur password required hai";
    errorEl.classList.remove("hidden");
    return;
  }

  // 🔄 show loader
  btnText.textContent = "Please wait...";
  btnLoader.classList.remove("hidden");

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // ✅ success
      document.getElementById("adminAuth").classList.add("hidden");
      document.getElementById("adminForm").classList.remove("hidden");
    })
    .catch((err) => {
      // ❌ error handling
      let msg = "Login failed ❌";

      switch (err.code) {
        case "auth/invalid-email":
          msg = "Invalid email format";
          break;
        case "auth/user-not-found":
          msg = "User not found";
          break;
        case "auth/wrong-password":
          msg = "Wrong password";
          break;
        case "auth/too-many-requests":
          msg = "Too many attempts. Try later";
          break;
      }

      errorEl.textContent = msg;
      errorEl.classList.remove("hidden");
    })
    .finally(() => {
      // 🔁 reset button
      btnText.textContent = "Login";
      btnLoader.classList.add("hidden");
    });
};

// 🔄 SESSION CHECK
onAuthStateChanged(auth, (user) => {
  if (!user) {
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

document.addEventListener("DOMContentLoaded", () => {
  ["adminEmail", "adminPass"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        loginAdmin();
      }
    });
  });
});

// 🔐 LOGOUT on page change (strict mode)
window.addEventListener("beforeunload", () => {
  signOut(auth);
});
// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { setPersistence, browserSessionPersistence, getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut} 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


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
const db = getFirestore(app);
setPersistence(auth, browserSessionPersistence);

// 🔐 LOGIN
window.loginAdmin = function() {
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPass").value.trim();

  const btnText = document.getElementById("btnText");
  const btnLoader = document.getElementById("btnLoader");
  const errorEl = document.getElementById("authError");


   const captcha = window.grecaptcha ? grecaptcha.getResponse() : "";


  if (!captcha) {
    alert("Please verify captcha ❌");
    return;
  }

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
  const authBox = document.getElementById("adminAuth");
  const formBox = document.getElementById("adminForm");

  if (user) {
    authBox.classList.add("hidden");
    formBox.classList.remove("hidden");
       renderAdminList();
    renderTagManager();
  } else {
    formBox.classList.add("hidden");
    authBox.classList.remove("hidden");
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


async function migrateLocalToFirestore() {
  const local = localStorage.getItem("projects");
  if (!local) return;

  const projects = JSON.parse(local);

  // check if firestore already has data
  const snapshot = await getDocs(collection(db, "projects"));
  if (!snapshot.empty) return; // already migrated

  for (const p of projects) {
    await addDoc(collection(db, "projects"), p);
  }

  console.log("✅ Local data migrated to Firestore");
}

document.addEventListener("DOMContentLoaded", async () => {
  await migrateLocalToFirestore();
  await renderProjects();

  const adminBtn = document.getElementById("adminBtn");
  if (window.location.hash === "#admin" && adminBtn) {
    adminBtn.classList.remove("hidden");
  }

  document.getElementById("f-img")?.addEventListener("input", function() {
    setImgPreview(this.value.trim());
  });

  document.getElementById("adminOverlay")?.addEventListener("click", function(e) {
    if (e.target === this) closeAdmin();
  });

  document.getElementById("adminPass")?.addEventListener("keydown", function(e) {
    if (e.key === "Enter") loginAdmin();
  });

  document.getElementById("adminEmail")?.addEventListener("keydown", function(e) {
    if (e.key === "Enter") loginAdmin();
  });
});


window.renderAdminList = async function () {
  const container = document.getElementById("adminProjectList");
  if (!container) return;

  const snapshot = await getDocs(collection(db, "projects"));
  const projects = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  container.innerHTML = projects.map(p => `
    <div class="admin-project-item">
      <img src="${p.img}" 
           onerror="this.src='assets/profile.jpg'" 
           style="width:36px;height:36px;border-radius:8px;object-fit:cover;">

      <span>${p.name}</span>

      <div style="margin-left:auto;display:flex;gap:6px;">
        <button onclick="editProject('${p.id}')">✏️ Edit</button>
        <button onclick="deleteProject('${p.id}')">🗑 Remove</button>
      </div>
    </div>
  `).join("");
};

  window.renderProjects = async function () {
  const grid = document.getElementById("projectGrid");
  if (!grid) return;

  const snapshot = await getDocs(collection(db, "projects"));
  const projects = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  grid.innerHTML = projects.map(p => {
    const hasPlay = p.link;
    const hasApple = p.appleLink;

    return `
    <article class="project">
      <div class="project-img-wrap">
        <img src="${p.img}" alt="${p.name}" onerror="this.src='assets/profile.jpg'">
      </div>

      <div class="p-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>

        <div class="tech-stack">
          ${(p.tags || []).map(t => `<span>${t}</span>`).join("")}
        </div>

        <div class="store-btns">
          ${hasPlay ? `
            <a href="${p.link}" target="_blank" class="store-badge store-badge-play">
              <span>Google Play</span>
            </a>` : ""}

          ${hasApple ? `
            <a href="${p.appleLink}" target="_blank" class="store-badge store-badge-apple">
              <span>App Store</span>
            </a>` : ""}
        </div>
      </div>
    </article>`;
  }).join("");
};


window.getProjectsFromFirestore = async function () {
  const snapshot = await getDocs(collection(db, "projects"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}


  window.renderTagManager = async function (selectedTags = []) {
  const container = document.getElementById("tagList");
  if (!container) return;

  const snapshot = await getDocs(collection(db, "projects"));
  const projects = snapshot.docs.map(doc => doc.data());

  const tagSet = new Set();

  projects.forEach(p => {
    (p.tags || []).forEach(t => tagSet.add(t));
  });

  const allTags = Array.from(tagSet);

  container.innerHTML = allTags.map(tag => `
    <span 
      class="tag-chip ${selectedTags.includes(tag) ? 'active' : ''}"
      onclick="toggleTag('${tag}')"
    >
      ${tag}
    </span>
  `).join("");
};

window.addProjectToFirestore = async function (project) {
  await addDoc(collection(db, "projects"), project);
}
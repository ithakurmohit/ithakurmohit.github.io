// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { setPersistence, browserSessionPersistence, getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
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
window.loginAdmin = function () {
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPass").value.trim();

  const btnText = document.getElementById("btnText");
  const btnLoader = document.getElementById("btnLoader");
  const errorEl = document.getElementById("authError");

  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  
  if (!isLocalhost) {
    const captcha = window.grecaptcha ? grecaptcha.getResponse() : "";
    if (!captcha) {
      alert("Please verify captcha ❌");
      return;
    }
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

      console.log("✅ Login success");

      const authBox = document.getElementById("adminAuth");
      const formBox = document.getElementById("adminForm");

      // ✅ IMPORTANT: Inline styles hatao jo toggleAdminPanel ne set kiye hain
      authBox.style.display = "";
      formBox.style.display = "block";   // ← important

      authBox.classList.add("hidden");
      formBox.classList.remove("hidden");
      document.getElementById("adminOverlay").classList.add("show");

      renderAdminList();
      renderTagManager();
      if (window.renderAdminExperienceList) renderAdminExperienceList();
      if (window.renderExpRoleManager) renderExpRoleManager();
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
onAuthStateChanged(auth, async (user) => {
  window.firebaseAuthCurrentUser = user;
  const authBox = document.getElementById("adminAuth");
  const formBox = document.getElementById("adminForm");

  console.log("👤 Auth:", user);

  if (user) {
    authBox.classList.add("hidden");
    formBox.classList.remove("hidden");
    formBox.style.display = "block";
    await renderAdminList();
    await renderTagManager();
    if (window.renderAdminExperienceList) await renderAdminExperienceList();
    if (window.renderExpRoleManager) await renderExpRoleManager();
  } else {
    formBox.classList.add("hidden");
    authBox.classList.remove("hidden");
    authBox.style.display = "block";
    formBox.style.display = "none";   // 🔥 IMPORTANT
  }
});

// 🚪 LOGOUT
window.logoutAdmin = function () {
  signOut(auth).then(() => {
    location.reload();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (isLocalhost) {
    document.querySelectorAll(".g-recaptcha").forEach(el => el.style.display = "none");
  }

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
/* window.addEventListener("beforeunload", () => {
  signOut(auth);
});
 */

document.addEventListener("DOMContentLoaded", async () => {
  await renderProjects();
  if (window.renderExperiences) await renderExperiences();

  const adminBtn = document.getElementById("adminBtn");
  if (window.location.hash === "#admin" && adminBtn) {
    adminBtn.classList.remove("hidden");
  }

  document.getElementById("f-img")?.addEventListener("input", function () {
    setImgPreview(this.value.trim());
  });

  document.getElementById("adminOverlay")?.addEventListener("click", function (e) {
    if (e.target === this) closeAdmin();
  });

  document.getElementById("adminPass")?.addEventListener("keydown", function (e) {
    if (e.key === "Enter") loginAdmin();
  });

  document.getElementById("adminEmail")?.addEventListener("keydown", function (e) {
    if (e.key === "Enter") loginAdmin();
  });
});


window.renderAdminList = async function () {
  const container = document.getElementById("adminProjectList");
  if (!container) return;

  const snapshot = await getDocs(collection(db, "projects"));
  const projects = snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  }));
  projects.sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : -1;
    const orderB = b.order !== undefined ? b.order : -1;
    if (orderA !== orderB) return orderA - orderB;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  container.innerHTML = projects.map(p => `
    <div class="admin-project-item" draggable="true" data-id="${p.id}" style="cursor: grab; display: flex; align-items: center; padding: 10px; border: 1px solid #ddd; margin-bottom: 8px; border-radius: 8px; background: #fff; transition: background 0.2s;">
      <span class="drag-handle" style="cursor: grab; margin-right: 12px; font-size: 18px; color: #888;">☰</span>
      <img src="${p.img}" 
           onerror="this.src='assets/profile.jpg'" 
           referrerpolicy="no-referrer"
           style="width:36px;height:36px;border-radius:8px;object-fit:cover;">

      <span style="margin-left: 12px; font-weight: 500;">${p.name}</span>

      <div style="margin-left:auto;display:flex;gap:6px; align-items: center;">
        <button class="edit-btn" data-id="${p.id}">✏️ Edit</button>
        <button class="delete-btn" data-id="${p.id}">🗑 Remove</button>
      </div>
    </div>
  `).join("");
};

window.renderProjects = async function () {
  try {
    console.log("📡 Rendering projects...");

    const grid = document.getElementById("projectGrid");
    if (!grid) {
      console.error("❌ projectGrid not found");
      return;
    }

    const snapshot = await getDocs(collection(db, "projects"));

    console.log("📦 Docs:", snapshot.docs.length);

    const projects = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    projects.sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : -1;
      const orderB = b.order !== undefined ? b.order : -1;
      if (orderA !== orderB) return orderA - orderB;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    grid.innerHTML = projects.map(p => {
      const hasPlay = p.hasPlay !== undefined ? p.hasPlay : !!p.link;
      const hasApple = p.hasApple !== undefined ? p.hasApple : !!p.appleLink;

      return `
  <article class="project">
    <div class="project-img-wrap">
      <img src="${p.img}" alt="${p.name}" onerror="this.src='assets/profile.jpg'" referrerpolicy="no-referrer">
    </div>

    <div class="p-body">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>

      <div class="tech-stack">
        ${(p.tags || []).map(t => `<span>${t}</span>`).join("")}
      </div>

      <div class="store-btns">
  ${hasPlay ? `
    <a href="${p.link || '#'}" target="_blank" class="store-badge store-badge-play">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.18 23.5c.34.19.72.25 1.1.18L15.64 12 12 8.36 3.18 23.5z" fill="#EA4335"/>
        <path d="M20.47 10.37L17.6 8.74 13.64 12l3.96 3.96 2.87-1.63a2 2 0 0 0 0-3.96z" fill="#FBBC04"/>
        <path d="M4.28 1.32A2 2 0 0 0 3 3.14v17.72a2 2 0 0 0 1.28 1.82L15.64 12 4.28 1.32z" fill="#4285F4"/>
        <path d="M4.28 1.32L15.64 12l3.96-3.96-10.22-5.8a2 2 0 0 0-5.1-.92z" fill="#34A853"/>
      </svg>
      <span><small>GET IT ON</small><b>Google Play</b></span>
    </a>
  ` : ""}
  ${hasApple ? `
    <a href="${p.appleLink || '#'}" target="_blank" class="store-badge store-badge-apple">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#fff"/>
      </svg>
      <span><small>Download on the</small><b>App Store</b></span>
    </a>
  ` : ""}
</div>
    </div>
  </article>`;
    }).join("");

  } catch (e) {
    console.error("❌ Render Error:", e);
  }
};


window.getProjectsFromFirestore = async function () {
  try {
    console.log("📡 Fetching projects...");

    const snapshot = await getDocs(collection(db, "projects"));

    const data = snapshot.docs.map(d => ({
      ...d.data(),
      id: d.id
    }));
    data.sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : -1;
      const orderB = b.order !== undefined ? b.order : -1;
      if (orderA !== orderB) return orderA - orderB;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    console.log("✅ Projects:", data);

    return data;
  } catch (e) {
    console.error("❌ Fetch Error:", e);
    return [];
  }
};

window.updateProjectInFirestore = async function (id, data) {
  try {
    console.log("✏️ Updating:", id, data);

    const docRef = doc(db, "projects", String(id)); // ✅ Ensure string

    await updateDoc(docRef, data);

    console.log("✅ Updated");
  } catch (e) {
    console.error("❌ Update Error:", e);
    throw e; // Propagate error
  }
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
    <span class="tag-chip ${selectedTags.includes(tag) ? 'active' : ''}" data-tag="${tag}">
      ${tag}
    </span>
  `).join("");

  // ✅ No direct click listeners – delegation will handle
};


window.addProjectToFirestore = async function (project) {
  try {
    console.log("🔥 Adding project:", project);

    const res = await addDoc(collection(db, "projects"), project);

    console.log("✅ Added with ID:", res.id);
  } catch (e) {
    console.error("❌ Add Error:", e);
    alert(e.message);
  }
};

window.deleteProjectFromFirestore = async function (id) {
  try {
    console.log("🗑 Deleting:", id);

    await deleteDoc(doc(db, "projects", String(id))); // ✅ Ensure string

    console.log("✅ Deleted");
  } catch (e) {
    console.error("❌ Delete Error:", e);
  }
};

window.renderExperiences = async function () {
  try {
    console.log("📡 Rendering experiences...");
    const listContainer = document.getElementById("experienceList");
    if (!listContainer) {
      console.error("❌ experienceList not found");
      return;
    }
    let snapshot = await getDocs(collection(db, "experience"));
    console.log("📦 Experience Docs:", snapshot.docs.length);

    if (snapshot.empty) {
      console.log("🌱 Seeding default experiences...");
      const defaultExps = [
        {
          company: "Comrade Tech Solutions",
          duration: "Jul 2023 – Present",
          role: "Android & Flutter Developer — Enhancements, bug fixes, payment integrations and API security.",
          order: 0,
          createdAt: Date.now() - 1000
        },
        {
          company: "Sanda Group",
          duration: "Nov 2022 – Jun 2023",
          role: "Java & Android Developer",
          order: 1,
          createdAt: Date.now() - 2000
        },
        {
          company: "AARA Technologies Pvt Ltd",
          duration: "May 2022 – Nov 2022",
          role: "Android Developer",
          order: 2,
          createdAt: Date.now() - 3000
        },
        {
          company: "PWS Information Technology",
          duration: "Jan 2021 – Apr 2022",
          role: "Android Developer",
          order: 3,
          createdAt: Date.now() - 4000
        }
      ];

      for (const exp of defaultExps) {
        await addDoc(collection(db, "experience"), exp);
      }
      snapshot = await getDocs(collection(db, "experience"));
    }

    const experiences = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    experiences.sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : -1;
      const orderB = b.order !== undefined ? b.order : -1;
      if (orderA !== orderB) return orderA - orderB;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    listContainer.innerHTML = experiences.map(exp => {
      let roleHtml = "";
      if (exp.roles && exp.roles.length > 0) {
        const rolesStr = exp.roles.join(" & ");
        if (exp.desc) {
          roleHtml = `<p>${rolesStr} — ${exp.desc}</p>`;
        } else {
          roleHtml = `<p>${rolesStr}</p>`;
        }
      } else if (exp.role) {
        roleHtml = `<p>${exp.role}</p>`;
      } else if (exp.desc) {
        roleHtml = `<p>${exp.desc}</p>`;
      }
      return `
        <li>
          <div class="exp-header"><strong>${exp.company}</strong> <span class="exp-date">${exp.duration}</span></div>
          ${roleHtml}
        </li>
      `;
    }).join("");
  } catch (e) {
    console.error("❌ Experience Render Error:", e);
  }
};

window.renderAdminExperienceList = async function () {
  const container = document.getElementById("adminExperienceList");
  if (!container) return;

  const snapshot = await getDocs(collection(db, "experience"));
  const experiences = snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  }));
  experiences.sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : -1;
    const orderB = b.order !== undefined ? b.order : -1;
    if (orderA !== orderB) return orderA - orderB;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  container.innerHTML = experiences.map(exp => {
    let roleSummary = "";
    if (exp.roles && exp.roles.length > 0) {
      roleSummary = exp.roles.join(" & ");
      if (exp.desc) {
        roleSummary += ` — ${exp.desc}`;
      }
    } else if (exp.role) {
      roleSummary = exp.role;
    } else if (exp.desc) {
      roleSummary = exp.desc;
    }
    const displaySummary = roleSummary ? `${roleSummary.slice(0, 50)}${roleSummary.length > 50 ? '...' : ''} ` : "";
    return `
      <div class="admin-experience-item" draggable="true" data-id="${exp.id}" style="cursor: grab; display: flex; align-items: center; padding: 10px; border: 1px solid #ddd; margin-bottom: 8px; border-radius: 8px; background: #fff; transition: background 0.2s;">
        <span class="drag-handle" style="cursor: grab; margin-right: 12px; font-size: 18px; color: #888;">☰</span>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-weight: 600;">${exp.company}</span>
          <span style="font-size: 12px; color: #666;">${displaySummary}(${exp.duration})</span>
        </div>
        <div style="margin-left:auto;display:flex;gap:6px; align-items: center;">
          <button class="edit-btn exp-edit-btn" data-id="${exp.id}">✏️ Edit</button>
          <button class="delete-btn exp-delete-btn" data-id="${exp.id}">🗑 Remove</button>
        </div>
      </div>
    `;
  }).join("");
};

window.getExperiencesFromFirestore = async function () {
  try {
    const snapshot = await getDocs(collection(db, "experience"));
    const data = snapshot.docs.map(d => ({
      ...d.data(),
      id: d.id
    }));
    data.sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : -1;
      const orderB = b.order !== undefined ? b.order : -1;
      if (orderA !== orderB) return orderA - orderB;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    return data;
  } catch (e) {
    console.error("❌ Fetch Experience Error:", e);
    return [];
  }
};

window.addExperienceToFirestore = async function (experience) {
  try {
    console.log("🔥 Adding experience:", experience);
    const res = await addDoc(collection(db, "experience"), experience);
    console.log("✅ Experience added with ID:", res.id);
  } catch (e) {
    console.error("❌ Add Experience Error:", e);
    alert(e.message);
  }
};

window.updateExperienceInFirestore = async function (id, data) {
  try {
    console.log("✏️ Updating experience:", id, data);
    const docRef = doc(db, "experience", String(id));
    await updateDoc(docRef, data);
    console.log("✅ Experience updated");
  } catch (e) {
    console.error("❌ Update Experience Error:", e);
    throw e;
  }
};

window.deleteExperienceFromFirestore = async function (id) {
  try {
    console.log("🗑 Deleting experience:", id);
    await deleteDoc(doc(db, "experience", String(id)));
    console.log("✅ Experience deleted");
  } catch (e) {
    console.error("❌ Delete Experience Error:", e);
  }
};

window.renderExpRoleManager = async function (selectedRoles = []) {
  const container = document.getElementById("expRoleList");
  if (!container) return;

  const snapshot = await getDocs(collection(db, "experience"));
  const experiences = snapshot.docs.map(doc => doc.data());

  const roleSet = new Set();
  
  const defaultSeeds = ["Android Developer", "Flutter Developer", "Kotlin", "Java", "Firebase", "Jetpack Compose", "REST APIs", "MVVM", "Android SDK", "Payment Integration", "Security Auditing"];
  defaultSeeds.forEach(r => roleSet.add(r));

  experiences.forEach(exp => {
    if (exp.roles) {
      exp.roles.forEach(r => roleSet.add(r));
    } else if (exp.role) {
      exp.role.split(/[,,—&-]/).map(r => r.trim()).filter(Boolean).forEach(r => roleSet.add(r));
    }
  });

  const allRoles = Array.from(roleSet);

  container.innerHTML = allRoles.map(role => `
    <span class="tag-chip exp-role-chip ${selectedRoles.includes(role) ? 'active' : ''}" data-role="${role}">
      ${role}
    </span>
  `).join("");
};
const DEFAULT_PROJECTS = [
  { id: 1, name: "Hi-Tech Kisan", img: "assets/hitechkisan.webp", desc: "The app focuses on making farming-related purchases more accessible by offering a structured and transparent way to explore products related to agriculture, dairy, and livestock care.", tags: ["Flutter", "Dart", "REST API"], link: "https://play.google.com/store/apps/details?id=com.hitechkisan.app&hl=en_IN", appleLink: "" },
  { id: 2, name: "Dream Square", img: "assets/dream.png", desc: "Dream Square – Property Buy or Sale Made Simple.", tags: ["Flutter", "Dart", "REST API"], link: "https://play.google.com/store/apps/details?id=com.dream.square&hl=en_IN", appleLink: "" },
  { id: 3, name: "Starlyte Mobile", img: "assets/starlyte.png", desc: "Mobile client for Starlyte platform — UI & integration work.", tags: ["Flutter", "Dart", "REST API"], link: "https://play.google.com/store/apps/details?id=com.starlyte.mobile&hl=en_IN", appleLink: "" },
  { id: 4, name: "Secuber", img: "assets/secuber.png", desc: "Business & productivity app — enhancements & bug fixes.", tags: ["Kotlin", "Java", "Firebase", "MVVM"], link: "https://play.google.com/store/apps/details?id=com.mad.SpaciMax", appleLink: "https://apps.apple.com/in/app/secuber/id1636624719" },
  { id: 5, name: "Dev Tea", img: "assets/tea.png", desc: "Discover Premium Teas, Expert Brewing, and a Personalized Tea Experience.", tags: ["Java", "XML", "Webview"], link: "https://play.google.com/store/apps/details?id=com.comrade.devtea", appleLink: "" },
  { id: 6, name: "Siccura Work", img: "assets/siccuraWork.png", desc: "A Secure, Zero-Knowledge Platform for Total Control of Business Data and Communications.", tags: ["Java", "Firebase", "AES Encryption"], link: "https://play.google.com/store/apps/details?id=yw.wemet.siccurapro", appleLink: "" },
  { id: 7, name: "SUMS - Education Management", img: "assets/sums.png", desc: "Education / enterprise app. Implemented features and release updates.", tags: ["Kotlin", "Java", "Firebase", "MVVM"], link: "http://play.google.com/store/apps/details?id=com.sujaltech.sums&hl=en_IN", appleLink: "" },
  { id: 8, name: "Siccura Lite", img: "assets/siccura.png", desc: "Security & tracking application — worked on core Android modules.", tags: ["Kotlin", "Java", "Firebase", "MVVM"], link: "https://play.google.com/store/apps/details?id=yw.wemet.siccuraLite&hl=en_IN", appleLink: "" },
  { id: 9, name: "Siccura Office", img: "assets/siccuraoffice.png", desc: "Document viewer app — performance improvements and bug fixes.", tags: ["Kotlin", "Java", "Firebase", "MVVM"], link: "https://play.google.com/store/apps/details?id=yw.wemet.docviewer", appleLink: "" },
  { id: 10, name: "Reward Dragon", img: "assets/reward.png", desc: "An employee engagement mobile platform powered by gamification.", tags: ["Kotlin", "Java", "XML"], link: "https://play.google.com/store/apps/details?id=com.rewarddragon.app", appleLink: "" },
  { id: 11, name: "Useme - Social Saving App", img: "assets/useme.png", desc: "Wallet & recharge app — worked on payments (Paytm, Cashfree, Razorpay), AePS, and AAR libraries.", tags: ["Java", "Firebase", "Razorpay", "Cashfree", "AePS"], link: "https://play.google.com/store/apps/details?id=com.useme.wallet&hl=en_IN", appleLink: "" },
  { id: 12, name: "Rajkamal Recharge", img: "assets/rajkamal.png", desc: "This app makes online recharges and bill payments.", tags: ["Java", "XML", "JSON", "Razorpay", "Cashfree"], link: "https://play.google.com/store/apps/details?id=com.app.rajkamal&hl=en_IN", appleLink: "" }
];


// function getProjects() {
//   const saved = localStorage.getItem("projects");
//   return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
// }

// function saveProjects(projects) {
//   localStorage.setItem("projects", JSON.stringify(projects));
// }

async function updateProjectInFirestore(id, data) {
  await updateDoc(doc(db, "projects", id), data);
}

/* async function deleteProjectFromFirestore(id) {
  await deleteDoc(doc(db, "projects", id));
} */

  async function deleteProject(id) {
  await deleteProjectFromFirestore(id);
  await renderProjects();
  await renderAdminList();
}
async function getAllTags() {
  const projects = await getProjectsFromFirestore();
  const tagSet = new Set();

  projects.forEach(p => {
    (p.tags || []).forEach(t => tagSet.add(t));
  });

  const savedTags = JSON.parse(localStorage.getItem("allTags") || "[]");
  savedTags.forEach(t => tagSet.add(t));

  return Array.from(tagSet);
}

/* async function renderTagManager(selectedTags = []) {
  const allTags = await getAllTags();
  const container = document.getElementById("tagList");
  if (!container) return;

  container.innerHTML = allTags.map(tag => `
    <span
      class="tag-chip ${selectedTags.includes(tag) ? 'active' : ''}"
      onclick="toggleTag('${tag}')"
    >
      ${tag}
    </span>
  `).join("");
} */


async function toggleTag(tag) {
  const input = document.getElementById("f-tags");
  let current = input.value ? input.value.split(",").map(t => t.trim()).filter(Boolean) : [];

  if (current.includes(tag)) {
    current = current.filter(t => t !== tag);
  } else {
    current.push(tag);
  }

  input.value = current.join(", ");
  await renderTagManager(current);
}

async function addNewTag() {
  const input = document.getElementById("newTagInput");
  const newTag = input.value.trim();
  if (!newTag) return;

  let tags = await getAllTags();

  if (!tags.includes(newTag)) {
    tags.push(newTag);
    saveAllTags(tags);
  }

  const currentSelected = document.getElementById("f-tags").value
    ? document.getElementById("f-tags").value.split(",").map(t => t.trim()).filter(Boolean)
    : [];

  if (!currentSelected.includes(newTag)) currentSelected.push(newTag);

  document.getElementById("f-tags").value = currentSelected.join(", ");
  input.value = "";

  await renderTagManager(currentSelected);
}

function removeTag(tag) {
  let tags = getAllTags().filter(t => t !== tag);
  saveAllTags(tags);

  // projects se bhi remove
  const projects = getProjects().map(p => ({
    ...p,
    tags: (p.tags || []).filter(t => t !== tag)
  }));

  saveProjects(projects);

  renderProjects();
  renderAdminList();
  renderTagManager();
}

function saveAllTags(tags) {
  localStorage.setItem("allTags", JSON.stringify(tags));
}

/* async function renderProjects() {
  const grid = document.getElementById("projectGrid");
  const projects = await getProjectsFromFirestore();
  grid.innerHTML = projects.map(p => {
    const hasPlay = p.link;
    const hasApple = p.appleLink;
    const storeButtons = `
      <div class="store-btns">
        ${hasPlay ? `
        <a href="${p.link}" target="_blank" class="store-badge store-badge-play">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.18 23.5c.34.19.72.25 1.1.18L15.64 12 12 8.36 3.18 23.5z" fill="#EA4335"/>
            <path d="M20.47 10.37L17.6 8.74 13.64 12l3.96 3.96 2.87-1.63a2 2 0 0 0 0-3.96z" fill="#FBBC04"/>
            <path d="M4.28 1.32A2 2 0 0 0 3 3.14v17.72a2 2 0 0 0 1.28 1.82L15.64 12 4.28 1.32z" fill="#4285F4"/>
            <path d="M4.28 1.32L15.64 12l3.96-3.96-10.22-5.8a2 2 0 0 0-5.1-.92z" fill="#34A853"/>
          </svg>
          <span><small>GET IT ON</small><b>Google Play</b></span>
        </a>` : ""}
        ${hasApple ? `
        <a href="${p.appleLink}" target="_blank" class="store-badge store-badge-apple">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#fff"/>
          </svg>
          <span><small>Download on the</small><b>App Store</b></span>
        </a>` : ""}
      </div>`;
    return `
    <article class="project">
      <div class="project-img-wrap">
        <img src="${p.img}" alt="${p.name}" onerror="this.src='assets/profile.jpg'">
      </div>
      <div class="p-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="tech-stack">${p.tags.map(t => `<span>${t}</span>`).join("")}</div>
        ${storeButtons}
      </div>
    </article>`;
  }).join("");
}
 */
// ── ADMIN PANEL ──

window.toggleAdminPanel = function () {
  if (window.location.hash !== "#admin") {
    alert("Unauthorized access ❌");
    return;
  }

  document.getElementById("adminOverlay").classList.add("show");
};

function closeAdmin() {
  document.getElementById("adminOverlay").classList.remove("show");

  // 🔐 Firebase logout
  if (window.logoutAdmin) {
    logoutAdmin();
  }

  document.getElementById("adminPass").value = "";
  document.getElementById("authError").classList.add("hidden");
}



/* async function renderAdminList() {
  const projects = await getProjectsFromFirestore();
  document.getElementById("adminProjectList").innerHTML = projects.map(p => `
    <div class="admin-project-item">
      <img src="${p.img}" onerror="this.src='assets/profile.jpg'" style="width:36px;height:36px;border-radius:8px;object-fit:cover;flex-shrink:0;">
      <span>${p.name}</span>
      <div style="display:flex;gap:6px;margin-left:auto">
        <button class="edit-btn" onclick="editProject(${p.id})">✏️ Edit</button>
        <button onclick="deleteProject(${p.id})">🗑 Remove</button>
      </div>
    </div>
  `).join("");
} */

  
async function editProject(id) {
   const p = (await getProjectsFromFirestore()).find(item => item.id === id);
  if (!p) return;

  document.getElementById("f-edit-id").value = id;
  document.getElementById("f-name").value = p.name;
  document.getElementById("f-img").value = p.img;
  document.getElementById("f-desc").value = p.desc;
  document.getElementById("f-tags").value = p.tags.join(", ");
  document.getElementById("f-link").value = p.link || "";
  document.getElementById("f-link-apple-store").value = p.appleLink || "";
  document.getElementById("f-has-play").checked = !!p.link;
  document.getElementById("f-has-apple").checked = !!p.appleLink;
  setImgPreview(p.img);

  document.getElementById("formTitle").textContent = "✏️ Edit Project";
  document.getElementById("submitBtn").textContent = "💾 Save Changes";
  document.getElementById("cancelEditBtn").classList.remove("hidden");

  // Scroll to form top
  document.getElementById("formTitle").scrollIntoView({ behavior: "smooth" });
 await renderTagManager(p.tags || []);   // 👈 selected tags ke sath
}

function cancelEdit() {
  document.getElementById("f-edit-id").value = "";
  document.getElementById("formTitle").textContent = "Add New Project";
  document.getElementById("submitBtn").textContent = "➕ Add Project";
  document.getElementById("cancelEditBtn").classList.add("hidden");
  ["f-name","f-img","f-desc","f-tags","f-link","f-link-apple","f-link-apple-store"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("f-has-play").checked = true;
  document.getElementById("f-has-apple").checked = false;
  setImgPreview("");
  document.getElementById("fetchStatus").classList.add("hidden");
  renderTagManager();   // 👈 reset view
}

function saveProject() {
  const editId = document.getElementById("f-edit-id").value;
  if (editId) {
    updateProject(editId);
  } else {
    addProject();
  }
}

/* function updateProject(id) {
  const name = document.getElementById("f-name").value.trim();
  const img  = document.getElementById("f-img").value.trim();
  const desc = document.getElementById("f-desc").value.trim();
  const tags = document.getElementById("f-tags").value.trim();
  const hasPlay  = document.getElementById("f-has-play").checked;
  const hasApple = document.getElementById("f-has-apple").checked;
  const playLink  = hasPlay  ? document.getElementById("f-link").value.trim() : "";
  const appleLink = hasApple ? document.getElementById("f-link-apple-store").value.trim() : "";

  if (!name || !img || !desc) { alert("Name, Image aur Description required hai."); return; }

  const projects = getProjects().map(p =>
    p.id === id ? { ...p, name, img, desc, tags: tags ? tags.split(",").map(t => t.trim()) : [], link: playLink, appleLink } : p
  );
  saveProjects(projects);
  renderProjects();
  renderAdminList();
  cancelEdit();

  const msg = document.getElementById("formMsg");
  msg.textContent = "Project updated!";
  msg.classList.remove("hidden");
  setTimeout(() => { msg.classList.add("hidden"); msg.textContent = "Project added!"; }, 2500);
} */


/* function deleteProject(id) {
  saveProjects(getProjects().filter(p => p.id !== id));
  renderProjects();
  renderAdminList();
} */



function setImgPreview(url) {
  const preview = document.getElementById("f-img-preview");
  if (url) { preview.src = url; preview.classList.remove("hidden"); }
  else { preview.classList.add("hidden"); }
}

function handleImgUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById("f-img").value = e.target.result;
    setImgPreview(e.target.result);
  };
  reader.readAsDataURL(file);
}

async function fetchAppDetails(type) {
  const inputId = type === "apple" ? "f-link-apple" : "f-link";
  const link = document.getElementById(inputId).value.trim();
  const status = document.getElementById("fetchStatus");
  status.className = "fetch-status";
  status.classList.remove("hidden");
  status.textContent = "⏳ Fetching...";

  try {
    if (type === "apple" || link.includes("apps.apple.com") || link.includes("itunes.apple.com")) {
      const idMatch = link.match(/id(\d+)/);
      if (!idMatch) throw new Error("Invalid App Store URL");
      const appId = idMatch[1];
      const countryMatch = link.match(/apps\.apple\.com\/([a-z]{2})\//);
      const country = countryMatch ? countryMatch[1] : "us";
      let data;
      for (const cc of [country, "us", "in"]) {
        const res = await fetch(`https://itunes.apple.com/lookup?id=${appId}&country=${cc}`);
        data = await res.json();
        if (data.results && data.results.length) break;
      }
      if (!data.results || !data.results.length) throw new Error("App not found on App Store");
      const app = data.results[0];
      document.getElementById("f-name").value = app.trackName || "";
      document.getElementById("f-desc").value = (app.description || "").slice(0, 200);
      const iconUrl = app.artworkUrl512 || app.artworkUrl100 || "";
      document.getElementById("f-img").value = iconUrl;
      setImgPreview(iconUrl);
      document.getElementById("f-link-apple-store").value = link;
      document.getElementById("f-has-apple").checked = true;
      status.textContent = "✅ App Store details fetched!";

    } else if (link.includes("play.google.com")) {
      const idMatch = link.match(/id=([a-zA-Z0-9._]+)/);
      if (!idMatch) throw new Error("Invalid Play Store URL");
      const bundleId = idMatch[1];
      const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=https://play.google.com/store/apps/details?id=${bundleId}&hl=en`;
      const res = await fetch(proxyUrl);
      const raw = await res.text();
      const html = raw.includes("&lt;") ? raw.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/&quot;/g,'"') : raw;

      const nameMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
      const appName = nameMatch ? nameMatch[1].replace(/ - Apps on Google Play/i, "").trim() : "";
      const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{10,})["']/) ||
                        html.match(/<meta[^>]+content=["']([^"']{10,})["'][^>]+name=["']description["']/);
      const desc = descMatch ? descMatch[1].trim() : "";
      const ogImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/) ||
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/);
      const iconUrl = ogImgMatch ? ogImgMatch[1].split("=")[0] + "=w120-h120" : "";

      if (appName) document.getElementById("f-name").value = appName;
      if (desc) document.getElementById("f-desc").value = desc.slice(0, 200);
      if (iconUrl) { document.getElementById("f-img").value = iconUrl; setImgPreview(iconUrl); }
      // Auto-fill play store link and check checkbox only on success
      if (appName || desc || iconUrl) {
        document.getElementById("f-link").value = link;
        document.getElementById("f-has-play").checked = true;
      }
      status.textContent = appName ? "✅ Play Store details fetched!" : "⚠️ Partial data. Please fill remaining fields.";
      if (!appName) status.classList.add("error-status");

    } else {
      throw new Error("Please enter a valid Play Store or App Store URL");
    }
  } catch (e) {
    status.textContent = "❌ " + e.message;
    status.classList.add("error-status");
  }
}

async function addProject() {
  const name = document.getElementById("f-name").value.trim();
  const img  = document.getElementById("f-img").value.trim();
  const desc = document.getElementById("f-desc").value.trim();
  const tags = document.getElementById("f-tags").value.trim();
  const hasPlay  = document.getElementById("f-has-play").checked;
  const hasApple = document.getElementById("f-has-apple").checked;
  const playLink  = hasPlay ? document.getElementById("f-link").value.trim() : "";
  const appleLink = hasApple ? document.getElementById("f-link-apple-store").value.trim() : "";

  if (!name || !img || !desc) {
    alert("Name, Image aur Description required hai.");
    return;
  }

  await addProjectToFirestore({
    name,
    img,
    desc,
    tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    link: playLink,
    appleLink
  });

  await renderProjects();
  await renderAdminList();
  cancelEdit();
}

/* async function addProject() {
  const name = document.getElementById("f-name").value.trim();
  const img  = document.getElementById("f-img").value.trim();
  const desc = document.getElementById("f-desc").value.trim();
  const tags = document.getElementById("f-tags").value.trim();
  const hasPlay  = document.getElementById("f-has-play").checked;
  const hasApple = document.getElementById("f-has-apple").checked;
  const playLink  = hasPlay  ? document.getElementById("f-link").value.trim() : "";
  const appleLink = hasApple ? document.getElementById("f-link-apple-store").value.trim() : "";

  if (!name || !img || !desc) { alert("Name, Image aur Description required hai."); return; }

  const projects = await getProjectsFromFirestore();
  projects.push({ id: Date.now(), name, img, desc, tags: tags ? tags.split(",").map(t => t.trim()) : [], link: playLink, appleLink });
  saveProjects(projects);
  
  renderProjects();
  renderAdminList();
  cancelEdit();

  const msg = document.getElementById("formMsg");
  msg.classList.remove("hidden");
  setTimeout(() => msg.classList.add("hidden"), 2500);
} */



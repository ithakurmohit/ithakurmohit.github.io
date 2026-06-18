
// function getProjects() {
//   const saved = localStorage.getItem("projects");
//   return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
// }

// function saveProjects(projects) {
//   localStorage.setItem("projects", JSON.stringify(projects));
// }



/* async function deleteProjectFromFirestore(id) {
  await deleteDoc(doc(db, "projects", id));
} */

 async function deleteProject(id) {
  if (!confirm("Are you sure you want to delete this project?")) return;
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
  if (!input) return;
  
  let current = input.value ? input.value.split(",").map(t => t.trim()).filter(Boolean) : [];

  if (current.includes(tag)) {
    current = current.filter(t => t !== tag);
  } else {
    current.push(tag);
  }

  input.value = current.join(", ");
  
  // Re-render tag manager with updated selection
  if (window.renderTagManager) {
    await window.renderTagManager(current);
  }
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
  const overlay = document.getElementById("adminOverlay");
  const authBox = document.getElementById("adminAuth");
  const formBox = document.getElementById("adminForm");
  const user = window.firebaseAuthCurrentUser || null;

   // ✅ Agar user logged in nahi hai, to sirf login form dikhao
  if (!user) {
    overlay.classList.add("show");
    authBox.style.display = "flex";
    formBox.style.display = "none";
    authBox.classList.remove("hidden");
    formBox.classList.add("hidden");
    return;
  }

   // ✅ User logged in hai to admin form dikhao
  overlay.classList.add("show");
  authBox.style.display = "none";
  formBox.style.display = "block";
  authBox.classList.add("hidden");
  formBox.classList.remove("hidden");
};

function closeAdmin() {
  const overlay = document.getElementById("adminOverlay");
  overlay.classList.remove("show");

  if (window.logoutAdmin) {
    logoutAdmin();   // ye signOut karega, phir onAuthStateChanged fire hoga
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

   try {
  console.log("✏️ Edit called with id:", id);

  const projects = await getProjectsFromFirestore();
    const p = projects.find(item => String(item.id) === String(id));
      console.log("Project data:", p);
 if (!p) {
      console.error("Project not found:", id);
      return;
    }

        console.log("Project data:", p);

  // Safely set form fields
    document.getElementById("f-edit-id").value = id;
    document.getElementById("f-name").value = p.name || "";
    document.getElementById("f-img").value = p.img || "";
    document.getElementById("f-desc").value = p.desc || "";
    
    const tagsArray = Array.isArray(p.tags) ? p.tags : [];
    document.getElementById("f-tags").value = tagsArray.join(", ");
    document.getElementById("f-link").value = p.link || "";
    document.getElementById("f-link-apple-store").value = p.appleLink || "";
    document.getElementById("f-has-play").checked = p.hasPlay !== undefined ? p.hasPlay : !!(p.link);
    document.getElementById("f-has-apple").checked = p.hasApple !== undefined ? p.hasApple : !!(p.appleLink);
    
    setImgPreview(p.img || "");

    document.getElementById("formTitle").textContent = "✏️ Edit Project";
    document.getElementById("submitBtn").textContent = "💾 Save Changes";
    document.getElementById("cancelEditBtn").classList.remove("hidden");

    document.getElementById("formTitle").scrollIntoView({ behavior: "smooth" });
    
    // Safely render tag manager
    await renderTagManager(tagsArray);
 } catch (error) {
    console.error("Error in editProject:", error);
   
  }
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

async function updateProject(id) {
  console.log("Updating project:", id);
  const name = document.getElementById("f-name").value.trim();
  const img = document.getElementById("f-img").value.trim();
  const desc = document.getElementById("f-desc").value.trim();
  const tags = document.getElementById("f-tags").value.trim();
  const hasPlay = document.getElementById("f-has-play").checked;
  const hasApple = document.getElementById("f-has-apple").checked;
  const playLink = hasPlay ? document.getElementById("f-link").value.trim() : "";
  const appleLink = hasApple ? document.getElementById("f-link-apple-store").value.trim() : "";

  if (!name || !img || !desc) {
    alert("Name, Image aur Description required hai.");
    return;
  }
 const stringId = String(id);

   try {

  await updateProjectInFirestore(stringId, {
    name, img, desc,
    tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    link: playLink,
    appleLink,
    hasPlay,
    hasApple
  });

  await renderProjects();
  await renderAdminList();
  cancelEdit();

  const msg = document.getElementById("formMsg");
  msg.textContent = "✅ Project updated successfully!";
  msg.classList.remove("hidden");
  setTimeout(() => msg.classList.add("hidden"), 3000);
   } catch (error) {
    console.error("Update error:", error);
    alert("Update failed: " + error.message);
  }
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
      const playUrl = `https://play.google.com/store/apps/details?id=${bundleId}&hl=en`;
      const proxyUrl = `proxy.php?url=${encodeURIComponent(playUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error("Network response was not ok");
      const json = await res.json();
      const raw = json.contents;
      const html = raw.includes("&lt;") ? raw.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/&quot;/g,'"') : raw;

      const nameMatch = html.match(/<title[^>]*>([\s\S]+?)<\/title>/i) || html.match(/itemprop="name"[^>]*>([\s\S]+?)<\//i);
      const appName = nameMatch ? nameMatch[1].replace(/ - Apps on Google Play/i, "").trim() : "";
      
      const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{10,})["']/i) ||
                        html.match(/<meta[^>]+content=["']([^"']{10,})["'][^>]+name=["']description["']/i);
      const desc = descMatch ? descMatch[1].trim() : "";
      
      const ogImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
      let iconUrl = ogImgMatch ? ogImgMatch[1] : "";
      
      if (!iconUrl) {
          const imgMatch = html.match(/https:\/\/play-lh\.googleusercontent\.com\/[a-zA-Z0-9_-]+/);
          if (imgMatch) iconUrl = imgMatch[0];
      }

      if (iconUrl) {
          iconUrl = iconUrl.split("=")[0] + "=w120-h120";
      }

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

  const existingProjects = await window.getProjectsFromFirestore();
  const isDuplicate = existingProjects.some(p => 
    p.name.toLowerCase() === name.toLowerCase() || 
    (playLink && p.link === playLink) || 
    (appleLink && p.appleLink === appleLink)
  );

  if (isDuplicate) {
    alert("⚠️ This project name or link already exists!");
    return;
  }

  await addProjectToFirestore({
    name,
    img,
    desc,
    tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    link: playLink,
    appleLink,
    hasPlay,
    hasApple,
    createdAt: Date.now()
  });

  await renderProjects();
  await renderAdminList();
  cancelEdit();

   // ✅ Show success message
  const msg = document.getElementById("formMsg");
  msg.textContent = "✅ Project added successfully!";
  msg.classList.remove("hidden");
  setTimeout(() => msg.classList.add("hidden"), 3000);
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


document.getElementById("adminBtn")?.addEventListener("click", () => {
  toggleAdminPanel();
});

document.getElementById("adminProjectList")?.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".edit-btn");
  const deleteBtn = e.target.closest(".delete-btn");

  if (editBtn) {
    editProject(editBtn.dataset.id);
  }

  if (deleteBtn) {
    deleteProject(deleteBtn.dataset.id);
  }
});

let dragSourceEl = null;

function handleDragStart(e) {
  const item = e.target.closest('.admin-project-item');
  if (!item) return;
  dragSourceEl = item;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', item.outerHTML);
  item.style.opacity = '0.5';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const item = e.target.closest('.admin-project-item');
  if (item && item !== dragSourceEl) {
    item.style.borderTop = "2px solid #007bff";
  }
  return false;
}

function handleDragLeave(e) {
  const item = e.target.closest('.admin-project-item');
  if (item) {
    item.style.borderTop = "";
  }
}

async function handleDrop(e) {
  e.stopPropagation();
  const targetItem = e.target.closest('.admin-project-item');
  
  document.querySelectorAll('.admin-project-item').forEach(el => {
    el.style.opacity = '1';
    el.style.borderTop = '';
  });

  if (dragSourceEl !== targetItem && targetItem) {
    const list = document.getElementById("adminProjectList");
    const allItems = [...list.querySelectorAll('.admin-project-item')];
    const sourceIndex = allItems.indexOf(dragSourceEl);
    const targetIndex = allItems.indexOf(targetItem);

    if (sourceIndex < targetIndex) {
      targetItem.after(dragSourceEl);
    } else {
      targetItem.before(dragSourceEl);
    }

    await saveNewOrder();
  }
  return false;
}

async function saveNewOrder() {
  const list = document.getElementById("adminProjectList");
  const allItems = [...list.querySelectorAll('.admin-project-item')];
  
  const msg = document.getElementById("formMsg");
  if (msg) {
    msg.textContent = "⏳ Saving new order...";
    msg.classList.remove("hidden");
  }

  try {
    const updates = allItems.map((item, index) => {
      const id = item.dataset.id;
      return window.updateProjectInFirestore(id, { order: index });
    });
    
    await Promise.all(updates);
    await window.renderProjects();
    
    if (msg) {
      msg.textContent = "✅ Order updated successfully!";
      setTimeout(() => msg.classList.add("hidden"), 3000);
    }
  } catch(e) {
    console.error("Failed to save order:", e);
    if(msg) msg.textContent = "❌ Failed to save order";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const adminList = document.getElementById("adminProjectList");
  if (adminList) {
    adminList.addEventListener('dragstart', handleDragStart);
    adminList.addEventListener('dragover', handleDragOver);
    adminList.addEventListener('dragleave', handleDragLeave);
    adminList.addEventListener('drop', handleDrop);
  }
});

// ── EXPERIENCE DRAG-AND-DROP ──
let dragExpSourceEl = null;

function handleExpDragStart(e) {
  const item = e.target.closest('.admin-experience-item');
  if (!item) return;
  dragExpSourceEl = item;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', item.outerHTML);
  item.style.opacity = '0.5';
}

function handleExpDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const item = e.target.closest('.admin-experience-item');
  if (item && item !== dragExpSourceEl) {
    item.style.borderTop = "2px solid #007bff";
  }
  return false;
}

function handleExpDragLeave(e) {
  const item = e.target.closest('.admin-experience-item');
  if (item) {
    item.style.borderTop = "";
  }
}

async function handleExpDrop(e) {
  e.stopPropagation();
  const targetItem = e.target.closest('.admin-experience-item');
  
  document.querySelectorAll('.admin-experience-item').forEach(el => {
    el.style.opacity = '1';
    el.style.borderTop = '';
  });

  if (dragExpSourceEl !== targetItem && targetItem) {
    const list = document.getElementById("adminExperienceList");
    const allItems = [...list.querySelectorAll('.admin-experience-item')];
    const sourceIndex = allItems.indexOf(dragExpSourceEl);
    const targetIndex = allItems.indexOf(targetItem);

    if (sourceIndex < targetIndex) {
      targetItem.after(dragExpSourceEl);
    } else {
      targetItem.before(dragExpSourceEl);
    }

    await saveNewExperienceOrder();
  }
  return false;
}

async function saveNewExperienceOrder() {
  const list = document.getElementById("adminExperienceList");
  const allItems = [...list.querySelectorAll('.admin-experience-item')];
  
  const msg = document.getElementById("expFormMsg");
  if (msg) {
    msg.textContent = "⏳ Saving new order...";
    msg.classList.remove("hidden");
  }

  try {
    const updates = allItems.map((item, index) => {
      const id = item.dataset.id;
      return window.updateExperienceInFirestore(id, { order: index });
    });
    
    await Promise.all(updates);
    await window.renderExperiences();
    
    if (msg) {
      msg.textContent = "✅ Order updated successfully!";
      setTimeout(() => msg.classList.add("hidden"), 3000);
    }
  } catch(e) {
    console.error("Failed to save experience order:", e);
    if(msg) msg.textContent = "❌ Failed to save order";
  }
}

// ── EXPERIENCE DURATION HELPERS ──
function initDurationSelects() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  const startYearSelect = document.getElementById("f-exp-start-year");
  const endYearSelect = document.getElementById("f-exp-end-year");
  const startMonthSelect = document.getElementById("f-exp-start-month");
  const endMonthSelect = document.getElementById("f-exp-end-month");

  if (!startYearSelect || !endYearSelect || !startMonthSelect || !endMonthSelect) return;

  const monthOptions = months.map(m => `<option value="${m}">${m}</option>`).join("");
  startMonthSelect.innerHTML = monthOptions;
  endMonthSelect.innerHTML = monthOptions;

  let yearOptions = "";
  for (let y = currentYear + 1; y >= 2010; y--) {
    yearOptions += `<option value="${y}">${y}</option>`;
  }
  startYearSelect.innerHTML = yearOptions;
  endYearSelect.innerHTML = yearOptions;

  startMonthSelect.value = "Jan";
  startYearSelect.value = String(currentYear);
  endMonthSelect.value = "Jan";
  endYearSelect.value = String(currentYear);

  const presentCheckbox = document.getElementById("f-exp-present");
  const endDateRow = document.getElementById("expEndDateRow");

  if (presentCheckbox && endDateRow) {
    const toggleEndDateVisibility = () => {
      if (presentCheckbox.checked) {
        endDateRow.style.display = "none";
      } else {
        endDateRow.style.display = "flex";
      }
    };
    presentCheckbox.addEventListener("change", toggleEndDateVisibility);
    toggleEndDateVisibility();
  }
}

function getDurationString() {
  const startMonth = document.getElementById("f-exp-start-month").value;
  const startYear = document.getElementById("f-exp-start-year").value;
  const isPresent = document.getElementById("f-exp-present").checked;

  if (isPresent) {
    return `${startMonth} ${startYear} – Present`;
  } else {
    const endMonth = document.getElementById("f-exp-end-month").value;
    const endYear = document.getElementById("f-exp-end-year").value;
    return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
  }
}

function setDurationFields(durationStr) {
  if (!durationStr) return;
  const parts = durationStr.split(/[–-]/).map(p => p.trim());
  if (parts.length < 2) return;

  const startParts = parts[0].split(" ");
  if (startParts.length >= 2) {
    document.getElementById("f-exp-start-month").value = startParts[0];
    document.getElementById("f-exp-start-year").value = startParts[1];
  }

  const isPresent = parts[1].toLowerCase() === "present";
  document.getElementById("f-exp-present").checked = isPresent;

  const endDateRow = document.getElementById("expEndDateRow");
  if (isPresent) {
    if (endDateRow) endDateRow.style.display = "none";
  } else {
    if (endDateRow) endDateRow.style.display = "flex";
    const endParts = parts[1].split(" ");
    if (endParts.length >= 2) {
      document.getElementById("f-exp-end-month").value = endParts[0];
      document.getElementById("f-exp-end-year").value = endParts[1];
    }
  }
}

// ── ADMIN TABS ──
function initTabs() {
  const tabProjectsBtn = document.getElementById("tabProjectsBtn");
  const tabExperienceBtn = document.getElementById("tabExperienceBtn");
  const projectsSection = document.getElementById("projectsSection");
  const experienceSection = document.getElementById("experienceSection");

  if (tabProjectsBtn && tabExperienceBtn && projectsSection && experienceSection) {
    tabProjectsBtn.addEventListener("click", () => {
      tabProjectsBtn.classList.add("active");
      tabExperienceBtn.classList.remove("active");
      projectsSection.classList.remove("hidden");
      experienceSection.classList.add("hidden");
    });

    tabExperienceBtn.addEventListener("click", () => {
      tabExperienceBtn.classList.add("active");
      tabProjectsBtn.classList.remove("active");
      experienceSection.classList.remove("hidden");
      projectsSection.classList.add("hidden");
    });
  }
}

// ── EXPERIENCE CRUD ACTIONS ──
async function addExperience() {
  const company = document.getElementById("f-exp-company").value.trim();
  const duration = getDurationString();
  const roleInput = document.getElementById("f-exp-role").value.trim();

  if (!company || !duration) {
    alert("Company Name aur Duration required hai.");
    return;
  }

  const roles = roleInput ? roleInput.split(",").map(r => r.trim()).filter(Boolean) : [];
  const desc = document.getElementById("f-exp-desc").value.trim();

  await window.addExperienceToFirestore({
    company,
    duration,
    role: roleInput,
    roles,
    desc,
    createdAt: Date.now()
  });

  await window.renderExperiences();
  await window.renderAdminExperienceList();
  cancelExpEdit();

  const msg = document.getElementById("expFormMsg");
  if (msg) {
    msg.textContent = "✅ Experience added successfully!";
    msg.classList.remove("hidden");
    setTimeout(() => msg.classList.add("hidden"), 3000);
  }
}

async function editExperience(id) {
  try {
    console.log("✏️ Edit Experience called with id:", id);
    const experiences = await window.getExperiencesFromFirestore();
    const exp = experiences.find(item => String(item.id) === String(id));
    if (!exp) {
      console.error("Experience not found:", id);
      return;
    }

    document.getElementById("f-exp-edit-id").value = id;
    document.getElementById("f-exp-company").value = exp.company || "";
    setDurationFields(exp.duration || "");
    document.getElementById("f-exp-desc").value = exp.desc || "";

    let selectedRoles = [];
    if (exp.roles && exp.roles.length > 0) {
      selectedRoles = exp.roles;
    } else if (exp.role) {
      selectedRoles = exp.role.split(/[,,—&-]/).map(r => r.trim()).filter(Boolean);
    }
    
    document.getElementById("f-exp-role").value = selectedRoles.join(", ");
    if (window.renderExpRoleManager) {
      await window.renderExpRoleManager(selectedRoles);
    }

    document.getElementById("expFormTitle").textContent = "✏️ Edit Experience";
    document.getElementById("submitExpBtn").textContent = "💾 Save Changes";
    document.getElementById("cancelExpEditBtn").classList.remove("hidden");

    document.getElementById("expFormTitle").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Error in editExperience:", error);
  }
}

function cancelExpEdit() {
  document.getElementById("f-exp-edit-id").value = "";
  document.getElementById("expFormTitle").textContent = "Add New Experience";
  document.getElementById("submitExpBtn").textContent = "➕ Add Experience";
  document.getElementById("cancelExpEditBtn").classList.add("hidden");
  document.getElementById("f-exp-company").value = "";
  document.getElementById("f-exp-role").value = "";
  document.getElementById("f-exp-desc").value = "";
  
  const currentYear = new Date().getFullYear();
  document.getElementById("f-exp-start-month").value = "Jan";
  document.getElementById("f-exp-start-year").value = String(currentYear);
  document.getElementById("f-exp-present").checked = true;
  const endDateRow = document.getElementById("expEndDateRow");
  if (endDateRow) endDateRow.style.display = "none";
  document.getElementById("f-exp-end-month").value = "Jan";
  document.getElementById("f-exp-end-year").value = String(currentYear);

  if (window.renderExpRoleManager) {
    window.renderExpRoleManager([]);
  }
}

async function updateExperience(id) {
  const company = document.getElementById("f-exp-company").value.trim();
  const duration = getDurationString();
  const roleInput = document.getElementById("f-exp-role").value.trim();

  if (!company || !duration) {
    alert("Company Name aur Duration required hai.");
    return;
  }

  const roles = roleInput ? roleInput.split(",").map(r => r.trim()).filter(Boolean) : [];
  const desc = document.getElementById("f-exp-desc").value.trim();

  try {
    await window.updateExperienceInFirestore(String(id), { company, duration, role: roleInput, roles, desc });
    await window.renderExperiences();
    await window.renderAdminExperienceList();
    cancelExpEdit();

    const msg = document.getElementById("expFormMsg");
    if (msg) {
      msg.textContent = "✅ Experience updated successfully!";
      msg.classList.remove("hidden");
      setTimeout(() => msg.classList.add("hidden"), 3000);
    }
  } catch (error) {
    console.error("Update Experience error:", error);
    alert("Update failed: " + error.message);
  }
}

function saveExperience() {
  const editId = document.getElementById("f-exp-edit-id").value;
  if (editId) {
    updateExperience(editId);
  } else {
    addExperience();
  }
}

async function deleteExperience(id) {
  if (!confirm("Are you sure you want to delete this experience?")) return;
  await window.deleteExperienceFromFirestore(id);
  await window.renderExperiences();
  await window.renderAdminExperienceList();
}
async function toggleExpRole(role) {
  const input = document.getElementById("f-exp-role");
  if (!input) return;

  let current = input.value ? input.value.split(",").map(r => r.trim()).filter(Boolean) : [];

  if (current.includes(role)) {
    current = current.filter(r => r !== role);
  } else {
    current.push(role);
  }

  input.value = current.join(", ");
  if (window.renderExpRoleManager) {
    await window.renderExpRoleManager(current);
  }
}

async function addNewExpRole() {
  const input = document.getElementById("newExpRoleInput");
  const newRole = input.value.trim();
  if (!newRole) return;

  const currentSelected = document.getElementById("f-exp-role").value
    ? document.getElementById("f-exp-role").value.split(",").map(r => r.trim()).filter(Boolean)
    : [];

  if (!currentSelected.includes(newRole)) {
    currentSelected.push(newRole);
  }

  document.getElementById("f-exp-role").value = currentSelected.join(", ");
  input.value = "";

  if (window.renderExpRoleManager) {
    await window.renderExpRoleManager(currentSelected);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  // Admin button
  document.getElementById("adminBtn")?.addEventListener("click", toggleAdminPanel);

  // Login
  document.getElementById("loginBtn")?.addEventListener("click", loginAdmin);

  // Apple fetch
  document.getElementById("appleFetchBtn")?.addEventListener("click", () => {
    fetchAppDetails("apple");
  });

  // Cancel edit
  document.getElementById("cancelEditBtn")?.addEventListener("click", cancelEdit);

  const fileInput = document.getElementById("f-img-upload");
  if (fileInput) {
    fileInput.removeAttribute("onchange");
    fileInput.addEventListener("change", handleImgUpload);
  }

  // Initialize tabs
  initTabs();

  // Initialize duration dropdowns
  initDurationSelects();

  // Experience cancel edit
  document.getElementById("cancelExpEditBtn")?.addEventListener("click", cancelExpEdit);

  // Experience click handler for Edit / Delete delegation
  document.getElementById("adminExperienceList")?.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".exp-edit-btn");
    const deleteBtn = e.target.closest(".exp-delete-btn");

    if (editBtn) {
      editExperience(editBtn.dataset.id);
    }

    if (deleteBtn) {
      deleteExperience(deleteBtn.dataset.id);
    }
  });

  // Experience drag-and-drop
  const expAdminList = document.getElementById("adminExperienceList");
  if (expAdminList) {
    expAdminList.addEventListener('dragstart', handleExpDragStart);
    expAdminList.addEventListener('dragover', handleExpDragOver);
    expAdminList.addEventListener('dragleave', handleExpDragLeave);
    expAdminList.addEventListener('drop', handleExpDrop);
  }

  // Experience roles tag list click delegation
  document.getElementById("expRoleList")?.addEventListener("click", (e) => {
    const roleChip = e.target.closest(".exp-role-chip");
    if (roleChip) {
      const role = roleChip.dataset.role;
      if (role) toggleExpRole(role);
    }
  });
});

document.getElementById("addTagBtn")?.addEventListener("click", addNewTag);

document.getElementById("addExpRoleBtn")?.addEventListener("click", addNewExpRole);

document.getElementById("playFetchBtn")?.addEventListener("click", () => {
  fetchAppDetails("play");
});

document.getElementById("submitBtn")?.addEventListener("click", saveProject);

document.getElementById("submitExpBtn")?.addEventListener("click", saveExperience);

document.getElementById("closeAdminBtn")?.addEventListener("click", closeAdmin);

document.getElementById("tagList")?.addEventListener("click", (e) => {
  const tagChip = e.target.closest(".tag-chip");
  if (tagChip) {
    const tag = tagChip.dataset.tag;
    if (tag) toggleTag(tag);
  }
});

// Make functions global for inline event handlers and cross-module access
window.handleImgUpload = handleImgUpload;
window.setImgPreview = setImgPreview;
window.toggleTag = toggleTag;
window.addNewTag = addNewTag;
window.cancelEdit = cancelEdit;
window.saveProject = saveProject;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.fetchAppDetails = fetchAppDetails;
window.closeAdmin = closeAdmin;

window.handleExpDragStart = handleExpDragStart;
window.handleExpDragOver = handleExpDragOver;
window.handleExpDragLeave = handleExpDragLeave;
window.handleExpDrop = handleExpDrop;
window.saveNewExperienceOrder = saveNewExperienceOrder;
window.initTabs = initTabs;
window.initDurationSelects = initDurationSelects;
window.addExperience = addExperience;
window.editExperience = editExperience;
window.cancelExpEdit = cancelExpEdit;
window.updateExperience = updateExperience;
window.saveExperience = saveExperience;
window.deleteExperience = deleteExperience;
window.toggleExpRole = toggleExpRole;
window.addNewExpRole = addNewExpRole;
const DEFAULT_PROJECTS = [
  {
    id: 1,
    name: "Hi-Tech Kisan",
    img: "assets/hitechkisan.webp",
    desc: "The app focuses on making farming-related purchases more accessible by offering a structured and transparent way to explore products related to agriculture, dairy, and livestock care.",
    tags: ["Flutter", "Dart", "REST API"],
    link: "https://play.google.com/store/apps/details?id=com.hitechkisan.app&hl=en_IN"
  },
  {
    id: 2,
    name: "Dream Square",
    img: "assets/dream.png",
    desc: "Dream Square – Property Buy or Sale Made Simple.",
    tags: ["Flutter", "Dart", "REST API"],
    link: "https://play.google.com/store/apps/details?id=com.dream.square&hl=en_IN"
  },
  {
    id: 3,
    name: "Starlyte Mobile",
    img: "assets/starlyte.png",
    desc: "Mobile client for Starlyte platform — UI & integration work.",
    tags: ["Flutter", "Dart", "REST API"],
    link: "https://play.google.com/store/apps/details?id=com.starlyte.mobile&hl=en_IN"
  },
  {
    id: 4,
    name: "Secuber",
    img: "assets/secuber.png",
    desc: "Business & productivity app — enhancements & bug fixes.",
    tags: ["Kotlin", "Java", "Firebase", "MVVM"],
    link: "https://play.google.com/store/apps/details?id=com.mad.SpaciMax"
  },
  {
    id: 5,
    name: "Dev Tea",
    img: "assets/tea.png",
    desc: "Discover Premium Teas, Expert Brewing, and a Personalized Tea Experience.",
    tags: ["Java", "XML", "Webview"],
    link: "https://play.google.com/store/apps/details?id=com.comrade.devtea"
  },
  {
    id: 6,
    name: "Siccura Work",
    img: "assets/siccuraWork.png",
    desc: "A Secure, Zero-Knowledge Platform for Total Control of Business Data and Communications.",
    tags: ["Java", "Firebase", "AES Encryption"],
    link: "https://play.google.com/store/apps/details?id=yw.wemet.siccurapro"
  },
  {
    id: 7,
    name: "SUMS - Education Management",
    img: "assets/sums.png",
    desc: "Education / enterprise app. Implemented features and release updates.",
    tags: ["Kotlin", "Java", "Firebase", "MVVM"],
    link: "http://play.google.com/store/apps/details?id=com.sujaltech.sums&hl=en_IN"
  },
  {
    id: 8,
    name: "Siccura Lite",
    img: "assets/siccura.png",
    desc: "Security & tracking application — worked on core Android modules.",
    tags: ["Kotlin", "Java", "Firebase", "MVVM"],
    link: "https://play.google.com/store/apps/details?id=yw.wemet.siccuraLite&hl=en_IN"
  },
  {
    id: 9,
    name: "Siccura Office",
    img: "assets/siccuraoffice.png",
    desc: "Document viewer app — performance improvements and bug fixes.",
    tags: ["Kotlin", "Java", "Firebase", "MVVM"],
    link: "https://play.google.com/store/apps/details?id=yw.wemet.docviewer"
  },
  {
    id: 10,
    name: "Reward Dragon",
    img: "assets/reward.png",
    desc: "An employee engagement mobile platform powered by gamification.",
    tags: ["Kotlin", "Java", "XML"],
    link: "https://play.google.com/store/apps/details?id=com.rewarddragon.app"
  },
  {
    id: 11,
    name: "Useme - Social Saving App",
    img: "assets/useme.png",
    desc: "Wallet & recharge app — worked on payments (Paytm, Cashfree, Razorpay), AePS, and AAR libraries.",
    tags: ["Java", "Firebase", "Razorpay", "Cashfree", "AePS"],
    link: "https://play.google.com/store/apps/details?id=com.useme.wallet&hl=en_IN"
  },
  {
    id: 12,
    name: "Rajkamal Recharge",
    img: "assets/rajkamal.png",
    desc: "This app makes online recharges and bill payments.",
    tags: ["Java", "XML", "JSON", "Razorpay", "Cashfree"],
    link: "https://play.google.com/store/apps/details?id=com.app.rajkamal&hl=en_IN"
  }
];

const ADMIN_PASSWORD = "mohit@123";

function getProjects() {
  const saved = localStorage.getItem("projects");
  return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
}

function saveProjects(projects) {
  localStorage.setItem("projects", JSON.stringify(projects));
}

function renderProjects() {
  const grid = document.getElementById("projectGrid");
  const projects = getProjects();
  grid.innerHTML = projects.map(p => `
    <article class="project">
      <div class="project-img-wrap">
        <img src="${p.img}" alt="${p.name}" onerror="this.src='assets/profile.jpg'">
      </div>
      <div class="p-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="tech-stack">
          ${p.tags.map(t => `<span>${t}</span>`).join("")}
        </div>
        ${p.link ? `<a href="${p.link}" target="_blank" class="btn">Open on Play Store</a>` : ""}
      </div>
    </article>
  `).join("");
}

// ── ADMIN PANEL ──

function toggleAdminPanel() {
  document.getElementById("adminOverlay").classList.remove("hidden");
}

function closeAdmin() {
  document.getElementById("adminOverlay").classList.add("hidden");
  document.getElementById("adminAuth").classList.remove("hidden");
  document.getElementById("adminForm").classList.add("hidden");
  document.getElementById("adminPass").value = "";
  document.getElementById("authError").classList.add("hidden");
}

function checkAdmin() {
  const pass = document.getElementById("adminPass").value;
  if (pass === ADMIN_PASSWORD) {
    document.getElementById("adminAuth").classList.add("hidden");
    document.getElementById("adminForm").classList.remove("hidden");
    renderAdminList();
  } else {
    document.getElementById("authError").classList.remove("hidden");
  }
}

function renderAdminList() {
  const projects = getProjects();
  const list = document.getElementById("adminProjectList");
  list.innerHTML = projects.map(p => `
    <div class="admin-project-item">
      <span>${p.name}</span>
      <button onclick="deleteProject(${p.id})">🗑 Remove</button>
    </div>
  `).join("");
}

function deleteProject(id) {
  const projects = getProjects().filter(p => p.id !== id);
  saveProjects(projects);
  renderProjects();
  renderAdminList();
}

function addProject() {
  const name = document.getElementById("f-name").value.trim();
  const img  = document.getElementById("f-img").value.trim();
  const desc = document.getElementById("f-desc").value.trim();
  const tags = document.getElementById("f-tags").value.trim();
  const link = document.getElementById("f-link").value.trim();

  if (!name || !img || !desc) {
    alert("Name, Image path aur Description required hai.");
    return;
  }

  const projects = getProjects();
  const newProject = {
    id: Date.now(),
    name,
    img,
    desc,
    tags: tags ? tags.split(",").map(t => t.trim()) : [],
    link
  };

  projects.push(newProject);
  saveProjects(projects);
  renderProjects();
  renderAdminList();

  // clear form
  ["f-name","f-img","f-desc","f-tags","f-link"].forEach(id => document.getElementById(id).value = "");
  const msg = document.getElementById("formMsg");
  msg.classList.remove("hidden");
  setTimeout(() => msg.classList.add("hidden"), 2500);
}

// close modal on overlay click
document.getElementById("adminOverlay").addEventListener("click", function(e) {
  if (e.target === this) closeAdmin();
});

// enter key on password field
document.getElementById("adminPass").addEventListener("keydown", function(e) {
  if (e.key === "Enter") checkAdmin();
});

renderProjects();

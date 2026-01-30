// Optional small JS — keeps things light
console.log('Mohit Singh portfolio loaded');

// Simple smooth scrolling for internal links (if later added)
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    document.querySelector(a.getAttribute('href')).scrollIntoView({behavior:'smooth'});
  });
});



const appData = {
  siccura: {
    title: "Reward Dragon",
    desc: "Reward Dragon is a Gamification powered Employee Engagement &amp; Wellbeing SAAS Mobile Platform that makes the achievement of Business &amp; Wellbeing Goals an exciting experience and enables Everyday Employee Engagement. Reward Dragon can enable organizations with returns up to 750X through, - Higher Business Outcomes - Improved Employee Experience &amp; Engagement By implementing a Gamification based Effort &amp; Reward Culture, that enables Everyday Employee Engagement.",
    tech: ["Kotlin", "Firebase", "REST API", "MVVM"],
    images: [
      "assets/siccura1.png",
      "assets/siccura2.png"
    ],
    download: "https://drive.google.com/your-apk-link"
  },

  docviewer: {
    title: "Doc Viewer",
    desc: "PDF, Word & document viewer Android app.",
    tech: ["Java", "Android SDK", "PDF Engine"],
    images: [
      "assets/doc1.png",
      "assets/doc2.png"
    ],
    download: "https://drive.google.com/your-apk-link"
  }
};

function openModal(key) {
  const app = appData[key];

  document.getElementById("modalTitle").innerText = app.title;
  document.getElementById("modalDesc").innerText = app.desc;

  const techDiv = document.getElementById("modalTech");
  techDiv.innerHTML = "";
  app.tech.forEach(t =>
    techDiv.innerHTML += `<span>${t}</span>`
  );

  const imgDiv = document.getElementById("modalImages");
  imgDiv.innerHTML = "";
  app.images.forEach(img =>
    imgDiv.innerHTML += `<img src="${img}">`
  );

  document.getElementById("modalDownload").href = app.download;

  document.getElementById("appModal").style.display = "block";
}

function closeModal() {
  document.getElementById("appModal").style.display = "none";
}

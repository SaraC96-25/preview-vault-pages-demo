const DB_NAME = "preview-vault-db";
const STORE_NAME = "projects";
const DEMO_SLUG = "sara-preview-example";
const DEMO_PASSWORD = "cliente2026";
const DEMO_PASSWORD_HASH = "80a750bc189741e34692b43d88c5d97c09d9a7e65a9b1cbc828820b6c111c61f";

const SAMPLE_PROJECT_HTML = String.raw`
<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sara Cicchinelli Preview Example</title>
    <style>
      :root {
        --ink: #28323c;
        --paper: #f7fbfe;
        --brand: #5aa9e6;
        --deep: #22313f;
        --soft: #dceffd;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top right, rgba(90,169,230,.18), transparent 28%),
          linear-gradient(180deg, #ffffff 0%, var(--paper) 100%);
      }
      .hero {
        display: grid;
        grid-template-columns: 1.1fr .9fr;
        gap: 32px;
        min-height: 100vh;
        padding: 48px;
        align-items: center;
      }
      .badge {
        display: inline-block;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(16,43,49,.08);
        color: var(--deep);
        margin-bottom: 20px;
        font-size: 13px;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      h1 {
        margin: 0 0 18px;
        font-size: clamp(42px, 7vw, 84px);
        line-height: .95;
      }
      p {
        font-size: 18px;
        line-height: 1.6;
        max-width: 620px;
      }
      .cta-row {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
        margin-top: 28px;
      }
      .cta {
        text-decoration: none;
        padding: 14px 18px;
        border-radius: 999px;
        font-weight: 700;
      }
      .cta.primary {
        background: var(--deep);
        color: #fff;
      }
      .cta.secondary {
        color: var(--ink);
        background: rgba(90,169,230,.14);
      }
      .stage {
        background: linear-gradient(135deg, rgba(34,49,63,.96), rgba(62,92,121,.92));
        color: #fff;
        border-radius: 32px;
        padding: 28px;
        box-shadow: 0 22px 60px rgba(34,49,63,.28);
      }
      .screen {
        background: #fff;
        border-radius: 20px;
        min-height: 420px;
        padding: 20px;
        color: var(--ink);
      }
      .modules {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
        margin-top: 18px;
      }
      .module {
        background: var(--soft);
        border-radius: 16px;
        padding: 16px;
      }
      @media (max-width: 780px) {
        .hero {
          grid-template-columns: 1fr;
          padding: 24px;
          min-height: auto;
        }
        .modules {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <section class="hero">
      <div>
        <span class="badge">Anteprima cliente</span>
        <h1>Un ambiente chiaro per presentare il progetto con precisione.</h1>
        <p>
          Questo esempio mostra come condividere una pagina in modo ordinato,
          lasciando al cliente la possibilita di verificare il comportamento
          responsive tra desktop, tablet e mobile.
        </p>
        <div class="cta-row">
          <a class="cta primary" href="#">Raccogli feedback</a>
          <a class="cta secondary" href="#">Consulta note</a>
        </div>
      </div>
      <div class="stage">
        <strong>Vista del layout</strong>
        <div class="screen">
          <h2>Elementi principali</h2>
          <div class="modules">
            <div class="module">Header e messaggio chiave</div>
            <div class="module">Contenuti e prove di fiducia</div>
            <div class="module">Controllo della resa responsive</div>
          </div>
        </div>
      </div>
    </section>
  </body>
</html>
`;

const dom = {};
let objectUrlRegistry = [];

document.addEventListener("DOMContentLoaded", async () => {
  bindDom();
  bindEvents();
  await ensureDemoProject();
  await renderProjects();
  syncRouteWithUi();
});

function bindDom() {
  const ids = [
    "active-mode-label",
    "route-hint",
    "project-form",
    "project-name",
    "client-name",
    "project-slug",
    "project-password",
    "project-zip",
    "project-note",
    "project-badge",
    "share-link",
    "share-password",
    "share-message",
    "share-feedback",
    "projects-list",
    "viewer-slug",
    "viewer-password",
    "viewer-feedback",
    "open-preview",
    "open-demo-preview",
    "load-demo",
    "preview-frame",
    "viewport-frame",
    "current-project-name",
    "current-project-meta",
  ];

  ids.forEach((id) => {
    dom[id] = document.getElementById(id);
    dom[toCamelCase(id)] = dom[id];
  });

  dom.tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  dom.panels = Array.from(document.querySelectorAll(".panel"));
  dom.viewportButtons = Array.from(document.querySelectorAll(".viewport-button"));
  dom.copyButtons = Array.from(document.querySelectorAll("[data-copy-target]"));
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function bindEvents() {
  dom.tabButtons.forEach((button) => {
    button.addEventListener("click", () => activatePanel(button.dataset.panelTarget));
  });

  dom.viewportButtons.forEach((button) => {
    button.addEventListener("click", () => setViewport(button.dataset.viewport));
  });

  dom.projectForm.addEventListener("submit", handleProjectSubmit);
  dom.openPreview.addEventListener("click", handleViewerOpen);
  dom.openDemoPreview.addEventListener("click", async () => {
    dom.viewerSlug.value = DEMO_SLUG;
    dom.viewerPassword.value = DEMO_PASSWORD;
    await handleViewerOpen();
  });
  dom.loadDemo.addEventListener("click", async () => {
    const demoProject = await getProject(DEMO_SLUG);
    fillSharePanel(demoProject, DEMO_PASSWORD);
    location.hash = `#/project/${DEMO_SLUG}`;
    activatePanel("viewer-panel");
    dom.viewerSlug.value = DEMO_SLUG;
    dom.viewerPassword.value = DEMO_PASSWORD;
    await openProjectInViewer(demoProject);
  });

  dom.copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target?.value) {
        return;
      }

      await navigator.clipboard.writeText(target.value);
      dom.shareFeedback.textContent = "Contenuto copiato negli appunti.";
    });
  });

  window.addEventListener("hashchange", syncRouteWithUi);
}

function activatePanel(panelId) {
  dom.tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.panelTarget === panelId);
  });

  dom.panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === panelId);
  });

  const labels = {
    "admin-panel": {
      mode: "Admin",
      hint: "Crea una preview e genera un link condivisibile.",
    },
    "viewer-panel": {
      mode: "Viewer cliente",
      hint: "Inserisci slug e password per entrare nella preview.",
    },
    "notes-panel": {
      mode: "Note",
      hint: "Trovi qui limiti tecnici e direzione consigliata per la versione evoluta.",
    },
  };

  dom["active-mode-label"].textContent = labels[panelId].mode;
  dom["route-hint"].textContent = labels[panelId].hint;
}

function setViewport(viewport) {
  dom.viewportButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewport === viewport);
  });

  dom.viewportFrame.classList.remove("desktop", "tablet", "mobile");
  dom.viewportFrame.classList.add(viewport);
}

async function handleProjectSubmit(event) {
  event.preventDefault();

  const projectName = dom["project-name"].value.trim();
  const clientName = dom["client-name"].value.trim();
  const projectSlug = slugify(dom["project-slug"].value.trim());
  const projectPassword = dom["project-password"].value;
  const projectNote = dom["project-note"].value.trim();
  const zipFile = dom["project-zip"].files[0];

  if (!projectName || !clientName || !projectSlug || !projectPassword) {
    dom.shareFeedback.textContent = "Compila i campi richiesti prima di proseguire.";
    return;
  }

  let payload;
  if (zipFile) {
    try {
      payload = await buildZipPayload(zipFile);
    } catch (error) {
      dom.shareFeedback.textContent = `ZIP non valido: ${error.message}`;
      return;
    }
  } else {
    payload = {
      kind: "html",
      rootFile: "index.html",
      html: SAMPLE_PROJECT_HTML,
      files: [],
    };
  }

  const project = {
    slug: projectSlug,
    name: projectName,
    clientName,
    note: projectNote,
    passwordHash: await sha256(projectPassword),
    createdAt: new Date().toISOString(),
    payload,
  };

  await saveProject(project);
  await renderProjects();
  fillSharePanel(project, projectPassword);
  dom.shareFeedback.textContent =
    zipFile
      ? "Preview salvata nel browser. Il viewer puo aprirla su questo dispositivo."
      : "Esempio salvato usando il layout predefinito.";
  dom.projectForm.reset();
}

async function handleViewerOpen() {
  const slug = slugify(dom.viewerSlug.value.trim());
  const password = dom.viewerPassword.value;

  if (!slug || !password) {
    dom.viewerFeedback.textContent = "Inserisci sia slug sia password.";
    return;
  }

  const project = await loadProjectBySlug(slug);
  if (!project) {
    dom.viewerFeedback.textContent =
      "Preview non trovata in questo browser. Su GitHub Pages le preview caricate restano locali al browser che le ha create.";
    return;
  }

  const incomingHash = await sha256(password);
  if (incomingHash !== project.passwordHash) {
    dom.viewerFeedback.textContent = "Password non corretta.";
    return;
  }

  location.hash = `#/project/${slug}`;
  await openProjectInViewer(project);
  dom.viewerFeedback.textContent = `Accesso riuscito per ${project.clientName}.`;
}

async function openProjectInViewer(project) {
  activatePanel("viewer-panel");
  const { html } = await buildPreviewHtml(project.payload);
  dom.previewFrame.srcdoc = html;
  dom["current-project-name"].textContent = project.name;
  dom["current-project-meta"].textContent = `${project.clientName} · ${project.slug}`;
}

async function renderProjects() {
  const projects = await getAllProjects();
  dom.projectsList.innerHTML = "";

  if (projects.length === 0) {
    dom.projectsList.innerHTML = "<p class='helper-text'>Nessuna preview locale salvata.</p>";
    return;
  }

  projects
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((project) => {
      const wrapper = document.createElement("article");
      wrapper.className = "project-item";
      wrapper.innerHTML = `
        <div class="project-item-head">
          <div>
            <h4>${escapeHtml(project.name)}</h4>
            <p class="helper-text">${escapeHtml(project.clientName)} · ${escapeHtml(project.slug)}</p>
          </div>
          <span class="pill neutral">${project.payload.kind === "zip" ? "ZIP" : "Esempio"}</span>
        </div>
        <p class="helper-text">${escapeHtml(project.note || "Nessuna nota inserita.")}</p>
        <div class="project-actions">
          <button class="secondary-button" type="button" data-open-slug="${escapeHtml(project.slug)}">Apri</button>
          <button class="secondary-button" type="button" data-share-slug="${escapeHtml(project.slug)}">Prepara link</button>
        </div>
      `;

      wrapper.querySelector("[data-open-slug]").addEventListener("click", async () => {
        dom.viewerSlug.value = project.slug;
        dom.viewerPassword.value = project.slug === DEMO_SLUG ? DEMO_PASSWORD : "";
        await openProjectInViewer(project);
        location.hash = `#/project/${project.slug}`;
      });

      wrapper.querySelector("[data-share-slug]").addEventListener("click", async () => {
        fillSharePanel(project, project.slug === DEMO_SLUG ? DEMO_PASSWORD : "");
        activatePanel("admin-panel");
      });

      dom.projectsList.appendChild(wrapper);
    });
}

function fillSharePanel(project, password) {
  const link = buildShareLink(project.slug);
  dom.projectBadge.textContent = project.slug;
  dom.projectBadge.classList.remove("neutral");
  dom.shareLink.value = link;
  dom.sharePassword.value = password;
  dom.shareMessage.value = [
    `Ciao ${project.clientName},`,
    "",
    project.note || "Ti condivido il link dell'anteprima del progetto.",
    "",
    `Link: ${link}`,
    password ? `Password: ${password}` : "Password: inserisci qui la password concordata",
    "",
    "Nel viewer puoi passare da desktop a tablet e mobile per controllare il responsive.",
  ].join("\n");
}

function buildShareLink(slug) {
  return `${location.origin}${location.pathname}#/project/${slug}`;
}

function syncRouteWithUi() {
  const route = parseHash();
  if (!route) {
    activatePanel("admin-panel");
    return;
  }

  if (route.type === "project") {
    activatePanel("viewer-panel");
    dom.viewerSlug.value = route.slug;
    dom.viewerFeedback.textContent =
      "L'esempio pubblico e sempre disponibile. Le preview caricate manualmente funzionano invece solo nello stesso browser che le ha salvate.";

    loadProjectBySlug(route.slug).then((project) => {
      if (!project) {
        return;
      }

      dom.currentProjectName.textContent = project.name;
      dom.currentProjectMeta.textContent = `${project.clientName} · ${project.slug}`;
    });
  }
}

function parseHash() {
  const hash = location.hash.replace(/^#\/?/, "");
  if (!hash) {
    return null;
  }

  const segments = hash.split("/");
  if (segments[0] === "project" && segments[1]) {
    return { type: "project", slug: segments[1] };
  }

  return null;
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function buildZipPayload(file) {
  const zipLibrary = await getZipLibrary();

  const zip = await zipLibrary.loadAsync(file);
  const files = [];

  await Promise.all(
    Object.values(zip.files)
      .filter((entry) => !entry.dir)
      .map(async (entry) => {
        const path = normalizePath(entry.name);
        const ext = extensionOf(path);
        const isTextFile = isTextExtension(ext);
        const content = isTextFile
          ? await entry.async("string")
          : await entry.async("base64");

        files.push({
          path,
          ext,
          mime: mimeFromExtension(ext),
          encoding: isTextFile ? "text" : "base64",
          content,
        });
      }),
  );

  const rootFile =
    files.find((item) => /(^|\/)index\.html$/i.test(item.path))?.path ||
    files.find((item) => item.ext === "html")?.path;

  if (!rootFile) {
    throw new Error("Nello ZIP non ho trovato un file index.html.");
  }

  return {
    kind: "zip",
    rootFile,
    files,
  };
}

async function getZipLibrary() {
  if (window.JSZip) {
    return window.JSZip;
  }

  await wait(150);

  if (window.JSZip) {
    return window.JSZip;
  }

  throw new Error("Il modulo ZIP non e stato caricato correttamente. Ricarica la pagina e riprova.");
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function buildPreviewHtml(payload) {
  clearObjectUrls();

  if (payload.kind === "html") {
    return { html: payload.html };
  }

  const fileMap = new Map(payload.files.map((file) => [normalizePath(file.path), file]));
  const objectUrls = new Map();

  for (const file of payload.files) {
    const normalizedPath = normalizePath(file.path);
    if (file.ext === "html") {
      continue;
    }

    let body = file.content;
    if (file.encoding === "text" && file.ext === "css") {
      body = rewriteCssUrls(file.content, normalizedPath, fileMap);
    }

    const blob = file.encoding === "text"
      ? new Blob([body], { type: file.mime })
      : new Blob([base64ToUint8Array(file.content)], { type: file.mime });

    const blobUrl = URL.createObjectURL(blob);
    objectUrlRegistry.push(blobUrl);
    objectUrls.set(normalizedPath, blobUrl);
  }

  const root = fileMap.get(normalizePath(payload.rootFile));
  if (!root) {
    throw new Error("File root mancante nella preview.");
  }

  const html = rewriteHtmlAssetUrls(root.content, root.path, objectUrls, fileMap);
  return { html };
}

function rewriteHtmlAssetUrls(html, currentPath, objectUrls, fileMap) {
  let output = html;
  const currentDir = dirname(currentPath);

  output = output.replace(/(src|href)=["']([^"']+)["']/gi, (full, attr, rawUrl) => {
    if (isExternalUrl(rawUrl) || rawUrl.startsWith("#")) {
      return full;
    }

    const resolved = resolveRelativePath(currentDir, rawUrl);
    const assetUrl = objectUrls.get(resolved);
    if (!assetUrl) {
      return full;
    }

    return `${attr}="${assetUrl}"`;
  });

  output = output.replace(/url\((["']?)([^)"']+)\1\)/gi, (full, quote, rawUrl) => {
    if (isExternalUrl(rawUrl) || rawUrl.startsWith("data:")) {
      return full;
    }

    const resolved = resolveRelativePath(currentDir, rawUrl);
    const assetUrl = objectUrls.get(resolved);
    return assetUrl ? `url("${assetUrl}")` : full;
  });

  if (!/<meta[^>]+name=["']viewport["']/i.test(output)) {
    output = output.replace(
      /<head>/i,
      '<head><meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    );
  }

  return output;
}

function rewriteCssUrls(cssText, currentPath, fileMap) {
  const currentDir = dirname(currentPath);
  return cssText.replace(/url\((["']?)([^)"']+)\1\)/gi, (full, quote, rawUrl) => {
    if (isExternalUrl(rawUrl) || rawUrl.startsWith("data:")) {
      return full;
    }

    const resolved = resolveRelativePath(currentDir, rawUrl);
    const file = fileMap.get(resolved);
    if (!file) {
      return full;
    }

    if (file.encoding === "base64") {
      return `url("data:${file.mime};base64,${file.content}")`;
    }

    const data = btoa(unescape(encodeURIComponent(file.content)));
    return `url("data:${file.mime};base64,${data}")`;
  });
}

async function ensureDemoProject() {
  const existing = await getProject(DEMO_SLUG);
  if (existing) {
    return;
  }

  await saveProject({
    slug: DEMO_SLUG,
    name: "Template anteprima cliente",
    clientName: "Progetto di esempio",
    note: "Apri questo esempio per verificare subito il viewer responsive e il flusso di accesso.",
    passwordHash: DEMO_PASSWORD_HASH,
    createdAt: new Date().toISOString(),
    payload: {
      kind: "html",
      rootFile: "index.html",
      html: SAMPLE_PROJECT_HTML,
      files: [],
    },
  });
}

async function loadProjectBySlug(slug) {
  if (slug === DEMO_SLUG) {
    return getBuiltInDemoProject();
  }

  return getProject(slug);
}

function getBuiltInDemoProject() {
  return {
    slug: DEMO_SLUG,
    name: "Template anteprima cliente",
    clientName: "Progetto di esempio",
    note: "Apri questo esempio per verificare subito il viewer responsive e il flusso di accesso.",
    payload: {
      kind: "html",
      rootFile: "index.html",
      html: SAMPLE_PROJECT_HTML,
      files: [],
    },
    passwordHash: DEMO_PASSWORD_HASH,
    createdAt: null,
  };
}

function clearObjectUrls() {
  objectUrlRegistry.forEach((url) => URL.revokeObjectURL(url));
  objectUrlRegistry = [];
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "slug" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, callback) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const result = callback(store);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
}

async function saveProject(project) {
  return withStore("readwrite", (store) => store.put(project));
}

async function getProject(slug) {
  return new Promise(async (resolve, reject) => {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(slug);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function getAllProjects() {
  return new Promise(async (resolve, reject) => {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function extensionOf(path) {
  const match = path.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : "";
}

function isTextExtension(ext) {
  return ["html", "htm", "css", "js", "json", "svg", "txt", "xml"].includes(ext);
}

function mimeFromExtension(ext) {
  const map = {
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    js: "text/javascript",
    json: "application/json",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    ico: "image/x-icon",
    txt: "text/plain",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
  };

  return map[ext] || "application/octet-stream";
}

function normalizePath(path) {
  return path.replace(/^\.?\//, "").replace(/\\/g, "/");
}

function dirname(path) {
  const normalized = normalizePath(path);
  const index = normalized.lastIndexOf("/");
  return index === -1 ? "" : normalized.slice(0, index);
}

function resolveRelativePath(baseDir, relativePath) {
  const raw = normalizePath(relativePath.split("?")[0].split("#")[0]);
  const parts = `${baseDir}/${raw}`.split("/");
  const resolved = [];

  for (const part of parts) {
    if (!part || part === ".") {
      continue;
    }
    if (part === "..") {
      resolved.pop();
      continue;
    }
    resolved.push(part);
  }

  return resolved.join("/");
}

function isExternalUrl(url) {
  return /^(https?:|mailto:|tel:|data:|blob:|\/\/)/i.test(url);
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });
}

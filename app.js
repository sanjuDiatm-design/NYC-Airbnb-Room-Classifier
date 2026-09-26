/* ============================================================
   NYC AIRBNB ROOM TYPE PREDICTOR — app.js
   Handles: neighbourhood data, form logic, API call, result rendering
   ============================================================ */

/* Auto-detect: use production API when deployed, localhost when running locally */
const IS_LOCAL  = location.hostname === "localhost" || location.hostname === "127.0.0.1";
const API_BASE  = IS_LOCAL
  ? "http://127.0.0.1:8000"
  : "https://YOUR-RENDER-APP-NAME.onrender.com";   // ← replace after deploying API
const API_URL   = `${API_BASE}/predict`;
console.log("[NYC Predictor] app.js loaded. API:", API_URL);

/* ── Room type config (icon + bar colour) ── */
const ROOM_CONFIG = {
  "Entire home/apt": { icon: "🏠", color: "#fccc0a", label: "Entire Home / Apt" },
  "Private room":    { icon: "🚪", color: "#3b82f6", label: "Private Room" },
  "Shared room":     { icon: "🛏️", color: "#8b5cf6", label: "Shared Room" },
};

/* Exact order sklearn returns probabilities (model.classes_) */
const CLASS_ORDER = ["Entire home/apt", "Private room", "Shared room"];

/* ── NYC neighbourhood data ── */
const NEIGHBOURHOODS = {
  Manhattan: [
    { name: "Harlem",             lat: 40.8116, lon: -73.9465 },
    { name: "East Harlem",        lat: 40.7957, lon: -73.9389 },
    { name: "Upper West Side",    lat: 40.7870, lon: -73.9754 },
    { name: "Upper East Side",    lat: 40.7736, lon: -73.9566 },
    { name: "Morningside Heights",lat: 40.8100, lon: -73.9626 },
    { name: "Washington Heights", lat: 40.8448, lon: -73.9392 },
    { name: "Inwood",             lat: 40.8676, lon: -73.9218 },
    { name: "Midtown",            lat: 40.7549, lon: -73.9840 },
    { name: "Hell's Kitchen",     lat: 40.7638, lon: -73.9918 },
    { name: "Chelsea",            lat: 40.7465, lon: -74.0014 },
    { name: "Greenwich Village",  lat: 40.7336, lon: -74.0027 },
    { name: "East Village",       lat: 40.7265, lon: -73.9815 },
    { name: "Lower East Side",    lat: 40.7157, lon: -73.9863 },
    { name: "SoHo",               lat: 40.7233, lon: -74.0020 },
    { name: "Tribeca",            lat: 40.7163, lon: -74.0086 },
    { name: "Financial District", lat: 40.7074, lon: -74.0113 },
    { name: "Nolita",             lat: 40.7228, lon: -73.9946 },
    { name: "Chinatown",          lat: 40.7158, lon: -73.9970 },
    { name: "Murray Hill",        lat: 40.7479, lon: -73.9756 },
    { name: "Kips Bay",           lat: 40.7421, lon: -73.9782 },
    { name: "Gramercy",           lat: 40.7381, lon: -73.9830 },
    { name: "Flatiron District",  lat: 40.7401, lon: -73.9903 },
    { name: "NoMad",              lat: 40.7448, lon: -73.9872 },
    { name: "Two Bridges",        lat: 40.7115, lon: -73.9947 },
  ],
  Brooklyn: [
    { name: "Williamsburg",       lat: 40.7081, lon: -73.9571 },
    { name: "Park Slope",         lat: 40.6681, lon: -73.9803 },
    { name: "Brooklyn Heights",   lat: 40.6962, lon: -73.9937 },
    { name: "DUMBO",              lat: 40.7033, lon: -73.9893 },
    { name: "Bushwick",           lat: 40.6944, lon: -73.9213 },
    { name: "Flatbush",           lat: 40.6501, lon: -73.9496 },
    { name: "Crown Heights",      lat: 40.6694, lon: -73.9422 },
    { name: "Bedford-Stuyvesant", lat: 40.6872, lon: -73.9418 },
    { name: "Greenpoint",         lat: 40.7242, lon: -73.9542 },
    { name: "Sunset Park",        lat: 40.6459, lon: -74.0049 },
    { name: "Bay Ridge",          lat: 40.6349, lon: -74.0241 },
    { name: "Cobble Hill",        lat: 40.6863, lon: -73.9954 },
    { name: "Carroll Gardens",    lat: 40.6798, lon: -73.9997 },
    { name: "Red Hook",           lat: 40.6745, lon: -74.0107 },
    { name: "Fort Greene",        lat: 40.6897, lon: -73.9741 },
    { name: "Clinton Hill",       lat: 40.6882, lon: -73.9598 },
    { name: "Prospect Heights",   lat: 40.6769, lon: -73.9673 },
    { name: "East Flatbush",      lat: 40.6413, lon: -73.9361 },
    { name: "Canarsie",           lat: 40.6363, lon: -73.9300 },
    { name: "Sheepshead Bay",     lat: 40.5921, lon: -73.9438 },
    { name: "Borough Park",       lat: 40.6258, lon: -73.9978 },
    { name: "Bensonhurst",        lat: 40.6020, lon: -74.0076 },
    { name: "Coney Island",       lat: 40.5749, lon: -73.9857 },
    { name: "Gravesend",          lat: 40.5969, lon: -73.9815 },
    { name: "Marine Park",        lat: 40.6022, lon: -73.9200 },
    { name: "East New York",      lat: 40.6660, lon: -73.8888 },
    { name: "Brownsville",        lat: 40.6628, lon: -73.9133 },
    { name: "Kensington",         lat: 40.6464, lon: -73.9787 },
    { name: "Windsor Terrace",    lat: 40.6576, lon: -73.9848 },
  ],
  Queens: [
    { name: "Astoria",            lat: 40.7721, lon: -73.9301 },
    { name: "Flushing",           lat: 40.7675, lon: -73.8330 },
    { name: "Long Island City",   lat: 40.7447, lon: -73.9484 },
    { name: "Jamaica",            lat: 40.6914, lon: -73.8058 },
    { name: "Forest Hills",       lat: 40.7196, lon: -73.8449 },
    { name: "Jackson Heights",    lat: 40.7557, lon: -73.8831 },
    { name: "Ridgewood",          lat: 40.7063, lon: -73.9038 },
    { name: "Sunnyside",          lat: 40.7440, lon: -73.9194 },
    { name: "Woodside",           lat: 40.7451, lon: -73.9038 },
    { name: "Elmhurst",           lat: 40.7368, lon: -73.8791 },
    { name: "Rego Park",          lat: 40.7258, lon: -73.8630 },
    { name: "Kew Gardens",        lat: 40.7144, lon: -73.8310 },
    { name: "Rockaway Beach",     lat: 40.5851, lon: -73.8166 },
    { name: "Howard Beach",       lat: 40.6567, lon: -73.8508 },
    { name: "South Ozone Park",   lat: 40.6748, lon: -73.8212 },
    { name: "Bayside",            lat: 40.7632, lon: -73.7789 },
    { name: "Corona",             lat: 40.7474, lon: -73.8635 },
    { name: "Maspeth",            lat: 40.7256, lon: -73.9096 },
    { name: "Middle Village",     lat: 40.7193, lon: -73.8826 },
    { name: "Ozone Park",         lat: 40.6831, lon: -73.8557 },
    { name: "Richmond Hill",      lat: 40.6988, lon: -73.8357 },
    { name: "Springfield Gardens",lat: 40.6655, lon: -73.7648 },
  ],
  Bronx: [
    { name: "Fordham",            lat: 40.8603, lon: -73.8978 },
    { name: "Riverdale",          lat: 40.8987, lon: -73.9119 },
    { name: "Mott Haven",         lat: 40.8085, lon: -73.9244 },
    { name: "Concourse",          lat: 40.8327, lon: -73.9228 },
    { name: "Pelham Bay",         lat: 40.8553, lon: -73.8090 },
    { name: "Throgs Neck",        lat: 40.8310, lon: -73.8174 },
    { name: "Co-op City",         lat: 40.8748, lon: -73.8292 },
    { name: "Soundview",          lat: 40.8233, lon: -73.8735 },
    { name: "Kingsbridge",        lat: 40.8819, lon: -73.9044 },
    { name: "Highbridge",         lat: 40.8408, lon: -73.9267 },
    { name: "Morris Heights",     lat: 40.8513, lon: -73.9188 },
    { name: "University Heights", lat: 40.8603, lon: -73.9137 },
    { name: "East Tremont",       lat: 40.8464, lon: -73.8903 },
    { name: "West Farms",         lat: 40.8382, lon: -73.8870 },
    { name: "Baychester",         lat: 40.8866, lon: -73.8312 },
    { name: "City Island",        lat: 40.8484, lon: -73.7871 },
    { name: "Country Club",       lat: 40.8533, lon: -73.8232 },
    { name: "Spuyten Duyvil",     lat: 40.8776, lon: -73.9287 },
  ],
  "Staten Island": [
    { name: "St. George",         lat: 40.6443, lon: -74.0740 },
    { name: "Stapleton",          lat: 40.6264, lon: -74.0758 },
    { name: "Tottenville",        lat: 40.5113, lon: -74.2513 },
    { name: "Great Kills",        lat: 40.5503, lon: -74.1520 },
    { name: "New Dorp",           lat: 40.5728, lon: -74.1164 },
    { name: "Willowbrook",        lat: 40.5959, lon: -74.1519 },
    { name: "Richmond Town",      lat: 40.5709, lon: -74.1442 },
    { name: "Castleton Corners",  lat: 40.6174, lon: -74.1187 },
    { name: "Eltingville",        lat: 40.5438, lon: -74.1614 },
    { name: "Annadale",           lat: 40.5254, lon: -74.1893 },
    { name: "Huguenot",           lat: 40.5186, lon: -74.2082 },
    { name: "Port Richmond",      lat: 40.6363, lon: -74.1387 },
    { name: "Mariners Harbor",    lat: 40.6379, lon: -74.1521 },
    { name: "Grasmere",           lat: 40.6052, lon: -74.0885 },
    { name: "Rosebank",           lat: 40.6138, lon: -74.0649 },
    { name: "New Brighton",       lat: 40.6367, lon: -74.0980 },
    { name: "Silver Lake",        lat: 40.6299, lon: -74.1022 },
  ],
};

/* ── DOM refs ── */
const form          = document.getElementById("predictForm");
const boroughSel    = document.getElementById("neighbourhood_group");
const neighSel      = document.getElementById("neighbourhood");
const latInput      = document.getElementById("latitude");
const lonInput      = document.getElementById("longitude");
const availSlider   = document.getElementById("availability_365");
const availVal      = document.getElementById("availVal");
const predictBtn    = document.getElementById("predictBtn");
const fieldCount    = document.getElementById("fieldCount");
const resultIdle    = document.getElementById("resultIdle");
const resultCard    = document.getElementById("resultCard");
const errorCard     = document.getElementById("errorCard");
const resultIcon    = document.getElementById("resultIcon");
const resultType    = document.getElementById("resultType");
const confBadge     = document.getElementById("confBadge");
const probBars      = document.getElementById("probBars");
const echoGrid      = document.getElementById("echoGrid");
const retryBtn      = document.getElementById("retryBtn");
const errorRetryBtn = document.getElementById("errorRetryBtn");
const errorMsg      = document.getElementById("errorMsg");

/* ============================================================
   CANVAS PARTICLE SYSTEM
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  const ctx    = canvas.getContext("2d");
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x   = Math.random() * W;
      this.y   = Math.random() * H;
      this.r   = 1 + Math.random() * 1.5;
      this.vx  = (Math.random() - 0.5) * 0.25;
      this.vy  = (Math.random() - 0.5) * 0.25;
      this.op  = 0.05 + Math.random() * 0.2;
      const c  = ["252,204,10","59,130,246","139,92,246","16,185,129"];
      this.rgb = c[Math.floor(Math.random() * c.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.rgb},${this.op})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });

    /* draw faint connecting lines */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 90) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(59,130,246,${0.06 * (1 - d/90)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ============================================================
   NEIGHBOURHOOD DROPDOWN POPULATION
   ============================================================ */
boroughSel.addEventListener("change", () => {
  const borough = boroughSel.value;
  neighSel.innerHTML = '<option value="">Select neighbourhood…</option>';
  latInput.value = "";
  lonInput.value = "";

  if (borough && NEIGHBOURHOODS[borough]) {
    NEIGHBOURHOODS[borough].forEach(n => {
      const opt = document.createElement("option");
      opt.value = n.name;
      opt.textContent = n.name;
      neighSel.appendChild(opt);
    });
  }
  updateFieldCount();
});

neighSel.addEventListener("change", () => {
  const borough = boroughSel.value;
  const name    = neighSel.value;
  if (borough && name) {
    const match = NEIGHBOURHOODS[borough].find(n => n.name === name);
    if (match) {
      latInput.value = match.lat;
      lonInput.value = match.lon;
      latInput.dispatchEvent(new Event("input"));
      lonInput.dispatchEvent(new Event("input"));
    }
  }
  updateFieldCount();
});

/* ============================================================
   AVAILABILITY SLIDER LIVE VALUE
   ============================================================ */
availSlider.addEventListener("input", () => {
  availVal.textContent = availSlider.value;
  updateFieldCount();
});

/* ============================================================
   FIELD COMPLETION COUNTER
   ============================================================ */
const TRACKED_FIELDS = [
  "neighbourhood_group","neighbourhood",
  "latitude","longitude",
  "price","minimum_nights","availability_365",
  "number_of_reviews","reviews_per_month",
  "calculated_host_listings_count"
];

function updateFieldCount() {
  let filled = 0;
  TRACKED_FIELDS.forEach(name => {
    const el = document.getElementById(name);
    if (el && String(el.value).trim() !== "" && el.value !== "0" || (el && name === "availability_365")) filled++;
    // availability always counts since it has a default
    if (name === "availability_365") { /* already counted */ }
  });

  // re-count more accurately
  let count = 0;
  TRACKED_FIELDS.forEach(name => {
    const el = document.getElementById(name);
    if (!el) return;
    const v = el.value.trim();
    if (v !== "" && v !== undefined) count++;
  });

  fieldCount.textContent = `${count} / ${TRACKED_FIELDS.length}`;
  fieldCount.style.background = count === TRACKED_FIELDS.length
    ? "rgba(16,185,129,0.15)" : "rgba(252,204,10,0.1)";
  fieldCount.style.borderColor = count === TRACKED_FIELDS.length
    ? "rgba(16,185,129,0.4)" : "rgba(252,204,10,0.25)";
  fieldCount.style.color = count === TRACKED_FIELDS.length ? "#10b981" : "#fccc0a";
}

form.querySelectorAll("input, select").forEach(el => {
  el.addEventListener("input", updateFieldCount);
  el.addEventListener("change", updateFieldCount);
  el.addEventListener("input", () => {
    if (el.value.trim()) el.closest(".field")?.classList.remove("has-error");
  });
});

updateFieldCount();

/* ============================================================
   RIPPLE EFFECT
   ============================================================ */
document.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const rect   = btn.getBoundingClientRect();
  const size   = Math.max(rect.width, rect.height) * 2;
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.cssText = `
    width:${size}px; height:${size}px;
    left:${e.clientX - rect.left - size/2}px;
    top:${e.clientY - rect.top - size/2}px;
  `;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

/* ============================================================
   PANEL VISIBILITY HELPERS
   ============================================================ */
function showIdle()   { resultIdle.hidden = false; resultCard.hidden = true; errorCard.hidden = true; }
function showResult() { resultIdle.hidden = true;  resultCard.hidden = false; errorCard.hidden = true; }
function showError()  { resultIdle.hidden = true;  resultCard.hidden = true;  errorCard.hidden = false; }

/* ============================================================
   FORM VALIDATION
   ============================================================ */
function validateForm() {
  let valid = true;
  const required = [
    "neighbourhood_group","neighbourhood",
    "latitude","longitude",
    "price","minimum_nights",
    "number_of_reviews","reviews_per_month",
    "calculated_host_listings_count"
  ];
  required.forEach(name => {
    const el    = document.getElementById(name);
    const field = el?.closest(".field");
    if (!el || el.value.trim() === "") {
      valid = false;
      field?.classList.add("has-error");
    } else {
      field?.classList.remove("has-error");
    }
  });
  return valid;
}

/* ============================================================
   PROBABILITY BARS RENDERER
   ============================================================ */
function renderProbBars(probArray) {
  /* probArray order matches CLASS_ORDER = model.classes_ */
  const pairs = CLASS_ORDER.map((label, i) => ({
    label,
    prob: probArray[i] ?? 0,
    cfg:  ROOM_CONFIG[label] || { color: "#94a3b8" }
  })).sort((a, b) => b.prob - a.prob);

  probBars.innerHTML = pairs.map((p, i) => `
    <div class="prob-bar-item" style="animation-delay:${i*0.08}s">
      <div class="prob-bar-label">
        <span class="prob-bar-name">${p.cfg.label || p.label}</span>
        <span class="prob-bar-pct">${(p.prob * 100).toFixed(1)}%</span>
      </div>
      <div class="prob-bar-track">
        <div class="prob-bar-fill" data-pct="${p.prob * 100}"
          style="background: ${p.cfg.color}; width:0%"></div>
      </div>
    </div>
  `).join("");

  /* Animate bars after paint */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    probBars.querySelectorAll(".prob-bar-fill").forEach(bar => {
      bar.style.width = bar.dataset.pct + "%";
    });
  }));
}

/* ============================================================
   INPUT ECHO RENDERER
   ============================================================ */
function renderEcho(data) {
  const ECHO_LABELS = {
    neighbourhood_group:              "Borough",
    neighbourhood:                    "Neighbourhood",
    price:                            "Price / night",
    minimum_nights:                   "Min. nights",
    availability_365:                 "Availability",
    number_of_reviews:                "Reviews",
    reviews_per_month:                "Reviews/mo",
    calculated_host_listings_count:   "Host listings",
  };
  const ECHO_FORMAT = {
    price: v => `$${v}`,
    availability_365: v => `${v} days`,
  };

  echoGrid.innerHTML = Object.entries(ECHO_LABELS).map(([key, label], i) => `
    <div class="echo-item" style="animation-delay:${i*0.05}s">
      <div class="echo-key">${label}</div>
      <div class="echo-val" title="${data[key]}">
        ${ECHO_FORMAT[key] ? ECHO_FORMAT[key](data[key]) : data[key]}
      </div>
    </div>
  `).join("");
}

/* ============================================================
   FORM SUBMIT → API CALL
   ============================================================ */
form.addEventListener("submit", async e => {
  e.preventDefault();
  if (!validateForm()) return;

  /* Build payload */
  const payload = {
    latitude:                         parseFloat(latInput.value),
    longitude:                        parseFloat(lonInput.value),
    price:                            parseFloat(document.getElementById("price").value),
    minimum_nights:                   parseInt(document.getElementById("minimum_nights").value),
    number_of_reviews:                parseInt(document.getElementById("number_of_reviews").value),
    reviews_per_month:                parseFloat(document.getElementById("reviews_per_month").value),
    calculated_host_listings_count:   parseInt(document.getElementById("calculated_host_listings_count").value),
    availability_365:                 parseInt(availSlider.value),
    neighbourhood_group:              boroughSel.value,
    neighbourhood:                    neighSel.value,
  };

  /* Loading state */
  predictBtn.classList.add("loading");
  predictBtn.disabled = true;
  console.log("[NYC Predictor] Sending payload:", payload);

  try {
    const response = await fetch(API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    console.log("[NYC Predictor] Response status:", response.status);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("[NYC Predictor] Error body:", errText);
      let detail = "";
      try { detail = JSON.parse(errText)?.detail || errText; } catch { detail = errText; }
      throw new Error(detail || `Server error ${response.status}`);
    }

    const data = await response.json();
    console.log("[NYC Predictor] Response data:", data);

    const roomType = data.Predicted_room_type;
    const probs    = data.Probability;
    const cfg      = ROOM_CONFIG[roomType] || { icon: "🏠", color: "#fccc0a", label: roomType };

    /* Confidence for the top prediction */
    const topIdx  = CLASS_ORDER.indexOf(roomType);
    const topConf = topIdx >= 0 ? probs[topIdx] : Math.max(...probs);

    /* Populate result card */
    resultIcon.textContent       = cfg.icon;
    resultType.textContent       = cfg.label || roomType;
    confBadge.textContent        = (topConf * 100).toFixed(1) + "%";
    resultCard.style.setProperty("--result-color", cfg.color);
    resultIcon.style.borderColor = `${cfg.color}55`;
    resultIcon.style.background  = `${cfg.color}18`;

    renderProbBars(probs);
    renderEcho(payload);
    showResult();
    resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });

  } catch (err) {
    console.error("[NYC Predictor] Fetch error:", err);
    if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError") || err.name === "TypeError") {
      errorMsg.innerHTML = `
        <strong>Cannot reach the API.</strong><br/>
        Make sure uvicorn is running on port 8000, then open this page via a local server:<br/><br/>
        <code style="background:rgba(255,255,255,0.1);padding:4px 8px;border-radius:4px;font-size:0.8rem;">
          python -m http.server 3000
        </code><br/>
        then visit <code style="background:rgba(255,255,255,0.1);padding:4px 8px;border-radius:4px;font-size:0.8rem;">http://localhost:3000</code>
      `;
    } else {
      errorMsg.textContent = err.message;
    }
    showError();
  } finally {
    predictBtn.classList.remove("loading");
    predictBtn.disabled = false;
  }
});

/* ============================================================
   RETRY / RESET
   ============================================================ */
retryBtn.addEventListener("click", () => {
  form.reset();
  availVal.textContent = "180";
  neighSel.innerHTML = '<option value="">Select neighbourhood…</option>';
  updateFieldCount();
  showIdle();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

errorRetryBtn.addEventListener("click", () => {
  showIdle();
});

/* Init */
showIdle();
updateFieldCount();

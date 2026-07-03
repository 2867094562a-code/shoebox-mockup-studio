import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { USDZExporter } from "three/addons/exporters/USDZExporter.js";

const PX_PER_CM = 40;
const MODELS = [
  { id: "us-m", country: "US", countryName: "美国", gender: "male", name: "US 标准男鞋盒", l: 35.5, w: 20.5, h: 12.5, note: "US 9-12" },
  { id: "us-f", country: "US", countryName: "美国", gender: "female", name: "US 标准女鞋盒", l: 33, w: 19, h: 10.5, note: "US 6-10" },
  { id: "eu-m", country: "EU", countryName: "欧洲", gender: "male", name: "EU 标准男鞋盒", l: 34.5, w: 20, h: 12, note: "EU 41-45" },
  { id: "eu-f", country: "EU", countryName: "欧洲", gender: "female", name: "EU 标准女鞋盒", l: 31.5, w: 18.5, h: 10.5, note: "EU 36-40" },
  { id: "uk-m", country: "UK", countryName: "英国", gender: "male", name: "UK 标准男鞋盒", l: 35, w: 20, h: 12, note: "UK 8-11" },
  { id: "uk-f", country: "UK", countryName: "英国", gender: "female", name: "UK 标准女鞋盒", l: 32.5, w: 19, h: 10.5, note: "UK 4-8" },
  { id: "cn-m", country: "CN", countryName: "中国", gender: "male", name: "CN 标准男鞋盒", l: 34, w: 20, h: 11.5, note: "CN 255-280" },
  { id: "cn-f", country: "CN", countryName: "中国", gender: "female", name: "CN 标准女鞋盒", l: 31, w: 18, h: 10, note: "CN 225-250" },
  { id: "jp-m", country: "JP", countryName: "日本", gender: "male", name: "JP 标准男鞋盒", l: 33.5, w: 19.5, h: 11, note: "JP 26-28" },
  { id: "jp-f", country: "JP", countryName: "日本", gender: "female", name: "JP 标准女鞋盒", l: 30.5, w: 18, h: 9.5, note: "JP 22.5-25" },
  { id: "global-m", country: "GLOBAL", countryName: "全球运动款", gender: "male", name: "运动鞋男款加宽盒", l: 36, w: 22, h: 13.5, note: "Sneaker" },
  { id: "global-f", country: "GLOBAL", countryName: "全球运动款", gender: "female", name: "运动鞋女款加宽盒", l: 33, w: 21, h: 12, note: "Sneaker" }
];

const THEMES = {
  track: {
    name: "PULSE RUN",
    dark: "#152f39",
    mid: "#2d5f8b",
    light: "#e9f1f4",
    accent: "#d34a3a",
    secondary: "#f2be4b"
  },
  atelier: {
    name: "ATELIER 07",
    dark: "#2d2724",
    mid: "#9d6d77",
    light: "#f7f2ee",
    accent: "#b74335",
    secondary: "#3f6e52"
  },
  heritage: {
    name: "HERITAGE",
    dark: "#1f2b24",
    mid: "#3f6e52",
    light: "#f5f5ee",
    accent: "#a87b35",
    secondary: "#b74335"
  },
  mono: {
    name: "BLANK LABEL",
    dark: "#1f2226",
    mid: "#676f76",
    light: "#f8f8f5",
    accent: "#202327",
    secondary: "#2d5f8b"
  }
};

const els = {
  canvas: document.querySelector("#sceneCanvas"),
  modelCount: document.querySelector("#modelCount"),
  genderButtons: [...document.querySelectorAll(".segment")],
  countrySelect: document.querySelector("#countrySelect"),
  modelList: document.querySelector("#modelList"),
  themeSelect: document.querySelector("#themeSelect"),
  textureMode: document.querySelector("#textureMode"),
  textureUpload: document.querySelector("#textureUpload"),
  resetTexture: document.querySelector("#resetTexture"),
  downloadTemplate: document.querySelector("#downloadTemplate"),
  downloadAllTemplates: document.querySelector("#downloadAllTemplates"),
  playOpen: document.querySelector("#playOpen"),
  openProgress: document.querySelector("#openProgress"),
  openValue: document.querySelector("#openValue"),
  exportVideo: document.querySelector("#exportVideo"),
  exportModel: document.querySelector("#exportModel"),
  modelFormat: document.querySelector("#modelFormat"),
  exportStatus: document.querySelector("#exportStatus"),
  toggleDimensions: document.querySelector("#toggleDimensions"),
  toggleRatios: document.querySelector("#toggleRatios"),
  toggleEdges: document.querySelector("#toggleEdges"),
  ratioTable: document.querySelector("#ratioTable"),
  ratioBadge: document.querySelector("#ratioBadge"),
  templateScale: document.querySelector("#templateScale"),
  currentMarket: document.querySelector("#currentMarket"),
  currentTitle: document.querySelector("#currentTitle"),
  dimLength: document.querySelector("#dimLength"),
  dimWidth: document.querySelector("#dimWidth"),
  dimHeight: document.querySelector("#dimHeight"),
  templateSize: document.querySelector("#templateSize"),
  topRatio: document.querySelector("#topRatio"),
  longRatio: document.querySelector("#longRatio"),
  shortRatio: document.querySelector("#shortRatio"),
  dimensionStrip: document.querySelector(".dimension-strip"),
  specBand: document.querySelector(".spec-band"),
  viewFront: document.querySelector("#viewFront"),
  viewTop: document.querySelector("#viewTop"),
  toggleSpin: document.querySelector("#toggleSpin")
};

let selectedGender = "male";
let selectedCountry = "US";
let selectedModel = MODELS.find((model) => model.id === "us-m");
let selectedTheme = THEMES.track;
let uploadedImage = null;
let activeBox = null;
let autoSpin = true;
let showEdges = true;
let showDimensions = true;
let textureMode = "dieline";
let openProgress = 0;
let openTarget = 0;
let isOpenAnimating = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8fafb);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(4.8, 3.2, 4.7);

const renderer = new THREE.WebGLRenderer({
  canvas: els.canvas,
  antialias: true,
  alpha: false
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 3.2;
controls.maxDistance = 10;
controls.target.set(0, 0.55, 0);

const hemi = new THREE.HemisphereLight(0xffffff, 0xd2d6da, 2.1);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(3.6, 5.5, 3.2);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xdcecff, 1.1);
fillLight.position.set(-4, 2.4, -2.5);
scene.add(fillLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(14, 14),
  new THREE.ShadowMaterial({ color: 0x1a1f23, opacity: 0.14 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

initControls();
renderCountries();
setModel(selectedModel.id);
resizeRenderer();
animate();

window.shoeboxMockup = {
  models: MODELS,
  makeTemplateDataUrl(modelId) {
    const model = MODELS.find((item) => item.id === modelId);
    if (!model) return null;
    return makeTemplateCanvas(model).toDataURL("image/png");
  }
};

function initControls() {
  els.modelCount.textContent = `${MODELS.length} 款`;
  els.templateScale.textContent = `${PX_PER_CM} px/cm`;

  els.genderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedGender = button.dataset.gender;
      els.genderButtons.forEach((item) => item.classList.toggle("active", item === button));
      const fallback = MODELS.find((model) => model.gender === selectedGender && model.country === selectedCountry);
      setModel((fallback || MODELS.find((model) => model.gender === selectedGender)).id);
      renderCountries();
    });
  });

  els.countrySelect.addEventListener("change", (event) => {
    selectedCountry = event.target.value;
    const next = MODELS.find((model) => model.gender === selectedGender && model.country === selectedCountry);
    setModel(next.id);
  });

  els.themeSelect.addEventListener("change", (event) => {
    selectedTheme = THEMES[event.target.value];
    uploadedImage = null;
    els.textureUpload.value = "";
    rebuildScene();
  });

  els.textureMode.addEventListener("change", (event) => {
    textureMode = event.target.value;
    rebuildScene();
  });

  els.textureUpload.addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    const image = new Image();
    image.src = URL.createObjectURL(file);
    await image.decode();
    uploadedImage = image;
    rebuildScene();
  });

  els.resetTexture.addEventListener("click", () => {
    uploadedImage = null;
    els.textureUpload.value = "";
    rebuildScene();
  });

  els.downloadTemplate.addEventListener("click", () => {
    downloadTemplateForModel(selectedModel);
  });

  els.downloadAllTemplates.addEventListener("click", async () => {
    setExportStatus("生成全部刀模...");
    for (const model of MODELS) {
      downloadTemplateForModel(model);
      await new Promise((resolve) => setTimeout(resolve, 180));
    }
    setExportStatus("全部刀模已生成");
  });

  els.playOpen.addEventListener("click", () => {
    isOpenAnimating = true;
    openTarget = openProgress < 0.5 ? 1 : 0;
    els.playOpen.textContent = openTarget > 0 ? "播放合盒" : "播放开盒";
  });

  els.openProgress.addEventListener("input", (event) => {
    isOpenAnimating = false;
    setOpenProgress(Number(event.target.value) / 100);
  });

  els.toggleDimensions.addEventListener("change", () => {
    showDimensions = els.toggleDimensions.checked;
    els.dimensionStrip.classList.toggle("is-hidden", !showDimensions);
    syncDimensionVisibility();
  });

  els.toggleRatios.addEventListener("change", () => {
    const hidden = !els.toggleRatios.checked;
    els.specBand.classList.toggle("is-hidden", hidden);
    els.ratioTable.closest(".panel-section").classList.toggle("is-hidden", hidden);
  });

  els.toggleEdges.addEventListener("change", () => {
    showEdges = els.toggleEdges.checked;
    syncEdgeVisibility();
  });

  els.viewFront.addEventListener("click", () => {
    autoSpin = false;
    els.toggleSpin.classList.remove("active");
    moveCamera(0, 1.8, 5.6);
  });

  els.viewTop.addEventListener("click", () => {
    autoSpin = false;
    els.toggleSpin.classList.remove("active");
    moveCamera(0.1, 6.5, 0.1);
  });

  els.toggleSpin.addEventListener("click", () => {
    autoSpin = !autoSpin;
    els.toggleSpin.classList.toggle("active", autoSpin);
  });

  els.exportVideo.addEventListener("click", exportOpenCloseVideo);
  els.exportModel.addEventListener("click", exportCurrentModel);

  window.addEventListener("resize", resizeRenderer);
  new ResizeObserver(resizeRenderer).observe(els.canvas.parentElement);
  requestAnimationFrame(resizeRenderer);
  setTimeout(resizeRenderer, 250);
  els.toggleSpin.classList.add("active");
}

function renderCountries() {
  const countries = MODELS.filter((model) => model.gender === selectedGender).map((model) => model.country);
  const unique = [...new Set(countries)];
  els.countrySelect.innerHTML = unique
    .map((country) => {
      const model = MODELS.find((item) => item.country === country && item.gender === selectedGender);
      return `<option value="${country}">${model.countryName}</option>`;
    })
    .join("");
  selectedCountry = unique.includes(selectedCountry) ? selectedCountry : unique[0];
  els.countrySelect.value = selectedCountry;
  renderModelList();
}

function renderModelList() {
  const models = MODELS.filter((model) => model.gender === selectedGender);
  els.modelList.innerHTML = "";
  models.forEach((model) => {
    const button = document.createElement("button");
    button.className = `model-item ${model.id === selectedModel.id ? "active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <span>
        <strong>${model.name}</strong>
        <span>${model.l} × ${model.w} × ${model.h} cm</span>
      </span>
      <em>${model.note}</em>
    `;
    button.addEventListener("click", () => {
      selectedCountry = model.country;
      els.countrySelect.value = model.country;
      setModel(model.id);
    });
    els.modelList.appendChild(button);
  });
}

function setModel(modelId) {
  selectedModel = MODELS.find((model) => model.id === modelId) || MODELS[0];
  selectedCountry = selectedModel.country;
  selectedGender = selectedModel.gender;
  els.genderButtons.forEach((button) => button.classList.toggle("active", button.dataset.gender === selectedGender));
  if (els.countrySelect.value !== selectedCountry) els.countrySelect.value = selectedCountry;
  renderModelList();
  updateText();
  rebuildScene();
}

function updateText() {
  const { l, w, h } = selectedModel;
  const templateW = Math.round((l + h * 2) * PX_PER_CM);
  const templateH = Math.round((w + h * 2) * PX_PER_CM);
  const genderText = selectedModel.gender === "male" ? "男鞋" : "女鞋";

  els.currentMarket.textContent = `${selectedModel.countryName} / ${genderText}`;
  els.currentTitle.textContent = selectedModel.name;
  els.dimLength.textContent = `${l} cm`;
  els.dimWidth.textContent = `${w} cm`;
  els.dimHeight.textContent = `${h} cm`;
  els.templateSize.textContent = `${templateW} × ${templateH} px`;
  els.topRatio.textContent = `${ratio(l, w)}:1`;
  els.longRatio.textContent = `${ratio(l, h)}:1`;
  els.shortRatio.textContent = `${ratio(w, h)}:1`;
  els.ratioBadge.textContent = `${l}:${w}:${h}`;

  const rows = [
    ["顶面", `${l} : ${w}（${ratio(l, w)}:1）`],
    ["长边", `${l} : ${h}（${ratio(l, h)}:1）`],
    ["短边", `${w} : ${h}（${ratio(w, h)}:1）`],
    ["环绕条", `${(2 * l + 2 * w).toFixed(1)} : ${h}（${ratio(2 * l + 2 * w, h)}:1）`],
    ["模板", `${(l + 2 * h).toFixed(1)} : ${(w + 2 * h).toFixed(1)}（${ratio(l + 2 * h, w + 2 * h)}:1）`]
  ];

  els.ratioTable.innerHTML = rows
    .map(([term, value]) => `<div class="ratio-row"><dt>${term}</dt><dd>${value}</dd></div>`)
    .join("");
}

function rebuildScene() {
  if (activeBox) {
    activeBox.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          material.map?.dispose();
          material.dispose();
        });
      }
    });
    scene.remove(activeBox);
  }

  activeBox = makeShoeBox(selectedModel);
  scene.add(activeBox);
  syncEdgeVisibility();
  syncDimensionVisibility();
}

function makeShoeBox(model) {
  const scale = 0.082;
  const length = model.l * scale;
  const width = model.w * scale;
  const height = model.h * scale;
  const baseHeight = height * 0.72;
  const lidHeight = height * 0.3;
  const lidOverhang = 0.07;
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(length, baseHeight, width),
    makeBoxMaterials(model, "base")
  );
  base.position.y = baseHeight / 2;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);
  addEdges(base, 0x1f2226, 0.2, group);
  addBaseInterior(group, length, width, baseHeight);

  const lidPivot = new THREE.Group();
  lidPivot.userData.kind = "lidPivot";
  lidPivot.position.set(0, baseHeight - height * 0.08, -(width + lidOverhang) / 2);
  const lidShell = makeLidShell(model, length + lidOverhang, width + lidOverhang, lidHeight);
  lidShell.position.set(0, 0, (width + lidOverhang) / 2);
  lidPivot.add(lidShell);
  group.add(lidPivot);

  const seam = new THREE.Mesh(
    new THREE.BoxGeometry(length + lidOverhang + 0.012, 0.018, width + lidOverhang + 0.012),
    new THREE.MeshStandardMaterial({
      color: 0x202327,
      roughness: 0.62,
      metalness: 0,
      transparent: true,
      opacity: 0.22
    })
  );
  seam.position.y = baseHeight - height * 0.02;
  group.add(seam);

  group.add(makeDimensionOverlay(model, length, width, height));
  group.rotation.y = -0.55;
  group.rotation.x = -0.02;
  applyOpenProgress(group, openProgress);
  return group;
}

function makeLidShell(model, length, width, height) {
  const group = new THREE.Group();
  const thickness = Math.max(0.028, height * 0.12);
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(length, thickness, width),
    makeFaceMaterials(2, material(makeTexture(model, "lidTop", "lid"), 0.52), makeInsideMaterial())
  );
  top.position.y = height + thickness / 2;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);
  addEdges(top, 0xffffff, 0.16, group);

  const front = makeBoxPanel(length, height, thickness, 4, material(makeTexture(model, "lidLong", "lid"), 0.56));
  front.position.set(0, height / 2, width / 2 + thickness / 2);
  group.add(front);
  addEdges(front, 0xffffff, 0.13, group);

  const back = makeBoxPanel(length, height, thickness, 5, material(makeTexture(model, "lidLong", "lid"), 0.56));
  back.position.set(0, height / 2, -width / 2 - thickness / 2);
  group.add(back);
  addEdges(back, 0xffffff, 0.13, group);

  const left = makeBoxPanel(thickness, height, width, 1, material(makeTexture(model, "lidShort", "lid"), 0.56));
  left.position.set(-length / 2 - thickness / 2, height / 2, 0);
  group.add(left);
  addEdges(left, 0xffffff, 0.13, group);

  const right = makeBoxPanel(thickness, height, width, 0, material(makeTexture(model, "lidShort", "lid"), 0.56));
  right.position.set(length / 2 + thickness / 2, height / 2, 0);
  group.add(right);
  addEdges(right, 0xffffff, 0.13, group);

  return group;
}

function makeFaceMaterials(faceIndex, outsideMaterial, insideMaterial) {
  const materials = Array.from({ length: 6 }, () => insideMaterial.clone());
  materials[faceIndex] = outsideMaterial;
  return materials;
}

function makeBoxPanel(sizeX, sizeY, sizeZ, outsideFaceIndex, outsideMaterial) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sizeX, sizeY, sizeZ),
    makeFaceMaterials(outsideFaceIndex, outsideMaterial, makeInsideMaterial())
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addBaseInterior(group, length, width, baseHeight) {
  const innerMaterial = makeInsideMaterial();
  const inset = 0.012;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(length * 0.94, width * 0.9), innerMaterial.clone());
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.028;
  floor.receiveShadow = true;
  group.add(floor);

  const front = new THREE.Mesh(new THREE.PlaneGeometry(length * 0.96, baseHeight * 0.9), innerMaterial.clone());
  front.position.set(0, baseHeight * 0.46, width / 2 - inset);
  front.rotation.y = Math.PI;
  group.add(front);

  const back = new THREE.Mesh(new THREE.PlaneGeometry(length * 0.96, baseHeight * 0.9), innerMaterial.clone());
  back.position.set(0, baseHeight * 0.46, -width / 2 + inset);
  group.add(back);

  const left = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.9, baseHeight * 0.9), innerMaterial.clone());
  left.position.set(-length / 2 + inset, baseHeight * 0.46, 0);
  left.rotation.y = Math.PI / 2;
  group.add(left);

  const right = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.9, baseHeight * 0.9), innerMaterial.clone());
  right.position.set(length / 2 - inset, baseHeight * 0.46, 0);
  right.rotation.y = -Math.PI / 2;
  group.add(right);
}

function addEdges(mesh, color, opacity, group) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  );
  edges.position.copy(mesh.position);
  edges.rotation.copy(mesh.rotation);
  edges.userData.kind = "edge";
  edges.visible = showEdges;
  group.add(edges);
}

function syncEdgeVisibility() {
  if (!activeBox) return;
  activeBox.traverse((child) => {
    if (child.userData.kind === "edge") child.visible = showEdges;
  });
}

function syncDimensionVisibility() {
  if (!activeBox) return;
  activeBox.traverse((child) => {
    if (child.userData.kind === "dimension") child.visible = showDimensions;
  });
}

function setOpenProgress(value) {
  openProgress = THREE.MathUtils.clamp(value, 0, 1);
  els.openProgress.value = Math.round(openProgress * 100);
  els.openValue.textContent = `${Math.round(openProgress * 100)}%`;
  els.playOpen.textContent = openProgress >= 0.5 ? "播放合盒" : "播放开盒";
  if (activeBox) applyOpenProgress(activeBox, openProgress);
}

function applyOpenProgress(group, value) {
  const eased = easeInOutCubic(value);
  group.traverse((child) => {
    if (child.userData.kind === "lidPivot") {
      child.rotation.x = -THREE.MathUtils.degToRad(112) * eased;
    }
  });
}

function easeInOutCubic(value) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function makeDimensionOverlay(model, length, width, height) {
  const group = new THREE.Group();
  group.userData.kind = "dimension";
  const offset = 0.24;
  const y = 0.05;
  addMeasureLine(group, [-length / 2, y, width / 2 + offset], [length / 2, y, width / 2 + offset], `${model.l} cm`, [0, 0.12, 0]);
  addMeasureLine(group, [length / 2 + offset, y, -width / 2], [length / 2 + offset, y, width / 2], `${model.w} cm`, [0.06, 0.12, 0]);
  addMeasureLine(group, [length / 2 + offset * 1.6, 0, width / 2 + offset], [length / 2 + offset * 1.6, height, width / 2 + offset], `${model.h} cm`, [0.08, 0, 0]);
  group.traverse((child) => {
    child.userData.kind = "dimension";
    child.visible = showDimensions;
  });
  return group;
}

function addMeasureLine(group, start, end, label, labelOffset) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x202327, transparent: true, opacity: 0.8 })
  );
  line.userData.kind = "dimension";
  group.add(line);

  const tickSize = 0.08;
  addTick(group, start, tickSize);
  addTick(group, end, tickSize);

  const labelSprite = makeTextSprite(label);
  labelSprite.position.set(
    (start[0] + end[0]) / 2 + labelOffset[0],
    (start[1] + end[1]) / 2 + labelOffset[1],
    (start[2] + end[2]) / 2 + labelOffset[2]
  );
  labelSprite.userData.kind = "dimension";
  group.add(labelSprite);
}

function addTick(group, point, size) {
  const tick = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(point[0] - size / 2, point[1], point[2]),
      new THREE.Vector3(point[0] + size / 2, point[1], point[2])
    ]),
    new THREE.LineBasicMaterial({ color: 0x202327, transparent: true, opacity: 0.8 })
  );
  tick.userData.kind = "dimension";
  group.add(tick);
}

function makeTextSprite(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 144;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  roundRect(ctx, 18, 26, 348, 88, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(32,35,39,0.18)";
  ctx.lineWidth = 3;
  roundRect(ctx, 18, 26, 348, 88, 18);
  ctx.stroke();
  ctx.fillStyle = "#202327";
  ctx.font = "900 46px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  );
  sprite.scale.set(0.78, 0.29, 1);
  return sprite;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function makeBoxMaterials(model, layer) {
  const roughness = layer === "lid" ? 0.52 : 0.64;
  const longFace = makeTexture(model, "long", layer);
  const shortFace = makeTexture(model, "short", layer);
  const topFace = makeTexture(model, "top", layer);
  const bottomFace = makeTexture(model, "bottom", layer);
  const inside = makeInsideMaterial();
  const openTop = makeOpenMaterial();

  return [
    material(shortFace, roughness),
    material(shortFace.clone(), roughness),
    layer === "base" ? openTop : material(topFace, roughness),
    layer === "lid" ? inside : material(bottomFace, 0.72),
    material(longFace, roughness),
    material(longFace.clone(), roughness)
  ];
}

function makeInsideMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xc7aa7f,
    roughness: 0.9,
    metalness: 0,
    side: THREE.FrontSide
  });
}

function makeOpenMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
}

function material(texture, roughness) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return new THREE.MeshStandardMaterial({
    map: texture,
    roughness,
    metalness: 0.02
  });
}

function makeTexture(model, face, layer) {
  const size = faceSize(model, face);
  const canvas = document.createElement("canvas");
  const maxSide = 1280;
  const aspect = size.a / size.b;
  canvas.width = aspect >= 1 ? maxSide : Math.round(maxSide * aspect);
  canvas.height = aspect >= 1 ? Math.round(maxSide / aspect) : maxSide;
  const ctx = canvas.getContext("2d");

  if (uploadedImage) {
    if (textureMode === "dieline") {
      drawDielineFace(ctx, uploadedImage, canvas.width, canvas.height, model, face, layer);
    } else {
      drawCoverImage(ctx, uploadedImage, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(18, 22, 25, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else {
    drawExampleArt(ctx, canvas.width, canvas.height, model, face, layer);
  }

  return new THREE.CanvasTexture(canvas);
}

function faceSize(model, face) {
  if (face === "top" || face === "bottom" || face === "lidTop") return { a: model.l, b: model.w };
  if (face === "long" || face === "lidLong") return { a: model.l, b: model.h };
  if (face === "lidShort") return { a: model.w, b: model.h };
  return { a: model.w, b: model.h };
}

function drawExampleArt(ctx, width, height, model, face, layer) {
  const theme = selectedTheme;
  ctx.fillStyle = theme.light;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = layer === "lid" ? theme.dark : theme.mid;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.95;
  ctx.fillStyle = theme.light;
  const band = Math.max(24, height * 0.18);
  ctx.fillRect(0, height - band, width, band);
  ctx.globalAlpha = 1;

  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.moveTo(width * 0.08, 0);
  ctx.lineTo(width * 0.28, 0);
  ctx.lineTo(width * 0.16, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = theme.secondary;
  ctx.lineWidth = Math.max(5, Math.min(width, height) * 0.025);
  for (let x = -width; x < width * 1.6; x += width * 0.18) {
    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.lineTo(x + width * 0.42, 0);
    ctx.stroke();
  }

  const bigSize = Math.max(24, Math.min(width * 0.11, height * 0.38));
  ctx.fillStyle = theme.light;
  ctx.font = `900 ${bigSize}px Inter, Arial, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillText(theme.name, width * 0.12, height * 0.42);

  const smallSize = Math.max(16, Math.min(width * 0.045, height * 0.17));
  ctx.font = `800 ${smallSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = face === "top" ? theme.secondary : theme.light;
  ctx.fillText(`${model.countryName} ${model.gender === "male" ? "MEN" : "WOMEN"}`, width * 0.12, height * 0.62);

  ctx.fillStyle = theme.dark;
  ctx.font = `800 ${Math.max(12, smallSize * 0.82)}px Inter, Arial, sans-serif`;
  ctx.fillText(`${model.l} x ${model.w} x ${model.h} cm`, width * 0.12, height - band * 0.5);

  ctx.textAlign = "right";
  ctx.fillStyle = theme.dark;
  ctx.fillText(face.toUpperCase(), width * 0.9, height - band * 0.5);
  ctx.textAlign = "left";
}

function drawCoverImage(ctx, image, width, height) {
  const imageRatio = image.width / image.height;
  const targetRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  let x = 0;
  let y = 0;
  if (imageRatio > targetRatio) {
    drawHeight = height;
    drawWidth = height * imageRatio;
    x = (width - drawWidth) / 2;
  } else {
    drawWidth = width;
    drawHeight = width / imageRatio;
    y = (height - drawHeight) / 2;
  }
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function drawDielineFace(ctx, image, width, height, model, face, layer) {
  const region = getDielineRegion(face, layer);
  const sx = Math.round(image.width * region.x);
  const sy = Math.round(image.height * region.y);
  const sw = Math.round(image.width * region.w);
  const sh = Math.round(image.height * region.h);
  drawImageCrop(ctx, image, sx, sy, sw, sh, 0, 0, width, height);

  ctx.strokeStyle = "rgba(32,35,39,0.22)";
  ctx.lineWidth = Math.max(2, Math.min(width, height) * 0.012);
  ctx.strokeRect(1, 1, width - 2, height - 2);

  if (layer === "base") {
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(0, 0, width, height);
  }
}

function getDielineRegion(face, layer) {
  if (face === "lidTop" || (face === "top" && layer === "lid")) return { x: 0.25, y: 0.241, w: 0.438, h: 0.283 };
  if (face === "bottom") return { x: 0.25, y: 0.524, w: 0.438, h: 0.283 };
  if (face === "lidLong" || (face === "long" && layer === "lid")) return { x: 0.25, y: 0.138, w: 0.438, h: 0.103 };
  if (face === "long") return { x: 0.25, y: 0.807, w: 0.438, h: 0.103 };
  if (face === "lidShort" || (face === "short" && layer === "lid")) return { x: 0.688, y: 0.241, w: 0.131, h: 0.324 };
  return { x: 0.119, y: 0.241, w: 0.131, h: 0.324 };
}

function drawImageCrop(ctx, image, sx, sy, sw, sh, dx, dy, dw, dh) {
  const sourceRatio = sw / sh;
  const targetRatio = dw / dh;
  let cropX = sx;
  let cropY = sy;
  let cropW = sw;
  let cropH = sh;

  if (sourceRatio > targetRatio) {
    cropW = Math.round(sh * targetRatio);
    cropX = sx + Math.round((sw - cropW) / 2);
  } else {
    cropH = Math.round(sw / targetRatio);
    cropY = sy + Math.round((sh - cropH) / 2);
  }

  ctx.drawImage(image, cropX, cropY, cropW, cropH, dx, dy, dw, dh);
}

function makeTemplateCanvas(model) {
  const canvas = document.createElement("canvas");
  canvas.width = 3200;
  canvas.height = 2900;
  const ctx = canvas.getContext("2d");
  const theme = selectedTheme;
  const panels = [
    { x: 800, y: 400, width: 1400, height: 300, label: "LID LONG", cn: "盒盖长边", color: theme.mid },
    { x: 800, y: 700, width: 1400, height: 820, label: "LID TOP", cn: "盒盖顶面", color: theme.dark },
    { x: 800, y: 1520, width: 1400, height: 820, label: "BASE OUTER BOTTOM", cn: "底盒外底面", color: theme.mid },
    { x: 800, y: 2340, width: 1400, height: 300, label: "BASE LONG", cn: "底盒长边", color: theme.green || "#3f6e52" },
    { x: 380, y: 700, width: 420, height: 940, label: "LEFT SHORT", cn: "左短边", color: theme.accent },
    { x: 2200, y: 700, width: 420, height: 940, label: "RIGHT SHORT", cn: "右短边", color: theme.accent },
    { x: 120, y: 760, width: 260, height: 820, label: "BLEED", cn: "出血/插舌", color: "#d8c29d" },
    { x: 2620, y: 760, width: 260, height: 820, label: "BLEED", cn: "出血/插舌", color: "#d8c29d" }
  ];

  ctx.fillStyle = "#f8f8f5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid(ctx, canvas.width, canvas.height, 100);

  panels.forEach((panel) => {
    ctx.fillStyle = panel.color;
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(panel.x, panel.y, panel.width, panel.height);
    ctx.clip();
    ctx.strokeStyle = theme.secondary;
    ctx.lineWidth = 14;
    for (let x = panel.x - panel.height; x < panel.x + panel.width; x += 250) {
      ctx.beginPath();
      ctx.moveTo(x, panel.y + panel.height);
      ctx.lineTo(x + 450, panel.y);
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = "#202327";
    ctx.lineWidth = 3;
    ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);

    const badgeW = Math.min(panel.width - 40, 340);
    const badgeH = 132;
    const badgeX = panel.x + panel.width / 2 - badgeW / 2;
    const badgeY = panel.label === "TOP" ? panel.y + 44 : panel.y + panel.height / 2 - badgeH / 2;
    ctx.fillStyle = "rgba(0,0,0,0.68)";
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
    ctx.fillStyle = "#fff";
    ctx.font = "900 42px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(panel.label, panel.x + panel.width / 2, badgeY + 45);
    ctx.font = "800 28px Inter, Arial, sans-serif";
    ctx.fillText(panel.cn, panel.x + panel.width / 2, badgeY + 94);
  });

  ctx.setLineDash([18, 14]);
  ctx.strokeStyle = "rgba(32,35,39,0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(800, 700, 1400, 820);
  ctx.beginPath();
  ctx.moveTo(800, 700);
  ctx.lineTo(2200, 700);
  ctx.moveTo(800, 1520);
  ctx.lineTo(2200, 1520);
  ctx.moveTo(800, 2340);
  ctx.lineTo(2200, 2340);
  ctx.moveTo(800, 700);
  ctx.lineTo(800, 2640);
  ctx.moveTo(2200, 700);
  ctx.lineTo(2200, 2640);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.font = "900 112px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PULSE RUN", 1506, 886);
  ctx.fillStyle = "#fff";
  ctx.fillText("PULSE RUN", 1500, 880);
  ctx.font = "800 38px Inter, Arial, sans-serif";
  ctx.fillText("DIELINE COMPATIBLE SAMPLE", 1500, 1018);

  ctx.fillStyle = "#202327";
  ctx.font = "800 30px Inter, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`${model.name}  ${model.l} x ${model.w} x ${model.h} cm`, 800, 2730);
  ctx.fillText("上传模式：整张刀模贴图。盒内为空白纸板色，内底面不参与贴图。", 800, 2785);
  ctx.fillText("裁切区域：LID TOP=盒盖顶面；BASE OUTER BOTTOM=底盒外底面；LID/BASE LONG=长边；左右竖条=短边。", 800, 2840);
  return canvas;
}

function downloadTemplateForModel(model) {
  const canvas = makeTemplateCanvas(model);
  const link = document.createElement("a");
  link.download = `${model.id}-dieline-template-v3.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function drawGrid(ctx, width, height, spacing) {
  ctx.save();
  ctx.strokeStyle = "#e2e5e8";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

async function exportOpenCloseVideo() {
  if (!renderer.domElement.captureStream || typeof MediaRecorder === "undefined") {
    setExportStatus("浏览器不支持录制");
    return;
  }

  const mp4Type = [
    "video/mp4;codecs=avc1.42E01E",
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm"
  ].find((type) => MediaRecorder.isTypeSupported(type));
  const isMp4 = mp4Type?.startsWith("video/mp4");
  const mimeType = mp4Type || "";
  const extension = isMp4 ? "mp4" : "webm";
  const chunks = [];
  const stream = renderer.domElement.captureStream(30);
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

  setExportStatus(isMp4 ? "录制 MP4..." : "录制 WebM...");
  els.exportVideo.disabled = true;
  const originalSpin = autoSpin;
  autoSpin = false;
  els.toggleSpin.classList.remove("active");

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const stopped = new Promise((resolve) => {
    recorder.onstop = resolve;
  });

  recorder.start();
  await runOpenCloseTimeline(5200);
  recorder.stop();
  await stopped;
  stream.getTracks().forEach((track) => track.stop());

  const blob = new Blob(chunks, { type: mimeType || "video/webm" });
  downloadBlob(blob, `${selectedModel.id}-open-close.${extension}`);
  autoSpin = originalSpin;
  els.toggleSpin.classList.toggle("active", autoSpin);
  els.exportVideo.disabled = false;
  setOpenProgress(0);
  setExportStatus(isMp4 ? "MP4 已导出" : "已导出 WebM");
}

function runOpenCloseTimeline(duration) {
  const start = performance.now();
  return new Promise((resolve) => {
    function frame(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const progress = t < 0.5 ? t * 2 : 2 - t * 2;
      setOpenProgress(progress);
      renderer.render(scene, camera);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}

async function exportCurrentModel() {
  if (!activeBox) return;
  const format = els.modelFormat.value;
  const exportScene = new THREE.Scene();
  const model = activeBox.clone(true);
  stripExportHelpers(model);
  exportScene.add(model);

  els.exportModel.disabled = true;
  setExportStatus("烘焙导出...");

  try {
    if (format === "usdz") {
      const exporter = new USDZExporter();
      const arrayBuffer = await exporter.parse(exportScene);
      downloadBlob(new Blob([arrayBuffer], { type: "model/vnd.usdz+zip" }), `${selectedModel.id}-shoebox.usdz`);
      setExportStatus("USDZ 已导出");
    } else {
      const exporter = new GLTFExporter();
      const binary = format === "glb";
      const result = await new Promise((resolve, reject) => {
        exporter.parse(
          exportScene,
          resolve,
          reject,
          {
            binary,
            onlyVisible: true,
            includeCustomExtensions: false,
            trs: false
          }
        );
      });
      if (binary) {
        downloadBlob(new Blob([result], { type: "model/gltf-binary" }), `${selectedModel.id}-shoebox.glb`);
        setExportStatus("GLB 已导出");
      } else {
        const json = JSON.stringify(result, null, 2);
        downloadBlob(new Blob([json], { type: "model/gltf+json" }), `${selectedModel.id}-shoebox.gltf`);
        setExportStatus("GLTF 已导出");
      }
    }
  } catch (error) {
    console.error(error);
    setExportStatus("导出失败");
  } finally {
    els.exportModel.disabled = false;
  }
}

function stripExportHelpers(object) {
  const remove = [];
  object.traverse((child) => {
    if (child.userData.kind === "dimension") remove.push(child);
  });
  remove.forEach((child) => child.parent?.remove(child));
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 800);
}

function setExportStatus(text) {
  els.exportStatus.textContent = text;
}

function moveCamera(x, y, z) {
  camera.position.set(x, y, z);
  camera.lookAt(controls.target);
  controls.update();
}

function resizeRenderer() {
  const rect = els.canvas.parentElement.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / Math.max(1, rect.height);
  camera.updateProjectionMatrix();
}

function animate() {
  requestAnimationFrame(animate);
  if (isOpenAnimating) {
    const delta = openTarget - openProgress;
    if (Math.abs(delta) < 0.006) {
      setOpenProgress(openTarget);
      isOpenAnimating = false;
    } else {
      setOpenProgress(openProgress + delta * 0.075);
    }
  }
  if (autoSpin && activeBox) activeBox.rotation.y += 0.004;
  controls.update();
  renderer.render(scene, camera);
}

function ratio(a, b) {
  return (a / b).toFixed(2);
}

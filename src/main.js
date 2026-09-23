import { initScene } from "./scene.js";
import { initState } from "./state.js";
import { buildBottle } from "./bottle.js";
import { createExporter } from "./exporter.js";
import { bindUI } from "./ui.js";

const sceneCtx = initScene();
const state = initState();

function rebuild() {
  buildBottle({ bottleGroup: sceneCtx.bottleGroup, state });
}

const exporter = createExporter({
  bottleGroup: sceneCtx.bottleGroup,
  state,
  rebuild,
});

bindUI({ state, rebuild, exporter });

sceneCtx.resize();
rebuild();
sceneCtx.animate();

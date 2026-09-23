import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { download } from "./utils.js";

export function createExporter({ bottleGroup, state, rebuild }) {
  function exportGlb() {
    const exporter = new GLTFExporter();
    exporter.parse(
      bottleGroup,
      (gltf) => {
        const blob = new Blob([gltf], { type: "model/gltf-binary" });
        download(blob, "bottle.glb");
      },
      (error) => {
        console.error("GLB export failed:", error);
        alert("GLB export failed. See the console for details.");
      },
      { binary: true, onlyVisible: true },
    );
  }

  function exportJson() {
    const data = JSON.stringify(state.getValues(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    download(blob, "bottle.json");
  }

  function importJson(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const obj = JSON.parse(ev.target.result);
        state.setValues(obj);
        rebuild();
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  }

  return { exportGlb, exportJson, importJson };
}

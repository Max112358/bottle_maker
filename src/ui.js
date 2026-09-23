export function bindUI({ state, rebuild, exporter }) {
  const { inputs, ids } = state;

  document.getElementById("btnExportGlb").addEventListener("click", () => {
    exporter.exportGlb();
  });

  document.getElementById("btnExportJson").addEventListener("click", () => {
    exporter.exportJson();
  });

  const fileInput = document.getElementById("fileImportJson");
  document.getElementById("btnImportJson").addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    exporter.importJson(e.target.files[0]);
    e.target.value = "";
  });

  inputs.showLabel.addEventListener("change", (e) => {
    document.getElementById("labelOptions").style.display = e.target.checked
      ? "block"
      : "none";
    rebuild();
  });

  ids.forEach((id) => {
    if (id !== "showLabel") {
      inputs[id].addEventListener("input", rebuild);
    }
  });
}

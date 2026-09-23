export const PARAMETER_IDS = [
  "baseD",
  "middleD",
  "neckD",
  "neckUpperD",
  "lipD",
  "middleH",
  "neckH",
  "neckUpperH",
  "lipH",
  "wall",
  "liquidH",
  "liquidOpacity",
  "liquidColor",
  "showLabel",
  "labelText",
  "labelFont",
  "labelFontSize",
  "labelH",
  "glassSegs",
  "liquidSegs",
  "liquidRings",
  "labelSegs",
  "corkSegs",
  "corkRings",
];

export function initState() {
  const inputs = {};
  PARAMETER_IDS.forEach((id) => {
    inputs[id] = document.getElementById(id);
  });

  function getValues() {
    const out = {};
    PARAMETER_IDS.forEach((id) => {
      const el = inputs[id];
      if (el.type === "checkbox") {
        out[id] = el.checked;
      } else if (el.type === "range") {
        out[id] = Number(el.value);
      } else {
        out[id] = el.value;
      }
    });
    return out;
  }

  function setValues(obj) {
    PARAMETER_IDS.forEach((id) => {
      if (obj[id] === undefined || !inputs[id]) return;
      const el = inputs[id];
      if (el.type === "checkbox") {
        el.checked = obj[id];
        if (id === "showLabel") {
          document.getElementById("labelOptions").style.display = obj[id]
            ? "block"
            : "none";
        }
      } else {
        el.value = obj[id];
      }
    });
  }

  function updateLabels(p) {
    PARAMETER_IDS.forEach((key) => {
      if (
        key === "liquidColor" ||
        key === "labelText" ||
        key === "labelFont" ||
        key === "showLabel"
      ) {
        return;
      }
      const el = document.getElementById("val-" + key);
      if (!el) return;
      el.textContent = key === "liquidOpacity" ? p[key].toFixed(2) : p[key];
    });
  }

  return { ids: PARAMETER_IDS, inputs, getValues, setValues, updateLabels };
}

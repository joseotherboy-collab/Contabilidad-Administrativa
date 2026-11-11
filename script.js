const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "×" : "☰";
});
mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));

const number = id => Number(document.getElementById(id).value);
const money = value => value.toLocaleString("es-GT", {minimumFractionDigits: 2, maximumFractionDigits: 2});
const show = (id, message) => document.getElementById(id).textContent = message;

document.getElementById("calcMargin").addEventListener("click", () => {
  const sales = number("sales"), profit = number("profit");
  if (sales <= 0) return show("marginResult", "Ingrese ventas mayores que cero.");
  show("marginResult", `Margen neto: ${money(profit / sales * 100)}%`);
});
document.getElementById("calcProductivity").addEventListener("click", () => {
  const units = number("units"), hours = number("hours");
  if (units < 0 || hours <= 0) return show("productivityResult", "Ingrese unidades válidas y horas mayores que cero.");
  show("productivityResult", `Productividad: ${money(units / hours)} unidades/hora`);
});
document.getElementById("calcCash").addEventListener("click", () => {
  const net = number("inflows") - number("outflows");
  show("cashResult", `Flujo neto: ${money(net)} u.m. · ${net >= 0 ? "Flujo positivo" : "Flujo negativo"}.`);
});
document.getElementById("compareMakeBuy").addEventListener("click", () => {
  const q = number("quantity"), make = number("fixedMake") + number("variableMake") * q;
  const buy = number("buyPrice") * q + number("buyExtra");
  if (q <= 0) return show("makeBuyResult", "La cantidad debe ser mayor que cero.");
  const choice = Math.abs(make-buy) < 0.005 ? "Ambas alternativas tienen el mismo costo." : `La alternativa de menor costo es ${make < buy ? "producir" : "comprar"}.`;
  show("makeBuyResult", `Producir: ${money(make)} u.m. · Comprar: ${money(buy)} u.m. · ${choice}`);
});
document.getElementById("calcEquity").addEventListener("click", () => {
  const assets = number("assets"), liabilities = number("liabilities");
  show("equityResult", `Patrimonio: ${money(assets-liabilities)} u.m. · ${money(assets)} = ${money(liabilities)} + ${money(assets-liabilities)}.`);
});
document.getElementById("calcVan").addEventListener("click", () => {
  const investment = number("initialInvestment"), rate = number("discountRate") / 100;
  if (investment < 0 || rate < 0) return show("vanResult", "Ingrese valores válidos y una tasa no negativa.");
  const flows = [number("cash1"), number("cash2"), number("cash3")];
  const van = flows.reduce((sum, flow, i) => sum + flow / Math.pow(1 + rate, i + 1), -investment);
  show("vanResult", `VAN: ${money(van)} u.m. · ${van > 0 ? "Crea valor bajo estos supuestos." : van < 0 ? "No alcanza la rentabilidad requerida." : "Recupera exactamente la tasa requerida."}`);
});

function npv(rate, investment, flows) {
  return flows.reduce((sum, flow, i) => sum + flow / Math.pow(1 + rate, i + 1), -investment);
}
document.getElementById("calcIrr").addEventListener("click", () => {
  const investment = number("irrInvestment");
  const flows = [number("irrCash1"), number("irrCash2"), number("irrCash3")];
  if (investment <= 0 || flows.every(x => x <= 0)) return show("irrResult", "Ingrese una inversión positiva y al menos un flujo positivo.");
  let low = -0.9999, high = 1;
  let fLow = npv(low, investment, flows), fHigh = npv(high, investment, flows);
  while (fLow * fHigh > 0 && high < 1e6) {
    high = high * 2 + 1;
    fHigh = npv(high, investment, flows);
  }
  if (fLow * fHigh > 0) return show("irrResult", "No se encontró una TIR única en el rango evaluado. Revise los flujos.");
  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2, fMid = npv(mid, investment, flows);
    if (Math.abs(fMid) < 1e-8) { low = high = mid; break; }
    if (fLow * fMid <= 0) { high = mid; fHigh = fMid; }
    else { low = mid; fLow = fMid; }
  }
  const irr = (low + high) / 2;
  show("irrResult", `TIR aproximada: ${money(irr * 100)}%`);
});

// Ejecuta los cálculos iniciales para que los resultados coincidan con los valores de ejemplo.
["calcMargin","calcProductivity","calcCash","compareMakeBuy","calcEquity","calcVan","calcIrr"].forEach(id => document.getElementById(id).click());

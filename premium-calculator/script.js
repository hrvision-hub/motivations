const salesPlanInput = document.querySelector("#salesPlan");
const workDaysInput = document.querySelector("#workDays");
const newRequestsPerDayInput = document.querySelector("#newRequestsPerDay");
const processedRequestsInput = document.querySelector("#processedRequests");
const monthlyMeetingsInput = document.querySelector("#monthlyMeetings");
const averageCheckInput = document.querySelector("#averageCheck");
const salaryInput = document.querySelector("#salaryInput");
const kpiInput = document.querySelector("#kpiInput");
const normalPremiumInput = document.querySelector("#normalPremiumInput");
const strongPremiumInput = document.querySelector("#strongPremiumInput");
const topPremiumInput = document.querySelector("#topPremiumInput");
const normalIncome = document.querySelector("#normalIncome");
const strongIncome = document.querySelector("#strongIncome");
const topIncome = document.querySelector("#topIncome");
const kpiCard = document.querySelector("#kpiCard");
const hideKpiButton = document.querySelector("#hideKpi");
const showKpiButton = document.querySelector("#showKpi");
const incomeContent = document.querySelector(".income-content");
const funnelTable = document.querySelector("#funnelTable");
const bonusTable = document.querySelector("#bonusTable");
const calculationTable = document.querySelector("#calculationTable");
const conversionStandardsTable = document.querySelector("#conversionStandardsTable");
const calculationTableWrap = calculationTable.closest(".table-wrap");
const conversionStandardsWrap = conversionStandardsTable.closest(".table-wrap");
const addFunnelRowButton = document.querySelector("#addFunnelRow");
const addBonusRowButton = document.querySelector("#addBonusRow");
const addCalculationRowButton = document.querySelector("#addCalculationRow");
const addConversionStandardRowButton = document.querySelector("#addConversionStandardRow");
const toggleIncomeScenariosButton = document.querySelector("#toggleIncomeScenarios");
const toggleCalculationTableButton = document.querySelector("#toggleCalculationTable");
const toggleConversionStandardsButton = document.querySelector("#toggleConversionStandards");
const saveDataButton = document.querySelector("#saveData");
const saveStatus = document.querySelector("#saveStatus");
const STORAGE_KEY = "premiumCalculatorData";

function toNumber(value) {
  const normalizedValue = String(value)
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace("%", "")
    .trim();
  const number = Number(normalizedValue);

  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return Math.round(value).toLocaleString("ru-RU");
}

function formatCurrency(value) {
  return `${formatNumber(value)} ₽`;
}

function formatDecimal(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  const rounded = Number(value.toFixed(digits));

  return rounded.toLocaleString("ru-RU", {
    maximumFractionDigits: digits,
  });
}

function formatPercent(value, digits = 0) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return `${formatDecimal(value, digits)}%`;
}

function formatInputMoney(value) {
  const number = toNumber(value);

  return number ? Math.round(number).toLocaleString("ru-RU") : "";
}

function formatMoneyInputs() {
  document.querySelectorAll(".money-input").forEach((input) => {
    input.value = formatInputMoney(input.value);
  });
}

function parsePercent(value) {
  return toNumber(value);
}

function getFunnelConversionPercent(index) {
  const conversionCells = Array.from(funnelTable.querySelectorAll(".conversion"));

  return parsePercent(conversionCells[index]?.textContent || "0");
}

function getFunnelConversion(index) {
  return getFunnelConversionPercent(index) / 100;
}

function getBonusRanges() {
  return Array.from(bonusTable.querySelectorAll("tbody tr")).map((row) => {
    const inputs = row.querySelectorAll("input");
    const from = parsePercent(inputs[0]?.value || "0");
    const rawTo = String(inputs[1]?.value || "").toLowerCase();
    const to = rawTo.includes("выше") ? Infinity : parsePercent(rawTo);
    const percent = parsePercent(inputs[2]?.value || "0");

    return { from, to, percent };
  });
}

function getManagerPercent(planPercent) {
  const range = getBonusRanges().find((item) => planPercent >= item.from && planPercent <= item.to);

  return range ? range.percent : 0;
}

function updateFunnelConversions() {
  const rows = Array.from(funnelTable.querySelectorAll("tbody tr"));

  rows.forEach((row, index) => {
    const conversionCell = row.querySelector(".conversion");
    const currentValue = Number(row.querySelector(".funnel-value").value);

    if (index === 0) {
      conversionCell.textContent = "-";
      return;
    }

    const previousValue = Number(rows[index - 1].querySelector(".funnel-value").value);
    const conversion = previousValue > 0 ? (currentValue / previousValue) * 100 : NaN;

    conversionCell.textContent = formatPercent(conversion);
  });
}

function calculateThroughFunnel(startValue, lastConversionIndex) {
  let result = Math.round(startValue);

  for (let index = 1; index <= lastConversionIndex; index += 1) {
    result = Math.round(result * getFunnelConversion(index));
  }

  return result;
}

function updateNorms() {
  const workDays = Number(workDaysInput.value) || 0;
  const newRequestsPerDay = Number(newRequestsPerDayInput.value) || 0;
  const processedRequests = Math.round(workDays * newRequestsPerDay);
  const monthlyMeetings = calculateThroughFunnel(processedRequests, 4);

  processedRequestsInput.value = formatNumber(processedRequests);
  monthlyMeetingsInput.value = formatNumber(monthlyMeetings);
}

function getKpiValue() {
  return kpiCard.hidden ? 0 : toNumber(kpiInput.value);
}

function updateIncomeScenarios() {
  const salary = toNumber(salaryInput.value);
  const kpi = getKpiValue();

  normalIncome.textContent = formatCurrency(salary + kpi + toNumber(normalPremiumInput.value));
  strongIncome.textContent = formatCurrency(salary + kpi + toNumber(strongPremiumInput.value));
  topIncome.textContent = formatCurrency(salary + kpi + toNumber(topPremiumInput.value));
}

function createCalculationRow() {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td data-field="leads"></td>
    <td data-field="answered"></td>
    <td data-field="qualified"></td>
    <td data-field="meetingSet"></td>
    <td data-field="meetingDone"></td>
    <td data-field="deals"></td>
    <td data-field="sales"></td>
    <td data-field="planPercent"></td>
    <td data-field="managerPercent"></td>
    <td data-field="premium"></td>
  `;

  return row;
}

function createFunnelRow(stage = "Новая стадия", value = "") {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="text"></td>
    <td><input class="funnel-value" type="number" min="0" step="1"></td>
    <td class="conversion">-</td>
    <td><button class="icon-button remove-row" type="button" aria-label="Удалить строку">x</button></td>
  `;

  const inputs = row.querySelectorAll("input");
  inputs[0].value = stage;
  inputs[1].value = value;

  return row;
}

function getBonusClass(index) {
  if (index === 0) {
    return "bonus-low";
  }

  if (index === 1) {
    return "bonus-middle";
  }

  if (index === 2) {
    return "bonus-good";
  }

  return "bonus-best";
}

function applyBonusRowClasses() {
  Array.from(bonusTable.querySelectorAll("tbody tr")).forEach((row, index) => {
    row.className = getBonusClass(index);
  });
}

function createBonusRow(from = "", to = "", percent = "") {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="text"></td>
    <td><input type="text"></td>
    <td><input type="text"></td>
  `;

  const inputs = row.querySelectorAll("input");
  inputs[0].value = from;
  inputs[1].value = to;
  inputs[2].value = percent;

  return row;
}

function getStandardLabel(status) {
  const labels = {
    below: "Ниже нормы",
    normal: "Норма",
    good: "Хорошо",
    excellent: "Отлично",
  };

  return labels[status] || labels.normal;
}

function createConversionStandardRow(from = "", to = "", percent = "", status = "normal") {
  const row = document.createElement("tr");
  const statuses = ["below", "normal", "good", "excellent"];

  row.dataset.status = status;
  row.innerHTML = `
    <td><input type="text" placeholder="Стадия"></td>
    <td><input type="text" placeholder="Стадия"></td>
    <td class="percent-cell"><input class="standard-percent" type="number" min="0" max="100" step="0.1"></td>
    <td>
      <div class="status-actions">
        <select class="standard-status">
          ${statuses.map((item) => `<option value="${item}">${getStandardLabel(item)}</option>`).join("")}
        </select>
        <button class="icon-button remove-standard-row" type="button" aria-label="Удалить строку">x</button>
      </div>
    </td>
  `;

  const inputs = row.querySelectorAll("input");
  const select = row.querySelector("select");
  inputs[0].value = from;
  inputs[1].value = to;
  inputs[2].value = percent;
  select.value = status;

  return row;
}

function updateCalculationTable() {
  const rows = Array.from(calculationTable.querySelectorAll("tbody tr"));
  const newRequestsPerDay = Number(newRequestsPerDayInput.value) || 0;
  const averageCheck = toNumber(averageCheckInput.value);
  const salesPlan = toNumber(salesPlanInput.value);

  const answeredConversion = getFunnelConversion(1);
  const qualifiedConversion = getFunnelConversion(2);
  const meetingSetConversion = getFunnelConversion(3);
  const meetingDoneConversion = getFunnelConversion(4);
  const dealsConversion = getFunnelConversion(5);

  rows.forEach((row, index) => {
    const leads = newRequestsPerDay * (index + 1);
    const answered = leads * answeredConversion;
    const qualified = answered * qualifiedConversion;
    const meetingSet = qualified * meetingSetConversion;
    const meetingDone = meetingSet * meetingDoneConversion;
    const deals = Math.floor(meetingDone * dealsConversion);
    const sales = deals * averageCheck;
    const planPercent = salesPlan > 0 ? (sales / salesPlan) * 100 : 0;
    const managerPercent = getManagerPercent(planPercent);
    const premium = sales * (managerPercent / 100);

    row.querySelector('[data-field="leads"]').textContent = formatDecimal(leads);
    row.querySelector('[data-field="answered"]').textContent = formatDecimal(answered);
    row.querySelector('[data-field="qualified"]').textContent = formatDecimal(qualified);
    row.querySelector('[data-field="meetingSet"]').textContent = formatDecimal(meetingSet);
    row.querySelector('[data-field="meetingDone"]').textContent = formatDecimal(meetingDone);
    row.querySelector('[data-field="deals"]').textContent = formatNumber(deals);
    row.querySelector('[data-field="sales"]').textContent = formatNumber(sales);
    row.querySelector('[data-field="planPercent"]').textContent = formatPercent(planPercent);
    row.querySelector('[data-field="managerPercent"]').textContent = formatPercent(managerPercent, 2);
    row.querySelector('[data-field="premium"]').textContent = formatNumber(premium);
  });
}

function updateAllCalculations() {
  updateFunnelConversions();
  updateNorms();
  updateIncomeScenarios();
  applyBonusRowClasses();
  updateCalculationTable();
}

function addFunnelRow() {
  const tbody = funnelTable.querySelector("tbody");

  tbody.append(createFunnelRow());
  updateAllCalculations();
}

function removeFunnelRow(button) {
  const rows = funnelTable.querySelectorAll("tbody tr");

  if (rows.length <= 1) {
    return;
  }

  button.closest("tr").remove();
  updateAllCalculations();
}

function addCalculationRow() {
  calculationTable.querySelector("tbody").append(createCalculationRow());
  updateCalculationTable();
}

function addBonusRow() {
  bonusTable.querySelector("tbody").append(createBonusRow("100%", "и выше", "4%"));
  updateAllCalculations();
}

function addConversionStandardRow() {
  conversionStandardsTable.querySelector("tbody").append(createConversionStandardRow("", "", "", "excellent"));
}

function removeConversionStandardRow(button) {
  const rows = conversionStandardsTable.querySelectorAll("tbody tr");

  if (rows.length <= 1) {
    return;
  }

  button.closest("tr").remove();
}

function updateConversionStandardStatus(select) {
  select.closest("tr").dataset.status = select.value;
}

function toggleKpi(show) {
  kpiCard.hidden = !show;
  showKpiButton.hidden = show;
  updateIncomeScenarios();
}

function toggleTableVisibility(target, button, show) {
  target.classList.toggle("is-hidden", !show);
  button.textContent = show ? "Скрыть" : "Показать";
}

function switchTableVisibility(target, button) {
  toggleTableVisibility(target, button, target.classList.contains("is-hidden"));
}

function clampStandardPercent(input) {
  const value = toNumber(input.value);

  if (input.value === "") {
    return;
  }

  input.value = Math.min(100, Math.max(0, value));
}

function saveData() {
  const data = {
    simpleInputs: {
      salesPlan: salesPlanInput.value,
      workDays: workDaysInput.value,
      newRequestsPerDay: newRequestsPerDayInput.value,
      averageCheck: averageCheckInput.value,
      plannedDeals: document.querySelector("#plannedDeals")?.value || "",
      salaryInput: salaryInput.value,
      kpiInput: kpiInput.value,
      normalPremiumInput: normalPremiumInput.value,
      strongPremiumInput: strongPremiumInput.value,
      topPremiumInput: topPremiumInput.value,
    },
    kpiHidden: kpiCard.hidden,
    incomeScenariosHidden: incomeContent.classList.contains("is-hidden"),
    calculationHidden: calculationTableWrap.classList.contains("is-hidden"),
    conversionStandardsHidden: conversionStandardsWrap.classList.contains("is-hidden"),
    funnelRows: Array.from(funnelTable.querySelectorAll("tbody tr")).map((row) => {
      const inputs = row.querySelectorAll("input");

      return {
        stage: inputs[0]?.value || "",
        value: inputs[1]?.value || "",
      };
    }),
    bonusRows: Array.from(bonusTable.querySelectorAll("tbody tr")).map((row) => {
      const inputs = row.querySelectorAll("input");

      return {
        from: inputs[0]?.value || "",
        to: inputs[1]?.value || "",
        percent: inputs[2]?.value || "",
      };
    }),
    conversionStandardRows: Array.from(conversionStandardsTable.querySelectorAll("tbody tr")).map((row) => {
      const inputs = row.querySelectorAll("input");
      const select = row.querySelector("select");

      return {
        from: inputs[0]?.value || "",
        to: inputs[1]?.value || "",
        percent: inputs[2]?.value || "",
        status: select?.value || "normal",
      };
    }),
    calculationRowCount: calculationTable.querySelectorAll("tbody tr").length,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  saveStatus.textContent = "Сохранено";
  window.setTimeout(() => {
    saveStatus.textContent = "";
  }, 2000);
}

function restoreData() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return;
  }

  let data;

  try {
    data = JSON.parse(savedData);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  const funnelBody = funnelTable.querySelector("tbody");
  const bonusBody = bonusTable.querySelector("tbody");
  const calculationBody = calculationTable.querySelector("tbody");
  const standardsBody = conversionStandardsTable.querySelector("tbody");

  if (data.simpleInputs) {
    Object.entries(data.simpleInputs).forEach(([id, value]) => {
      const input = document.querySelector(`#${id}`);

      if (input) {
        input.value = value;
      }
    });
  } else if (Array.isArray(data.inputs)) {
    document.querySelectorAll("input").forEach((input, index) => {
      if (!input.readOnly && data.inputs[index] !== undefined) {
        input.value = data.inputs[index];
      }
    });
  }

  if (typeof data.kpiHidden === "boolean") {
    toggleKpi(!data.kpiHidden);
  }

  if (typeof data.incomeScenariosHidden === "boolean") {
    toggleTableVisibility(incomeContent, toggleIncomeScenariosButton, !data.incomeScenariosHidden);
  }

  if (typeof data.calculationHidden === "boolean") {
    toggleTableVisibility(calculationTableWrap, toggleCalculationTableButton, !data.calculationHidden);
  }

  if (typeof data.conversionStandardsHidden === "boolean") {
    toggleTableVisibility(conversionStandardsWrap, toggleConversionStandardsButton, !data.conversionStandardsHidden);
  }

  if (Array.isArray(data.funnelRows) && data.funnelRows.length) {
    funnelBody.innerHTML = "";

    data.funnelRows.forEach((item) => {
      funnelBody.append(createFunnelRow(item.stage, item.value));
    });
  }

  if (Array.isArray(data.bonusRows) && data.bonusRows.length) {
    bonusBody.innerHTML = "";

    data.bonusRows.forEach((item) => {
      bonusBody.append(createBonusRow(item.from, item.to, item.percent));
    });
  }

  if (data.calculationRowCount) {
    calculationBody.innerHTML = "";

    for (let index = 0; index < data.calculationRowCount; index += 1) {
      calculationBody.append(createCalculationRow());
    }
  }

  if (Array.isArray(data.conversionStandardRows) && data.conversionStandardRows.length) {
    standardsBody.innerHTML = "";

    data.conversionStandardRows.forEach((item) => {
      standardsBody.append(createConversionStandardRow(
        item.from,
        item.to,
        item.percent || item.currentPercent || item.standardPercent || "",
        item.status
      ));
    });
  }
}

document.addEventListener("input", (event) => {
  if (event.target.classList.contains("money-input")) {
    event.target.value = formatInputMoney(event.target.value);
  }

  if (event.target.classList.contains("standard-percent")) {
    clampStandardPercent(event.target);
  }

  updateAllCalculations();
});

funnelTable.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove-row")) {
    removeFunnelRow(event.target);
  }
});

conversionStandardsTable.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove-standard-row")) {
    removeConversionStandardRow(event.target);
  }
});

conversionStandardsTable.addEventListener("change", (event) => {
  if (event.target.classList.contains("standard-status")) {
    updateConversionStandardStatus(event.target);
  }
});

addFunnelRowButton.addEventListener("click", addFunnelRow);
addBonusRowButton.addEventListener("click", addBonusRow);
addCalculationRowButton.addEventListener("click", addCalculationRow);
addConversionStandardRowButton.addEventListener("click", addConversionStandardRow);
toggleIncomeScenariosButton.addEventListener("click", () => {
  switchTableVisibility(incomeContent, toggleIncomeScenariosButton);
});
toggleCalculationTableButton.addEventListener("click", () => {
  switchTableVisibility(calculationTableWrap, toggleCalculationTableButton);
});
toggleConversionStandardsButton.addEventListener("click", () => {
  switchTableVisibility(conversionStandardsWrap, toggleConversionStandardsButton);
});
hideKpiButton.addEventListener("click", () => toggleKpi(false));
showKpiButton.addEventListener("click", () => toggleKpi(true));
saveDataButton.addEventListener("click", saveData);
restoreData();
formatMoneyInputs();
applyBonusRowClasses();
updateAllCalculations();

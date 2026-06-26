const salesPlanInput = document.querySelector("#salesPlan");
const workDaysInput = document.querySelector("#workDays");
const newRequestsPerDayInput = document.querySelector("#newRequestsPerDay");
const processedRequestsInput = document.querySelector("#processedRequests");
const monthlyMeetingsInput = document.querySelector("#monthlyMeetings");
const averageCheckInput = document.querySelector("#averageCheck");
const plannedDealsInput = document.querySelector("#plannedDeals");
const salaryInput = document.querySelector("#salaryInput");
const probationSalaryInput = document.querySelector("#probationSalaryInput");
const probationSalaryLabelInput = document.querySelector("#probationSalaryLabel");
const probationSalaryCard = document.querySelector("#probationSalaryCard");
const hideProbationSalaryButton = document.querySelector("#hideProbationSalary");
const showProbationSalaryButton = document.querySelector("#showProbationSalary");
const probationAverageCard = document.querySelector("#probationAverageCard");
const probationAverageLabelInput = document.querySelector("#probationAverageLabel");
const probationAverageIncome = document.querySelector("#probationAverageIncome");
const hideProbationAverageButton = document.querySelector("#hideProbationAverage");
const showProbationAverageButton = document.querySelector("#showProbationAverage");
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
const incomePathCard = document.querySelector("#incomePathCard");
const toggleIncomePathButton = document.querySelector("#toggleIncomePath");
const targetIncomeInput = document.querySelector("#targetIncomeInput");
const incomePathResult = document.querySelector("#incomePathResult");
const funnelTable = document.querySelector("#funnelTable");
const bonusTable = document.querySelector("#bonusTable");
const calculationTable = document.querySelector("#calculationTable");
const conversionStandardsTable = document.querySelector("#conversionStandardsTable");
const incomeDynamicsTable = document.querySelector("#incomeDynamicsTable");
const incomeDynamicsContent = document.querySelector("#incomeDynamicsContent");
const calculationTableWrap = calculationTable.closest(".table-wrap");
const conversionStandardsWrap = conversionStandardsTable.closest(".table-wrap");
const paybackBlock = document.querySelector("#paybackBlock");
const paybackChartWrap = document.querySelector("#paybackChartWrap");
const paybackSummary = document.querySelector("#paybackSummary");
const exportExcelButton = document.querySelector("#exportExcel");
const addFunnelRowButton = document.querySelector("#addFunnelRow");
const addBonusRowButton = document.querySelector("#addBonusRow");
const addCalculationRowButton = document.querySelector("#addCalculationRow");
const addConversionStandardRowButton = document.querySelector("#addConversionStandardRow");
const toggleIncomeScenariosButton = document.querySelector("#toggleIncomeScenarios");
const toggleCalculationTableButton = document.querySelector("#toggleCalculationTable");
const toggleConversionStandardsButton = document.querySelector("#toggleConversionStandards");
const toggleIncomeDynamicsButton = document.querySelector("#toggleIncomeDynamics");
const togglePaybackChartButton = document.querySelector("#togglePaybackChart");
const saveDataButton = document.querySelector("#saveData");
const saveStatus = document.querySelector("#saveStatus");
const STORAGE_KEY = "premiumCalculatorData";
const STAGE_OPTIONS = [
  "Лид взят в работу",
  "Лид ответил",
  "Лид квалифицирован",
  "Встреча назначена",
  "Встреча состоялась",
  "Состоявшихся сделок",
];
let incomeDynamicsChart;
let paybackChart;
let xlsxLoadingPromise;
const currencyLabelsPlugin = {
  id: "currencyLabels",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;

    ctx.save();
    ctx.font = "700 12px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);

      if (meta.hidden) {
        return;
      }

      meta.data.forEach((element, index) => {
        const value = dataset.data[index];

        if (!Number.isFinite(value)) {
          return;
        }

        const position = element.tooltipPosition();
        const isBar = dataset.type === "bar";
        const isNegative = value < 0;
        const label = dataset.label || "";
        const color = label === "Совокупный доход"
          ? "#134e4a"
          : label.includes("Выручка")
          ? "#14532d"
          : label.includes("доход")
            ? "#1e3a8a"
            : (isNegative ? "#991b1b" : "#065f46");
        const offset = label === "Совокупный доход"
          ? -14
          : label.includes("Выручка")
          ? -24
          : label.includes("доход")
            ? 18
            : (isBar && isNegative ? 22 : -8);

        ctx.fillStyle = color;
        ctx.fillText(formatCurrency(value), position.x, position.y + offset);
      });
    });

    ctx.restore();
  },
};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

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

function roundHalfDown(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const integerPart = Math.floor(value);
  const fraction = value - integerPart;

  return fraction <= 0.5 ? integerPart : Math.ceil(value);
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

function getFunnelStages() {
  return Array.from(funnelTable.querySelectorAll("tbody tr")).map((row, index) => {
    const input = row.querySelector("td:first-child input");
    const name = input?.value.trim() || `Стадия ${index + 1}`;

    return {
      name,
      conversion: index === 0 ? 1 : getFunnelConversion(index),
    };
  });
}

function getDealStageIndex(stages = getFunnelStages()) {
  return Math.max(0, stages.length - 1);
}

function getMeetingStageIndex(stages = getFunnelStages()) {
  const index = stages.findIndex((stage) => stage.name.toLowerCase().includes("встреч") && stage.name.toLowerCase().includes("состоя"));

  return index >= 0 ? index : Math.max(0, stages.length - 2);
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

  rows.forEach((row) => {
    const actionCell = row.querySelector("td:last-child");

    if (actionCell && !actionCell.querySelector(".move-row-up")) {
      actionCell.innerHTML = `
        <div class="row-actions">
          <button class="icon-button move-row-up" type="button" aria-label="Переместить вверх">↑</button>
          <button class="icon-button move-row-down" type="button" aria-label="Переместить вниз">↓</button>
          <button class="icon-button remove-row" type="button" aria-label="Удалить строку">x</button>
        </div>
      `;
    }
  });

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

function calculateThroughFunnel(startValue, lastConversionIndex = getMeetingStageIndex()) {
  let result = Math.round(startValue);

  for (let index = 1; index <= lastConversionIndex; index += 1) {
    result = Math.round(result * getFunnelConversion(index));
  }

  return result;
}

function updateNorms() {
  const workDays = Number(workDaysInput.value) || 0;
  const newRequestsPerDay = Number(newRequestsPerDayInput.value) || 0;
  const salesPlan = toNumber(salesPlanInput.value);
  const averageCheck = toNumber(averageCheckInput.value);
  const processedRequests = Math.round(workDays * newRequestsPerDay);
  const monthlyMeetings = calculateThroughFunnel(processedRequests);
  const plannedDeals = averageCheck > 0 ? roundHalfDown(salesPlan / averageCheck) : 0;

  processedRequestsInput.value = formatNumber(processedRequests);
  monthlyMeetingsInput.value = formatNumber(monthlyMeetings);
  plannedDealsInput.value = formatNumber(plannedDeals);
}

function getKpiValue() {
  return kpiCard.classList.contains("is-collapsed") ? 0 : toNumber(kpiInput.value);
}

function getProbationSalaryValue() {
  return probationSalaryCard.classList.contains("is-collapsed") ? 0 : toNumber(probationSalaryInput.value);
}

function updateIncomeScenarios() {
  const salary = toNumber(salaryInput.value);
  const probationSalary = getProbationSalaryValue();
  const kpi = getKpiValue();
  const normalPremium = toNumber(normalPremiumInput.value);

  probationAverageIncome.textContent = formatCurrency(probationSalary + kpi + normalPremium);
  normalIncome.textContent = formatCurrency(salary + kpi + normalPremium);
  strongIncome.textContent = formatCurrency(salary + kpi + toNumber(strongPremiumInput.value));
  topIncome.textContent = formatCurrency(salary + kpi + toNumber(topPremiumInput.value));
}

function getPremiumForDeals(deals) {
  const targetDeals = Math.floor(Number(deals) || 0);
  const dealIndex = getDealStageIndex();
  const rows = Array.from(calculationTable.querySelectorAll("tbody tr"))
    .map((row) => ({
      deals: Math.floor(toNumber(row.querySelector(`[data-stage-index="${dealIndex}"]`)?.textContent || "0")),
      premium: toNumber(row.querySelector('[data-field="premium"]')?.textContent || "0"),
    }))
    .filter((item) => Number.isFinite(item.deals) && item.deals <= targetDeals)
    .sort((a, b) => a.deals - b.deals);

  const exactRow = rows.find((item) => item.deals === targetDeals);

  if (exactRow) {
    return exactRow.premium;
  }

  const averageCheck = toNumber(averageCheckInput.value);
  const salesPlan = toNumber(salesPlanInput.value);
  const sales = targetDeals * averageCheck;
  const planPercent = salesPlan > 0 ? (sales / salesPlan) * 100 : 0;

  return sales * (getManagerPercent(planPercent) / 100);
}

function getCalculationMetricsFromTable() {
  const stages = getFunnelStages();
  const meetingIndex = getMeetingStageIndex(stages);
  const dealIndex = getDealStageIndex(stages);

  return Array.from(calculationTable.querySelectorAll("tbody tr")).map((row) => ({
    leads: toNumber(row.querySelector('[data-stage-index="0"]')?.textContent || "0"),
    meetingDone: toNumber(row.querySelector(`[data-stage-index="${meetingIndex}"]`)?.textContent || "0"),
    deals: toNumber(row.querySelector(`[data-stage-index="${dealIndex}"]`)?.textContent || "0"),
    sales: toNumber(row.querySelector('[data-field="sales"]')?.textContent || "0"),
    premium: toNumber(row.querySelector('[data-field="premium"]')?.textContent || "0"),
  })).filter((item) => item.deals >= 0);
}

function getExactPremiumMatch(requiredPremium, fixedIncome) {
  return getCalculationMetricsFromTable()
    .map((item) => ({ ...item, income: fixedIncome + item.premium }))
    .find((item) => Math.abs(item.premium - requiredPremium) < 1);
}

function interpolateValue(from, to, ratio) {
  return from + (to - from) * ratio;
}

function getPremiumPathFromTable(requiredPremium, fixedIncome) {
  const rows = getCalculationMetricsFromTable()
    .filter((item) => item.premium >= 0)
    .sort((a, b) => a.premium - b.premium);

  const exactMatch = rows.find((item) => Math.abs(item.premium - requiredPremium) < 1);

  if (exactMatch) {
    return {
      ...exactMatch,
      premium: requiredPremium,
      income: fixedIncome + requiredPremium,
    };
  }

  for (let index = 1; index < rows.length; index += 1) {
    const previous = rows[index - 1];
    const current = rows[index];

    if (previous.premium <= requiredPremium && current.premium >= requiredPremium && current.premium !== previous.premium) {
      const ratio = (requiredPremium - previous.premium) / (current.premium - previous.premium);

      return {
        leads: interpolateValue(previous.leads, current.leads, ratio),
        meetingDone: interpolateValue(previous.meetingDone, current.meetingDone, ratio),
        deals: interpolateValue(previous.deals, current.deals, ratio),
        sales: interpolateValue(previous.sales, current.sales, ratio),
        premium: requiredPremium,
        income: fixedIncome + requiredPremium,
      };
    }
  }

  return null;
}

function getRevenueForRequiredPremium(requiredPremium, context) {
  const ranges = getBonusRanges()
    .filter((range) => range.percent > 0)
    .sort((a, b) => a.from - b.from);

  if (!ranges.length || context.salesPlan <= 0) {
    return null;
  }

  const exactRange = ranges.find((range) => {
    const revenue = requiredPremium / (range.percent / 100);
    const planPercent = (revenue / context.salesPlan) * 100;

    return planPercent >= range.from && planPercent <= range.to;
  });

  if (exactRange) {
    return requiredPremium / (exactRange.percent / 100);
  }

  const nearestRange = ranges
    .map((range) => {
      const revenue = requiredPremium / (range.percent / 100);
      const planPercent = (revenue / context.salesPlan) * 100;
      const distance = planPercent < range.from
        ? range.from - planPercent
        : planPercent - range.to;

      return {
        revenue,
        distance,
      };
    })
    .sort((a, b) => a.distance - b.distance)[0];

  return nearestRange?.revenue || null;
}

function getReverseMetricsForPremium(requiredPremium, fixedIncome, context) {
  const sales = getRevenueForRequiredPremium(requiredPremium, context);

  if (!sales || context.averageCheck <= 0) {
    return null;
  }

  const deals = sales / context.averageCheck;
  const stageValues = Array(context.stages.length).fill(0);
  const dealIndex = getDealStageIndex(context.stages);
  const meetingIndex = getMeetingStageIndex(context.stages);

  stageValues[dealIndex] = deals;

  for (let index = dealIndex; index > 0; index -= 1) {
    const conversion = context.stages[index].conversion;

    stageValues[index - 1] = conversion > 0 ? stageValues[index] / conversion : 0;
  }

  return {
    leads: stageValues[0] || 0,
    meetingDone: stageValues[meetingIndex] || 0,
    deals,
    sales,
    premium: requiredPremium,
    income: fixedIncome + requiredPremium,
  };
}

function getExtendedIncomePath(targetIncome) {
  const salary = toNumber(salaryInput.value);
  const kpi = getKpiValue();
  const fixedIncome = salary + kpi;
  const context = getCalculationContext();

  if (targetIncome <= fixedIncome) {
    return {
      coveredByFixed: true,
      leads: 0,
      meetingDone: 0,
      deals: 0,
      sales: 0,
      premium: 0,
      income: fixedIncome,
    };
  }

  const requiredPremium = targetIncome - fixedIncome;
  const tablePath = getPremiumPathFromTable(requiredPremium, fixedIncome);

  if (tablePath) {
    return tablePath;
  }

  return getReverseMetricsForPremium(requiredPremium, fixedIncome, context);
}

function updateIncomePath() {
  const targetIncome = toNumber(targetIncomeInput.value);

  if (!targetIncome) {
    incomePathResult.innerHTML = '<div class="income-path-message">Введите желаемый доход, чтобы увидеть путь по воронке.</div>';
    return;
  }

  const path = getExtendedIncomePath(targetIncome);

  if (!path) {
    incomePathResult.innerHTML = '<div class="income-path-message">Для такого дохода нужно увеличить плановые показатели или добавить больше строк в таблицу "Расчет премии".</div>';
    return;
  }

  const fixedMessage = path.coveredByFixed
    ? '<div class="income-path-message">Этот доход уже покрывается фиксированной частью</div>'
    : '';
  const workDays = Number(workDaysInput.value) || 0;
  const leadsPerDay = workDays > 0 ? path.leads / workDays : path.leads;

  incomePathResult.innerHTML = `
    ${fixedMessage}
    <div class="income-path-step">${formatDecimal(leadsPerDay)} лидов в день</div>
    <div class="income-path-arrow">↓</div>
    <div class="income-path-step">${formatDecimal(path.meetingDone)} встреч в месяц</div>
    <div class="income-path-arrow">↓</div>
    <div class="income-path-step">${formatDecimal(path.deals)} сделок в месяц</div>
    <div class="income-path-arrow">↓</div>
    <div class="income-path-step">${formatCurrency(path.sales)} выручки</div>
    <div class="income-path-arrow">↓</div>
    <div class="income-path-step">${formatCurrency(path.premium)} премии</div>
    <div class="income-path-arrow">↓</div>
    <div class="income-path-total">${formatCurrency(path.income)} совокупный доход</div>
  `;
}

function getMonthAnalytics() {
  const salary = toNumber(salaryInput.value);
  const kpi = getKpiValue();
  const averageCheck = toNumber(averageCheckInput.value);

  return Array.from(incomeDynamicsTable.querySelectorAll("tbody tr")).map((row) => {
    const month = row.querySelector(".month-name").value || "Месяц";
    const deals = Math.floor(Number(row.querySelector(".month-deals").value) || 0);
    const premium = getPremiumForDeals(deals);
    const income = salary + kpi + premium;
    const revenue = deals * averageCheck;
    const difference = revenue - income;

    row.querySelector(".month-income").textContent = formatCurrency(income);

    return { month, deals, premium, income, revenue, difference };
  });
}

function createCalculationRow() {
  const row = document.createElement("tr");
  const stages = getFunnelStages();

  row.innerHTML = `
    ${stages.map((stage, index) => `<td data-stage-index="${index}"></td>`).join("")}
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
    <td>
      <div class="row-actions">
        <button class="icon-button move-row-up" type="button" aria-label="Переместить вверх">↑</button>
        <button class="icon-button move-row-down" type="button" aria-label="Переместить вниз">↓</button>
        <button class="icon-button remove-row" type="button" aria-label="Удалить строку">x</button>
      </div>
    </td>
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
  const rows = Array.from(bonusTable.querySelectorAll("tbody tr"));

  rows.forEach((row, index) => {
    row.className = getBonusClass(index);
    const cells = row.querySelectorAll("td");
    const inputs = row.querySelectorAll("input");
    const isLast = index === rows.length - 1;

    cells[0]?.classList.add("percent-cell");
    cells[2]?.classList.add("percent-cell");

    inputs[0]?.classList.add("bonus-percent-input");
    inputs[2]?.classList.add("bonus-percent-input");

    if (isLast) {
      cells[1]?.classList.remove("percent-cell");
      inputs[1].type = "text";
      inputs[1].readOnly = true;
      inputs[1].value = "и выше";
      inputs[1].classList.add("bonus-above-input");
    } else {
      cells[1]?.classList.add("percent-cell");
      inputs[1].type = "number";
      inputs[1].readOnly = false;
      inputs[1].min = "0";
      inputs[1].step = "0.1";
      inputs[1].classList.add("bonus-percent-input", "bonus-to-input");

      if (String(inputs[1].value).toLowerCase().includes("выше")) {
        inputs[1].value = "";
      }
    }
  });
}

function normalizePercentValue(value) {
  return String(value).trim() === "" ? "" : parsePercent(value);
}

function createBonusRow(from = "", to = "", percent = "") {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="percent-cell"><input class="bonus-percent-input" type="number" min="0" step="0.1"></td>
    <td class="percent-cell"><input class="bonus-percent-input bonus-to-input" type="number" min="0" step="0.1"></td>
    <td class="percent-cell"><input class="bonus-percent-input" type="number" min="0" step="0.1"></td>
    <td><button class="icon-button remove-bonus-row" type="button" aria-label="Удалить строку">x</button></td>
  `;

  const inputs = row.querySelectorAll("input");
  inputs[0].value = normalizePercentValue(from);
  inputs[1].value = String(to).toLowerCase().includes("выше") ? "" : normalizePercentValue(to);
  inputs[2].value = normalizePercentValue(percent);

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

function createStageOptions(selectedValue = "") {
  const stages = getFunnelStages().map((stage) => stage.name);

  return stages.map((stage) => (
    `<option${stage === selectedValue ? " selected" : ""}>${stage}</option>`
  )).join("");
}

function updateConversionStageSelects() {
  conversionStandardsTable.querySelectorAll(".standard-stage-from, .standard-stage-to").forEach((select) => {
    const selectedValue = select.value;

    select.innerHTML = createStageOptions(selectedValue);
    select.value = Array.from(select.options).some((option) => option.value === selectedValue)
      ? selectedValue
      : select.options[0]?.value || "";
  });
}

function createConversionStandardRow(from = "", to = "", percent = "", status = "normal") {
  const row = document.createElement("tr");
  const statuses = ["below", "normal", "good", "excellent"];

  row.dataset.status = status;
  row.innerHTML = `
    <td><select class="standard-stage-from">${createStageOptions(from)}</select></td>
    <td><select class="standard-stage-to">${createStageOptions(to)}</select></td>
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
  const statusSelect = row.querySelector(".standard-status");

  inputs[0].value = percent;
  statusSelect.value = status;

  return row;
}

function getCalculationContext() {
  const averageCheck = toNumber(averageCheckInput.value);
  const salesPlan = toNumber(salesPlanInput.value);
  const workDays = Number(workDaysInput.value) || 0;
  const stages = getFunnelStages();

  return {
    averageCheck,
    salesPlan,
    workDays,
    stages,
    answeredConversion: getFunnelConversion(1),
    qualifiedConversion: getFunnelConversion(2),
    meetingSetConversion: getFunnelConversion(3),
    meetingDoneConversion: getFunnelConversion(4),
    dealsConversion: getFunnelConversion(5),
  };
}

function calculateCalculationMetrics(leads, context = getCalculationContext()) {
  const stageValues = context.stages.map((stage, index) => {
    if (index === 0) {
      return leads;
    }

    return 0;
  });

  for (let index = 1; index < context.stages.length; index += 1) {
    stageValues[index] = stageValues[index - 1] * context.stages[index].conversion;
  }

  const dealIndex = getDealStageIndex(context.stages);
  const deals = Math.floor(stageValues[dealIndex] || 0);
  stageValues[dealIndex] = deals;
  const sales = deals * context.averageCheck;
  const planPercent = context.salesPlan > 0 ? (sales / context.salesPlan) * 100 : 0;
  const managerPercent = getManagerPercent(planPercent);
  const premium = sales * (managerPercent / 100);

  return {
    stageValues,
    deals,
    sales,
    planPercent,
    managerPercent,
    premium,
  };
}

function fillCalculationRow(row, metrics) {
  const dealIndex = getDealStageIndex();

  metrics.stageValues.forEach((value, index) => {
    const cell = row.querySelector(`[data-stage-index="${index}"]`);

    if (cell) {
      cell.textContent = index === dealIndex ? formatNumber(value) : formatDecimal(value);
    }
  });

  row.querySelector('[data-field="sales"]').textContent = formatNumber(metrics.sales);
  row.querySelector('[data-field="planPercent"]').textContent = formatPercent(metrics.planPercent);
  row.querySelector('[data-field="managerPercent"]').textContent = formatPercent(metrics.managerPercent, 2);
  row.querySelector('[data-field="premium"]').textContent = formatNumber(metrics.premium);
}

function getPlanRowMetrics(context) {
  if (context.salesPlan <= 0 || context.averageCheck <= 0 || !context.stages.length) {
    return null;
  }

  const conversionProduct = context.stages
    .slice(1)
    .reduce((product, stage) => product * stage.conversion, 1);

  if (conversionProduct <= 0) {
    return null;
  }

  const targetDeals = context.salesPlan / context.averageCheck;
  const estimatedLeads = Math.ceil(targetDeals / conversionProduct);
  const maxLeads = Math.min(250000, Math.max(200, estimatedLeads * 2 + 100));
  let bestMetrics = null;
  let bestDistance = Infinity;

  for (let leads = 1; leads <= maxLeads; leads += 1) {
    const metrics = calculateCalculationMetrics(leads, context);
    const distance = Math.abs(metrics.planPercent - 100);

    if (distance < bestDistance) {
      bestMetrics = metrics;
      bestDistance = distance;
    }

    if (metrics.planPercent >= 100 && distance > bestDistance + 20) {
      break;
    }
  }

  return bestMetrics;
}

function updateCalculationStructure() {
  const stages = getFunnelStages();
  const headerRow = calculationTable.querySelector("thead tr");
  const bodyRows = calculationTable.querySelectorAll("tbody tr");
  const fixedHeaders = ["Сумма продаж", "% от плана выручки", "% менеджера", "Сумма премии менеджера"];

  headerRow.innerHTML = `
    ${stages.map((stage) => `<th>${stage.name}</th>`).join("")}
    ${fixedHeaders.map((header) => `<th>${header}</th>`).join("")}
  `;

  bodyRows.forEach((row) => {
    const isPlanRow = row.classList.contains("plan-row");

    row.innerHTML = `
      ${stages.map((stage, index) => `<td data-stage-index="${index}"></td>`).join("")}
      <td data-field="sales"></td>
      <td data-field="planPercent"></td>
      <td data-field="managerPercent"></td>
      <td data-field="premium"></td>
    `;

    row.classList.toggle("plan-row", isPlanRow);
  });
}

function updatePlanRow(baseMetrics, context) {
  const tbody = calculationTable.querySelector("tbody");
  let planRow = tbody.querySelector(".plan-row");
  const planMetrics = getPlanRowMetrics(context);

  if (!planMetrics) {
    planRow?.remove();
    return;
  }

  const alreadyExists = baseMetrics.some((metrics) => (
    metrics.deals === planMetrics.deals
    || Math.round(metrics.planPercent) === Math.round(planMetrics.planPercent)
  ));

  if (alreadyExists) {
    planRow?.remove();
    return;
  }

  if (!planRow) {
    planRow = createCalculationRow();
    planRow.classList.add("plan-row");
    tbody.append(planRow);
  }

  fillCalculationRow(planRow, planMetrics);
}

function updateCalculationTable() {
  updateCalculationStructure();

  const rows = Array.from(calculationTable.querySelectorAll("tbody tr:not(.plan-row)"));
  const newRequestsPerDay = Number(newRequestsPerDayInput.value) || 0;
  const context = getCalculationContext();
  const baseMetrics = [];

  rows.forEach((row, index) => {
    const metrics = calculateCalculationMetrics(newRequestsPerDay * (index + 1), context);

    baseMetrics.push(metrics);
    fillCalculationRow(row, metrics);
  });

  updatePlanRow(baseMetrics, context);
}

function getPaybackStatus(revenue, income) {
  const difference = revenue - income;
  const nearZero = Math.max(5000, income * 0.05);

  if (difference < -nearZero) {
    return "loss";
  }

  if (Math.abs(difference) <= nearZero) {
    return "even";
  }

  return "profit";
}

function getPaybackColors(items) {
  return items.map((item) => {
    const status = getPaybackStatus(item.revenue, item.income);

    if (status === "loss") {
      return "rgba(255, 118, 118, 0.72)";
    }

    if (status === "even") {
      return "rgba(155, 163, 175, 0.62)";
    }

    return "rgba(83, 198, 138, 0.72)";
  });
}

function updateIncomeDynamicsChart(items) {
  if (typeof Chart === "undefined") {
    renderFallbackIncomeChart(items);
    return;
  }

  const chartData = {
    labels: items.map((item) => item.month),
    datasets: [
      {
        label: "Совокупный доход",
        data: items.map((item) => item.income),
        borderColor: "#25a78a",
        backgroundColor: "rgba(37, 167, 138, 0.16)",
        tension: 0.35,
        fill: true,
      },
    ],
  };

  if (incomeDynamicsChart) {
    incomeDynamicsChart.data = chartData;
    incomeDynamicsChart.update();
    return;
  }

  incomeDynamicsChart = new Chart(document.querySelector("#incomeDynamicsChart"), {
    type: "line",
    data: chartData,
    plugins: [currencyLabelsPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 28,
        },
      },
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${Number(value).toLocaleString("ru-RU")} ₽`,
          },
        },
      },
    },
  });
}

function renderFallbackIncomeChart(items) {
  const canvas = document.querySelector("#incomeDynamicsChart");
  const card = canvas.closest(".chart-card");
  const maxIncome = Math.max(...items.map((item) => item.income), 1);
  let fallback = card.querySelector(".fallback-chart");

  canvas.hidden = true;

  if (!fallback) {
    fallback = document.createElement("div");
    fallback.className = "fallback-chart";
    card.append(fallback);
  }

  fallback.innerHTML = items.map((item) => `
    <div class="fallback-chart-row">
      <strong>${item.month}</strong>
      <div class="fallback-chart-track">
        <div class="fallback-chart-fill" style="width: ${(item.income / maxIncome) * 100}%"></div>
      </div>
      <span>${formatCurrency(item.income)}</span>
    </div>
  `).join("");
}

function updatePaybackSummary(items) {
  const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);
  const totalIncome = items.reduce((sum, item) => sum + item.income, 0);
  const difference = totalRevenue - totalIncome;
  const status = getPaybackStatus(totalRevenue, totalIncome);
  const firstProfitIndex = items.findIndex((item) => item.difference > 0);
  const firstProfitItem = firstProfitIndex >= 0 ? items[firstProfitIndex] : null;
  const profitText = firstProfitItem
    ? ` Предположительно кандидат начнет окупаться на ${firstProfitIndex + 1} месяц.`
    : " По текущему сценарию кандидат пока не выходит в окупаемость.";

  paybackSummary.classList.remove("is-loss", "is-even", "is-profit");

  if (firstProfitItem) {
    paybackSummary.textContent = `🟢 Кандидат окупится предположительно на ${firstProfitIndex + 1} месяц: компания получит на ${formatCurrency(firstProfitItem.difference)} больше, чем платит сотруднику.`;
    paybackSummary.classList.add("is-profit");
    return;
  }

  if (status === "loss") {
    paybackSummary.textContent = `🔴 Кандидат пока не окупается: компания платит на ${formatCurrency(Math.abs(difference))} больше, чем получает выручки.${profitText}`;
    paybackSummary.classList.add("is-loss");
    return;
  }

  if (status === "even") {
    paybackSummary.textContent = `⚪ Стоимость кандидата примерно равна выручке от него: разница между выручкой и доходом ${formatCurrency(Math.abs(difference))}.${profitText}`;
    paybackSummary.classList.add("is-even");
    return;
  }

  paybackSummary.textContent = `🟢 Кандидат окупается: компания получает на ${formatCurrency(difference)} больше, чем платит сотруднику.${profitText}`;
  paybackSummary.classList.add("is-profit");
}

function updatePaybackChart(items) {
  if (typeof Chart === "undefined") {
    renderFallbackPaybackChart(items);
    return;
  }

  const chartData = {
    labels: items.map((item) => item.month),
    datasets: [
      {
        type: "bar",
        label: "Разница",
        data: items.map((item) => item.difference),
        backgroundColor: getPaybackColors(items),
        borderRadius: 8,
        order: 2,
      },
      {
        type: "line",
        label: "Выручка от сотрудника",
        data: items.map((item) => item.revenue),
        borderColor: "#16a34a",
        backgroundColor: "#16a34a",
        tension: 0.35,
        order: 1,
      },
      {
        type: "line",
        label: "Совокупный доход сотрудника",
        data: items.map((item) => item.income),
        borderColor: "#334155",
        backgroundColor: "#334155",
        tension: 0.35,
        order: 1,
      },
    ],
  };

  if (paybackChart) {
    paybackChart.data = chartData;
    paybackChart.update();
    return;
  }

  paybackChart = new Chart(document.querySelector("#paybackChart"), {
    data: chartData,
    plugins: [currencyLabelsPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 32,
        },
      },
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${Number(context.raw).toLocaleString("ru-RU")} ₽`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${Number(value).toLocaleString("ru-RU")} ₽`,
          },
        },
      },
    },
  });
}

function renderFallbackPaybackChart(items) {
  const canvas = document.querySelector("#paybackChart");
  const card = canvas.closest(".chart-card");
  const maxDifference = Math.max(...items.map((item) => Math.abs(item.difference)), 1);
  let fallback = card.querySelector(".fallback-chart");

  canvas.hidden = true;

  if (!fallback) {
    fallback = document.createElement("div");
    fallback.className = "fallback-chart";
    card.append(fallback);
  }

  fallback.innerHTML = items.map((item) => {
    const status = getPaybackStatus(item.revenue, item.income);

    return `
      <div class="fallback-chart-row">
        <strong>${item.month}</strong>
        <div class="fallback-chart-track">
          <div class="fallback-chart-fill is-${status}" style="width: ${(Math.abs(item.difference) / maxDifference) * 100}%"></div>
        </div>
        <span>${formatCurrency(item.difference)}</span>
      </div>
    `;
  }).join("");
}

function updateAnalyticsBlocks() {
  const items = getMonthAnalytics();

  updateIncomeDynamicsChart(items);
  updatePaybackSummary(items);
  updatePaybackChart(items);
}

function updateAllCalculations() {
  updateFunnelConversions();
  updateConversionStageSelects();
  updateNorms();
  updateIncomeScenarios();
  applyBonusRowClasses();
  updateCalculationTable();
  updateIncomePath();
  updateAnalyticsBlocks();
}

function addFunnelRow() {
  const tbody = funnelTable.querySelector("tbody");
  const row = createFunnelRow();
  const rows = tbody.querySelectorAll("tr");

  if (rows.length > 1) {
    tbody.insertBefore(row, rows[rows.length - 1]);
  } else {
    tbody.append(row);
  }

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

function moveFunnelRow(button, direction) {
  const row = button.closest("tr");

  if (direction < 0 && row.previousElementSibling) {
    row.parentElement.insertBefore(row, row.previousElementSibling);
  }

  if (direction > 0 && row.nextElementSibling) {
    row.parentElement.insertBefore(row.nextElementSibling, row);
  }

  updateAllCalculations();
}

function addCalculationRow() {
  calculationTable.querySelector("tbody").append(createCalculationRow());
  updateAllCalculations();
}

function addBonusRow() {
  bonusTable.querySelector("tbody").append(createBonusRow("100", "и выше", "4"));
  updateAllCalculations();
}

function removeBonusRow(button) {
  const rows = bonusTable.querySelectorAll("tbody tr");

  if (rows.length <= 1) {
    return;
  }

  button.closest("tr").remove();
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
  kpiCard.hidden = false;
  kpiCard.classList.toggle("is-collapsed", !show);
  hideKpiButton.textContent = show ? "x" : "+";
  hideKpiButton.setAttribute("aria-label", show ? "Скрыть KPI" : "Показать KPI");
  showKpiButton.hidden = true;
  updateIncomeScenarios();
}

function toggleProbationSalary(show) {
  probationSalaryCard.hidden = false;
  probationSalaryCard.classList.toggle("is-collapsed", !show);
  hideProbationSalaryButton.textContent = show ? "x" : "+";
  hideProbationSalaryButton.setAttribute("aria-label", show ? "Скрыть оклад на испытательный срок" : "Показать оклад на испытательный срок");
  showProbationSalaryButton.hidden = true;
  updateAllCalculations();
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

function clampBonusPercent(input) {
  if (input.value === "") {
    return;
  }

  input.value = Math.max(0, toNumber(input.value));
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
      probationSalaryInput: probationSalaryInput.value,
      probationSalaryLabel: probationSalaryLabelInput.value,
      probationAverageLabel: probationAverageLabelInput.value,
      kpiInput: kpiInput.value,
      normalPremiumInput: normalPremiumInput.value,
      strongPremiumInput: strongPremiumInput.value,
      topPremiumInput: topPremiumInput.value,
      targetIncomeInput: targetIncomeInput.value,
    },
    kpiHidden: kpiCard.classList.contains("is-collapsed"),
    probationSalaryHidden: probationSalaryCard.classList.contains("is-collapsed"),
    probationAverageHidden: probationAverageCard.hidden,
    incomeScenariosHidden: incomeContent.classList.contains("is-hidden"),
    incomeDynamicsHidden: incomeDynamicsContent.classList.contains("is-hidden"),
    incomePathHidden: incomePathCard.classList.contains("is-hidden"),
    calculationHidden: calculationTableWrap.classList.contains("is-hidden"),
    conversionStandardsHidden: conversionStandardsWrap.classList.contains("is-hidden"),
    paybackChartHidden: paybackBlock.classList.contains("is-collapsed"),
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
      const percentInput = row.querySelector(".standard-percent");
      const fromSelect = row.querySelector(".standard-stage-from");
      const toSelect = row.querySelector(".standard-stage-to");
      const statusSelect = row.querySelector(".standard-status");

      return {
        from: fromSelect?.value || "",
        to: toSelect?.value || "",
        percent: percentInput?.value || "",
        status: statusSelect?.value || "normal",
      };
    }),
    incomeDynamicsRows: Array.from(incomeDynamicsTable.querySelectorAll("tbody tr")).map((row) => ({
      month: row.querySelector(".month-name")?.value || "",
      deals: row.querySelector(".month-deals")?.value || "0",
    })),
    calculationRowCount: calculationTable.querySelectorAll("tbody tr:not(.plan-row)").length,
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

  if (typeof data.probationSalaryHidden === "boolean") {
    toggleProbationSalary(!data.probationSalaryHidden);
  }

  if (typeof data.probationAverageHidden === "boolean") {
    probationAverageCard.hidden = data.probationAverageHidden;
    showProbationAverageButton.hidden = !data.probationAverageHidden;
  }

  if (typeof data.incomeScenariosHidden === "boolean") {
    toggleTableVisibility(incomeContent, toggleIncomeScenariosButton, !data.incomeScenariosHidden);
  }

  if (typeof data.incomeDynamicsHidden === "boolean") {
    toggleTableVisibility(incomeDynamicsContent, toggleIncomeDynamicsButton, !data.incomeDynamicsHidden);
  }

  if (typeof data.incomePathHidden === "boolean") {
    incomePathCard.classList.toggle("is-hidden", data.incomePathHidden);
    toggleIncomePathButton.textContent = data.incomePathHidden ? "🚀 Показать путь к доходу" : "Скрыть";
  }

  if (typeof data.calculationHidden === "boolean") {
    toggleTableVisibility(calculationTableWrap, toggleCalculationTableButton, !data.calculationHidden);
  }

  if (typeof data.conversionStandardsHidden === "boolean") {
    toggleTableVisibility(conversionStandardsWrap, toggleConversionStandardsButton, !data.conversionStandardsHidden);
  }

  if (typeof data.paybackChartHidden === "boolean") {
    paybackBlock.classList.toggle("is-collapsed", data.paybackChartHidden);
    paybackChartWrap.classList.toggle("is-hidden", data.paybackChartHidden);
    togglePaybackChartButton.textContent = data.paybackChartHidden ? "+" : "Скрыть график";
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

  if (Array.isArray(data.incomeDynamicsRows) && data.incomeDynamicsRows.length) {
    incomeDynamicsTable.querySelector("tbody").innerHTML = "";

    data.incomeDynamicsRows.forEach((item) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td><input class="month-name" type="text"></td>
        <td><input class="month-deals" type="number" min="0" step="1"></td>
        <td class="month-income">0 ₽</td>
      `;
      row.querySelector(".month-name").value = item.month;
      row.querySelector(".month-deals").value = item.deals;
      incomeDynamicsTable.querySelector("tbody").append(row);
    });
  }
}

function getCellValue(cell) {
  const input = cell.querySelector("input");
  const select = cell.querySelector("select");
  const rawValue = input ? input.value : cell.textContent.trim();
  const normalizedValue = String(rawValue)
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace("%", "")
    .replace("₽", "")
    .trim();
  const number = Number(normalizedValue);
  const isNumeric = normalizedValue !== "" && Number.isFinite(number);

  if (input) {
    return isNumeric ? number : input.value;
  }

  if (select) {
    return select.options[select.selectedIndex]?.text || select.value;
  }

  return isNumeric ? number : cell.textContent.trim();
}

function tableToRows(title, table) {
  const rows = [[title]];

  table.querySelectorAll("tr").forEach((tr) => {
    rows.push(Array.from(tr.children).map(getCellValue));
  });

  return rows;
}

function addSheet(workbook, title, rows) {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  XLSX.utils.book_append_sheet(workbook, worksheet, title.slice(0, 31));
}

async function ensureXlsx() {
  if (typeof XLSX === "undefined") {
    xlsxLoadingPromise = xlsxLoadingPromise || loadScript("https://unpkg.com/xlsx/dist/xlsx.full.min.js");

    try {
      await xlsxLoadingPromise;
    } catch {
      return false;
    }
  }

  return typeof XLSX !== "undefined";
}

async function exportToExcel() {
  if (!(await ensureXlsx())) {
    alert("Библиотека Excel не загрузилась. Проверьте интернет и попробуйте еще раз.");
    return;
  }

  updateAllCalculations();

  const workbook = XLSX.utils.book_new();
  const monthlyRows = getMonthAnalytics().map((item) => [
    item.month,
    item.deals,
    item.premium,
    item.income,
    item.revenue,
    item.difference,
  ]);

  addSheet(workbook, "Нормы", tableToRows("Нормы", document.querySelector("#normsTable")));
  addSheet(workbook, "Воронка", tableToRows("Воронка", document.querySelector("#funnelTable")));
  addSheet(workbook, "% премии", tableToRows("% премии от выполнения плана", document.querySelector("#bonusTable")));
  addSheet(workbook, "Сценарии дохода", [
    ["Сценарии дохода"],
    ["Параметр", "Сумма"],
    ["Оклад", toNumber(salaryInput.value)],
    [probationSalaryLabelInput.value || "Оклад на испытательный срок", toNumber(probationSalaryInput.value)],
    ["KPI", getKpiValue()],
    ["Премия в норме", toNumber(normalPremiumInput.value)],
    ["Премия выше среднего", toNumber(strongPremiumInput.value)],
    ["Премия топового МОП", toNumber(topPremiumInput.value)],
    [],
    ...tableToRows("Итоговые сценарии", document.querySelector("#incomeScenariosTable")),
  ]);
  addSheet(workbook, "Расчет премии", tableToRows("Расчет премии", document.querySelector("#calculationTable")));
  addSheet(workbook, "Нормативы конверсий", tableToRows("Нормативы конверсий", document.querySelector("#conversionStandardsTable")));
  addSheet(workbook, "Динамика дохода", [
    ["Динамика дохода из месяца в месяц"],
    ["Месяц", "Количество сделок", "Премия", "Совокупный доход", "Выручка", "Разница"],
    ...monthlyRows,
  ]);
  addSheet(workbook, "Окупаемость", [
    ["Окупаемость кандидата"],
    ["Статус", paybackSummary.textContent],
    ["Месяц", "Количество сделок", "Выручка", "Совокупный доход кандидата", "Разница"],
    ...getMonthAnalytics().map((item) => [item.month, item.deals, item.revenue, item.income, item.difference]),
  ]);

  XLSX.writeFile(workbook, "raschet-premii.xlsx");
}

function switchPaybackChart() {
  const show = paybackBlock.classList.contains("is-collapsed");

  paybackBlock.classList.toggle("is-collapsed", !show);
  paybackChartWrap.classList.toggle("is-hidden", !show);
  togglePaybackChartButton.textContent = show ? "Скрыть график" : "+";
}

function switchIncomeDynamics() {
  switchTableVisibility(incomeDynamicsContent, toggleIncomeDynamicsButton);
}

function switchIncomePath() {
  const show = incomePathCard.classList.contains("is-hidden");

  incomePathCard.classList.toggle("is-hidden", !show);
  toggleIncomePathButton.textContent = show ? "Скрыть" : "🚀 Показать путь к доходу";
  updateIncomePath();
}

document.addEventListener("input", (event) => {
  if (event.target.classList.contains("money-input")) {
    event.target.value = formatInputMoney(event.target.value);
  }

  if (event.target.classList.contains("standard-percent")) {
    clampStandardPercent(event.target);
  }

  if (event.target.classList.contains("bonus-percent-input")) {
    clampBonusPercent(event.target);
  }

  updateAllCalculations();
});

funnelTable.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove-row")) {
    removeFunnelRow(event.target);
  }

  if (event.target.classList.contains("move-row-up")) {
    moveFunnelRow(event.target, -1);
  }

  if (event.target.classList.contains("move-row-down")) {
    moveFunnelRow(event.target, 1);
  }
});

bonusTable.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove-bonus-row")) {
    removeBonusRow(event.target);
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

  updateAllCalculations();
});

addFunnelRowButton.addEventListener("click", addFunnelRow);
addBonusRowButton.addEventListener("click", addBonusRow);
addCalculationRowButton.addEventListener("click", addCalculationRow);
addConversionStandardRowButton.addEventListener("click", addConversionStandardRow);
toggleIncomeScenariosButton.addEventListener("click", () => {
  switchTableVisibility(incomeContent, toggleIncomeScenariosButton);
});
toggleIncomePathButton.addEventListener("click", switchIncomePath);
toggleCalculationTableButton.addEventListener("click", () => {
  switchTableVisibility(calculationTableWrap, toggleCalculationTableButton);
});
toggleConversionStandardsButton.addEventListener("click", () => {
  switchTableVisibility(conversionStandardsWrap, toggleConversionStandardsButton);
});
toggleIncomeDynamicsButton.addEventListener("click", switchIncomeDynamics);
togglePaybackChartButton.addEventListener("click", switchPaybackChart);
hideKpiButton.addEventListener("click", () => {
  toggleKpi(kpiCard.classList.contains("is-collapsed"));
  updateAllCalculations();
});
showKpiButton.addEventListener("click", () => {
  toggleKpi(true);
  updateAllCalculations();
});
hideProbationSalaryButton.addEventListener("click", () => toggleProbationSalary(probationSalaryCard.classList.contains("is-collapsed")));
showProbationSalaryButton.addEventListener("click", () => toggleProbationSalary(true));
hideProbationAverageButton.addEventListener("click", () => {
  probationAverageCard.hidden = true;
  showProbationAverageButton.hidden = false;
  updateAllCalculations();
});
showProbationAverageButton.addEventListener("click", () => {
  probationAverageCard.hidden = false;
  showProbationAverageButton.hidden = true;
  updateAllCalculations();
});
exportExcelButton?.addEventListener("click", exportToExcel);
saveDataButton.addEventListener("click", saveData);
restoreData();
formatMoneyInputs();
applyBonusRowClasses();
updateAllCalculations();

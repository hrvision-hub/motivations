const salesPlanInput = document.querySelector("#salesPlan");
const workDaysInput = document.querySelector("#workDays");
const newRequestsPerDayInput = document.querySelector("#newRequestsPerDay");
const processedRequestsInput = document.querySelector("#processedRequests");
const monthlyMeetingsInput = document.querySelector("#monthlyMeetings");
const averageCheckInput = document.querySelector("#averageCheck");
const plannedDealsInput = document.querySelector("#plannedDeals");
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
const incomePathCard = document.querySelector("#incomePathCard");
const toggleIncomePathButton = document.querySelector("#toggleIncomePath");
const targetIncomeInput = document.querySelector("#targetIncomeInput");
const incomePathResult = document.querySelector("#incomePathResult");
const funnelTable = document.querySelector("#funnelTable");
const bonusTable = document.querySelector("#bonusTable");
const calculationTable = document.querySelector("#calculationTable");
const conversionStandardsTable = document.querySelector("#conversionStandardsTable");
const incomeDynamicsTable = document.querySelector("#incomeDynamicsTable");
const calculationTableWrap = calculationTable.closest(".table-wrap");
const conversionStandardsWrap = conversionStandardsTable.closest(".table-wrap");
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
  const salesPlan = toNumber(salesPlanInput.value);
  const averageCheck = toNumber(averageCheckInput.value);
  const processedRequests = Math.round(workDays * newRequestsPerDay);
  const monthlyMeetings = calculateThroughFunnel(processedRequests, 4);
  const plannedDeals = averageCheck > 0 ? roundHalfDown(salesPlan / averageCheck) : 0;

  processedRequestsInput.value = formatNumber(processedRequests);
  monthlyMeetingsInput.value = formatNumber(monthlyMeetings);
  plannedDealsInput.value = formatNumber(plannedDeals);
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

function getPremiumForDeals(deals) {
  const targetDeals = Math.floor(Number(deals) || 0);
  const rows = Array.from(calculationTable.querySelectorAll("tbody tr"))
    .map((row) => ({
      deals: Math.floor(toNumber(row.querySelector('[data-field="deals"]')?.textContent || "0")),
      premium: toNumber(row.querySelector('[data-field="premium"]')?.textContent || "0"),
    }))
    .filter((item) => Number.isFinite(item.deals) && item.deals <= targetDeals)
    .sort((a, b) => a.deals - b.deals);

  return rows.length ? rows[rows.length - 1].premium : 0;
}

function getCalculationMetricsFromTable() {
  return Array.from(calculationTable.querySelectorAll("tbody tr")).map((row) => ({
    leads: toNumber(row.querySelector('[data-field="leads"]')?.textContent || "0"),
    meetingDone: toNumber(row.querySelector('[data-field="meetingDone"]')?.textContent || "0"),
    deals: Math.floor(toNumber(row.querySelector('[data-field="deals"]')?.textContent || "0")),
    sales: toNumber(row.querySelector('[data-field="sales"]')?.textContent || "0"),
    premium: toNumber(row.querySelector('[data-field="premium"]')?.textContent || "0"),
  })).filter((item) => item.deals >= 0);
}

function getExactPremiumMatch(requiredPremium, fixedIncome) {
  return getCalculationMetricsFromTable()
    .map((item) => ({ ...item, income: fixedIncome + item.premium }))
    .find((item) => Math.abs(item.premium - requiredPremium) < 1);
}

function getReverseMetricsForPremium(requiredPremium, fixedIncome, context) {
  const positivePercents = getBonusRanges()
    .map((range) => range.percent)
    .filter((percent) => percent > 0);

  if (!positivePercents.length || context.averageCheck <= 0 || context.salesPlan <= 0) {
    return null;
  }

  const minPercent = Math.min(...positivePercents);
  const maxRevenue = requiredPremium / (minPercent / 100);
  const maxDeals = Math.min(500000, Math.ceil(maxRevenue / context.averageCheck) + 1000);

  for (let deals = 0; deals <= maxDeals; deals += 1) {
    const sales = deals * context.averageCheck;
    const planPercent = (sales / context.salesPlan) * 100;
    const managerPercent = getManagerPercent(planPercent);
    const premium = sales * (managerPercent / 100);

    if (premium >= requiredPremium) {
      const meetingDone = context.dealsConversion > 0 ? deals / context.dealsConversion : 0;
      const meetingSet = context.meetingDoneConversion > 0 ? meetingDone / context.meetingDoneConversion : 0;
      const qualified = context.meetingSetConversion > 0 ? meetingSet / context.meetingSetConversion : 0;
      const answered = context.qualifiedConversion > 0 ? qualified / context.qualifiedConversion : 0;
      const leads = context.answeredConversion > 0 ? answered / context.answeredConversion : 0;

      return {
        leads,
        meetingDone,
        deals,
        sales,
        premium,
        income: fixedIncome + premium,
      };
    }
  }

  return null;
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
  const exactMatch = getExactPremiumMatch(requiredPremium, fixedIncome);

  if (exactMatch) {
    return exactMatch;
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
    <div class="income-path-step">${formatNumber(path.deals)} сделок в месяц</div>
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

    row.querySelector(".month-income").textContent = formatCurrency(income);

    return { month, deals, premium, income, revenue };
  });
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

function createStageOptions(selectedValue = "") {
  return STAGE_OPTIONS.map((stage) => (
    `<option${stage === selectedValue ? " selected" : ""}>${stage}</option>`
  )).join("");
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

  return {
    averageCheck,
    salesPlan,
    workDays,
    answeredConversion: getFunnelConversion(1),
    qualifiedConversion: getFunnelConversion(2),
    meetingSetConversion: getFunnelConversion(3),
    meetingDoneConversion: getFunnelConversion(4),
    dealsConversion: getFunnelConversion(5),
  };
}

function calculateCalculationMetrics(leads, context = getCalculationContext()) {
  const answered = leads * context.answeredConversion;
  const qualified = answered * context.qualifiedConversion;
  const meetingSet = qualified * context.meetingSetConversion;
  const meetingDone = meetingSet * context.meetingDoneConversion;
  const deals = Math.floor(meetingDone * context.dealsConversion);
  const sales = deals * context.averageCheck;
  const planPercent = context.salesPlan > 0 ? (sales / context.salesPlan) * 100 : 0;
  const managerPercent = getManagerPercent(planPercent);
  const premium = sales * (managerPercent / 100);

  return {
    leads,
    answered,
    qualified,
    meetingSet,
    meetingDone,
    deals,
    sales,
    planPercent,
    managerPercent,
    premium,
  };
}

function fillCalculationRow(row, metrics) {
  row.querySelector('[data-field="leads"]').textContent = formatDecimal(metrics.leads);
  row.querySelector('[data-field="answered"]').textContent = formatDecimal(metrics.answered);
  row.querySelector('[data-field="qualified"]').textContent = formatDecimal(metrics.qualified);
  row.querySelector('[data-field="meetingSet"]').textContent = formatDecimal(metrics.meetingSet);
  row.querySelector('[data-field="meetingDone"]').textContent = formatDecimal(metrics.meetingDone);
  row.querySelector('[data-field="deals"]').textContent = formatNumber(metrics.deals);
  row.querySelector('[data-field="sales"]').textContent = formatNumber(metrics.sales);
  row.querySelector('[data-field="planPercent"]').textContent = formatPercent(metrics.planPercent);
  row.querySelector('[data-field="managerPercent"]').textContent = formatPercent(metrics.managerPercent, 2);
  row.querySelector('[data-field="premium"]').textContent = formatNumber(metrics.premium);
}

function getPlanRowMetrics(context) {
  if (context.salesPlan <= 0 || context.averageCheck <= 0) {
    return null;
  }

  const conversionProduct = context.answeredConversion
    * context.qualifiedConversion
    * context.meetingSetConversion
    * context.meetingDoneConversion
    * context.dealsConversion;

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
  if (revenue < income * 0.95) {
    return "loss";
  }

  if (revenue <= income * 1.05) {
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
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
  const status = getPaybackStatus(totalRevenue, totalIncome);

  paybackSummary.classList.remove("is-loss", "is-even", "is-profit");

  if (status === "loss") {
    paybackSummary.textContent = "Кандидат пока не окупается";
    paybackSummary.classList.add("is-loss");
    return;
  }

  if (status === "even") {
    paybackSummary.textContent = "Кандидат вышел в точку окупаемости";
    paybackSummary.classList.add("is-even");
    return;
  }

  paybackSummary.textContent = "Кандидат приносит прибыль";
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
        label: "Выручка компании",
        data: items.map((item) => item.revenue),
        backgroundColor: getPaybackColors(items),
        borderRadius: 8,
      },
      {
        type: "line",
        label: "Доход кандидата",
        data: items.map((item) => item.income),
        borderColor: "#334155",
        backgroundColor: "#334155",
        tension: 0.35,
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
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
  const maxRevenue = Math.max(...items.map((item) => Math.max(item.revenue, item.income)), 1);
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
          <div class="fallback-chart-fill is-${status}" style="width: ${(item.revenue / maxRevenue) * 100}%"></div>
        </div>
        <span>${formatCurrency(item.revenue)}</span>
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
  updateNorms();
  updateIncomeScenarios();
  applyBonusRowClasses();
  updateCalculationTable();
  updateIncomePath();
  updateAnalyticsBlocks();
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
  updateAllCalculations();
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
      targetIncomeInput: targetIncomeInput.value,
    },
    kpiHidden: kpiCard.hidden,
    incomeScenariosHidden: incomeContent.classList.contains("is-hidden"),
    incomePathHidden: incomePathCard.classList.contains("is-hidden"),
    calculationHidden: calculationTableWrap.classList.contains("is-hidden"),
    conversionStandardsHidden: conversionStandardsWrap.classList.contains("is-hidden"),
    paybackChartHidden: paybackChartWrap.classList.contains("is-hidden"),
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

  if (typeof data.incomeScenariosHidden === "boolean") {
    toggleTableVisibility(incomeContent, toggleIncomeScenariosButton, !data.incomeScenariosHidden);
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
    toggleTableVisibility(paybackChartWrap, togglePaybackChartButton, !data.paybackChartHidden);
    togglePaybackChartButton.textContent = data.paybackChartHidden ? "Показать график" : "Скрыть график";
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
  ]);

  addSheet(workbook, "Нормы", tableToRows("Нормы", document.querySelector("#normsTable")));
  addSheet(workbook, "Воронка", tableToRows("Воронка", document.querySelector("#funnelTable")));
  addSheet(workbook, "% премии", tableToRows("% премии от выполнения плана", document.querySelector("#bonusTable")));
  addSheet(workbook, "Сценарии дохода", [
    ["Сценарии дохода"],
    ["Параметр", "Сумма"],
    ["Оклад", toNumber(salaryInput.value)],
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
    ["Месяц", "Количество сделок", "Премия", "Совокупный доход", "Выручка"],
    ...monthlyRows,
  ]);
  addSheet(workbook, "Окупаемость", [
    ["Окупаемость кандидата"],
    ["Статус", paybackSummary.textContent],
    ["Месяц", "Количество сделок", "Выручка", "Совокупный доход кандидата"],
    ...getMonthAnalytics().map((item) => [item.month, item.deals, item.revenue, item.income]),
  ]);

  XLSX.writeFile(workbook, "raschet-premii.xlsx");
}

function switchPaybackChart() {
  const show = paybackChartWrap.classList.contains("is-hidden");

  paybackChartWrap.classList.toggle("is-hidden", !show);
  togglePaybackChartButton.textContent = show ? "Скрыть график" : "Показать график";
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
toggleIncomePathButton.addEventListener("click", switchIncomePath);
toggleCalculationTableButton.addEventListener("click", () => {
  switchTableVisibility(calculationTableWrap, toggleCalculationTableButton);
});
toggleConversionStandardsButton.addEventListener("click", () => {
  switchTableVisibility(conversionStandardsWrap, toggleConversionStandardsButton);
});
togglePaybackChartButton.addEventListener("click", switchPaybackChart);
hideKpiButton.addEventListener("click", () => toggleKpi(false));
showKpiButton.addEventListener("click", () => toggleKpi(true));
exportExcelButton.addEventListener("click", exportToExcel);
saveDataButton.addEventListener("click", saveData);
restoreData();
formatMoneyInputs();
applyBonusRowClasses();
updateAllCalculations();

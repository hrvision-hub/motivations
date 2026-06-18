const STORAGE_KEY = "salary_constructor_v2";

function formatMoney(value) {

    return Number(value).toLocaleString("ru-RU") + " ₽";

}

function calculateIncome() {

    let total = 0;

    const breakdown = [];

    const salary =
        Number(
            document.getElementById("salary").value
        ) || 0;

    total += salary;

    breakdown.push({
        name: "Оклад",
        value: salary
    });

    document
        .querySelectorAll(".kpi-card")
        .forEach(card => {

            const name =
                card.querySelector(".kpi-name").value ||
                "KPI";

            const value =
                Number(
                    card.querySelector(".kpi-value").value
                ) || 0;

            total += value;

            breakdown.push({
                name,
                value
            });

        });

    const premium =
        Number(
            document.getElementById(
                "premiumAmount"
            ).value
        ) || 0;

    total += premium;

    breakdown.push({
        name: "Премия",
        value: premium
    });

    renderBreakdown(breakdown);

    document.getElementById(
        "totalIncome"
    ).innerText =
        formatMoney(total);

    updateLinkPreview();
}

function renderBreakdown(data) {

    const container =
        document.getElementById(
            "incomeBreakdown"
        );

    container.innerHTML = "";

    data.forEach(item => {

        const row =
            document.createElement("div");

        row.className =
            "income-row";

        row.innerHTML = `
            <span>${item.name}</span>
            <strong>${formatMoney(item.value)}</strong>
        `;

        container.appendChild(row);

    });

}

function addKPI(name = "", value = 0) {

    const container =
        document.getElementById(
            "kpiContainer"
        );

    const card =
        document.createElement("div");

    card.className =
        "kpi-card";

    card.innerHTML = `
        <div class="kpi-header">

            <div class="kpi-title">
                KPI
            </div>

            <button
            class="delete-btn"
            onclick="removeKPI(this)">
            ✕
            </button>

        </div>

        <div class="kpi-grid">

            <input
            class="kpi-name"
            placeholder="Название KPI"
            value="${name}">

            <input
            class="kpi-value"
            type="number"
            value="${value}"
            placeholder="Сумма">

        </div>
    `;

    container.appendChild(card);

    attachEvents();

    calculateIncome();
}

function removeKPI(button) {

    button
        .closest(".kpi-card")
        .remove();

    calculateIncome();
}

function updateLinkPreview() {

    const url =
        document.getElementById(
            "premiumLink"
        ).value;

    const block =
        document.getElementById(
            "linkPreview"
        );

    if (!url) {

        block.innerHTML = "";

        return;

    }

    block.innerHTML = `
        <a href="${url}"
        target="_blank">

        Открыть расчет →

        </a>
    `;
}

function attachEvents() {

    document
        .querySelectorAll("input")
        .forEach(input => {

            input.removeEventListener(
                "input",
                calculateIncome
            );

            input.addEventListener(
                "input",
                calculateIncome
            );

        });

}

function saveSettings() {

    const data = {

        salary:
            document.getElementById(
                "salary"
            ).value,

        premium:
            document.getElementById(
                "premiumAmount"
            ).value,

        link:
            document.getElementById(
                "premiumLink"
            ).value,

        kpis: []

    };

    document
        .querySelectorAll(".kpi-card")
        .forEach(card => {

            data.kpis.push({

                name:
                    card.querySelector(
                        ".kpi-name"
                    ).value,

                value:
                    card.querySelector(
                        ".kpi-value"
                    ).value

            });

        });

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    alert(
        "Настройки сохранены"
    );
}

function loadSettings() {

    const raw =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (!raw) {

        addKPI(
            "SLA - скорость реакции",
            30000
        );

        addKPI(
            "Конверсия",
            50000
        );

        return;
    }

    const data =
        JSON.parse(raw);

    document.getElementById(
        "salary"
    ).value =
        data.salary;

    document.getElementById(
        "premiumAmount"
    ).value =
        data.premium;

    document.getElementById(
        "premiumLink"
    ).value =
        data.link;

    data.kpis.forEach(kpi => {

        addKPI(
            kpi.name,
            kpi.value
        );

    });

}

function resetSettings() {

    if (
        !confirm(
            "Удалить сохраненные настройки?"
        )
    ) return;

    localStorage.removeItem(
        STORAGE_KEY
    );

    location.reload();
}

window.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSettings();

        attachEvents();

        calculateIncome();

    }
);

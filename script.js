const STORAGE_KEY = "salary_constructor_v2";
const DEFAULT_PREMIUM_LINK = "https://lesookaya.github.io/-sales--/premium-calculator/";

function parseMoney(value) {

    return Number(
        String(value)
            .replace(/[^\d]/g, "")
    ) || 0;

}

function formatMoney(value) {

    return Number(value).toLocaleString("ru-RU") + " ₽";

}

function formatMoneyInput(value) {

    const number =
        parseMoney(value);

    if (!number) {

        return "";

    }

    return formatMoney(number);

}

function formatMoneyField(input) {

    input.value =
        formatMoneyInput(input.value);

}

function handleInput(event) {

    if (
        event.target.classList.contains(
            "money-input"
        )
    ) {

        formatMoneyField(event.target);

    }

    calculateIncome();
}

function calculateIncome() {

    let total = 0;

    const breakdown = [];

    const salary =
        parseMoney(
            document.getElementById("salary").value
        );

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
                parseMoney(
                    card.querySelector(".kpi-value").value
                );

            total += value;

            breakdown.push({
                name,
                value
            });

        });

    const premium =
        parseMoney(
            document.getElementById(
                "premiumAmount"
            ).value
        );

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

function addKPI(name = "", value = "") {

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
            class="kpi-value money-input"
            type="text"
            inputmode="numeric"
            value="${formatMoneyInput(value)}"
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

    const input =
        document.getElementById(
            "premiumLink"
        );

    const url =
        input.value ||
        DEFAULT_PREMIUM_LINK;

    const block =
        document.getElementById(
            "linkPreview"
        );

    input.value = url;

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
                handleInput
            );

            input.addEventListener(
                "input",
                handleInput
            );

        });

}

function saveSettings() {

    const data = {

        salary:
            parseMoney(
                document.getElementById(
                    "salary"
                ).value
            ),

        premium:
            parseMoney(
                document.getElementById(
                    "premiumAmount"
                ).value
            ),

        link:
            document.getElementById(
                "premiumLink"
            ).value ||
            DEFAULT_PREMIUM_LINK,

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
                    parseMoney(
                        card.querySelector(
                            ".kpi-value"
                        ).value
                    )

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
        formatMoneyInput(data.salary);

    document.getElementById(
        "premiumAmount"
    ).value =
        formatMoneyInput(data.premium);

    document.getElementById(
        "premiumLink"
    ).value =
        data.link ||
        DEFAULT_PREMIUM_LINK;

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

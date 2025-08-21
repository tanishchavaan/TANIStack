const correctPIN = "786912";
let totalBalance = parseFloat(localStorage.getItem("totalBalance")) || 0;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let pomoInterval, pomoTime = 1500, isBreak = false;

function checkPIN() {
  const pin = document.getElementById('pinInput').value;
  if (pin === correctPIN) {
    localStorage.setItem("authenticated", "true");
    document.getElementById("loginSection").classList.add("hidden");
    showSection("dashboard");
    updateBalanceDisplay();
    renderTransactions();
    updateCharts();
    updateTimerDisplay();
  } else {
    alert("❌ Wrong PIN. Try again.");
  }
}

function logout() {
  localStorage.clear();
  location.reload();
}

function updateBalance() {
  const amountInput = document.getElementById("balanceInput");
  const descInput = document.getElementById("descriptionInput");
  const typeSelect = document.getElementById("transactionType");
  const amount = parseFloat(amountInput.value);
  const type = typeSelect.value.toLowerCase();
  const description = descInput.value.trim();
  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;

  if (!isNaN(amount) && amount > 0 && (type === "credit" || type === "debit")) {
    const signedAmount = type === "credit" ? amount : -amount;
    totalBalance += signedAmount;

    transactions.push({
      amount: Math.abs(amount),
      type,
      description,
      date: formattedDate
    });

    localStorage.setItem("totalBalance", totalBalance);
    localStorage.setItem("transactions", JSON.stringify(transactions));

    updateBalanceDisplay();
    renderTransactions();
    updateCharts();

    amountInput.value = "";
    descInput.value = "";
  } else {
    alert("⚠️ Yo pal, enter a valid amount and select transaction type.");
  }
}

function renderTransactions() {
  const tbody = document.querySelector("#transactionTable tbody");
  tbody.innerHTML = "";

  if (transactions.length === 0) {
    const row = document.createElement("tr");
    const empty = document.createElement("td");
    empty.setAttribute("colspan", 3);
    empty.textContent = "No transactions yet.";
    row.appendChild(empty);
    tbody.appendChild(row);
    return;
  }

  transactions.forEach(t => {
    const row = document.createElement("tr");

    const amountCell = document.createElement("td");
    amountCell.textContent = `${t.type === "credit" ? "+" : "-"} ₹${t.amount.toFixed(2)}`;

    const descCell = document.createElement("td");
    descCell.textContent = t.description || "-";

    const dateCell = document.createElement("td");
    dateCell.textContent = t.date || "-";

    row.appendChild(amountCell);
    row.appendChild(descCell);
    row.appendChild(dateCell);

    tbody.appendChild(row);
  });
}

function updateBalanceDisplay() {
  document.getElementById("totalBalance").textContent = `Total Balance: ₹${totalBalance.toFixed(2)}`;
}

let pieChartInstance = null;
let barChartInstance = null;

function updateCharts() {
  const credits = transactions
    .filter(t => t.type === "credit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const debits = transactions
    .filter(t => t.type === "debit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const pieCtx = document.getElementById("pieChart").getContext("2d");
  const barCtx = document.getElementById("barChart").getContext("2d");

  if (pieChartInstance) {
    pieChartInstance.data.datasets[0].data = [credits, debits];
    pieChartInstance.update();
  } else {
    pieChartInstance = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: ['Credits', 'Debits'],
        datasets: [{
          data: [credits, debits],
          backgroundColor: ['#10b981', '#ef4444']
        }]
      }
    });
  }

  if (barChartInstance) {
    barChartInstance.data.datasets[0].data = [credits, debits];
    barChartInstance.update();
  } else {
    barChartInstance = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Credits', 'Debits'],
        datasets: [{
          label: 'Amount',
          data: [credits, debits],
          backgroundColor: ['#3b82f6', '#f59e0b']
        }]
      }
    });
  }
}

function toggleTheme() {
  const dark = document.body.style.background === 'rgb(15, 23, 42)';
  document.body.style.background = dark ? '#f8fafc' : '#0f172a';
  document.body.style.color = dark ? '#0f172a' : '#f8fafc';
}

function showSection(id) {
  if (!localStorage.getItem("authenticated")) {
    alert("🚫 Please login first to access this section.");
    return;
  }
  document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function addTask() {
  const taskInput = document.getElementById("taskInput");
  const taskText = taskInput.value.trim();
  if (taskText) {
    const li = document.createElement("li");
    li.textContent = taskText;

    const doneBtn = document.createElement("button");
    doneBtn.textContent = "✅";
    doneBtn.onclick = () => li.style.textDecoration = "line-through";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.onclick = () => li.remove();

    const btnGroup = document.createElement("span");
    btnGroup.classList.add("task-buttons");
    btnGroup.appendChild(doneBtn);
    btnGroup.appendChild(deleteBtn);

    li.appendChild(btnGroup);
    document.getElementById("taskList").appendChild(li);
    taskInput.value = "";
  }
}

function startPomodoro() {
  if (pomoInterval) return;

  pomoInterval = setInterval(() => {
    if (pomoTime > 0) {
      pomoTime--;
    } else {
      document.getElementById('alarmSound').play();
      clearInterval(pomoInterval);
      pomoTime = isBreak ? 1500 : 300;
      isBreak = !isBreak;
      pomoInterval = null;
      document.getElementById('breakMessage').textContent = isBreak ? "🌴 Time for a short break!" : "💼 Back to work!";
      startPomodoro();
    }
    updateTimerDisplay();
  }, 1000);
}

function stopPomodoro() {
  clearInterval(pomoInterval);
  pomoInterval = null;
  pomoTime = 1500;
  isBreak = false;
  updateTimerDisplay();
  document.getElementById('breakMessage').textContent = '';
}

function updateTimerDisplay() {
  const min = String(Math.floor(pomoTime / 60)).padStart(2, '0');
  const sec = String(pomoTime % 60).padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${min}:${sec}`;
}

window.onload = function () {
  if (localStorage.getItem("authenticated") === "true") {
    document.getElementById("loginSection").classList.add("hidden");
    showSection("dashboard");
    updateBalanceDisplay();
    renderTransactions();
    updateCharts();
    updateTimerDisplay();
  }
};

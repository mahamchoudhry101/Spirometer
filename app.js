const airflowCtx = document.getElementById("airflowChart");
const volumeCtx = document.getElementById("volumeChart");

const fev1El = document.getElementById("fev1");
const fvcEl = document.getElementById("fvc");
const pefEl = document.getElementById("pef");
const testStatusEl = document.getElementById("testStatus");

let running = false;
let timer = null;
let time = 0;
let currentVolume = 0;

const airflowChart = new Chart(airflowCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Airflow",
        data: [],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.15)",
        fill: true,
        tension: 0.3
      }
    ]
  },
  options: {
    responsive: true,
    animation: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Time (s)"
        }
      },
      y: {
        title: {
          display: true,
          text: "Flow Rate"
        },
        beginAtZero: true
      }
    }
  }
});

const volumeChart = new Chart(volumeCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Volume",
        data: [],
        borderColor: "#7c3aed",
        backgroundColor: "rgba(124,58,237,0.15)",
        fill: true,
        tension: 0.3
      }
    ]
  },
  options: {
    responsive: true,
    animation: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Time (s)"
        }
      },
      y: {
        title: {
          display: true,
          text: "Volume (L)"
        },
        beginAtZero: true
      }
    }
  }
});

function addSimulatedDataPoint() {
  time += 0.2;

  const flow = Math.max(0, Math.sin(time * 2) * 2 + Math.random() * 0.4 + 2);
  currentVolume += flow * 0.02;

  airflowChart.data.labels.push(time.toFixed(1));
  airflowChart.data.datasets[0].data.push(flow.toFixed(2));

  volumeChart.data.labels.push(time.toFixed(1));
  volumeChart.data.datasets[0].data.push(currentVolume.toFixed(2));

  if (airflowChart.data.labels.length > 30) {
    airflowChart.data.labels.shift();
    airflowChart.data.datasets[0].data.shift();
    volumeChart.data.labels.shift();
    volumeChart.data.datasets[0].data.shift();
  }

  airflowChart.update();
  volumeChart.update();

  const airflowValues = airflowChart.data.datasets[0].data.map(Number);
  const pef = Math.max(...airflowValues);
  const fvc = currentVolume;
  const fev1 = 0.8 * fvc;

  fev1El.textContent = fev1.toFixed(2);
  fvcEl.textContent = fvc.toFixed(2);
  pefEl.textContent = pef.toFixed(2);
}

document.getElementById("startBtn").addEventListener("click", () => {
  if (running) return;

  running = true;
  testStatusEl.textContent = "Status: Running";
  timer = setInterval(addSimulatedDataPoint, 200);
});

document.getElementById("stopBtn").addEventListener("click", () => {
  running = false;
  clearInterval(timer);
  testStatusEl.textContent = "Status: Stopped";
});

document.getElementById("resetBtn").addEventListener("click", () => {
  running = false;
  clearInterval(timer);
  time = 0;
  currentVolume = 0;

  airflowChart.data.labels = [];
  airflowChart.data.datasets[0].data = [];

  volumeChart.data.labels = [];
  volumeChart.data.datasets[0].data = [];

  airflowChart.update();
  volumeChart.update();

  fev1El.textContent = "0.00";
  fvcEl.textContent = "0.00";
  pefEl.textContent = "0.00";
  testStatusEl.textContent = "Status: Idle";
});

/*
  backend teammates can call this function
  with real processed spirometer data instead of fake data.
*/
function handleIncomingData(sample) {
  const { timestamp, flowRate, volume, fev1, fvc, pef } = sample;

  airflowChart.data.labels.push(timestamp);
  airflowChart.data.datasets[0].data.push(flowRate);

  volumeChart.data.labels.push(timestamp);
  volumeChart.data.datasets[0].data.push(volume);

  airflowChart.update();
  volumeChart.update();

  fev1El.textContent = fev1.toFixed(2);
  fvcEl.textContent = fvc.toFixed(2);
  pefEl.textContent = pef.toFixed(2);
}
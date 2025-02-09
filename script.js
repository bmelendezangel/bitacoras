// Data storage
let mantenimientosVentas = [];
let ventas = [];
let emailDestino = "angel.bmelendez@securitasdirect.es";

// Helper function to show/hide elements
function showElement(id) {
  document.getElementById(id).classList.remove('hidden');
}

function hideElement(id) {
  document.getElementById(id).classList.add('hidden');
}

// Functions to show forms and tables
function showForm(formId) {
  hideAllForms();
  hideAllTables();
  showElement(formId);
}

function showTable(tableId) {
  hideAllForms();
  hideAllTables();
  showElement(tableId);

  if (tableId === 'ventas-table') {
    updateVentasTable();
    updateSalesChart();
    showElement('chart-container');
  } else {
    hideElement('chart-container');
  }
  if (tableId === 'mantenimientos-ventas-table') {
    updateMantenimientosVentasTable();
  }
  if (tableId === 'kpi-table') {
    updateKpiTable();
  }
}

function hideAllForms() {
  document.querySelectorAll('.form-container').forEach(form => form.classList.add('hidden'));
}

function hideAllTables() {
  document.querySelectorAll('table').forEach(table => table.classList.add('hidden'));
  hideElement('chart-container');
}

function showMainMenu() {
  hideAllForms();
  hideAllTables();
  hideElement('chart-container');
  showElement('main-menu');
}

// Form submission functions
function guardarMantenimientoVenta() {
  const fecha = document.getElementById('fecha-mantenimiento').value;
  const numeroMantenimientosA = parseInt(document.getElementById('numero-mantenimientos-a').value);
  const numeroMantenimientosB = parseInt(document.getElementById('numero-mantenimientos-b').value);
  const incumplimientos = parseInt(document.getElementById('incumplimientos').value);
  const numeroVentas = parseInt(document.getElementById('numero-ventas').value);

  mantenimientosVentas.push({
    fecha,
    numeroMantenimientosA,
    numeroMantenimientosB,
    incumplimientos,
    numeroVentas
  });
  updateMantenimientosVentasTable();
  showMainMenu();
}

function guardarVenta() {
  const fechaVenta = document.getElementById('fecha-venta').value;
  const numeroMantenimientoVenta = document.getElementById('numero-mantenimiento-venta').value;
  const instalacion = document.getElementById('instalacion').value;
  const precio = parseFloat(document.getElementById('precio').value);
  const tipoAlarma = document.getElementById('tipo-alarma').value;
  const elementoVendido = document.getElementById('elemento-vendido').value;

  ventas.push({
    fechaVenta,
    numeroMantenimientoVenta,
    instalacion,
    precio,
    tipoAlarma,
    elementoVendido
  });
  updateVentasTable();
  updateSalesChart();
  showMainMenu();
}

// Function to change the destination email
function cambiarCorreo() {
  const nuevoCorreo = document.getElementById('nuevo-correo').value;
  if (nuevoCorreo) {
    emailDestino = nuevoCorreo;
    alert('Correo de destino actualizado a: ' + emailDestino);
  } else {
    alert('Por favor, introduce un correo válido.');
  }
  showMainMenu();
}

// Table update functions
function updateMantenimientosVentasTable() {
  const tableBody = document.querySelector('#mantenimientos-ventas-table tbody');
  tableBody.innerHTML = '';

  let puntosTipoATotales = 0;
  let puntosTipoBTotales = 0;

  mantenimientosVentas.forEach(item => {
    const puntosTipoA = item.numeroMantenimientosA * 3;
    const puntosTipoB = item.numeroMantenimientosB * 7;

    puntosTipoATotales += puntosTipoA;
    puntosTipoBTotales += puntosTipoB;

    const row = tableBody.insertRow();
    row.insertCell().textContent = item.fecha;
    row.insertCell().textContent = item.numeroMantenimientosA;
    row.insertCell().textContent = item.numeroMantenimientosB;
    row.insertCell().textContent = item.numeroVentas;
    row.insertCell().textContent = item.incumplimientos;
    row.insertCell().textContent = puntosTipoA;
    row.insertCell().textContent = puntosTipoB;
    row.insertCell().textContent = puntosTipoA + puntosTipoB;

    // Calculate "Puntos Deberían Ser"
    const fechaMantenimiento = new Date(item.fecha);
    const diasRealizados = contarDiasConMantenimiento();
    const puntosDeberianSer = diasRealizados * 20;
    row.insertCell().textContent = puntosDeberianSer;
  });
}

function updateVentasTable() {
  const tableBody = document.querySelector('#ventas-table tbody');
  tableBody.innerHTML = '';

  ventas.forEach(item => {
    const row = tableBody.insertRow();
    row.insertCell().textContent = item.fechaVenta;
    row.insertCell().textContent = item.numeroMantenimientoVenta;
    row.insertCell().textContent = item.instalacion;
    row.insertCell().textContent = item.precio;
    row.insertCell().textContent = item.tipoAlarma;
    row.insertCell().textContent = item.elementoVendido;
  });
}

// KPI Calculations and Table Update
function updateKpiTable() {
  const totalMantenimientos = mantenimientosVentas.length;
  const totalVentas = ventas.length;
  let conversion = totalMantenimientos > 0 ? (totalMantenimientos / totalVentas) * 100 : 0;
  conversion = parseFloat(conversion.toFixed(2));

  let sumaTipoAyB = 0;
  mantenimientosVentas.forEach(item => {
    if (item.numeroMantenimientosA) {
      sumaTipoAyB += item.numeroMantenimientosA;
    } else if (item.numeroMantenimientosB) {
      sumaTipoAyB += item.numeroMantenimientosB;
    }
  });
  const diasRealizados = contarDiasConMantenimiento();
  let produccion = (sumaTipoAyB > 0 && diasRealizados > 0) ? (sumaTipoAyB / (diasRealizados * 20)) * 100 : 0;
  produccion = parseFloat(produccion.toFixed(2));

  let incumplimientosTotales = 0;
  mantenimientosVentas.forEach(item => {
    incumplimientosTotales += item.incumplimientos;
  });

  let incumplimiento = (totalMantenimientos > 0) ? (incumplimientosTotales / totalMantenimientos) * 100 : 0;
  incumplimiento = parseFloat(incumplimiento.toFixed(2));

  let dineroVendidoTotal = 0;
  ventas.forEach(item => {
    dineroVendidoTotal += item.precio;
  });

  const dineroVendido15 = dineroVendidoTotal * 0.15;
  const dineroVendido17 = dineroVendidoTotal * 0.17;

  // Update KPI Table
  document.getElementById('conversion').textContent = conversion + '%';
  document.getElementById('produccion').textContent = produccion + '%';
  document.getElementById('incumplimiento').textContent = incumplimiento + '%';
  document.getElementById('dinero-vendido').textContent = dineroVendidoTotal.toFixed(2);
  document.getElementById('dinero-vendido-15').textContent = dineroVendido15.toFixed(2);
  document.getElementById('dinero-vendido-17').textContent = dineroVendido17.toFixed(2);

  // Apply background colors based on conditions
  const conversionElement = document.getElementById('conversion');
  conversionElement.classList.remove('green', 'light-green', 'yellow', 'white', 'red');
  if (conversion > 17) {
    conversionElement.classList.add('green');
  } else if (conversion >= 15 && conversion <= 16.99) {
    conversionElement.classList.add('light-green');
  } else if (conversion >= 14 && conversion <= 14.99) {
    conversionElement.classList.add('yellow');
  } else if (conversion >= 13 && conversion <= 13.99) {
    conversionElement.classList.add('white');
  } else {
    conversionElement.classList.add('red');
  }

  const produccionElement = document.getElementById('produccion');
  produccionElement.classList.remove('green', 'yellow', 'white', 'red');
  if (produccion >= 100) {
    produccionElement.classList.add('green');
  } else if (produccion >= 97 && produccion < 100) {
    produccionElement.classList.add('yellow');
  } else if (produccion >= 95 && produccion < 97) {
    produccionElement.classList.add('white');
  } else {
    produccionElement.classList.add('red');
  }
}

// Chart Update Function
function updateSalesChart() {
  const elementoCounts = {};
  ventas.forEach(venta => {
    const elemento = venta.elementoVendido;
    elementoCounts[elemento] = (elementoCounts[elemento] || 0) + 1;
  });

  const labels = Object.keys(elementoCounts);
  const data = Object.values(elementoCounts);

  const ctx = document.getElementById('salesChart').getContext('2d');

  // Destroy the existing chart, if it exists
  if (window.myChart) {
    window.myChart.destroy();
  }

  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Número de Elementos Vendidos',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

function contarDiasConMantenimiento() {
  const fechasMantenimiento = new Set();
  mantenimientosVentas.forEach(item => {
    fechasMantenimiento.add(item.fecha);
  });
  return fechasMantenimiento.size;
}

// Initial setup: hide all forms and tables, show main menu
document.addEventListener('DOMContentLoaded', showMainMenu);
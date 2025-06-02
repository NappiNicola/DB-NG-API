// BASE_URL gestito dinamicamente da input impostazioni
let BASE_URL = "http://localhost:8080";

let currentTable = "";

// --- GESTIONE IMPOSTAZIONI ---

const settingsForm = document.getElementById("settingsForm");
const baseUrlInput = document.getElementById("baseUrlInput");

// Carica URL base da localStorage se presente
window.addEventListener('DOMContentLoaded', () => {
  const savedBaseUrl = localStorage.getItem('baseUrl');
  if (savedBaseUrl) {
    BASE_URL = savedBaseUrl;
    baseUrlInput.value = BASE_URL;
  }

  // Inizializza app
  fetchAllTables();
  setupTableSelectForRow();
  setupTableSelectView();

  // Imposta sezione attiva iniziale
  activateSection('settings');
});

// Salva URL base al submit del form impostazioni
settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newUrl = baseUrlInput.value.trim();
  if (newUrl) {
    BASE_URL = newUrl;
    localStorage.setItem('baseUrl', BASE_URL);
    alert(`Base URL salvata: ${BASE_URL}`);

    // Aggiorna liste tabelle con nuova URL
    fetchAllTables();
    setupTableSelectForRow();
    setupTableSelectView();
  }
});

// --- NAVBAR E GESTIONE SEZIONI ---

document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = e.target.getAttribute('href').substring(1);
    activateSection(target);

    // Scroll smooth alla sezione
    document.getElementById(target).scrollIntoView({ behavior: 'smooth' });

    // Evidenzia link attivo
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    e.target.classList.add('active');
  });
});

function activateSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById(sectionId);
  if (sec) sec.classList.add('active');
}

// --- FETCH LISTA TABELLE ---

async function fetchAllTables() {
  try {
    const res = await fetch(`${BASE_URL}/table/allTables`);
    const data = await res.json();

    const tableSelect = document.getElementById('tableSelect');
    const tableSelectForRow = document.getElementById('tableSelectForRow');

    tableSelect.innerHTML = "";
    tableSelectForRow.innerHTML = "";

    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      data.data.forEach(name => {
        const option1 = document.createElement("option");
        option1.value = name;
        option1.textContent = name;
        tableSelect.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = name;
        option2.textContent = name;
        tableSelectForRow.appendChild(option2);
      });

      currentTable = tableSelect.value;

      updateMiniTable();
      fetchTableData(currentTable);
      updateHeadersRow(currentTable);
    } else {
      document.getElementById("error").textContent = "Nessuna tabella disponibile.";
      currentTable = "";
      updateMiniTable();
      document.getElementById("tableData").innerHTML = "";
      document.getElementById("headersRow").textContent = "";
    }
  } catch (err) {
    console.error("Errore durante il recupero delle tabelle:", err);
    document.getElementById("error").textContent = "Errore nel recupero delle tabelle.";
  }
}

// --- GESTIONE SELECT VISUALIZZA TABELLA ---

const tableSelect = document.getElementById("tableSelect");
tableSelect.addEventListener('change', () => {
  currentTable = tableSelect.value;
  fetchTableData(currentTable);
  updateHeadersRow(currentTable);
  updateMiniTable();
});

// --- GESTIONE SELECT AGGIUNGI RIGA ---

const tableSelectForRow = document.getElementById("tableSelectForRow");
tableSelectForRow.addEventListener('change', () => {
  const selectedTable = tableSelectForRow.value;
  updateHeadersRow(selectedTable);
});

// Mostra intestazioni sotto select aggiungi riga
async function updateHeadersRow(tableName) {
  if (!tableName) {
    document.getElementById('headersRow').textContent = "";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/table/getTable?table=${encodeURIComponent(tableName)}`);
    if (!res.ok) throw new Error("Errore fetch headers");

    const data = await res.json();
    const headers = data.headers?.columnNames;

    if (headers && headers.length > 0) {
      document.getElementById('headersRow').textContent = "Intestazioni: " + headers.join(", ");
    } else {
      document.getElementById('headersRow').textContent = "Nessuna intestazione trovata";
    }
  } catch (err) {
    console.error(err);
    document.getElementById('headersRow').textContent = "Errore nel recupero intestazioni";
  }
}

// --- FUNZIONI PER VISUALIZZARE TABELLA ---

async function fetchTableData(tableName) {
  document.getElementById("error").textContent = "";
  try {
    const res = await fetch(`${BASE_URL}/table/getTable?table=${encodeURIComponent(tableName)}`);
    if (!res.ok) throw new Error("Errore nella fetch");

    const data = await res.json();
    const headers = data.headers.columnNames;
    const rows = data.rows;
    const table = document.getElementById("tableData");

    table.innerHTML = "";

    const thead = table.createTHead();
    const rowHead = thead.insertRow();
    headers.forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      rowHead.appendChild(th);
    });

    const tbody = table.createTBody();
    rows.forEach(row => {
      const tr = tbody.insertRow();
      row.params.forEach(cell => {
        const td = tr.insertCell();
        td.textContent = cell.value;
      });
    });
  } catch (err) {
    document.getElementById("tableData").innerHTML = "";
    document.getElementById("error").textContent = "Errore nel caricamento della tabella.";
    console.error(err);
  }
}

function refreshTable() {
  if (!currentTable) {
    document.getElementById("error").textContent = "Nessuna tabella da aggiornare.";
    return;
  }
  fetchTableData(currentTable);
  updateHeadersRow(currentTable);
  updateMiniTable();
}

// --- MINI TABELLA ---

function updateMiniTable() {
  const miniTable = document.getElementById('miniTable');
  const miniTableBody = document.getElementById('miniTableBody');
  const tables = Array.from(document.getElementById('tableSelect').options).map(o => o.value);

  miniTableBody.innerHTML = "";

  if (tables.length === 0) {
    miniTable.style.display = 'none';
    return;
  }

  tables.forEach(tableName => {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.textContent = tableName;

    const tdActions = document.createElement('td');

    // Bottone Visualizza
    const btnLoad = document.createElement('button');
    btnLoad.textContent = 'Visualizza';
    btnLoad.onclick = () => {
      currentTable = tableName;
      document.getElementById('tableSelect').value = tableName;
      fetchTableData(tableName);
      updateHeadersRow(tableName);
    };

    // Bottone Elimina
    const btnDelete = document.createElement('button');
    btnDelete.textContent = 'Elimina';
    btnDelete.className = 'deleteButton'; // Stile rosso già presente
    btnDelete.onclick = async () => {
      const confirmed = confirm(`Sei sicuro di voler eliminare la tabella "${tableName}"?`);
      if (!confirmed) return;

      try {
        const res = await fetch(`${BASE_URL}/table/deleteTable?table=${encodeURIComponent(tableName)}`);
        const json = await res.json();
        if (json.success) {
          alert(`Tabella "${tableName}" eliminata.`);
          fetchAllTables();
        } else {
          alert("Errore durante eliminazione tabella.");
        }
      } catch (err) {
        alert("Errore durante eliminazione tabella.");
        console.error(err);
      }
    };

    tdActions.appendChild(btnLoad);
    tdActions.appendChild(btnDelete);

    tr.appendChild(tdName);
    tr.appendChild(tdActions);
    miniTableBody.appendChild(tr);
  });

  miniTable.style.display = 'table';
}

// --- CREAZIONE TABELLA ---

const tableForm = document.getElementById("tableForm");
const responseOutput = document.getElementById("responseOutput");

tableForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const tableName = document.getElementById('tableName').value.trim();
  const headersRaw = document.getElementById('headers').value.trim();

  if (!tableName || !headersRaw) {
    responseOutput.textContent = "Compila tutti i campi.";
    return;
  }

  const headers = headersRaw.split(',').map(h => h.trim()).filter(h => h.length > 0);

  if (headers.length === 0) {
    responseOutput.textContent = "Inserisci almeno una colonna.";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/table/createTable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName, headers })
    });
    const json = await res.json();
    responseOutput.textContent = JSON.stringify(json, null, 2);
    if (json.success) {
      fetchAllTables();
      tableForm.reset();
    }
  } catch (err) {
    responseOutput.textContent = "Errore durante la creazione della tabella.";
    console.error(err);
  }
});

// --- AGGIUNGI RIGA ---

const addRowForm = document.getElementById("addRowForm");
const addRowResponse = document.getElementById("addRowResponse");

addRowForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const tableName = tableSelectForRow.value;
  const valuesRaw = document.getElementById('valuesInput').value.trim();

  if (!tableName) {
    addRowResponse.textContent = "Seleziona una tabella.";
    return;
  }

  if (!valuesRaw) {
    addRowResponse.textContent = "Inserisci i valori per la riga.";
    return;
  }

  // Split valori, gestione placeholder virgola
  const values = valuesRaw.split(',').map(v => v.trim());

  try {
    const res = await fetch(`${BASE_URL}/table/insertRow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName, values })
    });

    const json = await res.json();
    addRowResponse.textContent = JSON.stringify(json, null, 2);

    if (json.success) {
      fetchTableData(tableName);
      addRowForm.reset();
    }
  } catch (err) {
    addRowResponse.textContent = "Errore durante l'inserimento della riga.";
    console.error(err);
  }
});

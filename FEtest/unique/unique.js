const BASE_URL = "http://localhost:8080"; // 🔧 cambia qui se l'host cambia

let currentTable = "";

function fetchAllTables() {
  fetch(`${BASE_URL}/table/allTables`)
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById("tableSelect");
      select.innerHTML = "";

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        data.data.forEach(name => {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;
          select.appendChild(option);
        });

        currentTable = select.value;
        updateMiniTable();
        fetchTableData(currentTable);
      } else {
        document.getElementById("error").textContent = "Nessuna tabella disponibile.";
        currentTable = "";
        updateMiniTable();
        document.getElementById("tableData").innerHTML = "";
      }
    })
    .catch(err => {
      console.error("Errore durante il recupero delle tabelle:", err);
      document.getElementById("error").textContent = "Errore nel recupero delle tabelle.";
    });
}

function loadTable() {
  const select = document.getElementById("tableSelect");
  currentTable = select.value;
  updateMiniTable();
  fetchTableData(currentTable);
}

function refreshTable() {
  if (!currentTable) {
    document.getElementById("error").textContent = "Nessuna tabella da aggiornare.";
    return;
  }
  updateMiniTable();
  fetchTableData(currentTable);
}

function fetchTableData(tableName) {
  document.getElementById("error").textContent = "";
  fetch(`${BASE_URL}/table/getTable?table=${encodeURIComponent(tableName)}`)
    .then(response => {
      if (!response.ok) throw new Error("Errore nella fetch");
      return response.json();
    })
    .then(data => {
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
    })
    .catch(err => {
      document.getElementById("tableData").innerHTML = "";
      document.getElementById("error").textContent = "Errore nel caricamento della tabella.";
      console.error(err);
    });
}

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
    const btnLoad = document.createElement('button');
    btnLoad.textContent = 'Visualizza';
    btnLoad.onclick = () => {
      currentTable = tableName;
      document.getElementById('tableSelect').value = tableName;
      fetchTableData(tableName);
    };
    tdActions.appendChild(btnLoad);
    tr.appendChild(tdName);
    tr.appendChild(tdActions);
    miniTableBody.appendChild(tr);
  });

  miniTable.style.display = 'table';
}

// Gestione submit form creazione tabella
document.getElementById('tableForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const tableName = document.getElementById('tableName').value.trim();
  const headersRaw = document.getElementById('headers').value.trim();

  if (!tableName || !headersRaw) return;

  const headers = headersRaw.split(',').map(h => h.trim()).filter(h => h.length > 0);

  const payload = {
    tableName,
    headers
  };

  try {
    const res = await fetch(`${BASE_URL}/table/generateTable`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    document.getElementById('responseOutput').textContent = JSON.stringify(data, null, 2);

    // Aggiorna select tabelle e visualizza nuova tabella
    await fetchAllTables();
    currentTable = tableName;
    document.getElementById('tableSelect').value = currentTable;
    fetchTableData(currentTable);

  } catch (err) {
    document.getElementById('responseOutput').textContent = "Errore nella creazione tabella: " + err.message;
  }
});

// Gestione submit form aggiunta riga
document.getElementById('addRowForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const responseOutput = document.getElementById('addRowResponse');
  const input = document.getElementById('valuesInput');
  responseOutput.textContent = "";

  if (!currentTable) {
    responseOutput.textContent = "Seleziona prima una tabella dal menu a tendina.";
    return;
  }

  const valuesRaw = input.value.trim();
  if (!valuesRaw) {
    responseOutput.textContent = "Inserisci i valori separati da virgola.";
    return;
  }

  // Dividi valori, rimuovi spazi superflui
  const values = valuesRaw.split(',').map(v => v.trim());

  const payload = {
    tableName: currentTable,
    values: values
  };

  try {
    const res = await fetch(`${BASE_URL}/table/add-row`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Errore API: ${errorText || res.status}`);
    }

    const data = await res.json();
    responseOutput.textContent = "Riga aggiunta con successo:\n" + JSON.stringify(data, null, 2);
    
    // Pulisci input
    input.value = "";

    // Aggiorna tabella per vedere la nuova riga
    fetchTableData(currentTable);

  } catch (err) {
    responseOutput.textContent = "Errore durante inserimento riga:\n" + err.message;
  }
});

// On load iniziale
window.addEventListener('DOMContentLoaded', () => {
  fetchAllTables();

  document.getElementById('tableSelect').addEventListener('change', (e) => {
  currentTable = e.target.value;
  fetchTableData(currentTable);
  updateMiniTable();
    });


  // Navbar gestione switch sezioni
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.target.getAttribute('data-target');
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(target).classList.add('active');

      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
});

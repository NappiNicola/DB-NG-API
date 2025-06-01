let currentTable = "";

function fetchAllTables() {
    fetch("http://localhost:8080/table/allTables")
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

                currentTable = data.data[0];
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
    fetch(`http://localhost:8080/table/getTable?table=${encodeURIComponent(tableName)}`)
        .then(response => {
            if (!response.ok) throw new Error("Errore nella fetch");
            return response.json();
        })
        .then(data => {
            const headers = data.headers.columnNames;
            const rows = data.rows;
            const table = document.getElementById("tableData");

            table.innerHTML = "";

            // Crea intestazione
            const thead = table.createTHead();
            const rowHead = thead.insertRow();
            headers.forEach(h => {
                const th = document.createElement("th");
                th.textContent = h;
                rowHead.appendChild(th);
            });

            // Crea corpo
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

// Funzione per aggiornare la mini tabella sopra
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

        // Nome tabella
        const tdName = document.createElement('td');
        tdName.textContent = tableName;
        tr.appendChild(tdName);

        // Pulsante elimina
        const tdBtn = document.createElement('td');
        const btn = document.createElement('button');
        btn.textContent = "Elimina";
        btn.className = "deleteButton";
        btn.style.cursor = "pointer";

        btn.onclick = () => deleteTable(tableName);

        tdBtn.appendChild(btn);
        tr.appendChild(tdBtn);

        miniTableBody.appendChild(tr);
    });

    miniTable.style.display = 'table';
}

// Funzione chiamata dal pulsante elimina - chiamata DELETE con fetch
async function deleteTable(tableName) {
    if (!tableName) {
        alert('Nome tabella non valido.');
        return;
    }

    if (!confirm(`Sei sicuro di voler eliminare la tabella "${tableName}"?`)) {
        return;
    }

    const url = `http://localhost:8080/table/delete?table=${encodeURIComponent(tableName)}`;

    try {
        const response = await fetch(url, { method: 'DELETE' });
        if (response.ok) {
            alert(`Tabella "${tableName}" eliminata con successo.`);
            // Ricarica tabelle e mini tabella
            await fetchAllTables();

            // Se la tabella eliminata era quella caricata, resetta visualizzazione
            if (tableName === currentTable) {
                currentTable = "";
                document.getElementById('tableData').innerHTML = "";
            }
        } else {
            const errorText = await response.text();
            alert(`Errore eliminazione tabella: ${errorText}`);
        }
    } catch (error) {
        alert('Errore nella chiamata DELETE: ' + error.message);
    }
}

// Aggiorna la mini tabella anche al cambio di selezione
document.getElementById('tableSelect').addEventListener('change', () => {
    updateMiniTable();
    // Aggiorna anche la tabella di dati quando selezioni un'altra tabella
    loadTable();
});

// Carica tutte le tabelle al caricamento della pagina
fetchAllTables();

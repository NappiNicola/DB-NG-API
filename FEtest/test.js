let currentTable = "";

function fetchAllTables() {
    fetch("http://localhost:8080/table/allTables")
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("tableSelect");
            select.innerHTML = "";

            if (data.success && Array.isArray(data.data)) {
                data.data.forEach(name => {
                    const option = document.createElement("option");
                    option.value = name;
                    option.textContent = name;
                    select.appendChild(option);
                });

                currentTable = data.data[0];
                fetchTableData(currentTable);
            } else {
                document.getElementById("error").textContent = "Nessuna tabella disponibile.";
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
    fetchTableData(currentTable);
}

function refreshTable() {
    if (!currentTable) {
        document.getElementById("error").textContent = "Nessuna tabella da aggiornare.";
        return;
    }
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

// Carica tutte le tabelle al caricamento della pagina
fetchAllTables();
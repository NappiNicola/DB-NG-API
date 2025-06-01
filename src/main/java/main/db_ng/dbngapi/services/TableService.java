package main.db_ng.dbngapi.services;

import actions.AddRow;
import actions.CreateTable;
import actions.DeleteTable;
import actions.GetAllTables;
import db_class.Table;
import operationsIO.IOFile;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TableService {

    public Table generateTable(String tableName, List<String> headers) {
        CreateTable ct = new CreateTable(tableName, headers);
        return ct.getTable();
    }

    public Table getTable(String tableName) {
        JSONObject tabelObj = IOFile.readFromFile(tableName);
        Table tab = utils.Utility.parseJsonToTable(tabelObj);

        return tab;
    }

    public Table addRowToTable(String tableName, List<String> values) {
        JSONObject tableJ = IOFile.readFromFile(tableName);
        Table table = utils.Utility.parseJsonToTable(tableJ);
        if (table == null) {
            throw new IllegalArgumentException("Table not found: " + tableName);
        }

        AddRow ar = new AddRow();
        table = ar.addRowFromApi(table, values);

        IOFile.saveOnFile(table.getTableName(), table.toJSON());

        return table;
    }

    public List<String> getHeader(String tableName) {
        return utils.Utility.getColumnNames(tableName);
    }

    public boolean deleteTable(String tableName) {
        return DeleteTable.deleteTable(tableName);
    }

    public List<String> getAllTables() {
        return GetAllTables.listTables();
    }
}

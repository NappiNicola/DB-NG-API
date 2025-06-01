package main.db_ng.dbngapi.controller;

import db_class.Table;
import main.db_ng.dbngapi.dto.AddRowRequest;
import main.db_ng.dbngapi.dto.CreateTableRequest;
import main.db_ng.dbngapi.services.TableService;
import operationsIO.IOFile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static misc.Misc.prettyJson;

@RestController
public class TableController {

    private final TableService tableService;

    public TableController(TableService tableService) {
        this.tableService = tableService;
    }

    @PostMapping("/generate-table")
    public String generateTable(@RequestBody CreateTableRequest request) {
        Table table = tableService.generateTable(request.getTableName(), request.getHeaders());
        IOFile.saveOnFile(table.getTableName(), table.toJSON());
        return prettyJson(table.toJSON());
    }

    @PostMapping("/add-row")
    public String addRow(@RequestBody AddRowRequest request) {
        Table table = tableService.addRowToTable(request.getTableName(), request.getValues());
        return prettyJson(table.toJSON());
    }

    @GetMapping("/getTable")
    public String getTable(@RequestParam("table") String tableName) {
        Table table = tableService.getTable(tableName);

        return prettyJson(table.toJSON());
    }

    @GetMapping("/getHeaders")
    public String getHeaders(@RequestParam("table") String tableName) {

        List<String> headers = tableService.getHeader(tableName);

        return prettyJson(headers);

    }

}

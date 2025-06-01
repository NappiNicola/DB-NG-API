package main.db_ng.dbngapi.controller;

import db_class.Table;
import main.db_ng.dbngapi.dto.AddRowRequest;
import main.db_ng.dbngapi.dto.CreateTableRequest;
import main.db_ng.dbngapi.services.TableService;
import misc.ApiResponseJSON;
import operationsIO.IOFile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static misc.Misc.listToJSON;
import static misc.Misc.prettyJson;

@RestController
@RequestMapping("/table")
@CrossOrigin(origins = "*")
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

    @GetMapping("/allTables")
    public ApiResponseJSON getAllTables() {
        ApiResponseJSON apiResponseJSON = new ApiResponseJSON();
        List<String> tables = tableService.getAllTables();

        if (!tables.isEmpty()) {
            apiResponseJSON.setSuccess(true);
            apiResponseJSON.setMessage("Successfully retrieved tables");
            apiResponseJSON.setData(tables); // oppure listToJSON(tables)
        } else {
            apiResponseJSON.setSuccess(false);
            apiResponseJSON.setMessage("No tables found");
            apiResponseJSON.setData(null);
        }

        return apiResponseJSON;
    }


    @GetMapping("/getHeaders")
    public String getHeaders(@RequestParam("table") String tableName) {

        List<String> headers = tableService.getHeader(tableName);

        return prettyJson(headers);

    }

    @DeleteMapping("/delete")
    public ApiResponseJSON delete(@RequestParam("table") String tableName) {
        boolean deleted = tableService.deleteTable(tableName);
        if (deleted) {
            return new ApiResponseJSON("Table " + tableName + " deleted successfully", true);
        } else {
            return new ApiResponseJSON("Table " + tableName + "  not found or couldn't be deleted", false);
        }
    }

}

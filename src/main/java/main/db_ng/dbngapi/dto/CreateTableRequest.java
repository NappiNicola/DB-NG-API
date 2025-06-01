package main.db_ng.dbngapi.dto;

import java.util.List;

public class CreateTableRequest {

    private String tableName;
    private List<String> headers;

    public CreateTableRequest() {}

    public String getTableName() {
        return tableName;
    }
    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public List<String> getHeaders() {
        return headers;
    }
    public void setHeaders(List<String> headers) {
        this.headers = headers;
    }
}


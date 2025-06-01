package main.db_ng.dbngapi.dto;

import java.util.List;

public class AddRowRequest {
    private String tableName;
    private List<String> values;

    public AddRowRequest() {}

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public List<String> getValues() {
        return values;
    }

    public void setValues(List<String> values) {
        this.values = values;
    }
}

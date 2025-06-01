package misc;

import org.json.JSONObject;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

public class ApiResponseJSON {
    private String message;
    private boolean success;
    private LocalDateTime timestamp;
    Object data;

    public ApiResponseJSON() {
        this.timestamp = LocalDateTime.ofInstant(Instant.now(), ZoneId.systemDefault());
        this.data = new JSONObject();
    }

    public ApiResponseJSON(String message, boolean success) {
        this.message = message;
        this.success = success;
        this.timestamp = LocalDateTime.now();
        data = new JSONObject();
    }

    public String getMessage() {
        return message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

}

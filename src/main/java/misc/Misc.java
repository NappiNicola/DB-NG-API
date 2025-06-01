package misc;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;

public class Misc {

    public static String prettyJson(JSONObject json) {
        return json.toString(4); // indentazione 4 spazi
    }

    public static String prettyJson(List<String> list) {
        return new JSONArray(list).toString(4); // 4 = indentazione
    }

    public static Object listToJSON(List<String> list) {
        return list; // lasciamo che Jackson serializzi correttamente
    }

}

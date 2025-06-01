package misc;

import org.json.JSONObject;

import java.util.List;

public class Misc {

    public static String prettyJson(JSONObject json) {
        return json.toString(4); // indentazione 4 spazi
    }

    public static String prettyJson(List<String> list) {
        return new org.json.JSONArray(list).toString(4); // 4 = indentazione
    }

}

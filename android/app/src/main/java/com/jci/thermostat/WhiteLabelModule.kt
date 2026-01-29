package com.jci.thermostat

import android.content.res.Resources
import com.facebook.react.bridge.*
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.io.IOException
import java.io.InputStream

class WhiteLabelModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {

    override fun getName(): String = "WhiteLabelModule"

    override fun getConstants(): Map<String, Any>? {
        val resources: Resources = reactApplicationContext.resources
        val constants = HashMap<String, Any>()

        try {
            val json = JSONObject(loadJSONFromAssets() ?: "")
            val graphUrl = json.getString("graph_url")
            val uriScheme = json.getString("uri_scheme")
            val androidStoreID = json.getString("android_store_id")
            val lightColors = json.getJSONObject("light_colors")
            val darkColors = json.getJSONObject("dark_colors")
            println("Graph URL: $graphUrl")

            constants["GRAPH_URL"] = graphUrl
            constants["URI_SCHEME"] = uriScheme
            constants["ANDROID_STORE_ID"] = androidStoreID
            constants["LIGHT_COLORS"] = convertJsonToMap(lightColors)
            constants["DARK_COLORS"] = convertJsonToMap(darkColors)

        } catch (e: Exception) {
            e.printStackTrace()
        }
        return constants
    }

    private fun loadJSONFromAssets(): String? {
        return try {
            val file = java.io.File("/")
            if (!file.exists()) return null
            val inputStream: InputStream = reactApplicationContext.assets.open("whitelabel.json")
            val size = inputStream.available()
            val buffer = ByteArray(size)
            inputStream.read(buffer)
            inputStream.close()
            String(buffer, Charsets.UTF_8)
        } catch (ex: IOException) {
            ex.printStackTrace()
            null
        }
    }

    companion object {

        @Throws(JSONException::class)
        fun convertJsonToMap(jsonObject: JSONObject): WritableMap {
            val map: WritableMap = WritableNativeMap()
            val iterator = jsonObject.keys()

            while (iterator.hasNext()) {
                val key = iterator.next()
                val value = jsonObject.get(key)
                when (value) {
                    is JSONObject -> map.putMap(key, convertJsonToMap(value))
                    is JSONArray -> map.putArray(key, convertJsonToArray(value))
                    is Boolean -> map.putBoolean(key, value)
                    is Int -> map.putInt(key, value)
                    is Double -> map.putDouble(key, value)
                    is String -> map.putString(key, value)
                    else -> map.putString(key, value.toString())
                }
            }
            return map
        }

        @Throws(JSONException::class)
        fun convertJsonToArray(jsonArray: JSONArray): WritableArray {
            val array: WritableArray = WritableNativeArray()

            for (i in 0 until jsonArray.length()) {
                val value = jsonArray.get(i)
                when (value) {
                    is JSONObject -> array.pushMap(convertJsonToMap(value))
                    is JSONArray -> array.pushArray(convertJsonToArray(value))
                    is Boolean -> array.pushBoolean(value)
                    is Int -> array.pushInt(value)
                    is Double -> array.pushDouble(value)
                    is String -> array.pushString(value)
                    else -> array.pushString(value.toString())
                }
            }
            return array
        }
    }
}
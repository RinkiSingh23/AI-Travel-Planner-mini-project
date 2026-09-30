from __future__ import annotations

import json
import os
from pathlib import Path
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder="../Frontend", static_url_path="")
FRONTEND_DIR = Path(app.root_path).parent / "Frontend"
GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_API = "https://api.open-meteo.com/v1/forecast"
PLACES_API = "https://nominatim.openstreetmap.org/search"
REVERSE_API = "https://nominatim.openstreetmap.org/reverse"
NUMBEO_API = "https://www.numbeo.com/api/city_prices"
HTTP_TIMEOUT_SECONDS = 20


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    return response


def fetch_json(url: str) -> dict | list:
    req = Request(url, headers={"User-Agent": "MiniProjectWeatherAPI/1.0"})
    with urlopen(req, timeout=HTTP_TIMEOUT_SECONDS) as response:
        return json.loads(response.read().decode("utf-8"))


def weather_code_label(code):
    mapping = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Light freezing drizzle",
        57: "Dense freezing drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Light freezing rain",
        67: "Heavy freezing rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        77: "Snow grains",
        80: "Rain showers",
        81: "Heavy rain showers",
        82: "Violent rain showers",
        85: "Snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Severe thunderstorm with hail",
    }
    return mapping.get(code, "Weather update")


def get_city_coordinates(city_name: str):
    normalized_city = " ".join(city_name.split())
    queries = [normalized_city]
    for separator in (",", "."):
        city_only = city_name.split(separator, 1)[0].strip()
        if city_only and city_only not in queries:
            queries.append(city_only)

    results = []
    for query in queries:
        encoded = quote(query)
        url = f"{GEOCODING_API}?name={encoded}&count=1&language=en&format=json"
        data = fetch_json(url)
        results = data.get("results") or []
        if results:
            break

    if not results:
        raise ValueError(f"No weather data found for '{city_name}'")

    location = results[0]
    return {
        "city": location.get("name"),
        "state": location.get("admin1"),
        "country": location.get("country"),
        "latitude": float(location["latitude"]),
        "longitude": float(location["longitude"]),
    }


def search_locations(query: str):
    encoded = quote(" ".join(query.split()))
    url = f"{GEOCODING_API}?name={encoded}&count=5&language=en&format=json"
    data = fetch_json(url)
    return [
        {
            "city": item.get("name"),
            "state": item.get("admin1"),
            "country": item.get("country"),
            "latitude": float(item["latitude"]),
            "longitude": float(item["longitude"]),
        }
        for item in data.get("results") or []
    ]


def reverse_location(latitude: float, longitude: float):
    url = f"{REVERSE_API}?lat={latitude}&lon={longitude}&format=jsonv2&zoom=10"
    data = fetch_json(url)
    address = data.get("address") or {}
    return {
        "city": address.get("city") or address.get("town") or address.get("village") or "Current location",
        "state": address.get("state"),
        "country": address.get("country"),
        "latitude": latitude,
        "longitude": longitude,
    }


def search_places(city_name: str, category: str):
    query = quote(f"{category} in {city_name}")
    url = f"{PLACES_API}?q={query}&format=jsonv2&limit=5&addressdetails=1"
    data = fetch_json(url)
    return [
        {
            "name": item.get("name") or item.get("display_name", "").split(",")[0],
            "category": category,
            "type": item.get("type"),
            "latitude": float(item["lat"]),
            "longitude": float(item["lon"]),
            "address": item.get("display_name"),
        }
        for item in data
        if item.get("lat") and item.get("lon")
    ]


def find_average_price(prices: list, item_text: str):
    for item in prices:
        if item_text in item.get("item_name", "").lower():
            try:
                return float(item["average_price"])
            except (KeyError, TypeError, ValueError):
                return None
    return None


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "weather-api"})


@app.get("/")
def frontend():
    return send_from_directory(FRONTEND_DIR, "Index.html")


@app.get("/locations")
def locations():
    query = request.args.get("q", "").strip()
    if len(query) < 2:
        return jsonify([])
    try:
        return jsonify(search_locations(query))
    except Exception as exc:
        return jsonify({"error": f"Unable to search locations: {exc}"}), 502


@app.get("/location")
def location():
    try:
        latitude = float(request.args["lat"])
        longitude = float(request.args["lon"])
        return jsonify(reverse_location(latitude, longitude))
    except (KeyError, ValueError):
        return jsonify({"error": "Latitude and longitude must be valid numbers."}), 400
    except Exception as exc:
        return jsonify({"error": f"Unable to identify this location: {exc}"}), 502


@app.get("/weather")
def weather():
    city = request.args.get("city")
    lat_arg = request.args.get("lat")
    lon_arg = request.args.get("lon")

    if city:
        try:
            location = get_city_coordinates(city)
        except Exception as exc:
            return jsonify({"error": str(exc)}), 404
        lat = location["latitude"]
        lon = location["longitude"]
        city_label = location["city"]
        country_label = location.get("country")
    elif lat_arg and lon_arg:
        try:
            lat = float(lat_arg)
            lon = float(lon_arg)
        except ValueError:
            return jsonify({"error": "Latitude and longitude must be valid numbers."}), 400
        city_label = "Custom location"
        country_label = "Coordinates"
    else:
        return jsonify({"error": "Provide a 'city' query parameter or both 'lat' and 'lon' parameters."}), 400

    forecast_url = (
        f"{FORECAST_API}?latitude={lat}&longitude={lon}"
        "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code"
        "&timezone=auto"
    )

    try:
        forecast = fetch_json(forecast_url)
    except Exception as exc:
        return jsonify({"error": f"Unable to fetch weather: {exc}"}), 500

    current = forecast.get("current") or {}
    weather_code = current.get("weather_code")

    payload = {
        "city": city_label,
        "country": country_label,
        "latitude": lat,
        "longitude": lon,
        "temperature_c": current.get("temperature_2m"),
        "feels_like_c": current.get("apparent_temperature"),
        "humidity": current.get("relative_humidity_2m"),
        "wind_kph": current.get("wind_speed_10m"),
        "condition": weather_code_label(weather_code),
        "timezone": forecast.get("timezone"),
    }

    return jsonify(payload)


@app.get("/places")
def places():
    city = request.args.get("city")
    if not city:
        return jsonify({"error": "Provide a 'city' query parameter."}), 400

    try:
        location = get_city_coordinates(city)
        attractions = search_places(location["city"], "tourism")
        food = search_places(location["city"], "restaurant")
    except Exception as exc:
        return jsonify({"error": f"Unable to fetch places: {exc}"}), 502

    return jsonify({
        "city": location["city"],
        "country": location.get("country"),
        "latitude": location["latitude"],
        "longitude": location["longitude"],
        "places": attractions + food,
    })


@app.get("/budget")
def budget():
    api_key = os.environ.get("NUMBEO_API_KEY")
    if not api_key:
        return jsonify({"error": "Live city prices require a NUMBEO_API_KEY configuration."}), 503

    city = " ".join(request.args.get("city", "").split())
    currency = request.args.get("currency", "INR").upper()
    try:
        days = int(request.args.get("days", "0"))
        travelers = int(request.args.get("travelers", "0"))
    except ValueError:
        return jsonify({"error": "Days and travelers must be valid whole numbers."}), 400

    if not city:
        return jsonify({"error": "Provide a 'city' query parameter."}), 400
    if not 1 <= days <= 60 or not 1 <= travelers <= 20:
        return jsonify({"error": "Days must be 1-60 and travelers must be 1-20."}), 400
    if currency not in {"INR", "USD", "EUR"}:
        return jsonify({"error": "Currency must be INR, USD, or EUR."}), 400

    params = urlencode({"api_key": api_key, "query": city, "currency": currency})
    try:
        data = fetch_json(f"{NUMBEO_API}?{params}")
        if not isinstance(data, dict):
            raise ValueError("The price provider returned an invalid response.")
        response_currency = data.get("currency")
        if response_currency and response_currency != currency:
            raise ValueError(f"The provider returned prices in {response_currency}, not {currency}.")

        prices = data.get("prices") or []
        meal_price = find_average_price(prices, "meal, inexpensive restaurant")
        transit_price = find_average_price(prices, "one-way ticket")
        activity_price = find_average_price(prices, "cinema, international release")
        monthly_rent = find_average_price(prices, "apartment (1 bedroom) in city centre")
        if monthly_rent is None:
            monthly_rent = find_average_price(prices, "apartment (1 bedroom) in city center")
        if meal_price is None and transit_price is None and activity_price is None and monthly_rent is None:
            raise ValueError("No meal, activity, transit, or accommodation prices were returned for this city.")

        food = (meal_price or 0) * 3 * travelers * days
        local_transport = (transit_price or 0) * 3 * travelers * days
        activities = (activity_price or 0) * travelers * days
        accommodation = (monthly_rent or 0) / 30 * max(days - 1, 0)
        priced_costs = food + local_transport + activities + accommodation
        contingency = priced_costs * 0.12
        breakdown = {
            "food": round(food, 2),
            "activities": round(activities, 2),
            "local_transport": round(local_transport, 2),
            "accommodation_proxy": round(accommodation, 2),
            "contingency": round(contingency, 2),
        }
        unavailable = []
        if meal_price is None:
            unavailable.append("food")
        if transit_price is None:
            unavailable.append("local_transport")
        if activity_price is None:
            unavailable.append("activities")
        if monthly_rent is None:
            unavailable.append("accommodation")

        return jsonify({
            "city": data.get("name", city),
            "currency": response_currency or currency,
            "days": days,
            "travelers": travelers,
            "total": round(priced_costs + contingency, 2),
            "breakdown": breakdown,
            "unavailable": unavailable,
            "updated_month": data.get("monthLastUpdate"),
            "updated_year": data.get("yearLastUpdate"),
            "source": "Numbeo current city prices",
        })
    except Exception as exc:
        return jsonify({"error": f"Unable to estimate current city costs: {exc}"}), 502


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)

const state = {
  plan: null,
  records: [],
  initialized: false,
  map: null,
  packingBaseItems: [],
  customPackingItems: []
};
const API_BASE_URL = window.location.protocol === "file:" ? "http://localhost:5000" : window.location.origin;
const WEATHER_API_URL = `${API_BASE_URL}/weather`;
const BUDGET_API_URL = `${API_BASE_URL}/budget`;
const LOCAL_STORAGE_KEY = "roamwell-saved-plans";
const LOCATION_API_URL = API_BASE_URL;

const destinationProfiles = [{
  match: /jaipur|rajasthan/i,
  attractions: ["Amber Fort at golden hour", "City Palace courtyards", "Hawa Mahal streets"],
  food: ["Dal baati churma", "Laal maas", "Masala chai at a local cafe"],
  weather: "Warm, dry days with cooler evenings.",
  emergency: "112 | India emergency",
  safety: "Carry water for daytime walks, agree taxi prices before leaving, and keep a light scarf handy for heritage sites."
}, {
  match: /goa/i,
  attractions: ["Old Goa churches", "Sunset at a quiet beach", "Fontainhas heritage lanes"],
  food: ["Goan fish curry", "Prawn balchao", "Fresh coconut water"],
  weather: "Humid coastal weather with plenty of sun.",
  emergency: "112 | India emergency",
  safety: "Use licensed water-sport operators, protect yourself from the sun, and avoid isolated beaches after dark."
}, {
  match: /paris/i,
  attractions: ["Louvre Museum highlights", "Montmartre walking loop", "Seine river promenade"],
  food: ["Fresh croissant breakfast", "Bistro lunch menu", "Classic crepes"],
  weather: "Mild city weather; layers make sightseeing easy.",
  emergency: "112 | European emergency",
  safety: "Watch personal belongings around major sights and use official taxis or transit options late at night."
}, {
  match: /tokyo/i,
  attractions: ["Meiji Shrine gardens", "Shibuya crossing at dusk", "Asakusa temple district"],
  food: ["Ramen counter dinner", "Sushi breakfast", "Matcha sweets"],
  weather: "Changeable urban weather; pack flexible layers.",
  emergency: "110 Police | 119 Ambulance",
  safety: "Keep your hotel address saved offline, observe local etiquette in sacred spaces, and use station signage for navigation."
}, {
  match: /bali/i,
  attractions: ["Tegalalang rice terraces", "Uluwatu sunset temple", "Ubud artisan market"],
  food: ["Nasi goreng", "Fresh tropical fruit", "Balinese satay"],
  weather: "Tropical and warm with occasional quick showers.",
  emergency: "112 | Local emergency",
  safety: "Use reef-safe sunscreen, respect temple dress codes, and book drivers through trusted accommodation."
}, {
  match: /.*/i,
  attractions: ["Historic centre walking route", "Signature viewpoint", "Local market or arts quarter"],
  food: ["Regional breakfast staple", "Popular local speciality", "Neighbourhood cafe stop"],
  weather: "Check the local forecast before departure and bring adaptable layers.",
  emergency: "112 | Local emergency",
  safety: "Share your itinerary with someone you trust, use licensed transport, and keep digital copies of important documents."
}];

const visualProfiles = [{
  match: /jaipur|rajasthan/i,
  items: [
    ["Hawa Mahal", "place", "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=700&q=82"],
    ["Amber Fort", "place", "https://images.unsplash.com/photo-1592639296346-560c37a0f711?auto=format&fit=crop&w=700&q=82"],
    ["Dal baati churma", "food", "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=82"],
    ["Masala chai", "food", "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=700&q=82"]
  ]
}, {
  match: /paris/i,
  items: [
    ["Eiffel Tower", "place", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=700&q=82"],
    ["Montmartre", "place", "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=700&q=82"],
    ["French pastry", "food", "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=82"],
    ["Bistro table", "food", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=82"]
  ]
}, {
  match: /tokyo/i,
  items: [
    ["Shibuya at dusk", "place", "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=700&q=82"],
    ["Asakusa", "place", "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=700&q=82"],
    ["Ramen counter", "food", "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=700&q=82"],
    ["Sushi set", "food", "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=700&q=82"]
  ]
}, {
  match: /.*/i,
  items: [
    ["A memorable viewpoint", "place", "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=82"],
    ["A local street", "place", "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=700&q=82"],
    ["Local speciality", "food", "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=82"],
    ["Neighbourhood table", "food", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=82"]
  ]
}];

const tripOptions = [{
  destination: "Rishikesh, India",
  currency: "INR",
  estimatedBudget: 18000,
  days: 4,
  tags: ["nature", "wellness", "adventure"],
  description: "A calm river-and-mountain escape with outdoor activities and wellness stops."
}, {
  destination: "Jaipur, India",
  currency: "INR",
  estimatedBudget: 22000,
  days: 4,
  tags: ["culture", "food", "heritage"],
  description: "A colorful heritage break with forts, markets, and memorable local food."
}, {
  destination: "Kochi, India",
  currency: "INR",
  estimatedBudget: 24000,
  days: 4,
  tags: ["food", "culture", "nature"],
  description: "A relaxed coastal route through galleries, historic streets, and Kerala flavors."
}, {
  destination: "Goa, India",
  currency: "INR",
  estimatedBudget: 28000,
  days: 4,
  tags: ["nature", "food", "wellness"],
  description: "A sunny coastal stay with beaches, heritage lanes, and easygoing evenings."
}, {
  destination: "Bali, Indonesia",
  currency: "INR",
  estimatedBudget: 70000,
  days: 5,
  tags: ["nature", "wellness", "food"],
  description: "A tropical trip combining rice terraces, temples, beaches, and restorative breaks."
}, {
  destination: "Paris, France",
  currency: "INR",
  estimatedBudget: 95000,
  days: 5,
  tags: ["culture", "food", "shopping"],
  description: "A classic city escape built around art, neighborhood walks, and excellent food."
}, {
  destination: "Tokyo, Japan",
  currency: "INR",
  estimatedBudget: 105000,
  days: 5,
  tags: ["food", "culture", "shopping"],
  description: "A high-energy city adventure with temples, design districts, and exceptional dining."
}];

const currencyToInr = {
  INR: 1,
  USD: 83,
  EUR: 90
};

function profileFor(destination) {
  return destinationProfiles.find(item => item.match.test(destination)) || destinationProfiles[destinationProfiles.length - 1];
}

function visualProfileFor(destination) {
  return visualProfiles.find(item => item.match.test(destination)) || visualProfiles[visualProfiles.length - 1];
}

function parseAssistantRequest(text) {
  const normalized = text.toLowerCase();
  const amountMatch = normalized.match(/(?:₹|rs\.?|inr|\$|usd|€|eur)?\s*([\d,]+(?:\.\d+)?)/i);
  const currency = /\$|usd/.test(normalized) ? "USD" : /€|eur/.test(normalized) ? "EUR" : "INR";
  const typedBudget = amountMatch ? Number(amountMatch[1].replace(/,/g, "")) : Number(document.getElementById("budget").value);
  const budget = Number.isFinite(typedBudget) && typedBudget > 0 ? typedBudget : 30000;
  const interest = ["culture", "food", "nature", "shopping", "adventure", "wellness"].find(item => normalized.includes(item));
  return {
    budget,
    currency,
    budgetInr: budget * currencyToInr[currency],
    interest
  };
}

function formatAssistantMoney(value, currency) {
  return money(value, currency);
}

function addAssistantMessage(text, type = "assistant") {
  const messages = document.getElementById("assistant-messages");
  const message = document.createElement("p");
  message.className = `assistant-message assistant-message-${type}`;
  message.textContent = text;
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

function renderAssistantSuggestions(suggestions, currency) {
  const messages = document.getElementById("assistant-messages");
  const group = document.createElement("div");
  group.className = "assistant-suggestions";

  suggestions.forEach(option => {
    const card = document.createElement("article");
    card.className = "assistant-suggestion";
    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = option.destination;
    const description = document.createElement("p");
    description.textContent = `${option.description} About ${formatAssistantMoney(option.estimatedBudget, currency)} for ${option.days} days.`;
    const button = document.createElement("button");
    button.className = "canva-button rounded-lg px-3 py-2 text-sm font-bold";
    button.type = "button";
    button.textContent = "Use this trip";
    button.addEventListener("click", () => {
      document.getElementById("destination").value = option.destination;
      document.getElementById("budget").value = Math.round(option.estimatedBudget / currencyToInr[currency]);
      document.getElementById("currency").value = currency;
      document.getElementById("planner-panel").scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("destination").focus();
      document.getElementById("assistant-status").textContent = `${option.destination} added to your trip planner.`;
    });
    details.append(title, description);
    card.append(details, button);
    group.appendChild(card);
  });
  messages.appendChild(group);
}

function recommendTrips(request) {
  return tripOptions
    .map(option => ({
      ...option,
      interestMatch: request.interest && option.tags.includes(request.interest) ? 1 : 0,
      distance: Math.abs(option.estimatedBudget - request.budgetInr)
    }))
    .sort((first, second) => second.interestMatch - first.interestMatch || first.distance - second.distance)
    .filter(option => option.estimatedBudget <= request.budgetInr * 1.15)
    .slice(0, 3);
}

function initializeAssistant() {
  addAssistantMessage("Tell me your budget and what you enjoy, and I will suggest a few destinations. Try: trips under 30000 INR for food.");
  document.getElementById("assistant-form").addEventListener("submit", event => {
    event.preventDefault();
    const input = document.getElementById("assistant-input");
    const request = input.value.trim();
    if (!request) return;
    addAssistantMessage(request, "user");
    input.value = "";
    const parsedRequest = parseAssistantRequest(request);
    const suggestions = recommendTrips(parsedRequest);
    if (!suggestions.length) {
      addAssistantMessage(`I could not find a close match under ${formatAssistantMoney(parsedRequest.budget, parsedRequest.currency)}. Try increasing the budget or asking for a shorter trip.`);
      return;
    }
    addAssistantMessage(`Here are options close to your ${formatAssistantMoney(parsedRequest.budget, parsedRequest.currency)} budget${parsedRequest.interest ? ` with a focus on ${parsedRequest.interest}` : ""}:`);
    renderAssistantSuggestions(suggestions, parsedRequest.currency);
  });
}

function money(value, currency) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(Math.round(value));
}

function numberOfDays(start, end) {
  const oneDay = 86400000;
  const diff = Math.round((new Date(end + "T00:00:00") - new Date(start + "T00:00:00")) / oneDay);
  return Math.max(1, diff + 1);
}

function selectedInterests() {
  return [...document.querySelectorAll(".interest-choice input:checked")].map(input => input.value);
}

function estimateTravelCost(budget, travelMode) {
  const fareRates = {
    Flight: .24,
    Train: .12,
    Bus: .08,
    "Road trip": .16
  };
  return Math.floor(Math.min(budget * (fareRates[travelMode] || .16), budget * .35));
}

function createPlanFromForm() {
  const destination = document.getElementById("destination").value.trim();
  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;
  const budget = Number(document.getElementById("budget").value);
  const travelers = Number(document.getElementById("travelers").value);
  const currency = document.getElementById("currency").value;
  const travelMode = document.getElementById("travel-mode").value;
  const occasion = document.getElementById("occasion").value;
  const interests = selectedInterests();

  if (!destination || !startDate || !endDate || !budget || !travelers || endDate < startDate) return null;

  const days = numberOfDays(startDate, endDate);
  const profile = profileFor(destination);
  const interestActivity = {
    Culture: "Discover a heritage landmark and hear the stories behind it.",
    Food: "Join a small local food stop and order a regional speciality.",
    Nature: "Take a scenic walk through a nearby green or waterside area.",
    Shopping: "Browse independent makers and bring home one meaningful souvenir.",
    Adventure: "Choose a guided outdoor activity suited to local conditions.",
    Wellness: "Slow down with a spa, yoga, or restorative cafe break."
  };
  const focus = interests.length ? interests : ["Culture", "Food"];
  const itinerary = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate + "T00:00:00");
    date.setDate(date.getDate() + i);
    const emphasis = focus[i % focus.length];
    itinerary.push({
      day: i + 1,
      date: date.toLocaleDateString("en", {
        weekday: "short",
        day: "numeric",
        month: "short"
      }),
      title: i === 0 ? "Arrival, orientation & easy discoveries" : i === days - 1 ? "A final local favourite" : emphasis + " day",
      activities: [{
        time: "09:00",
        text: i === 0 ? "Settle in, get your bearings, and start with a relaxed neighbourhood breakfast." : "Start with a flexible breakfast close to your first stop."
      }, {
        time: "11:00",
        text: interestActivity[emphasis]
      }, {
        time: "15:30",
        text: "Leave room for a spontaneous detour, photos, and a restful cafe pause."
      }, {
        time: "19:00",
        text: "Enjoy dinner in a well-reviewed local neighbourhood and note tomorrow's route."
      }]
    });
  }

  return {
    destination,
    startDate,
    endDate,
    budget,
    travelers,
    currency,
    interests,
    travelMode,
    occasion,
    days,
    itinerary,
    profile,
    fare: estimateTravelCost(budget, travelMode)
  };
}

async function fetchWeather(destination) {
  const response = await fetch(`${WEATHER_API_URL}?city=${encodeURIComponent(destination)}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Weather service is unavailable.");
  return data;
}

async function fetchPlaces(destination) {
  const placesUrl = WEATHER_API_URL.replace("/weather", "/places");
  const response = await fetch(`${placesUrl}?city=${encodeURIComponent(destination)}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Places service is unavailable.");
  return data;
}

async function fetchBudgetEstimate(plan) {
  const params = new URLSearchParams({
    city: plan.destination,
    days: String(plan.days),
    travelers: String(plan.travelers),
    currency: plan.currency
  });
  const response = await fetch(`${BUDGET_API_URL}?${params}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Current city prices are unavailable.");
  return data;
}

function renderMap(plan) {
  const mapElement = document.getElementById("trip-map");
  if (!mapElement) return;
  if (state.map) {
    state.map.remove();
    state.map = null;
  }
  if (!plan.places?.latitude || !plan.places?.longitude) {
    mapElement.innerHTML = '<div class="map-fallback">Map coordinates are unavailable for this destination.</div>';
    return;
  }
  if (!window.L) {
    mapElement.innerHTML = '<div class="map-fallback">Map tiles are still loading. Place details are listed below.</div>';
    window.setTimeout(() => {
      if (window.L && state.plan === plan) renderMap(plan);
    }, 500);
    return;
  }
  try {
    state.map = L.map(mapElement, {
      scrollWheelZoom: false
    }).setView([plan.places.latitude, plan.places.longitude], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(state.map);

    const points = [
      [plan.places.latitude, plan.places.longitude]
    ];
    L.circleMarker([plan.places.latitude, plan.places.longitude], {
      radius: 9,
      color: "#e97857",
      fillColor: "#e97857",
      fillOpacity: .95
    }).bindPopup(`<strong>${plan.places.city}</strong><br>Trip base`).addTo(state.map);

    (plan.places.places || []).forEach(place => {
      const point = [place.latitude, place.longitude];
      points.push(point);
      L.marker(point).bindPopup(`<strong>${place.name}</strong><br>${place.category}`).addTo(state.map);
    });

    if (points.length > 1) state.map.fitBounds(points, {
      padding: [24, 24],
      maxZoom: 14
    });
    window.requestAnimationFrame(() => state.map?.invalidateSize());
    window.setTimeout(() => state.map?.invalidateSize(), 450);
  } catch (error) {
    mapElement.innerHTML = '<div class="map-fallback">The interactive map could not load. Place details are listed below.</div>';
    state.map = null;
  }
}

function selectDashboardTab(view) {
  document.querySelectorAll("[data-dashboard-view]").forEach(panel => {
    panel.classList.toggle("hidden-view", panel.dataset.dashboardView !== view);
  });
  document.querySelectorAll("[data-dashboard-container]").forEach(container => {
    const views = container.dataset.dashboardContainer.split(/\s+/);
    container.classList.toggle("hidden-view", !views.includes(view));
  });
  document.querySelectorAll("[data-dashboard-tab]").forEach(tab => {
    tab.setAttribute("aria-pressed", String(tab.dataset.dashboardTab === view));
  });
  document.querySelectorAll("[data-dashboard-layout]").forEach(layout => {
    layout.classList.toggle("dashboard-layout-single", view !== "overview");
  });
  if (view === "map" && state.map) {
    window.requestAnimationFrame(() => state.map?.invalidateSize());
  }
}

const dashboardTabList = document.getElementById("dashboard-tabs");
dashboardTabList.addEventListener("click", event => {
  const tab = event.target.closest("[data-dashboard-tab]");
  if (tab) selectDashboardTab(tab.dataset.dashboardTab);
});
dashboardTabList.addEventListener("keydown", event => {
  const tabs = [...dashboardTabList.querySelectorAll("[data-dashboard-tab]")];
  const currentIndex = tabs.indexOf(document.activeElement);
  if (currentIndex < 0) return;
  let nextIndex = currentIndex;
  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
  else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  else if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = tabs.length - 1;
  else return;
  event.preventDefault();
  tabs[nextIndex].focus();
  selectDashboardTab(tabs[nextIndex].dataset.dashboardTab);
});

function renderCelebration(plan) {
  const list = document.getElementById("celebration-list");
  const description = document.getElementById("celebration-description");
  if (!list || !description) return;
  const city = plan.places?.city || plan.destination;
  const occasion = plan.occasion || "special occasion";
  description.textContent = `Ideas for your ${occasion.toLowerCase()} in ${city}: choose a memorable spot, then find a table nearby.`;
  list.replaceChildren();

  const livePlaces = plan.places?.places || [];
  const cards = [
    ...livePlaces.filter(place => place.category === "tourism").slice(0, 3).map(place => ({
      ...place,
      action: "Open spot",
      query: place.name
    })),
    ...livePlaces.filter(place => place.category === "restaurant").slice(0, 3).map(place => ({
      ...place,
      action: "Find a table",
      query: `${place.name} restaurant`
    }))
  ];
  if (!cards.length) {
    plan.profile.attractions.slice(0, 2).forEach(name => cards.push({
      name,
      category: "famous spot",
      action: "Open spot",
      query: name
    }));
    plan.profile.food.slice(0, 2).forEach(name => cards.push({
      name,
      category: "local food",
      action: "Find a table",
      query: `${name} restaurant`
    }));
  }

  const visualItems = visualProfileFor(city).items;
  let placeImageIndex = 0;
  let foodImageIndex = 0;
  cards.forEach(place => {
    const isFood = place.category === "restaurant" || place.category === "local food";
    const pool = visualItems.filter(item => item[1] === (isFood ? "food" : "place"));
    const index = isFood ? foodImageIndex++ : placeImageIndex++;
    place.image = pool[index % pool.length]?.[2] || visualItems[0][2];
  });

  cards.forEach(place => {
    const card = document.createElement("article");
    card.className = "celebration-card";
    const image = document.createElement("img");
    image.className = "celebration-thumb";
    image.src = place.image;
    image.alt = place.name;
    image.loading = "lazy";
    image.onerror = () => {
      image.src = visualItems[0][2];
    };
    const icon = document.createElement("div");
    icon.className = "celebration-icon";
    icon.textContent = place.category === "restaurant" || place.category === "local food" ? "TABLE" : "SPOT";
    const body = document.createElement("div");
    const label = document.createElement("span");
    label.className = "celebration-type";
    label.textContent = place.category === "restaurant" || place.category === "local food" ? "Table idea" : "Famous nearby spot";
    const title = document.createElement("h3");
    title.textContent = place.name;
    const action = document.createElement("a");
    action.className = "celebration-link";
    action.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.query}, ${city}`)}`;
    action.target = "_blank";
    action.rel = "noreferrer";
    action.textContent = place.action;
    body.append(label, title, action);
    card.append(image, icon, body);
    list.appendChild(card);
  });
}

function renderVisualGallery(destination) {
  const gallery = document.getElementById("visual-gallery");
  if (!gallery) return;
  gallery.replaceChildren();
  visualProfileFor(destination).items.forEach(([name, category, image]) => {
    const card = document.createElement("article");
    card.className = "visual-card";
    const picture = document.createElement("img");
    picture.src = image;
    picture.alt = name;
    picture.loading = "lazy";
    picture.onerror = () => {
      picture.src = "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=82";
    };
    const caption = document.createElement("div");
    caption.className = "visual-card-caption";
    caption.innerHTML = `<span>${category === "food" ? "Taste" : "See"}</span><strong></strong>`;
    caption.querySelector("strong").textContent = name;
    card.append(picture, caption);
    gallery.appendChild(card);
  });
}

function calculateBudgetAllocation(plan) {
  const budgetLimit = Math.max(0, Math.floor(Number(plan.budget) || 0));
  const travelCost = Math.min(estimateTravelCost(budgetLimit, plan.travelMode), budgetLimit);
  const availableAfterTravel = budgetLimit - travelCost;
  const estimate = plan.budgetEstimate;
  const estimateBreakdown = estimate?.breakdown || {};
  const unavailable = new Set(estimate?.unavailable || []);
  const toAmount = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  const categories = estimate ? [
    { name: "Accommodation", amount: toAmount(estimateBreakdown.accommodation_proxy), unavailable: unavailable.has("accommodation") },
    { name: "Food", amount: toAmount(estimateBreakdown.food), unavailable: unavailable.has("food") },
    { name: "Activities", amount: toAmount(estimateBreakdown.activities), unavailable: unavailable.has("activities") || typeof estimateBreakdown.activities !== "number" },
    { name: "Local transport", amount: toAmount(estimateBreakdown.local_transport), unavailable: unavailable.has("local_transport") },
    { name: "Other", amount: toAmount(estimateBreakdown.contingency), unavailable: false }
  ] : [
    { name: "Accommodation", amount: availableAfterTravel * .36 },
    { name: "Food", amount: availableAfterTravel * .22 },
    { name: "Activities", amount: availableAfterTravel * .18 },
    { name: "Local transport", amount: availableAfterTravel * .14 },
    { name: "Other", amount: availableAfterTravel * .10 }
  ];
  const estimatedDailyCosts = categories.reduce((sum, category) => sum + category.amount, 0);
  const fitRatio = estimatedDailyCosts > availableAfterTravel && estimatedDailyCosts > 0 ?
    availableAfterTravel / estimatedDailyCosts : 1;
  const allocatedCategories = categories.map(category => ({
    ...category,
    amount: Math.floor(category.amount * fitRatio)
  }));
  const breakdown = [
    ...allocatedCategories,
    { name: "Travel to destination", amount: travelCost, unavailable: false }
  ];
  const total = Math.min(budgetLimit, breakdown.reduce((sum, category) => sum + category.amount, 0));

  return {
    budgetLimit,
    travelCost,
    availableAfterTravel,
    categories: allocatedCategories,
    breakdown,
    total,
    remaining: Math.max(0, budgetLimit - total),
    scaledToFit: fitRatio < 1
  };
}

function renderBudgetBreakdown(plan, allocation = calculateBudgetAllocation(plan)) {
  const estimate = plan.budgetEstimate;
  const currency = estimate?.currency || plan.currency;

  plan.fare = allocation.travelCost;
  document.getElementById("budget-total").textContent = money(allocation.total, currency);
  document.getElementById("budget-daily").textContent = `Available for daily expenses after travel: ${money(allocation.availableAfterTravel, currency)}`;
  document.getElementById("budget-per-person").textContent = `Original trip budget: ${money(allocation.budgetLimit, currency)}`;
  document.getElementById("budget-remaining").textContent = `Remaining after estimates: ${money(allocation.remaining, currency)}`;
  document.querySelector('[data-template-id="budget-kicker"]').textContent = estimate ? "Current prices + mode allowance" : "Planning estimate";
  document.querySelector('[data-template-id="budget-title"]').textContent = "Estimated trip costs";

  const budgetSource = document.getElementById("budget-source");
  if (estimate) {
    const updated = estimate.updated_month && estimate.updated_year ?
      new Date(Date.UTC(estimate.updated_year, estimate.updated_month - 1, 1)).toLocaleDateString("en", { month: "short", year: "numeric", timeZone: "UTC" }) :
      null;
    const activityNote = (estimate.unavailable || []).includes("activities") || typeof estimate.breakdown?.activities !== "number" ?
      "No current activity ticket price was available. " :
      "Activities use current cinema-ticket prices. ";
    const fitNote = allocation.scaledToFit ?
      "Daily price estimates were proportionally fit to the amount remaining after travel. " : "";
    budgetSource.textContent = `${estimate.source}${updated ? ` | updated ${updated}` : ""}. ${activityNote}${fitNote}Accommodation is a long-term rent proxy; ${plan.travelMode.toLowerCase()} destination travel is an allowance, not a live ticket quote.`;
  } else {
    budgetSource.textContent = `Daily categories use a planning split of the amount left after travel. ${plan.travelMode.toLowerCase()} destination travel is an allowance, not a live ticket quote.`;
  }

  const budgetSplits = document.getElementById("budget-splits");
  budgetSplits.replaceChildren();
  allocation.breakdown.forEach(category => {
    const node = document.getElementById("budget-row-template").content.cloneNode(true);
    node.querySelector(".budget-name").textContent = category.name;
    node.querySelector(".budget-value").textContent = category.unavailable ? "No price data" : money(category.amount, currency);
    node.querySelector(".budget-person-value").textContent = category.unavailable ?
      "Not included in estimate" :
      `${money(category.amount / plan.travelers, currency)} per person`;
    node.querySelector(".budget-bar").style.width = allocation.total > 0 ? `${Math.round(category.amount / allocation.total * 100)}%` : "0%";
    budgetSplits.appendChild(node);
  });

  document.getElementById("mode-name").textContent = plan.travelMode;
  document.getElementById("fare-estimate").textContent = `Reserved first for ${plan.travelMode.toLowerCase()} travel: ${money(allocation.travelCost, currency)}`;
}

function renderTripSummary(plan) {
  document.getElementById("trip-summary").textContent = `${plan.days} day${plan.days > 1 ? "s" : ""} | ${plan.travelers} traveler${plan.travelers > 1 ? "s" : ""} | ${plan.travelMode} | ${plan.occasion} | ${plan.interests.join(" | ") || "Curious traveller"} | planned at your pace`;
}

function renderPlan(plan) {
  state.plan = plan;
  if (Array.isArray(plan.customPackingItems)) {
    state.customPackingItems = plan.customPackingItems.filter(item => typeof item === "string");
  }
  document.getElementById("empty-workspace").classList.add("hidden-view");
  document.getElementById("results-workspace").classList.remove("hidden-view");
  selectDashboardTab("overview");
  document.getElementById("trip-heading").textContent = plan.destination;
  renderTripSummary(plan);
  document.getElementById("overview-days").textContent = `${plan.days} day${plan.days === 1 ? "" : "s"}`;
  document.getElementById("overview-travelers").textContent = `${plan.travelers} traveler${plan.travelers === 1 ? "" : "s"}`;
  document.getElementById("overview-mode").textContent = plan.travelMode;
  document.getElementById("overview-budget").textContent = money(plan.budget, plan.currency);
  document.getElementById("travel-mode").value = plan.travelMode;
  document.getElementById("hotel-search-link").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`hotels in ${plan.destination}`)}`;

  const itineraryList = document.getElementById("itinerary-list");
  itineraryList.replaceChildren();
  const destinationVisuals = visualProfileFor(plan.destination).items;
  const dayImageIndexes = { place: 0, food: 0 };
  plan.itinerary.forEach(day => {
    const fragment = document.getElementById("day-template").content.cloneNode(true);
    fragment.querySelector(".day-number").textContent = String(day.day).padStart(2, "0");
    fragment.querySelector(".day-title").textContent = day.title;
    fragment.querySelector(".day-date").textContent = day.date;
    const focusText = day.activities.find(activity => activity.time === "11:00")?.text || "";
    const imageCategory = /food|specialit|local market|caf/i.test(focusText) ? "food" : "place";
    const imageOptions = destinationVisuals.filter(([, category]) => category === imageCategory);
    const image = fragment.querySelector(".day-image");
    const visual = imageOptions[dayImageIndexes[imageCategory] % imageOptions.length] || destinationVisuals[0];
    dayImageIndexes[imageCategory]++;
    image.src = visual[2];
    image.alt = `${visual[0]} in ${plan.destination}`;
    image.onerror = () => {
      image.onerror = null;
      image.src = "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=82";
    };
    const activities = fragment.querySelector(".day-activities");
    day.activities.forEach(activity => {
      const activityNode = document.getElementById("activity-template").content.cloneNode(true);
      activityNode.querySelector(".activity-time").textContent = activity.time;
      activityNode.querySelector(".activity-text").textContent = activity.text;
      activities.appendChild(activityNode);
    });
    itineraryList.appendChild(fragment);
  });

  const estimate = plan.budgetEstimate;
  const budgetAllocation = calculateBudgetAllocation(plan);
  const hotelEstimate = document.getElementById("hotel-estimate");
  const hotelEstimateNote = document.getElementById("hotel-estimate-note");
  const hotelNights = Math.max(plan.days - 1, 0);
  const hotelAllocation = budgetAllocation.categories.find(category => category.name === "Accommodation")?.amount || 0;
  if (estimate && !(estimate.unavailable || []).includes("accommodation")) {
    hotelEstimate.textContent = `${money(hotelAllocation, estimate.currency)} allocated for ${hotelNights} night${hotelNights === 1 ? "" : "s"}`;
    hotelEstimateNote.textContent = "Based on average long-term rent for a one-bedroom city-centre apartment, not hotel pricing.";
  } else if (!estimate) {
    hotelEstimate.textContent = `${money(hotelAllocation, plan.currency)} planning allowance for ${hotelNights} night${hotelNights === 1 ? "" : "s"}`;
    hotelEstimateNote.textContent = "This planning allowance is capped by the budget left after destination travel; it is not a hotel quote.";
  } else {
    hotelEstimate.textContent = "No current accommodation estimate for this destination.";
    hotelEstimateNote.textContent = "Compare available properties using the hotel search. Live city prices do not include hotel quotes.";
  }
  renderBudgetBreakdown(plan, budgetAllocation);
  document.getElementById("map-label").textContent = `${plan.destination} | ${plan.places ? "live places" : "curated route"}`;

  const liveAttractions = plan.places?.places?.filter(place => place.category === "tourism").map(place => place.name);
  const liveFood = plan.places?.places?.filter(place => place.category === "restaurant").map(place => place.name);
  renderSimpleList("attractions-list", liveAttractions?.length ? liveAttractions : plan.profile.attractions);
  renderSimpleList("food-list", liveFood?.length ? liveFood : plan.profile.food);
  renderMap(plan);
  renderVisualGallery(plan.destination);
  renderCelebration(plan);

  const weather = plan.weather;
  document.getElementById("weather-title").textContent = weather ?
    `${weather.condition} in ${weather.city}` :
    "Weather-aware note";
  document.getElementById("weather-description").textContent = weather ?
    `${weather.temperature_c} C, feels like ${weather.feels_like_c} C | Humidity ${weather.humidity}% | Wind ${weather.wind_kph} km/h.` :
    plan.profile.weather;

  const packing = ["Photo ID & booking copies", "Phone charger & power bank", "Comfortable walking shoes", "Reusable water bottle", "Small day bag", "Basic medication"];
  if ((weather && weather.temperature_c >= 25) || /warm|tropical|humid|sun/i.test(plan.profile.weather)) packing.push("Sunscreen and sun hat");
  else packing.push("Light jacket and compact umbrella");
  state.packingBaseItems = packing;
  renderPacking([...packing, ...state.customPackingItems]);

  document.getElementById("safety-copy").textContent = plan.profile.safety;
  document.getElementById("emergency-number").textContent = plan.profile.emergency;
  document.getElementById("results-workspace").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

document.getElementById("travel-mode").addEventListener("change", event => {
  if (!state.plan) return;
  state.plan.travelMode = event.currentTarget.value;
  state.plan.fare = estimateTravelCost(state.plan.budget, state.plan.travelMode);
  document.getElementById("overview-mode").textContent = state.plan.travelMode;
  renderTripSummary(state.plan);
  renderBudgetBreakdown(state.plan);
});

function renderSimpleList(id, items) {
  const list = document.getElementById(id);
  list.replaceChildren();
  items.forEach(item => {
    const node = document.getElementById("list-item-template").content.cloneNode(true);
    node.querySelector(".list-item-text").textContent = item;
    list.appendChild(node);
  });
  lucide.createIcons();
}

function renderPacking(items, preserveChecked = false) {
  const list = document.getElementById("packing-list");
  const checkedItems = preserveChecked ? new Set(
    [...list.querySelectorAll(".check-item input:checked")].map(input => input.value)
  ) : new Set();
  list.replaceChildren();
  items.forEach(item => {
    const node = document.getElementById("packing-item-template").content.cloneNode(true);
    const checkbox = node.querySelector("input[type=checkbox]");
    checkbox.value = item;
    checkbox.checked = checkedItems.has(item);
    node.querySelector(".packing-item-text").textContent = item;
    list.appendChild(node);
  });
  lucide.createIcons();
}

document.getElementById("packing-add-form").addEventListener("submit", event => {
  event.preventDefault();
  const input = document.getElementById("packing-add-input");
  const status = document.getElementById("packing-add-status");
  const item = input.value.trim();
  if (!item) {
    status.textContent = "Enter an item to add.";
    input.focus();
    return;
  }
  const existingItems = [...state.packingBaseItems, ...state.customPackingItems];
  if (existingItems.some(existing => existing.toLocaleLowerCase() === item.toLocaleLowerCase())) {
    status.textContent = "That item is already on your checklist.";
    input.focus();
    return;
  }
  state.customPackingItems.push(item);
  if (state.plan) state.plan.customPackingItems = [...state.customPackingItems];
  renderPacking([...state.packingBaseItems, ...state.customPackingItems], true);
  input.value = "";
  status.textContent = `${item} added to your checklist.`;
});

function fillLocalCopy() {
  const copy = {
    "brand-name": "Roamwell",
    "nav-badge": "Weather-aware travel planning",
    "hero-kicker": "A better way to get away",
    "hero-title": "Go somewhere that stays with you.",
    "hero-description": "Build a thoughtful trip around the places, flavours, and small discoveries you want to remember.",
    "hero-detail-one": "Live weather guidance",
    "hero-detail-two": "Day-by-day routes",
    "planner-eyebrow": "Your next chapter",
    "planner-title": "Build the trip",
    "destination-label": "Where are you going?",
    "start-date-label": "Start date",
    "end-date-label": "End date",
    "budget-label": "Total group budget",
    "currency-label": "Currency",
    "travelers-label": "People traveling",
    "interests-label": "What are you drawn to?",
    "mode-label": "How will you get there?",
    "occasion-label": "What are you celebrating?",
    "generate-button": "Shape my itinerary",
    "empty-title": "Your map is waiting",
    "empty-description": "Fill in the essentials above and we will turn your idea into a flexible, weather-aware travel plan.",
    "results-kicker": "Your trip, in focus",
    "save-plan-button": "Save this plan",
    "assistant-kicker": "A little help choosing",
    "assistant-title": "Ask the trip assistant",
    "assistant-description": "Share your budget, interests, or a destination idea and get a few realistic places to start.",
    "assistant-submit": "Suggest trips",
    "load-plan-button": "Load plan",
    "delete-plan-button": "Delete",
    "delete-confirm-copy": "Delete this saved trip?",
    "confirm-delete-button": "Delete trip",
    "cancel-delete-button": "Cancel",
    "itinerary-kicker": "The days ahead",
    "itinerary-title": "A route with room to wander",
    "budget-kicker": "Spend with intention",
    "budget-title": "Budget rhythm",
    "transport-kicker": "Getting there",
    "transport-title": "Your main move",
    "transport-note": "Leave a little room between destinations. The best travel days are rarely over-planned.",
    "guide-kicker": "A sense of place",
    "guide-title": "Local highlights",
    "attractions-title": "Worth seeing",
    "food-title": "Worth tasting",
    "packing-kicker": "Travel lighter",
    "packing-title": "Pack for the moment",
    "safety-title": "A little peace of mind",
    "visual-kicker": "Postcard material",
    "visual-title": "The flavours and places to remember",
    "celebration-kicker": "Make it memorable",
    "celebration-title": "Celebrate like a local",
    "saved-kicker": "Your travel shelf",
    "saved-title": "Saved plans",
    "saved-empty": "Your saved journeys will appear here."
  };

  Object.entries(copy).forEach(([id, value]) => {
    document.querySelectorAll(`[data-template-id="${id}"]`).forEach(element => {
      if (!element.textContent.trim()) element.textContent = value;
    });
  });
}

function readLocalRecords() {
  try {
    const records = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    return Array.isArray(records) ? records : [];
  } catch (error) {
    return [];
  }
}

function writeLocalRecords(records) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
}

function locationLabel(location) {
  return [location.city, location.state, location.country].filter(Boolean).join(", ");
}

let locationSearchTimer;
document.getElementById("destination").addEventListener("input", event => {
  window.clearTimeout(locationSearchTimer);
  const query = event.target.value.trim();
  const suggestions = document.getElementById("location-suggestions");
  const suggestionMenu = document.getElementById("location-suggestion-menu");
  if (query.length < 2) {
    suggestions.replaceChildren();
    suggestionMenu.replaceChildren();
    suggestionMenu.classList.add("hidden-view");
    return;
  }
  locationSearchTimer = window.setTimeout(async () => {
    try {
      const response = await fetch(`${LOCATION_API_URL}/locations?q=${encodeURIComponent(query)}`);
      const locations = await response.json();
      suggestions.replaceChildren();
      suggestionMenu.replaceChildren();
      locations.forEach(location => {
        const option = document.createElement("option");
        const label = locationLabel(location);
        option.value = label;
        suggestions.appendChild(option);
        const suggestion = document.createElement("button");
        suggestion.type = "button";
        suggestion.className = "location-suggestion";
        suggestion.setAttribute("role", "option");
        suggestion.textContent = label;
        suggestion.addEventListener("click", () => {
          document.getElementById("destination").value = label;
          suggestionMenu.classList.add("hidden-view");
        });
        suggestionMenu.appendChild(suggestion);
      });
      suggestionMenu.classList.toggle("hidden-view", locations.length === 0);
    } catch (error) {
      suggestions.replaceChildren();
      suggestionMenu.replaceChildren();
      suggestionMenu.classList.add("hidden-view");
    }
  }, 250);
});

document.getElementById("use-location").addEventListener("click", () => {
  const message = document.getElementById("form-message");
  if (!navigator.geolocation) {
    message.textContent = "Location access is not supported in this browser.";
    message.className = "mt-3 min-h-5 text-center text-sm font-medium text-[#b64534]";
    return;
  }
  message.textContent = "Finding your current location...";
  message.className = "mt-3 min-h-5 text-center text-sm font-medium text-[#007c91]";
  navigator.geolocation.getCurrentPosition(async position => {
    try {
      const {
        latitude,
        longitude
      } = position.coords;
      const response = await fetch(`${LOCATION_API_URL}/location?lat=${latitude}&lon=${longitude}`);
      const location = await response.json();
      if (!response.ok) throw new Error(location.error || "Unable to identify this location.");
      document.getElementById("destination").value = locationLabel(location);
      message.textContent = `Using ${location.city}. Add your dates and budget to continue.`;
    } catch (error) {
      message.textContent = "We found your coordinates but could not identify the city.";
      message.className = "mt-3 min-h-5 text-center text-sm font-medium text-[#b64534]";
    }
  }, () => {
    message.textContent = "Location access was blocked. Search for a city instead.";
    message.className = "mt-3 min-h-5 text-center text-sm font-medium text-[#b64534]";
  }, {
    enableHighAccuracy: false,
    timeout: 10000
  });
});

document.getElementById("trip-form").addEventListener("submit", async event => {
  event.preventDefault();
  const message = document.getElementById("form-message");
  const button = event.currentTarget.querySelector("button[type=submit]");
  const plan = createPlanFromForm();
  if (!plan) {
    message.textContent = "Add valid dates, a destination, and a budget to map your trip.";
    message.className = "mt-3 min-h-5 text-center text-sm font-medium text-[#b64534]";
    return;
  }
  button.disabled = true;
  message.textContent = "Checking live weather for your destination...";
  message.className = "mt-3 min-h-5 text-center text-sm font-medium text-[#007c91]";
  try {
    plan.weather = await fetchWeather(plan.destination);
  } catch (error) {
    message.textContent = "Live weather is unavailable, so the trip uses a general packing note.";
  }
  try {
    plan.places = await fetchPlaces(plan.destination);
  } catch (error) {
    plan.places = null;
    if (!message.textContent.startsWith("Live weather")) {
      message.textContent = "Live places are unavailable, so the trip uses curated local highlights.";
    }
  }
  try {
    plan.budgetEstimate = await fetchBudgetEstimate(plan);
  } catch (error) {
    plan.budgetEstimate = null;
    plan.budgetEstimateError = error.message;
  }
  button.disabled = false;
  if (plan.budgetEstimate) {
    message.textContent = "Your route and current city-price estimate are ready below.";
  } else if (!message.textContent.startsWith("Live weather")) {
    message.textContent = "Your personalised route is ready below.";
  }
  renderPlan(plan);
});

document.getElementById("map-refresh").addEventListener("click", () => {
  if (state.plan) renderMap(state.plan);
});

function serializePlan(plan) {
  return JSON.stringify({
    days: plan.days,
    itinerary: plan.itinerary,
    fare: plan.fare,
    travelers: plan.travelers,
    occasion: plan.occasion,
    weather: plan.weather,
    places: plan.places,
    budgetEstimate: plan.budgetEstimate,
    customPackingItems: state.customPackingItems
  });
}

document.getElementById("save-plan-button").addEventListener("click", async () => {
  const button = document.getElementById("save-plan-button");
  const message = document.getElementById("save-message");
  if (!state.plan || !state.initialized) {
    message.textContent = "Generate a trip before saving it.";
    message.className = "min-h-5 text-sm font-semibold text-[#b64534]";
    return;
  }
  if (state.records.length >= 999) {
    message.textContent = "Your saved-plan limit is reached. Delete a plan before adding another.";
    message.className = "min-h-5 text-sm font-semibold text-[#b64534]";
    return;
  }
  button.disabled = true;
  message.textContent = "Saving your trip plan...";
  message.className = "min-h-5 text-sm font-semibold text-[#007c91]";
  const p = state.plan;
  const record = {
    destination: p.destination,
    start_date: p.startDate,
    end_date: p.endDate,
    budget: p.budget,
    currency: p.currency,
    interests: p.interests.join(", "),
    travel_mode: p.travelMode,
    occasion: p.occasion,
    itinerary_json: serializePlan(p),
    created_at: new Date().toISOString()
  };
  let result;
  if (window.dataSdk) {
    const {
      occasion,
      ...backendRecord
    } = record;
    result = await window.dataSdk.create(backendRecord);
  } else {
    record.__backendId = `local-${Date.now()}`;
    const records = readLocalRecords();
    records.push(record);
    writeLocalRecords(records);
    renderSavedPlans(records);
    result = {
      isOk: true
    };
  }
  button.disabled = false;
  if (result.isOk) {
    message.textContent = window.dataSdk ? "Trip saved to your Canva Sheet." : "Trip saved on this device.";
    message.className = "min-h-5 text-sm font-semibold text-[#007c91]";
  } else {
    message.textContent = "Your trip could not be saved. Please try again.";
    message.className = "min-h-5 text-sm font-semibold text-[#b64534]";
  }
});

function renderSavedPlans(records) {
  state.records = records.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  document.getElementById("saved-count").textContent = state.records.length;
  const list = document.getElementById("saved-plans-list");
  const empty = document.getElementById("saved-empty");
  list.replaceChildren();
  empty.classList.toggle("hidden-view", state.records.length > 0);

  state.records.forEach(record => {
    const node = document.getElementById("saved-plan-template").content.cloneNode(true);
    const card = node.querySelector("article");
    card.dataset.recordId = record.__backendId;
    node.querySelector(".saved-destination").textContent = record.destination;
    node.querySelector(".saved-dates").textContent = `${record.start_date} -> ${record.end_date}`;
    node.querySelector(".saved-budget").textContent = money(record.budget, record.currency);
    node.querySelector(".saved-mode").textContent = record.travel_mode;

    node.querySelector(".load-plan").addEventListener("click", () => loadRecord(record));
    const deleteButton = node.querySelector(".delete-plan");
    const confirmBox = node.querySelector(".delete-confirm");
    deleteButton.addEventListener("click", () => confirmBox.classList.remove("hidden-view"));
    node.querySelector(".cancel-delete").addEventListener("click", () => confirmBox.classList.add("hidden-view"));
    node.querySelector(".confirm-delete").addEventListener("click", async event => {
      const button = event.currentTarget;
      button.disabled = true;
      let result;
      if (window.dataSdk) {
        result = await window.dataSdk.delete(record);
      } else {
        writeLocalRecords(readLocalRecords().filter(item => item.__backendId !== record.__backendId));
        renderSavedPlans(readLocalRecords());
        result = {
          isOk: true
        };
      }
      if (!result.isOk) {
        button.disabled = false;
        button.textContent = "Try again";
      }
    });
    list.appendChild(node);
  });
  lucide.createIcons();
}

function loadRecord(record) {
  let saved = {};
  try {
    saved = JSON.parse(record.itinerary_json);
  } catch (e) {
    saved = {};
  }
  const profile = profileFor(record.destination);
  const plan = {
    destination: record.destination,
    startDate: record.start_date,
    endDate: record.end_date,
    budget: record.budget,
    currency: record.currency,
    interests: record.interests.split(", ").filter(Boolean),
    travelMode: record.travel_mode,
    travelers: saved.travelers || 1,
    occasion: record.occasion || saved.occasion || "Everyday escape",
    days: saved.days || numberOfDays(record.start_date, record.end_date),
    itinerary: saved.itinerary || [],
    fare: saved.fare || record.budget * .15,
    profile,
    weather: saved.weather,
    places: saved.places,
    budgetEstimate: saved.budgetEstimate,
    customPackingItems: saved.customPackingItems || []
  };
  if (!plan.itinerary.length) {
    document.getElementById("destination").value = record.destination;
    document.getElementById("start-date").value = record.start_date;
    document.getElementById("end-date").value = record.end_date;
    document.getElementById("budget").value = record.budget;
    document.getElementById("travelers").value = saved.travelers || 1;
    document.getElementById("currency").value = record.currency;
    document.getElementById("travel-mode").value = record.travel_mode;
    document.getElementById("occasion").value = record.occasion || "Everyday escape";
    const rebuilt = createPlanFromForm();
    if (rebuilt) renderPlan(rebuilt);
  } else {
    renderPlan(plan);
  }
}

async function initializeData() {
  const handler = {
    onDataChanged(data) {
      renderSavedPlans(data);
    }
  };
  if (!window.dataSdk) {
    state.initialized = true;
    renderSavedPlans(readLocalRecords());
    return;
  }
  const result = await window.dataSdk.init(handler);
  state.initialized = result.isOk;
  if (!result.isOk) {
    document.getElementById("saved-empty").textContent = "Saved plans are temporarily unavailable.";
  }
}

lucide.createIcons();
fillLocalCopy();
initializeAssistant();
initializeData();

document.querySelectorAll(".destination-pick").forEach(button => {
  button.addEventListener("click", () => {
    const destination = document.getElementById("destination");
    destination.value = button.dataset.destination;
    document.getElementById("planner-panel").scrollIntoView({ behavior: "smooth", block: "center" });
    destination.focus({ preventScroll: true });
  });
});
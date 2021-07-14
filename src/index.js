// API endpoints
const sightsUrl = 'https://api.foursquare.com/v2/venues/explore?near=';
const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
const unsplashUrl = `https://api.unsplash.com/search/photos/`;

// API keys
// Foursquare
const clientId = process.env.FOURSQUARE_CLIENT_ID;
const clientSecret = process.env.FOURSQUARE_CLIENT_SECRET;
// Openweather
const openWeatherKey = process.env.OPENWEATHER_KEY;
// Unsplash
const accessKey = process.env.UNSPLASH_ACCESS_KEY;
const secretKey = process.env.UNSPLASH_SECRET_KEY;

//Get DOM elements
let userInput = document.getElementById('user-input');
let locDisplay = document.getElementById('loc-display');
let locPhoto = document.getElementById('loc-photo');
let weatherIcon = document.getElementById('weather-icon');
let weatherDisplay = document.getElementById('weather-display');
let weatherCard = document.getElementById('weather-card');
let sightsDisplay = document.getElementById('sights-display');
let searchButton = document.getElementById('search-button');
let sightsHeading = document.getElementById('sights-heading');
let foodDisplay = document.getElementById('food-display');
let foodHeading = document.getElementById('food-heading');

weatherCard.hidden = true;
sightsHeading.hidden = true;
foodHeading.hidden = true;

//AJAX functions
const getLocationPhoto = async () => {
    let input = userInput.value;
    const urlToFetch = `${unsplashUrl}?client_id=${accessKey}&query=${input}&per_page=1`;

    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const jsonResponse = await response.json();
            console.log(jsonResponse);
            return jsonResponse.results[0].urls.regular;            
        }
        throw newError('Request failed');
    } catch (err) {
        console.log(err);
    }
}

const getWeather = async () => {
    let input = userInput.value;
    const urlToFetch = `${weatherUrl}?q=${input}&appid=${openWeatherKey}`;

    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const jsonResponse = await response.json();
            console.log(jsonResponse);
            return jsonResponse;
            
        }
        throw newError('Request failed');
    } catch (err) {
        console.log(err);
    }
}

const getSights = async () => {
    let input = userInput.value;
    const urlToFetch = `${sightsUrl}${input}&radius=450&section=outdoors&client_id=${clientId}&client_secret=${clientSecret}&v=20230101&limit=5`;

    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const jsonResponse = await response.json();
            console.log(jsonResponse);
            const sights = jsonResponse.response.groups[0].items.map(el => el.venue);
            return sights;
        }
        throw newError('Request failed');
    } catch (err) {
        console.log(err);
    }
}

const getRestaurants = async () => {
    let input = userInput.value;
    const urlToFetch = `${sightsUrl}${input}&radius=450&section=food&client_id=${clientId}&client_secret=${clientSecret}&v=20230101&limit=5`;

    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const jsonResponse = await response.json();
            console.log(jsonResponse);
            const sights = jsonResponse.response.groups[0].items.map(el => el.venue);
            return sights;
        }
        throw newError('Request failed');
    } catch (err) {
        console.log(err);
    }
}

const getSightPhotos = async (sightId) => {
    try {
        const response = await fetch(`https://api.foursquare.com/v2/venues/${sightId}/photos?limit=2&client_id=${clientId}&client_secret=${clientSecret}&v=20230101`);
        if (response.ok) {
            const jsonResponse = await response.json();
            let photoUrl = `${jsonResponse.response.photos.items[0].prefix}500x300${jsonResponse.response.photos.items[0].suffix}`;
            console.log(photoUrl);
            console.log(jsonResponse.response.photos.items);
            return photoUrl;
        }
        throw newError('Request failed');
    } catch (err) {
        console.log(err);
    }    
}

// Render in HTML functions
const renderLocPhoto = (photoUrl) => {
    locPhoto.innerHTML = `<img class="img-fluid rounded location" src="${photoUrl}" alt="Location photo">`;
}

const createHTMLforWeather = (weather) => {
    weatherCard.hidden = false;
    locDisplay.innerHTML = weather.name;
    weatherIcon.src = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;

    weatherDisplay.innerHTML = `<p>${(weather.main.temp - 273.15).toFixed(1)} &degC</p>`;
    weatherDisplay.innerHTML += `<p class="weather-text">Feels like ${(weather.main.feels_like - 273.15).toFixed(1)} &degC</p>`;
    weatherDisplay.innerHTML += `<p class="weather-text">Condition: ${weather.weather[0].description}</p>`;
    weatherDisplay.innerHTML += `<p class="weather-text">Humidity: ${weather.main.humidity}%</p>`;
}

const createHTMLforSights = (sights) => {
    // get the photo here for each sight id directly inside the render function in async
    sightsHeading.hidden = false;
    sightsDisplay.innerHTML = "";

    sights.forEach(async (el) => {    
        let photo = await getSightPhotos(el.id);
        let div = `<div class="col">
        <div class="card h-100">
        <img src="${photo}" class="card-img-top" alt="Venue photograph">
        <div class="card-body">
            <h5 class="card-title">${el.name}</h5>
            <p class="card-text">${el.categories[0].name}</p>
        </div>
        <div class="card-footer">
            <small class="text-muted">Address: ${el.location.address}, ${el.location.city}</small>
        </div></div>
        </div>`;
        sightsDisplay.innerHTML += div;
    });
}

const createHTMLforRestaurants = (sights) => {
    foodHeading.hidden = false;
    foodDisplay.innerHTML = "";

    sights.forEach(async (el) => {    
        let photo = await getSightPhotos(el.id);
        let div = `<div class="col">
        <div class="card h-100">
        <img src="${photo}" class="card-img-top" alt="Restaurant photograph">
        <div class="card-body">
            <h5 class="card-title">${el.name}</h5>
            <p class="card-text">${el.categories[0].name}</p>
        </div>
        <div class="card-footer">
            <small class="text-muted">Address: ${el.location.address}, ${el.location.city}</small>
        </div>
        </div>
        </div>`;
        foodDisplay.innerHTML += div;
    });
}

// Search button function
const executeSearch = () => {
    getLocationPhoto().then(photoUrl => renderLocPhoto(photoUrl));
    getWeather().then(weather => createHTMLforWeather(weather));
    getSights().then(sights => createHTMLforSights(sights));
    getRestaurants().then(sights => createHTMLforRestaurants(sights));
}

// Event listeners
searchButton.addEventListener('click', executeSearch);

userInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchButton.click();
        locDisplay.scrollIntoView({behavior: "smooth", block: "center"});
    }
});
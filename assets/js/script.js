// Weather App
console.log('Weather App!');

// Initializing First Map Screen
function initmap(){
    var options = {
        zoom: 1,
        center: {lat:30,lng:0}
    } // Map Options
    var map = new google.maps.Map(document.getElementById('map'),options);
} // Invoking Create Map Function using Google Maps API
initmap();

// Declaring Variables
var apiKey = 'ce5300e7acaa327ad655b8a21d5130d8';
var cityName = '';
var searchInput = $('#search');
var searchButton = $('.searchButton');
var citiesList = $('.locationList');
var clearCities = $('.clearCities');
var buttonContainer = $('.buttonContainer');
var cities = JSON.parse(localStorage.getItem("Cities History")) || [];
cities.splice(10);
var uniqueCities = [...new Set(cities)];
var cityNameText = $('.cityName');
var cardContainer = $('.cardContainer');
var temperature = $('.temperature');
var humidity = $('.humidity');
var conditionDiv = $('.conditionDiv');
var condition = $('.conditionImage');
var conditionText = $('.conditionText');
var wind = $('.wind');
var uvIndex = $('.UV-Index');
var cardDate = $('.date');
var cardIcon = $('.icon');
var cardDayText = $('.dayText');
var cardTemperature = $('.cardTemperature');
var cardWind = $('cardWind');
var cardHumidity = $('.cardHumidity');
var coordinates = $('.coords');

// Hide Cities Data Row
var citiesData = $('.citiesData');
if (cities.length === 0) citiesData.hide();

// When User Clicks Search Button
searchButton.on('click',function(event) {
    event.preventDefault();
    // console.log(newCities);
    var searchInputValue = searchInput.val();
    if (!searchInputValue) {
        alert('Please Enter Valid Location.');
        return;
    } else {
        var requestURL = `https://api.openweathermap.org/data/2.5/weather?q=${searchInputValue}&appid=${apiKey}`;
        // Fetch first dataset
        fetch(requestURL)
        .then(function(response) {
            return response.json();
        }).then(function(data) {
            if (data.cod === '404') {
                alert('City Not Found.');
                return;
            } else {
                cities.push(searchInputValue);
                cities.splice(10);
                var uniqueCities = [...new Set(cities)];
                localStorage.setItem('Cities History', JSON.stringify(uniqueCities));
                uniqueCities = JSON.parse(localStorage.getItem('Cities History'));
                uniqueCities = [...new Set(uniqueCities)];
                var buttonContainer = $('.buttonContainer');
                buttonContainer.html('');
                createButtons(uniqueCities);
                citiesData.show();
                searchInput.val('');
                // Converting Temperature from Kelvin to Fahrenheit
                var fahrenheit = Math.floor((data.main.temp - 273.15)* 1.8 + 32.00);
                cityNameText.html(data.name + ', ' + data.sys.country);
                temperature.html(fahrenheit + '?? F');
                humidity.html(data.main.humidity);
                wind.html(data.wind.speed);
                coordinates.html(Math.floor(data.coord.lat) + ', ' + Math.floor(data.coord.lon));

                // Initializing Coords
                var lat = data.coord.lat;
                var lon = data.coord.lon;
                // Reinitializing new map
                function initmap(){
                    var options = {
                        zoom: 9,
                        center: {lat:lat,lng:lon}
                    } // Map Options
                    var map = new google.maps.Map(document.getElementById('map'),options);
                } // Reinvoking Map with new Coords
                initmap();

                // Fetching 2nd dataset with new Lat Lon and OneCall API
                var latlonLink = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;
                fetch(latlonLink).then(function(response) {
                    return response.json();
                }).then(function(data) {
                    uvIndex.html(data.current.uvi);
                    var currentTime = moment.unix(data.current.dt).format('dddd, MMMM Do YYYY, h:mm a');
                    var currentTimeEl = $(`<span class="currentTime"> - ${currentTime} </span>`);
                    cityNameText.append(currentTimeEl);
                    cardContainer.html('');
                    conditionText.html(data.daily[0].weather[0].main);
                    // 5 day forecast
                    for (var i = 1; i < 6; i++) {
                        var fullDates = moment.unix(data.daily[i].dt).format('MMMM Do');
                        var day = moment.unix(data.daily[i].dt).format('dddd');
                        var mainIcon = data.daily[0].weather[0].icon;
                        var mainIconLink = `https://openweathermap.org/img/wn/${mainIcon}@2x.png`;
                        condition.addClass('conditionImageInverted');
                        condition.attr('src',mainIconLink);
                        var icon = data.daily[i].weather[0].icon;
                        var iconLink = `https://openweathermap.org/img/wn/${icon}@2x.png`;
                        // Creating Forecast Cards
                        var foreCastCards = $(`
                        <div class="card">
                        <div class="dateIcon"><h4 class="date">${fullDates}</h4><img class="icon" src="${iconLink}"></div>
                            <h3 class="dayText">${day}</h3>
                            <div class="spanContainer">
                                <div class="stat">Temperature: 
                                    <span class="cardTemperature">${Math.floor((data.daily[i].temp.max - 273.15)* 1.8 + 32.00)}?? F</span>
                                </div>
                                <div class="stat">Wind Speed: 
                                    <span class="cardWind">${data.daily[i].wind_speed}</span>
                                </div>
                                <div class="stat">Humidity: 
                                    <span class="cardHumidity">${data.daily[i].humidity}</span>
                                </div>
                            </div>
                        </div>`);
                        cardContainer.append(foreCastCards);
                    }
                })
            }
        })
    }
})

// Create Buttons Function
function createButtons(uniqueCities){
    uniqueCities.forEach((city,index) => {
        var locationButton = $(`<div class="locationElement"><button class="locationButton" id="${index}" data-location="${city}">${city}</button><button class="removeCityButton" id="${index}">X</button></div>`);
        // citiesList.after(locationButton);
        var buttonContainer = $('.buttonContainer');
        buttonContainer.append(locationButton);
    })
}

// Invoking Create Buttons Function on Page Load
createButtons(uniqueCities);

// When user clicks on Location Buttons
var locationButtons = $('.locationButton');
buttonContainer.on('click','.locationButton',function(event) {
    var location = $(event.target).html();
    var requestURL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;
    // Repeating Fetch of 1st dataset
    fetch(requestURL)
    .then(function(response) {
        return response.json();
    }).then(function(data) {
        var fahrenheit = Math.floor((data.main.temp - 273.15)* 1.8 + 32.00);
        cityNameText.html(data.name + ', ' + data.sys.country);
        temperature.html(fahrenheit + '?? F');
        humidity.html(data.main.humidity);
        wind.html(data.wind.speed);
        coordinates.html(Math.floor(data.coord.lat) + ', ' + Math.floor(data.coord.lon));

        // Initializing Lat Lons
        var lat = data.coord.lat;
        var lon = data.coord.lon;
        // Reinitializing map
        function initmap(){
            var options = {
                zoom: 9,
                center: {lat:lat,lng:lon}
            } // Map Options
            var map = new google.maps.Map(document.getElementById('map'),options);
        } // Reinvoking map with new coords
        initmap();
        var latlonLink = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        fetch(latlonLink).then(function(response) {
            return response.json();
        }).then(function(data) {
            uvIndex.html(data.current.uvi);
            var currentTime = moment.unix(data.current.dt).format('dddd, MMMM Do YYYY, h:mm a');
            var currentTimeEl = $(`<span class="currentTime"> - ${currentTime}</span>`);
            cityNameText.append(currentTimeEl);
            cardContainer.html('');
            conditionText.html(data.daily[0].weather[0].main);
            // 5 day forecast
            for (var i = 1; i < 6; i++) {
                var fullDates = moment.unix(data.daily[i].dt).format('MMMM Do');
                var day = moment.unix(data.daily[i].dt).format('dddd');
                var mainIcon = data.daily[0].weather[0].icon;
                var mainIconLink = `https://openweathermap.org/img/wn/${mainIcon}@2x.png`;
                condition.addClass('conditionImageInverted');
                condition.attr('src',mainIconLink);
                var icon = data.daily[i].weather[0].icon;
                var iconLink = `https://openweathermap.org/img/wn/${icon}@2x.png`;
                // Creating forecast cards
                var foreCastCards = $(`
                <div class="card">
                  <div class="dateIcon"><h4 class="date">${fullDates}</h4><img class="icon" src="${iconLink}"></div>
                    <h3 class="dayText">${day}</h3>
                    <div class="spanContainer">
                        <div class="stat">Temperature: 
                            <span class="cardTemperature">${Math.floor((data.daily[i].temp.max - 273.15)* 1.8 + 32.00)}?? F</span>
                        </div>
                        <div class="stat">Wind Speed: 
                            <span class="cardWind">${data.daily[i].wind_speed}</span>
                        </div>
                        <div class="stat">Humidity: 
                            <span class="cardHumidity">${data.daily[i].humidity}</span>
                        </div>
                    </div>
                </div>`);
                cardContainer.append(foreCastCards);
            }
        })
    })
})

// Clear Cities Function
clearCities.on('click',function() {
    localStorage.clear();
    location.reload(true);
})

// Remove City from DOM & Local Storage
var removeCityButton = buttonContainer.find('.locationElement').find('.removeCityButton');
buttonContainer.on('click','.removeCityButton',function(event){
    $(event.target).parent().remove();
    cities = JSON.parse(localStorage.getItem('Cities History'));
    var cityToRemoveIndex = $(event.target).attr('id');
    cities.splice(cityToRemoveIndex,1);
    localStorage.setItem('Cities History',JSON.stringify(cities));
    if (cities.length === 0) citiesData.hide();
})
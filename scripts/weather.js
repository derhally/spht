// Description:
//   Weather script for display temperature and humidity
//
// Dependencies:
//   None
//
// Configuration:
//   HUBOT_WEATHER_API_URL
//   HUBOT_WEATHER_UNITS
//   RAPIDAPI_KEY
//
// Commands:
//   !weather <city>  - Look up the temperature and humidity for the city
//

const Settings = require('./lib/settings.js')

process.env.HUBOT_WEATHER_API_URL = (process.env.HUBOT_WEATHER_API_URL != null) ?
  process.env.HUBOT_WEATHER_API_URL : 'https://community-open-weather-map.p.rapidapi.com'

process.env.HUBOT_WEATHER_UNITS = (process.env.HUBOT_WEATHER_UNITS != null) ?
  process.env.HUBOT_WEATHER_UNITS : 'imperial'

process.env.RAPIDAPI_KEY = (process.env.RAPIDAPI_KEY != null) ?
  process.env.RAPIDAPI_KEY : ''

const WeatherUserPrefKey = "default_weather_loc_";
const DefaultForecastDays = 3;

module.exports = function (robot) {
  function get_weather_location_for_user(user) {
    return robot.vault.forUser(user).get(WeatherUserPrefKey)
  }

  function get_weather_location_for_user(user, location) {
    return robot.vault.forUser(user).get(WeatherUserPrefKey, location)
  }

  function get_emote_for_code(code) {

    if (code >= 200 && code < 300)
      return ":thunder_cloud_rain:"

    if (code >= 300 && code < 400)
      return ":cloud_rain:"

    if (code >= 500 && code < 600)
      return ":cloud_rain:"

    if (code >= 600 && code < 700)
      return ":snowflake:"

    if (code == 762)
      return ":volcano:"

    if (code == 781)
      return ":cloud_tornado:"

    if (code == 800)
      return ":sunny:"

    if (code >= 801 && code < 805)
      return ":cloud:"

    return ""
  }

  function fetchWeather(robot, msg, query) {

    const isForecast = (typeof query.cnt === 'undefined') ? false : true;

    url = process.env.HUBOT_WEATHER_API_URL;
    url += isForecast ? "/forecast/daily" : "/weather";

    new Promise((resolve, reject) =>
        robot.http(url)
        .header('x-rapidapi-host', 'community-open-weather-map.p.rapidapi.com')
        .header('X-RapidAPI-Key', process.env.RAPIDAPI_KEY)
        .query(query)
        .get()((err, response, body) => {
          if (err != null) {
            reject(err);
          } else if (response.statusCode === 200) {
            resolve(body);
          } else {
            console.log("unknown error")
            json = JSON.parse(body);
            reject(json.message);
          }
        })
      )
      //parse to js object
      .then(body => {
        console.log(body)
        return JSON.parse(body)
      })
      .then(json => isForecast ? renderForecast(msg, json) : renderCurrent(msg, json))
      .catch(err => msg.reply('Cannot compute: ' + err));
  }

  function getDescription(weather) {
    return weather.description.charAt(0).toUpperCase() + weather.description.slice(1);
  }

  function renderForecast(msg, json) {
    m = `${json.cnt} day forecast for ${json.city.name}:`
    json.list.forEach((value) => {
      var date = new Date(value.dt * 1000);
      m += "\n   " + `${date.getMonth()+1}\\${date.getDate()}: Low: ${Math.round(value.temp.min)} High: ${Math.round(value.temp.max)} Humidity: ${value.humidity}%`
    });
    msg.send(m)
  }

  function renderCurrent(msg, json) {
    m = `It is currently ${Math.round(json.main.temp)}f and feels like ${Math.round(json.main.feels_like)}f in ${json.name}!`
    m += "\n   " + `${get_emote_for_code(json.weather[0].id)} ${getDescription(json.weather[0])}`
    m += "\n   " + `Humidity: ${json.main.humidity}%`;
    m += "\n   " + `Lows ${Math.round(json.main.temp_min)}f High ${Math.round(json.main.temp_max)}f`
    msg.send(m)
  }

  function fetchWeatherByName(robot, msg, name, days) {
    query = {
      units: process.env.HUBOT_WEATHER_UNITS,
      q: name
    }

    if (days > 0) {
      query.cnt = days
    }

    fetchWeather(robot, msg, query);
  }

  function fetchWeatherByZip(robot, msg, zipCode, days) {
    query = {
      units: process.env.HUBOT_WEATHER_UNITS,
      zip: zipCode,
    }

    if (days > 0) {
      query.cnt = days
    }

    fetchWeather(robot, msg, query);
  }

  function handleRequest(robot, msg, location, days) {
    const zip_regex = /^\d{5}$/;
    if (zip_regex.test(location))
      fetchWeatherByZip(robot, msg, location, days);
    else
      fetchWeatherByName(robot, msg, location, days);
  }

  function getUserPreferredLocation(userSettings) {
    return userSettings.default_weather_loc || null;
  }

  function setUserPreferredLocation(userSettings, location) {
    userSettings.default_weather_loc = location;
  }

  ///////////////
  // LISTENERS //
  ///////////////
  robot.hear(/!weather (.*)/i, function (res) {
    res.finish();

    const location = res.match[1].trim();
    handleRequest(robot, res, location, 0);
  });

  robot.hear(/!forecast (.+)$/i, function (res) {
    res.finish();

    location = res.match[1].trim();

    let days = DefaultForecastDays
    daysMatches = location.match(/(?:\s)([1-5])$/);
    if (daysMatches) {
      days = parseInt(daysMatches[1]);
      location = location.substring(0, location.length - daysMatches[0].length);
    }

    handleRequest(robot, res, location, days);
  });

  robot.hear(/!set my weather location to (.*)$/i, function (res) {
    location = res.match[1].trim();
    const userSettings = Settings.forUser(robot, res.message.user.id);
    setUserPreferredLocation(userSettings, location);
    msg.send(`I've saved it ${rs.message.user.name}.`)
  });

  robot.hear(/!weather$/i, function (res) {
    res.finish();

    const userSettings = Settings.forUser(robot, res.message.user.id);
    var userPrefLocation = getUserPreferredLocation(userSettings)
    handleRequest(robot, msg, userPrefLocation, 0);
  });

  robot.hear(/!forecast$/i, function (res) {
    res.finish();

    const userSettings = Settings.forUser(robot, res.message.user.id);
    var userPrefLocation = getUserPreferredLocation(userSettings)
    handleRequest(robot, msg, userPrefLocation, DefaultForecastDays);
  });
}
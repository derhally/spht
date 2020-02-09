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

process.env.HUBOT_WEATHER_API_URL = (process.env.HUBOT_WEATHER_API_URL != null) ?
  process.env.HUBOT_WEATHER_API_URL : 'https://community-open-weather-map.p.rapidapi.com'

process.env.HUBOT_WEATHER_UNITS = (process.env.HUBOT_WEATHER_UNITS != null) ?
  process.env.HUBOT_WEATHER_UNITS : 'imperial'

process.env.RAPIDAPI_KEY = (process.env.RAPIDAPI_KEY != null) ?
  process.env.RAPIDAPI_KEY : ''

const WeatherUserPrefKey = "weather-default-loc";

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

function fetch_weather(robot, msg, query) {

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
    .then(json => isForecast ? response_forecast(msg, json) : respond_current_weather(msg, json))
    .catch(err => msg.reply('Cannot compute: ' + err));
}

function getDescription(weather) {
  return weather.description.charAt(0).toUpperCase() + weather.description.slice(1);
}

function response_forecast(msg, json) {
  m = `${json.cnt} day forecast for ${json.city.name}:`
  json.list.forEach((value) => {
    var date = new Date(value.dt * 1000);
    m += "\n   " + `${date.getMonth()+1}\\${date.getDate()}: Low: ${Math.round(value.temp.min)} High: ${Math.round(value.temp.max)} Humidity: ${value.humidity}%`
  });
  msg.send(m)
}

function respond_current_weather(msg, json) {
  m = `It is currently ${Math.round(json.main.temp)}f and feels like ${Math.round(json.main.feels_like)}f in ${json.name}!`
  m += "\n   " + `${get_emote_for_code(json.weather[0].id)} ${getDescription(json.weather[0])}`
  m += "\n   " + `Humidity: ${json.main.humidity}%`;
  m += "\n   " + `Lows ${Math.round(json.main.temp_min)}f High ${Math.round(json.main.temp_max)}f`
  msg.send(m)
}

function fetch_weather_byname(robot, msg, name, days) {
  query = {
    units: process.env.HUBOT_WEATHER_UNITS,
    q: name
  }

  if (days > 0) {
    query.cnt = days
  }

  fetch_weather(robot, msg, query);
}

function fetch_weather_byzip(robot, msg, zipCode, days) {
  query = {
    units: process.env.HUBOT_WEATHER_UNITS,
    zip: zipCode,
  }

  if (days > 0) {
    query.cnt = days
  }

  fetch_weather(robot, msg, query);
}

function get_start_end_timerange(days) {
  let startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);
  endDate.setDate(endDate.getDate() + days);
  endDate.setHours(23, 59, 59, 999);
  return {
    start: startDate.valueOf(),
    end: endDate.valueOf()
  };
};

module.exports = function (robot) {
  robot.hear(/!weather (.*)/i, function (msg) {
    msg.finish();

    const match = msg.match[1].trim();
    const zip_regex = /^\d{5}$/;

    if (zip_regex.test(match))
      fetch_weather_byzip(robot, msg, match, 0);
    else
      fetch_weather_byname(robot, msg, match, 0);
  });

  robot.hear(/!forecast (.+)$/i,
    function (msg) {
      msg.finish();

      match = msg.match[1].trim();
      const zip_regex = /^\d{5}$/;

      days = 3
      daysMatches = match.match(/(?:\s)([1-5])$/);
      if (daysMatches) {
        days = parseInt(daysMatches[1]);
        match = match.substring(0, match.length - daysMatches[0].length);
      }

      if (zip_regex.test(match))
        fetch_weather_byzip(robot, msg, match, days);
      else
        fetch_weather_byname(robot, msg, match, days);
    });
}
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
  process.env.HUBOT_WEATHER_API_URL : 'https://community-open-weather-map.p.rapidapi.com/weather'

process.env.HUBOT_WEATHER_UNITS = (process.env.HUBOT_WEATHER_UNITS != null) ?
  process.env.HUBOT_WEATHER_UNITS : 'imperial'

process.env.RAPIDAPI_KEY = (process.env.RAPIDAPI_KEY != null) ?
  process.env.RAPIDAPI_KEY : ''

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
  url = process.env.HUBOT_WEATHER_API_URL

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
    .then(json => {
      m = `${get_emote_for_code(json.weather[0].id)} It's ${Math.round(json.main.temp)} degrees with ${json.weather[0].description} and humidity at ${json.main.humidity}% in ${json.name}!`;
      msg.send(m)
    })
    .catch(err => msg.reply('Cannot compute: ' + err));
}

function fetch_weather_byname(robot, msg, name) {
  query = {
    units: process.env.HUBOT_WEATHER_UNITS,
    q: name
  }

  fetch_weather(robot, msg, query);
}

function fetch_weather_byzip(robot, msg, zipCode) {
  query = {
    units: process.env.HUBOT_WEATHER_UNITS,
    zip: zipCode
  }

  fetch_weather(robot, msg, query);
}

module.exports = function (robot) {
  robot.hear(/!weather (.*)/i, function (msg) {
    msg.finish();

    const match = msg.match[1].trim();
    console.log(match)
    const zip_regex = /^\d{5}$/;

    if (zip_regex.test(match))
      fetch_weather_byzip(robot, msg, match);
    else
      fetch_weather_byname(robot, msg, match);
  });
}
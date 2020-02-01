// Description:
//   Weather script for display temperature and humidity
//
// Dependencies:
//   None
//
// Configuration:
//   HUBOT_WEATHER_API_URL
//   HUBOT_WEATHER_UNITS
//   HUBOT_WEATHER_API_KEY
//
// Commands:
//   !weather <city>  - Look up the temperature and humidity for the city
//

process.env.HUBOT_WEATHER_API_URL = (process.env.HUBOT_WEATHER_API_URL != null) ?
  process.env.HUBOT_WEATHER_API_URL : 'https://community-open-weather-map.p.rapidapi.com/weather'

process.env.HUBOT_WEATHER_UNITS = (process.env.HUBOT_WEATHER_UNITS != null) ?
  process.env.HUBOT_WEATHER_UNITS : 'imperial'

process.env.HUBOT_WEATHER_API_KEY = (process.env.HUBOT_WEATHER_API_KEY != null) ?
  process.env.HUBOT_WEATHER_API_KEY : ''

module.exports = function (robot) {
  robot.hear(/!weather (.*)/i, function (msg) {
    city = msg.match[1]
    query = {
      units: process.env.HUBOT_WEATHER_UNITS,
      q: city
    }

    url = process.env.HUBOT_WEATHER_API_URL

    new Promise((resolve, reject) =>
        robot.http(url)
        .header('x-rapidapi-host', 'community-open-weather-map.p.rapidapi.com')
        .header('X-RapidAPI-Key', process.env.HUBOT_WEATHER_API_KEY)
        .query(query)
        .get()((err, response, body) => {
          if (err != null) {
            reject(err)
          } else if (response.statusCode === 200) {
            resolve(body)
          } else {
            console.log("unknown error")
            json = JSON.parse(body)
            reject(json.message)
          }
        })
      )
      //parse to js object
      .then(body => {
        console.log(body)
        return JSON.parse(body)
      })
      .then(json => {
        m = `It's ${json.main.temp} degrees with ${json.main.humidity}% humidity in ${json.name}!`;
        msg.send(m)
      })
      .catch(err => msg.reply('Cannot compute: ' + err));

  });
}
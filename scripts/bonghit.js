// Description:
//   Bonghits
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   !bonghit  - Take a hit!
//

const BONG_TIME = [10, 5, 3]
const BONG_PHRASE = [
  "Bonghit",
  "Fly high",
  "Suck it like a wang",
  "Puff puff"
]

function startBongHit(msg, secs) {
  msg.send("(-_-)")
  bongCount(msg, secs)
}

function bongCount(msg, secs) {
  if (secs > 0) {
    msg.send(secs.toString())
    msg.send(secs)
    secs--
    setTimeout(f => bongCount(msg, secs), 1000);
    return
  }

  msg.send(msg.random(BONG_PHRASE) + "!")
}

module.exports = function (robot) {
  robot.hear(/!bonghit$/i, function (msg) {
    secs = msg.random(BONG_TIME)
    startBongHit(msg, secs)
  });
}
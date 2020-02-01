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

const BONGTIME = 10

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

  msg.send("bonghit!")
}

module.exports = function (robot) {
  robot.hear(/!bonghit/i, function (msg) {
    secs = BONGTIME
    startBongHit(msg, secs)
  });
}
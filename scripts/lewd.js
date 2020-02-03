// Description:
//   Reacts to lewd remarks
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   boobs
//

const RESPONSES = [
  "/shakes his assets at <u>",
  ":boobs:",
  "bow chicka wow wow!",
  "/winks at <u>",
  "watch your language <u>!"
]

module.exports = function (robot) {
  robot.hear(/(boob(s?|ies?)|tit(s?)|tata(s?)|bazongas)/i, function (msg) {
    const phrase = msg.random(RESPONSES)
    response = phrase.replace(/<u>/g, () => msg.message.user.name)

    if (response.startsWith("/"))
      msg.emote(response.slice(1));
    else
      msg.send(response);
  });
}
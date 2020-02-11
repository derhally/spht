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

words = [
  'boob(?:s|ies)?',
  'tit(?:s)?',
  'tata(?:s)?',
  'bazongas?',
]

const RESPONSES = [
  "/shakes his assets at <u>",
  ":boobs:",
  "bow chicka wow wow!",
  "/winks at <u>",
  "watch your language <u>!"
]

module.exports = function (robot) {

  const regex = new RegExp("\\b(?:" + words.join("|") + ")\\b", "gi");

  ///////////////
  // LISTENERS //
  ///////////////
  robot.hear(regex, function (res) {

    const phrase = res.random(RESPONSES)
    let response = phrase.replace(/<u>/g, () => res.message.user.name)

    if (response.startsWith("/"))
      res.emote(response.slice(1));
    else
      res.send(response);
  });
}
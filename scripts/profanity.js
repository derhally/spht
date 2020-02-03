// Description:
//   Mind your language
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//

words = [
    'anal',
    'arse',
    'ass',
    'assbagger',
    'asshole(s)?',
    'asslicker',
    'assman',
    'asswhore',
    'asswipe',
    'bastard',
    'bitch',
    'bj',
    'blowjob',
    'boob(ies)?',
    'bullshit',
    'cock',
    'cunt',
    'damn',
    'damnit',
    'depp',
    'dick',
    'douche',
    'fag',
    'fu',
    'fuck',
    'fucked',
    'fucker(s)?',
    'fucking',
    'ho',
    'oral',
    'piss',
    'scheisse',
    'shit',
    'slut(s)?',
    'tit(s)?',
    'tosser',
    'whore',
    'wank(er)?',
    'wankers'
]

const phrase = '*{user}* have been fined one credit for a violation of the verbal morality statute.';

regex = new RegExp('(?:^|\\s)(' + words.join('|') + ')(?:\\s|\\.|\\?|!|$)', 'i');

module.exports = function (robot) {
    robot.hear(regex, function (msg) {
        msg.send(phrase.replace(/{user}/, msg.message.user.name));
    });
}
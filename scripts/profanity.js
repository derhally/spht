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

const UserStore = require('./lib/userStore.js')

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
    'bitch(es)?',
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
    'douche(bag)?',
    'fag',
    'fu',
    'fuck',
    'fucked',
    'fucker(s)?',
    'fucking',
    'ho',
    'oral',
    'penis',
    'piss',
    'scheisse',
    'shit',
    'slut(s)?',
    'stfu',
    'tit(s)?',
    'tosser',
    'whore',
    'wank(er)?',
    'wankers',
    'wtf'
]

const phrase = '*{user}* have been fined one credit for a violation of the verbal morality statute.\n Your profanity has cost you *{credit}* credits up to this point.';

regex = new RegExp('(?:^|\\s)(' + words.join('|') + ')(?:\\s|\\.|\\?|!|$)', 'i');

module.exports = function (robot) {

    function incrementCredits(userData, amount = 1) {
        let current = userData.profanity_debt || 0;
        userData.profanity_debt = current + amount;
        return userData.profanity_debt;
    }

    ///////////////
    // LISTENERS //
    ///////////////
    robot.hear(regex, function (res) {
        let userData = UserStore.forUser(robot, res.message.user.id);
        let currentDebt = incrementCredits(userData);

        let response = phrase.replace(/{user}/, res.message.user.name)
            .replace(/{credit}/, currentDebt);
        res.send(response);
    });
}
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

const {
    table
} = require('table');

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

const phrase = '*{user}* you have been fined one credit for a violation of the verbal morality statute.\n Your profanity has cost you *{credit}* credits up to this point.';

regex = new RegExp('(?:^|\\s)(' + words.join('|') + ')(?:\\s|\\.|\\?|!|$)', 'i');

module.exports = function (robot) {

    function incrementCredits(userData, amount = 1) {
        let current = userData.profanity_debt || 0;
        userData.profanity_debt = current + amount;
        return userData.profanity_debt;
    }

    function getUserData(userId) {
        var userData = UserStore.forUser(robot, userId);
        if (userData.profanity_debt)
            return userData;

        return null;
    }

    function compare(user1, user2) {
        return user2[1] - user1[1];
    }

    table_config = {
        columns: {
            0: {
                alignment: 'left',
                width: 12
            },
            1: {
                alignment: 'right',
                width: 7
            },
        }
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

    robot.respond(/top offenders/i, function (res) {

        offenders = []

        const users = robot.brain.users();
        for (let key of Object.keys(users)) {
            const user = users[key];
            var userData = getUserData(user.id);
            if (userData == null) continue
            offenders.push([user.name, userData.profanity_debt]);
        }

        offenders.sort(compare);
        offenders.unshift(['Offender', 'Credits']);
        res.send('```' + table(offenders, table_config) + '```');
    });
}
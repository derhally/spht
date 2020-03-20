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
    'asshole(?:s)?',
    'asslicker',
    'assman',
    'asswhore',
    'asswipe',
    'bastard',
    'bitch(?:es)?',
    'bj(?:s)?',
    'blowjob(?:s)?',
    'boob(?:ies)?',
    'bullshit',
    'cock(?:s)?',
    'cunt(?:s)?',
    'damn',
    'damnit',
    'depp',
    'dick',
    'douche(?:bag)?',
    'fag(?:s)?',
    'fu',
    'fuck(?:s)?',
    'fucked',
    'fucker(?:s)?',
    'fucking',
    'ho',
    'oral',
    'penis(?:es)?',
    'piss',
    'scheisse',
    'shit(?:s)?',
    'slut(?:s)?',
    'stfu',
    'tit(?:s)?',
    'tosser',
    'whore(?:s)?',
    'wank(?:er)?',
    'wanker(?:s)?',
    'wtf'
]

const phrase = '*{user}* you have been fined {amount} credit for a violation of the verbal morality statute.\n Your profanity has cost you *{credit}* credits up to this point.';

const regex = new RegExp("\\b(?:" + words.join("|") + ")\\b", "gi");

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

    const ordinal_rules = new Intl.PluralRules("en", {
        type: "ordinal"
    });

    const suffixes = {
        one: "st",
        two: "nd",
        few: "rd",
        other: "th"
    };

    function ordinal(number) {
        const suffix = suffixes[ordinal_rules.select(number)];
        return (number + suffix);
    }

    ///////////////
    // LISTENERS //
    ///////////////
    robot.hear(regex, function (res) {

        return;

        let userData = UserStore.forUser(robot, res.message.user.id);
        let currentDebt = incrementCredits(userData, res.match.length);

        let response = phrase.replace(/{user}/, res.message.user.name)
            .replace(/{amount}/, res.match.length)
            .replace(/{credit}/, currentDebt);
        res.send(response);
    });

    robot.respond(/top (\d+?)?(?:\s)?offenders/i, function (res) {

        let offenders = [];

        var topCount = res.match[1] === undefined ? 5 : res.match[1];
        const users = robot.brain.users();
        for (let key of Object.keys(users)) {
            const user = users[key];
            var userData = getUserData(user.id);
            if (userData == null) continue
            offenders.push([user.name, userData.profanity_debt]);
        }

        offenders.sort(compare);
        let userPos = offenders.findIndex(data => {
            return data[0] === res.message.user.name
        })

        let topXOffenders = offenders.slice(0, topCount)
        topXOffenders.unshift(['Offender', 'Credits']);

        let respMsg = `The top ${topCount} offenders are:` +
            "\n```" + table(topXOffenders, table_config) + "```";

        if (userPos >= topCount) {
            respMsg += "\n" + `${res.message.user.name}, you are in ${ordinal(userPos + 1)} position`;
        }
        res.send(respMsg);
    });
}
const Helper = require('hubot-test-helper');
const UserStore = require('./../scripts/lib/userStore.js');

// helper loads a specific script if it's a file
const helper = new Helper('./../scripts/profanity.js');

const co = require('co');
const expect = require('chai').expect;
const {
    table
} = require('table');


describe('profanity', function () {

    beforeEach(function () {
        this.room = helper.createRoom({
            httpd: false
        });
    });

    afterEach(function () {
        this.room.destroy();
    });

    context('credit tally', function () {
        beforeEach(function () {
            return co(function* () {
                yield this.room.user.say('bob', 'ass');
                yield this.room.user.say('bob', 'ass shit');
            }.bind(this));
        });

        it('should reply to user', function () {
            expect(this.room.messages).to.eql([
                ['bob', 'ass'],
                ['hubot', '*bob* you have been fined 1 credit for a violation of the verbal morality statute.\n Your profanity has cost you *1* credits up to this point.'],
                ['bob', 'ass shit'],
                ['hubot', '*bob* you have been fined 2 credit for a violation of the verbal morality statute.\n Your profanity has cost you *3* credits up to this point.']
            ]);
        });
    });

    context('leaderboard', function () {
        beforeEach(function () {
            return co(function* () {
                this.user1 = this.room.robot.brain.userForId('bob', {
                    name: 'bob'
                })
                this.user2 = this.room.robot.brain.userForId('alice', {
                    name: 'alice'
                })
                this.user3 = this.room.robot.brain.userForId('tom', {
                    name: 'tom'
                })
                this.user4 = this.room.robot.brain.userForId('joe', {
                    name: 'joe'
                })
                this.user5 = this.room.robot.brain.userForId('bert', {
                    name: 'bert'
                })
                this.user6 = this.room.robot.brain.userForId('peter', {
                    name: 'peter'
                })

                var userData = UserStore.forUser(this.room.robot, 'bob');
                userData.profanity_debt = 6;

                userData = UserStore.forUser(this.room.robot, 'tom');
                userData.profanity_debt = 10;

                userData = UserStore.forUser(this.room.robot, 'alice');
                userData.profanity_debt = 4;

                userData = UserStore.forUser(this.room.robot, 'bert');
                userData.profanity_debt = 1;

                userData = UserStore.forUser(this.room.robot, 'peter');
                userData.profanity_debt = 2;

                userData = UserStore.forUser(this.room.robot, 'joe');
                userData.profanity_debt = 1;

                yield this.room.user.say('bob', 'hubot top offenders');
                yield this.room.user.say('bert', 'hubot top offenders');
                yield this.room.user.say('bob', 'hubot top 3 offenders');
            }.bind(this));
        });


        tableConfig = {
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

        expectedResponse = table([
            ['Offender', 'Credits'],
            ['tom', 10],
            ['bob', 6],
            ['alice', 4],
            ['peter', 2],
            ['joe', 1]
        ], tableConfig);

        expectedTop3Response = table([
            ['Offender', 'Credits'],
            ['tom', 10],
            ['bob', 6],
            ['alice', 4]
        ], tableConfig);

        it('should reply to user', function () {

            expect(this.room.messages).to.eql([
                ['bob', 'hubot top offenders'],
                ['hubot', "The top 5 offenders are:\n```" + expectedResponse + "```"],
                ['bert', 'hubot top offenders'],
                ['hubot', "The top 5 offenders are:\n```" + expectedResponse + "```\nbert, you are in 6th position"],
                ['bob', 'hubot top 3 offenders'],
                ['hubot', "The top 3 offenders are:\n```" + expectedTop3Response + "```"]
            ]);
        });
    });
});
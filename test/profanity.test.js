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
                yield this.room.user.say('bob', 'ass');
            }.bind(this));
        });

        it('should reply to user', function () {
            expect(this.room.messages).to.eql([
                ['bob', 'ass'],
                ['hubot', '*bob* you have been fined one credit for a violation of the verbal morality statute.\n Your profanity has cost you *1* credits up to this point.'],
                ['bob', 'ass'],
                ['hubot', '*bob* you have been fined one credit for a violation of the verbal morality statute.\n Your profanity has cost you *2* credits up to this point.']
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

                var userData = UserStore.forUser(this.room.robot, 'bob');
                userData.profanity_debt = 3;

                userData = UserStore.forUser(this.room.robot, 'tom');
                userData.profanity_debt = 10;

                userData = UserStore.forUser(this.room.robot, 'alice');
                userData.profanity_debt = 1;

                yield this.room.user.say('bob', 'hubot top offenders');
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
            ['bob', 3],
            ['alice', '1']
        ], tableConfig);

        it('should reply to user', function () {

            expect(this.room.messages).to.eql([
                ['bob', 'hubot top offenders'],
                ['hubot', '```' + expectedResponse + '```']
            ]);
        });
    });
});
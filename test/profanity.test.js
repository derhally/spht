const Helper = require('hubot-test-helper');

// helper loads a specific script if it's a file
const helper = new Helper('./../scripts/profanity.js');

const co = require('co');
const expect = require('chai').expect;


describe('profanity', function () {

    beforeEach(function () {
        this.room = helper.createRoom({
            httpd: false
        });

        brain = this.room.robot.brain;
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
});
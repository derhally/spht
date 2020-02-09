const Helper = require('hubot-test-helper');

// helper loads a specific script if it's a file
const helper = new Helper('./../scripts/weather.js');

const expect = require('chai').expect;
const nock = require('nock')


describe('weather', function () {

    beforeEach(function () {
        this.room = helper.createRoom({
            httpd: false
        });

        nock.disableNetConnect();
        nock('https://community-open-weather-map.p.rapidapi.com')
            .persist()
            .get('/weather')
            .query({
                units: 'imperial',
                zip: '20007'
            })
            .replyWithFile(200, __dirname + '/replies/weather.current-response.json', {
                'Content-Type': 'application/json',
            })
            .get('/weather')
            .query({
                units: 'imperial',
                q: 'washington'
            })
            .replyWithFile(200, __dirname + '/replies/weather.current-response.json', {
                'Content-Type': 'application/json',
            })
            .get('/forecast/daily')
            .query({
                units: 'imperial',
                zip: '20007',
                cnt: 3
            })
            .replyWithFile(200, __dirname + '/replies/weather.forecast-response.json', {
                'Content-Type': 'application/json',
            })
            .get('/forecast/daily')
            .query({
                units: 'imperial',
                q: 'washington',
                cnt: 3
            })
            .replyWithFile(200, __dirname + '/replies/weather.forecast-response.json', {
                'Content-Type': 'application/json',
            });
    });

    afterEach(function () {
        this.room.destroy();
        nock.cleanAll();
    });

    context('weather by zip', function () {
        beforeEach(function (done) {
            this.room.user.say('bob', '!weather 20007');
            this.room.user.say('bob', '!forecast 20007');
            this.room.user.say('bob', '!forecast 20007 3');
            setTimeout(done, 200);
        });

        it('should reply to user', function () {
            expect(this.room.messages).to.eql([
                ['bob', '!weather 20007'],
                ['bob', '!forecast 20007'],
                ['bob', '!forecast 20007 3'],
                ["hubot", "It is currently 41f and feels like 33f in Washington!\n    :cloud_rain: Light rain\n    Humidity: 64%\n    Low 37f High 44f"],
                ["hubot", "3 day forecast for Washington:\n   2\\8: Low: 3 High: 8 Humidity: 35%\n   2\\9: Low: 1 High: 9 Humidity: 39%\n   2\\10: Low: 7 High: 10 Humidity: 79%"],
                ["hubot", "3 day forecast for Washington:\n   2\\8: Low: 3 High: 8 Humidity: 35%\n   2\\9: Low: 1 High: 9 Humidity: 39%\n   2\\10: Low: 7 High: 10 Humidity: 79%"]
            ]);
        });
    });

    context('weather by name', function () {
        beforeEach(function (done) {
            this.room.user.say('bob', '!weather washington');
            this.room.user.say('bob', '!forecast washington');
            this.room.user.say('bob', '!forecast washington 3');
            setTimeout(done, 200);
        });

        it('should reply to user', function () {
            expect(this.room.messages).to.eql([
                ['bob', '!weather washington'],
                ['bob', '!forecast washington'],
                ['bob', '!forecast washington 3'],
                ["hubot", "It is currently 41f and feels like 33f in Washington!\n    :cloud_rain: Light rain\n    Humidity: 64%\n    Low 37f High 44f"],
                ["hubot", "3 day forecast for Washington:\n   2\\8: Low: 3 High: 8 Humidity: 35%\n   2\\9: Low: 1 High: 9 Humidity: 39%\n   2\\10: Low: 7 High: 10 Humidity: 79%"],
                ["hubot", "3 day forecast for Washington:\n   2\\8: Low: 3 High: 8 Humidity: 35%\n   2\\9: Low: 1 High: 9 Humidity: 39%\n   2\\10: Low: 7 High: 10 Humidity: 79%"]
            ]);
        });
    });
});
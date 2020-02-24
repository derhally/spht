module.exports = function (robot) {

    const alpha = require('alphavantage')({
        key: process.env.ALPHA_KEY
    });

    function changeSymbol(change) {
        if (change == "+")
            return "↑";
        else if (change == "-")
            return "↓"
        else
            return "";
    }

    function trimNumber(number, decimals) {
        const tmp = number + '';
        if (tmp.indexOf('.') > -1) {
            return +tmp.substr(0, tmp.indexOf('.') + decimals + 1);
        } else {
            return +number
        }
    }

    function format(data) {
        let current = `${data.symbol}: ${data.price}${changeSymbol(data.change_percent[0])} (${trimNumber(data.change, 2)}|${trimNumber(data.change_percent.slice(0, -1), 2)}%)`;
        let o = `     o: ${trimNumber(data.open)}`;
        let h = `     h: ${trimNumber(data.high)}`;
        let l = `     l: ${trimNumber(data.low)}`;

        return current + "\n" + o + "\n" + h + "\n" + l;
    }

    robot.hear(/^!stock (.*)$/i, function (res) {
        res.finish();

        alpha.data.quote(res.match[1].trim())
            .then(data => {
                const polished = alpha.util.polish(data);
                var response = format(polished.data);
                res.send(response);
            });
    });
}
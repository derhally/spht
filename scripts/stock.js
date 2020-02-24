// Description:
//   Stock script for displaing a quote
//
// Dependencies:
//   None
//
// Configuration:
//   ALPHA_KEY
//
// Commands:
//   !stock <ticker>  - Get the quote for a stock
//

module.exports = function (robot) {

    const alpha = require('alphavantage')({
        key: process.env.ALPHA_KEY
    });

    function changeSymbol(change) {
        if (change == "-")
            return "▼"
        else
            return "▲";
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
        let current = `${data.symbol}: ${trimNumber(data.price, 2)}${changeSymbol(data.change_percent[0])} (${trimNumber(data.change, 2)}|${trimNumber(data.change_percent.slice(0, -1), 2)}%)`;
        let o = ` O: ${trimNumber(data.open, 2)}`;
        let h = ` H: ${trimNumber(data.high, 2)}`;
        let l = ` L: ${trimNumber(data.low, 2)}`;

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
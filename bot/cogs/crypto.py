
import os

import config
import discord
from coinmarketcapapi import CoinMarketCapAPI, CoinMarketCapAPIError
from discord.ext import commands
from tabulate import tabulate


class CryptoQuote:
    def __init__(self, quote):
        self.quote = quote

    @property
    def price(self):
        return self.quote["price"]

    @property
    def change_percent(self):
        return self.quote["percent_change_1h"]

    @property
    def symbol(self):
        return self.quote["symbol"]

    @property
    def name(self):
        return self.quote["name"]


class Crypto(commands.Cog):
    def __init__(self, bot, client):
        self.bot = bot
        self.client = client
        default_symbols = "BTC,ETH,ADA,DOGE,BCH,BNB,USDT"

    @staticmethod
    def changeSymbol(change):
        if change > 0:
            return "▲"
        elif change < 0:
            return "▼"
        else:
            ""

    @staticmethod
    def render(quotes: list) -> discord.Embed:
        embed = discord.Embed(title="Crypto")
        embed.set_thumbnail(url=config.image_url("stock-market.png"))

        for quote in quotes:
            title = f"{quote.symbol}-{quote.name}"
            p = f"Price: {quote.price:.2f}"
            c = f"Change: {Crypto.changeSymbol(quote.change_percent)} ({quote.change_percent:.2f}%)"
            embed.add_field(name=title, value="\n".join([p, c]))

        return embed

    @commands.command(name="crypto")
    async def crypto(self, ctx, *args):
        symbols = self.default_symbols
        if len(args) > 1:
            symbols = ",".join(args)
        if len(args) == 1:
            symbols = ",".join(args[0].split(" "))

        data = self.client.cryptocurrency_quotes_latest(symbol=symbols).data
        crypto = []
        for _, info in data.items():
            crypto.append(CryptoQuote({
                "symbol": info["symbol"],
                "name": info["name"],
                "percent_change_1h": info["quote"]["USD"]["percent_change_1h"],
                "price": info["quote"]["USD"]["price"],
            }))

        response = Crypto.render(sorted(crypto, key=lambda q: q.price, reverse=True))
        await ctx.send(embed=response)


def setup(bot):
    client = CoinMarketCapAPI(os.getenv("CMC_API_KEY"))
    bot.add_cog(Crypto(bot, client))


import asyncio
import argparse
from cogs.settings import SettingsKey
import concurrent.futures
import config
import discord
from discord.ext import commands
import logging
from yahoo_fin import stock_info


class StockQuote:
    def __init__(self, quote):
        self.quote = quote

    @property
    def current(self):
        return self.quote["Quote Price"]

    @property
    def previous(self):
        return self.quote["Previous Close"]

    @property
    def open(self):
        return self.quote["Open"]

    @property
    def ex_dividend_date(self):
        return self.quote["Ex-Dividend Date"]

    @property
    def market_cap(self):
        return self.quote["Market Cap"]

    @property
    def change(self):
        return self.current - self.previous

    @property
    def change_percent(self):
        return (self.change / self.previous) * 100

    @property
    def day_range(self):
        return self.quote["Day's Range"]

    @property
    def ticker(self):
        return self.quote["ticker"]

@SettingsKey(key="stocks")
class Stocks(commands.Cog):

    STOCKS_SETTINGS_KEY = "stocks.list"
    MAX_STOCK = 6

    def __init__(self, bot):
        self.bot = bot

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
        embed = discord.Embed(title="Stocks")
        embed.set_thumbnail(url=config.image_url("stock-market.png"))

        for quote in quotes:
            title = quote.ticker
            p = f"Price: {quote.current:.2f}"
            c = f"Change: {Stocks.changeSymbol(quote.change)} ({quote.change:.2f}|{quote.change_percent:.2f}%)"
            pc = f"Previous Close: {quote.previous:.2f}"
            o = f"Open: {quote.open:.2f}"
            r = f"Day's Range: {quote.day_range}"
            embed.add_field(name=title, value="\n".join([p,c,o,pc,r]))

        return embed

    @staticmethod
    def get(ticker):
        try:
            logging.debug("Retrieving quote for '%s'", ticker)
            data = stock_info.get_quote_table(ticker)
            data["ticker"] = ticker.upper()
            return StockQuote(data)
        except:
            logging.error("Error retrieving quote for ticker '%s'", ticker)

    @commands.command(name="stock")
    async def stock(self, ctx, ticker:str):
        response = Stocks.render([Stocks.get(ticker)])
        await ctx.send(embed=response)

    @commands.command(name="stocks")
    async def stocks(self, ctx):
        async with ctx.typing():
            stocks = self.bot.storage.get(Stocks.STOCKS_SETTINGS_KEY, ctx.message.author.id)
            if not stocks or len(stocks) == 0:
                await ctx.send("You have not set your `stocks` setting.  Use the command: "
                f"```{self.bot.command_prefix}setting stocks set|add <ticker> <ticker>```")
                return

            quotes = []
            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
                future_stock = {executor.submit(Stocks.get, ticker): ticker for ticker in stocks}
                for stock in concurrent.futures.as_completed(future_stock):
                    res = stock.result()
                    if res:
                        quotes.append(res)

            # sort them as the original
            quotes = sorted(quotes, key=lambda x: stocks.index(x.ticker))
            response = Stocks.render(quotes)
            await ctx.send(embed=response)

    async def save_user_pref(self, ctx, command, args:list):
        parser = argparse.ArgumentParser()
        subs = parser.add_subparsers()
        stocks = subs.add_parser("set")
        stocks.add_argument("set", nargs="*")
        stocks = subs.add_parser("add")
        stocks.add_argument("add", nargs="*")
        stocks = subs.add_parser("rm")
        stocks.add_argument("rm", nargs="*")
        stocks = subs.add_parser("list")
        stocks.add_argument("list", action="store_true")

        try:
            options = parser.parse_args(args)
        except SystemExit as err:
            await ctx.message.author.send(f"Error: valid options are set, add, rm, list.")
            return
        except argparse.ArgumentError as err:
            await ctx.message.author.send(err.message)
            return

        curr = []
        if "set" in options:
            if len(options.set) > Stocks.MAX_STOCK:
                await ctx.message.author.send(f"There is a limit of {Stocks.MAX_STOCK} stocks!")
                return
            curr = list(map(lambda x:x.upper(), options.set))
            self.bot.storage.set(Stocks.STOCKS_SETTINGS_KEY, curr, user_id=ctx.message.author.id)
        elif "add" in options:
            curr = list(self.bot.storage.get(Stocks.STOCKS_SETTINGS_KEY, user_id=ctx.message.author.id, default=[]))
            add = list(map(lambda x:x.upper(), options.add))
            curr.extend(t for t in add if t not in curr)
            if len(curr) > Stocks.MAX_STOCK:
                await ctx.message.author.send(f"There is a limit of {Stocks.MAX_STOCK} stocks!")
                return
            self.bot.storage.set(Stocks.STOCKS_SETTINGS_KEY, curr, user_id=ctx.message.author.id)
        elif "rm" in options:
            rm = list(map(lambda x:x.upper(), options.rm))
            curr = self.bot.storage.get(Stocks.STOCKS_SETTINGS_KEY, user_id=ctx.message.author.id, default=[])
            curr = list(filter(lambda i: i not in rm, curr))
            self.bot.storage.set(Stocks.STOCKS_SETTINGS_KEY, curr, user_id=ctx.message.author.id)
        elif "list" in options:
            curr = self.bot.storage.get(Stocks.STOCKS_SETTINGS_KEY, user_id=ctx.message.author.id, default=[])

        await ctx.message.author.send(f"Your default stocks are `{curr}`.")

def setup(bot):
    bot.add_cog(Stocks(bot))
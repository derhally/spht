
import asyncio
import discord
from discord.ext import commands
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

class Stocks(commands.Cog):
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
    def render(quote: StockQuote):
        c = f"{quote.ticker}: {quote.current:.2f}{Stocks.changeSymbol(quote.change)} ({quote.change:.2f}|{quote.change_percent:.2f}%)"
        p = f"\tPrevious Close: {quote.previous:.2f}"
        o = f"\tOpen: {quote.open:.2f}"
        h = f"\tDay's Range: {quote.day_range}"

        title = quote.ticker
        description = c + "\n" + o + "\n" + h + "\n"
        embed = discord.Embed(title=title, description=description)
        return embed

    @staticmethod
    def get(ticker):
        data = stock_info.get_quote_table(ticker)
        data["ticker"] = ticker.upper()
        return StockQuote(data)

    @commands.command(name="stock")
    async def stock(self, ctx, ticker:str):
        response = Stocks.render(Stocks.get(ticker))
        await ctx.send(embed=response)

def setup(bot):
    bot.add_cog(Stocks(bot))
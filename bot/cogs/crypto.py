
import asyncio
import discord
from discord.ext import commands
from tabulate import tabulate
from yahoo_fin import stock_info

class CryptoQuote(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="crypto")
    async def crypto(self, ctx):
        data = stock_info.get_top_crypto().head(5).drop(["Market Cap", "Volume in Currency (Since 0:00 UTC)", "Volume in Currency (24Hr)", "Total Volume All Currencies (24Hr)", "Circulating Supply"], axis=1)
        msg = tabulate(data, headers="keys", showindex=False, tablefmt="simple", numalign="right", floatfmt=".2f")
        await ctx.send(f"```{msg}```")

def setup(bot):
    bot.add_cog(CryptoQuote(bot))
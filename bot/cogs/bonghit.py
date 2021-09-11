
import asyncio
import random

import discord
from discord.ext import commands

BONG_TIME = [10,5,3]
BONG_PHRASE = [
  "Bonghit",
  "Fly high",
  "Suck it like a wang",
  "Puff puff"
]

class BongHit(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @staticmethod
    async def run(ctx):
        count = random.choice(BONG_TIME)

        while count > 0:
            await ctx.send(f"{count}")
            count -=  1
            await asyncio.sleep(1)

        await ctx.send(f"{random.choice(BONG_PHRASE)}!")

    @commands.command(name="bonghit")
    async def bonghit(self, ctx):
        # await ctx.send(message)
        await self.run(ctx)

def setup(bot):
    bot.add_cog(BongHit(bot))
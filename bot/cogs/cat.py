import aiohttp
import asyncio
import config
import discord
from discord.ext import commands
import os
import random
import requests

class CatFacts(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    CAT_FACT_URL = "https://catfact.ninja/fact"

    CAT_CHARS = ["🐱", "😺", "😼", "😹", "🙀", "😸", "😽"]

    @commands.command()
    async def catfact(self, ctx):
        async with aiohttp.ClientSession() as session:
            async with session.get(CatFacts.CAT_FACT_URL) as response:
                data = await response.json()
                img = f"{config.cat_images_url}/{random.randint(1,4):02d}.png"
                embed = discord.Embed(title=f"{random.choice(CatFacts.CAT_CHARS)} Cat Fact", description=data["fact"], color=discord.Colour.blurple())
                embed.set_thumbnail(url=img)
                await ctx.send(embed=embed)

def setup(bot):
    bot.add_cog(CatFacts(bot))


import asyncio
import config
import discord
from discord.ext import commands
import logging
import os
import wolframalpha


class Wolfram(commands.Cog):

    def __init__(self, bot, app_id):
        self.bot = bot
        self.wolf_client = wolframalpha.Client(app_id)

    @staticmethod
    def render(dict):
        results = 0
        for pod in list(dict['pod']):
            if pod['@id'] == 'Input':
                input_value = pod['subpod']['img']['@title']
            elif pod['@id'] == 'Result':
                result_value = pod['subpod']['img']['@title']
                results = 1
            elif pod['@id'] == 'DecimalApproximation' and results == 0:
                result_value = pod['subpod']['img']['@title']
                results = 1
            elif results == 0:
                result_value = pod['subpod']['img']['@title']
        print_embed = discord.Embed(
            title='Results',
            description='Wolfram|Alpha',
            color=discord.Colour.purple()
        )
        print_embed.set_thumbnail(url='https://i.imgur.com/cXwo5bz.png')
        print_embed.add_field(name='Input:', value=input_value, inline=False)
        print_embed.add_field(name='Result:', value=result_value, inline=False)
        return print_embed

    # Compute Wolfram Response
    @commands.command(name="compute", aliases=["c"])
    async def computewolf(self, ctx, *, query):
        try:
            res = self.wolf_client.query(query)
            res_dict = dict(res)
            if res_dict['@error'] == 'true':
                await ctx.send("I have no idea.")
                return
            await ctx.send(embed=Wolfram.render(res_dict))
        except Exception as e:
            await ctx.send(f"Error: {e}")


def setup(bot):
    api_key = os.getenv("WOLFRAM_APPID")
    bot.add_cog(Wolfram(bot, api_key))

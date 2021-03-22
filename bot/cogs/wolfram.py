
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
    def render(query, res, dict):
        print_embed = discord.Embed(
            title='Results',
            description='Wolfram|Alpha',
            color=discord.Colour.purple()
        )
        result_value = ""
        results = 0
        if 'pod' in dict:
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
                    if isinstance(pod['subpod'], wolframalpha.Subpod):
                        result_value = pod['subpod']['img']['@title']
                    else:
                        for subpod in pod['subpod']:
                            if result_value != "":
                                result_value += "\n"
                            result_value += subpod['img']['@title']

        elif hasattr(res, "didyoumeans"):
            input_value = query
            if res.didyoumeans["@count"] == '1':
                didyoumean = res.didyoumeans["didyoumean"]["#text"]
            else:
                didyoumean = res.didyoumeans["didyoumean"][0]["#text"]
            result_value = f"did you mean '{didyoumean}'?"

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
            await ctx.send(embed=Wolfram.render(query, res, res_dict))
        except Exception as e:
            await ctx.send(f"Error: {e}")


def setup(bot):
    api_key = os.getenv("WOLFRAM_APPID")
    bot.add_cog(Wolfram(bot, api_key))

import { Telegraf, Scenes, session } from 'telegraf';
import { IContext, defaultData } from './types';
import { TScenes, defaultSceneContext } from './types';
import { ConfigApp } from './config/config.app';
import { mainScene, addressScene, paymentScene, findOrgScene, findAccountScene, invoiceScene } from './scenes/index';
import Redis from 'ioredis';

const env = new ConfigApp();
const bot = new Telegraf<IContext>(env.get("BOT_TOKEN"));

// Register scenes
const stage = new Scenes.Stage<IContext>(
    [mainScene, addressScene, paymentScene, findOrgScene, findAccountScene, invoiceScene]);

const redisClient = new Redis(env.get("REDIS_URL"));

const redisSession = () => {
    return async (ctx: IContext, next: () => Promise<void>) => {
        const sessionId = ctx.from?.id.toString() || '';
        if (sessionId) {
            const sessionData = await redisClient.get(sessionId);
            ctx.data = sessionData ? JSON.parse(sessionData) : {};
        }
        await next();
        if (sessionId) {
            await redisClient.set(sessionId, JSON.stringify(ctx.data));
        }
    };
};

bot.use(session());
bot.use(redisSession())
bot.use(stage.middleware());

bot.start(async (ctx) => {
    ctx.data = defaultData;
    await ctx.replyWithSticker("DOMA_STICKER");
    const start = await ctx.reply('Бот оплат doma.ai\nТут можно оплатить квитанции за ЖКУ');
    ctx.data.startMessage = start.message_id;
    await ctx.scene.enter(TScenes.MainScene);
    ctx.data.scenes = [];
    ctx.data.scenes.push(defaultSceneContext);
});

bot.launch().then(() => console.log('Bot is running...'));;

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

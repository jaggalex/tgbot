import { Scenes, Markup } from 'telegraf';
import { IContext, TScenes, defaultSceneContext } from '../types';
import { btnBottom } from '../menu';
import { clearMessages, saveMessages } from '../manager'


const paymentScene = new Scenes.BaseScene<IContext>(TScenes.PaymentScene);

paymentScene.enter(async (ctx) => {
    await clearMessages(ctx);
    let messages: Array<number> = [];
    const { document, amount } = ctx.scene.state as { document: string; amount: number };
    const titleMessage = await ctx.reply(
        `Processing payment for Document ${document}. Amount: ${amount}`);
    messages.push(titleMessage.message_id);
    const addressMessage = await ctx.reply(`Меню`,
        Markup.inlineKeyboard([btnBottom]));
    messages.push(addressMessage.message_id);
    await saveMessages(ctx, messages);
});

paymentScene.action('back', async (ctx) => {
    const prev_scene = ctx.data.scenes.pop();
    if (prev_scene)
        await ctx.scene.enter(prev_scene.scene, prev_scene.context);
    else await ctx.scene.enter(TScenes.MainScene);
});

paymentScene.action('home', async (ctx) => {
    await ctx.scene.enter(TScenes.MainScene);
});

export default paymentScene;

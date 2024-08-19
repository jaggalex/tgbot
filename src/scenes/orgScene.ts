import { Scenes, Markup } from 'telegraf';
import { IContext } from '../types';
import { clearMessages, saveMessages } from '../manager'
import { findAddressByID, IAddress } from '../dataProvider';
import { TScenes, } from '../types';
import { btnBottom } from '../menu';

const orgScene = new Scenes.BaseScene<IContext>(TScenes.AddressScene);

orgScene.enter(async (ctx) => {
    const { orgID } = ctx.scene.state as { orgID: string };
    ctx.data.session.organization = orgID;
    await clearMessages(ctx);
});

orgScene.action('back', async (ctx) => {
    const prev_scene = ctx.data.scenes.pop();
    if (prev_scene)
        await ctx.scene.enter(prev_scene.scene, prev_scene.context);
    else await ctx.scene.enter(TScenes.MainScene);
});

orgScene.action('home', async (ctx) => {
    await ctx.scene.enter(TScenes.MainScene);
});

orgScene.action(/pay\|.+/, async (ctx) => {
    ctx.data.scenes.push({
        scene: TScenes.AddressScene, context: { addressID: ctx.data.session.address }
    });
    await ctx.scene.enter(TScenes.PaymentScene, { document: 'A', amount: 300 });
});

orgScene.action('pay_all', async (ctx) => {
    await ctx.scene.enter('paymentScene', { document: 'All', amount: 500 });
});

orgScene.action('enter_reading', async (ctx) => {
    await ctx.reply('Please enter the meter reading:');
    orgScene.on('text', (ctx) => {
        const reading = ctx.message.text;
        ctx.reply(`Reading received: ${reading}`);
        ctx.scene.reenter();
    });
});

orgScene.action('select_address', async (ctx) => await ctx.scene.enter('mainScene'));

export default orgScene;

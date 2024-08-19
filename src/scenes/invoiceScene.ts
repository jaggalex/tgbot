import { Scenes, Markup } from 'telegraf';
import { IContext } from '../types';
import { clearMessages, saveMessages } from '../manager'
import { findInvoiceByID, IInvoice } from '../dataProvider';
import { TScenes, defaultSceneContext } from '../types';
import { btnBottom } from '../menu';

const addressScene = new Scenes.BaseScene<IContext>(TScenes.InvoiceScene);

addressScene.enter(async (ctx) => {
    await clearMessages(ctx);
    let messages: Array<number> = [];
    const { invoiceID } = ctx.scene.state as { invoiceID: string };
    ctx.data.session.invoice = invoiceID;
    if (invoiceID) {
        const invoice = findInvoiceByID(invoiceID);
        let inv: string;
        if (invoice !== null) {
            let srv: string = '';
            invoice.services.forEach(s => {
                srv += `\n\t\t<i>${s.name}: ${s.amount / 100} р</i>`;
            });
            inv = `<b>Квитанция на оплату</b>\n"${invoice.type}" <b>ЛС</b>: ${invoice.account}\nпериод: ${invoice.period}\nсумма к оплате: ${invoice.amount / 100} р${srv}`;
            const addressMessage = await ctx.reply(inv, {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [
                        Markup.button.callback('Добавить', `save|${invoiceID}`),
                        Markup.button.url('Оплатить', `https://v1.doma.ai`)
                    ],
                    btnBottom
                ])
            });
            messages.push(addressMessage.message_id);
        }
        saveMessages(ctx, messages);
    }
});

addressScene.action('back', async (ctx) => {
    const prev_scene = ctx.data.scenes.pop();
    if (prev_scene)
        await ctx.scene.enter(prev_scene.scene, prev_scene.context);
    else await ctx.scene.enter(TScenes.MainScene);
});

addressScene.action('home', async (ctx) => {
    await ctx.scene.enter(TScenes.MainScene);
});

addressScene.action(/save\|.+/, async (ctx) => {

});

addressScene.action(/pay\|.+/, async (ctx) => {
    ctx.data.scenes.push({
        scene: TScenes.AddressScene, context: { addressID: ctx.data.session.address }
    });
    await ctx.scene.enter(TScenes.PaymentScene, { document: 'A', amount: 300 });
});

addressScene.action('pay_all', async (ctx) => {
    await ctx.scene.enter('paymentScene', { document: 'All', amount: 500 });
});

addressScene.action('enter_reading', async (ctx) => {
    await ctx.reply('Please enter the meter reading:');
    addressScene.on('text', (ctx) => {
        const reading = ctx.message.text;
        ctx.reply(`Reading received: ${reading}`);
        ctx.scene.reenter();
    });
});

addressScene.action('select_address', async (ctx) => await ctx.scene.enter('mainScene'));

export default addressScene;

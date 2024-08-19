import { Scenes, Markup, } from 'telegraf';
import { IContext, TScenes, CallbackButtonArray } from '../types';
import { clearMessages, saveMessages } from '../manager'
import { findAddressByID, findAccount, getAccountByAddress } from '../dataProvider';
import { btnBottom } from '../menu';
import { Message } from 'telegraf/typings/core/types/typegram';

const addressScene = new Scenes.BaseScene<IContext>(TScenes.AddressScene);

addressScene.enter(async (ctx) => {
    await clearMessages(ctx);
    try {
        let promises: Promise<Message.TextMessage>[] = [];
        const { addressID } = ctx.scene.state as { addressID: string };
        ctx.data.session.address = addressID;

        if (addressID) {
            const { ...address } = findAddressByID(addressID);

            if (address !== undefined) {
                let msg = ctx.reply(
                    `Адрес: ${address.address}`,
                    Markup.inlineKeyboard(btnBottom));
                await saveMessages(ctx, [(await msg).message_id]);
                let buttons: CallbackButtonArray = [];
                const accounts = getAccountByAddress(ctx.msg.chat.id, addressID);
                accounts.forEach((async acc => {
                    const foundInvoices = findAccount(acc.org_id, acc.account);
                    if (foundInvoices !== undefined && foundInvoices.length > 0) {
                        ctx.data.session = foundInvoices;
                        foundInvoices.forEach(item => {
                            buttons.push(
                                [Markup.button.callback(`${item.type} ${item.amount / 100} за ${item.period}`, `invoice|${item.id}`)]
                            );
                        });
                    };
                    promises.push(ctx.reply(
                        `ЛС: ${acc.account}`,
                        Markup.inlineKeyboard(buttons)));
                }));
            }
        }
        let messages: Message.TextMessage[] = await Promise.all(promises);
        let messageIds = messages.map(msg => msg.message_id);

        await saveMessages(ctx, messageIds);

    } catch (error) {
        console.error("An error occurred:", error);
        await ctx.reply("Произошла ошибка при отправке сообщения!");
    }
});

addressScene.action(/invoice\|.+/, async (ctx) => {
    const invID = ctx.match.input.split('|')[1];
    await ctx.scene.enter(TScenes.InvoiceScene, { invoiceID: invID });
    ctx.data.scenes.push({ scene: TScenes.FindAccountScene, context: {} });
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


export default addressScene;

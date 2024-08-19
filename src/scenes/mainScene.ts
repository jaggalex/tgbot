import { Scenes, Markup } from 'telegraf';
import { IContext } from '../types';
import { getAddressList, IAddress } from '../dataProvider';
import { clearMessages, saveMessages } from '../manager'
import { TScenes, defaultSceneContext, CallbackButtonArray } from '../types';

const mainScene = new Scenes.BaseScene<IContext>(TScenes.MainScene);

mainScene.enter(async (ctx) => {
    await clearMessages(ctx);
    let messages: Array<number> = [];
    const chat_id = ctx.chat?.id;
    let addresses: Array<IAddress> = [];
    let buttons: CallbackButtonArray = [];
    if (chat_id) {
        addresses = getAddressList(chat_id);
    };
    addresses.forEach(item => {
        buttons.push(
            [Markup.button.callback(item.address, `address|${item.id}`)]
        );
    })
    if (buttons !== undefined && buttons.length > 0) {
        const addressMessage = await ctx.reply(
            'Выберите адрес',
            Markup.inlineKeyboard(buttons));
        messages.push(addressMessage.message_id);
    }
    const receiptMessage = await ctx.reply(
        'Можно подключить еще',
        Markup.inlineKeyboard(
            [[Markup.button.callback('Найти квитанцию', 'find_receipt')]]));
    messages.push(receiptMessage.message_id);
    await saveMessages(ctx, messages);
});

mainScene.action(/address\|.+/, async (ctx) => {
    let next_context = defaultSceneContext;
    const addressID = ctx.match.input.split('|')[1];
    next_context.scene = TScenes.AddressScene;
    next_context.context = { addressID: addressID };
    await ctx.scene.enter(next_context.scene, next_context.context);
    ctx.data.scenes.push({ scene: TScenes.MainScene, context: {} });
});

mainScene.action('find_receipt', async (ctx) => {
    await ctx.scene.enter(TScenes.FindOrgScene);
});

export default mainScene;

import { Scenes, Markup } from 'telegraf';
import { IContext, ISceneContext } from '../types';
import { InlineKeyboardButton } from 'telegraf/types';
import { clearMessages, saveMessages } from '../manager'
import { findAccount, IOrganization, IInvoice } from '../dataProvider';
import { TScenes, } from '../types';
import { btnBottom } from '../menu';

const findAccountScene = new Scenes.WizardScene<IContext>(
    TScenes.FindAccountScene,
    async (ctx) => {
        const findMessage = await ctx.reply(
            `Поиск ЛС\nвведите номер лицевого счета:`);
        await saveMessages(ctx, [findMessage.message_id]);
        return ctx.wizard.next();

    },
    async (ctx) => {
        let messages: Array<number> = [];
        const userInput = (ctx.message as { text: string })?.text;
        if (!userInput) {
            ctx.reply('Ошибка ввода. Введите верный номер ЛС:');
            return;
        }
        let buttons: Array<Array<InlineKeyboardButton.CallbackButton>> = [];
        const { orgID } = ctx.scene.state as { orgID: string };
        const foundInvoices = findAccount(orgID, userInput);
        if (foundInvoices === undefined || foundInvoices.length == 0) {
            ctx.reply('Лицевой счет не ненайден. Повторите попытку:');
        } else {
            ctx.data.session = foundInvoices;
            foundInvoices.forEach(item => {
                buttons.push(
                    [Markup.button.callback(`${item.type} ${item.amount / 100} за ${item.period}`, `invoice|${item.id}`)]
                );
            });
            buttons.push(btnBottom);
            const orgMessage = await ctx.reply(`Ваши квитанции:`, Markup.inlineKeyboard(
                buttons
            ));
            messages.push(orgMessage.message_id);
        }
        await saveMessages(ctx, messages);
    }
);

findAccountScene.action(/invoice\|.+/, async (ctx) => {
    const invID = ctx.match.input.split('|')[1];
    await ctx.scene.enter(TScenes.InvoiceScene, { invoiceID: invID });
    ctx.data.scenes.push({ scene: TScenes.FindAccountScene, context: {} });
});

findAccountScene.action('back', async (ctx) => {
    const prev_scene = ctx.data.scenes.pop();
    if (prev_scene)
        await ctx.scene.enter(prev_scene.scene, prev_scene.context);
    else await ctx.scene.enter(TScenes.MainScene);
});

findAccountScene.action('home', async (ctx) => {
    await ctx.scene.enter(TScenes.MainScene);
});

export default findAccountScene;

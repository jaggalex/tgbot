import { Scenes, Markup } from 'telegraf';
import { IContext } from '../types';
import { InlineKeyboardButton } from 'telegraf/types';
import { saveMessages } from '../manager'
import { findOrg } from '../dataProvider';
import { TScenes } from '../types';
import { btnBottom } from '../menu';

const findOrgScene = new Scenes.WizardScene<IContext>(
    TScenes.FindOrgScene,
    async (ctx) => {
        const findMessage = await ctx.reply(
            `Поиск организации\nвведите ИНН или наименование:`);
        await saveMessages(ctx, [findMessage.message_id]);
        return ctx.wizard.next();

    },
    async (ctx) => {
        let messages: Array<number> = [];
        const userInput = (ctx.message as { text: string })?.text;
        if (!userInput) {
            ctx.reply('Ошибка ввода. Введите валидный адрес:');
            return;
        }
        let buttons: Array<Array<InlineKeyboardButton.CallbackButton>> = [];
        const foundOrgs = findOrg(userInput);
        if (foundOrgs === undefined || foundOrgs.length == 0) {
            ctx.reply('Организация ненайдена. Повторите попытку:');
        } else {
            ctx.data.session = foundOrgs;
            foundOrgs.forEach(item => {
                buttons.push(
                    [Markup.button.callback(item.name, `organization|${item.id}`)]
                );
            });
            buttons.push(btnBottom);
            const orgMessage = await ctx.reply(`Выберите организации:`, Markup.inlineKeyboard(
                buttons
            ));
            messages.push(orgMessage.message_id);
        }
        await saveMessages(ctx, messages);
    }
);

findOrgScene.action(/organization\|.+/, async (ctx) => {
    const orgID = ctx.match.input.split('|')[1];
    await ctx.scene.enter(TScenes.FindAccountScene, { orgID: orgID });
    ctx.data.scenes.push({ scene: TScenes.FindOrgScene, context: {} });
});

findOrgScene.action('back', async (ctx) => {
    const prev_scene = ctx.data.scenes.pop();
    if (prev_scene)
        await ctx.scene.enter(prev_scene.scene, prev_scene.context);
    else await ctx.scene.enter(TScenes.MainScene);
});

findOrgScene.action('home', async (ctx) => {
    await ctx.scene.enter(TScenes.MainScene);
});

export default findOrgScene;

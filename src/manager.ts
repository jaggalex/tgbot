import { IContext } from './types';

export const clearMessages = async (ctx: IContext) => {
    while (ctx.data.messages.length > 0) {
        let id = ctx.data.messages.pop();
        await ctx.deleteMessage(id).catch(() => { });
    }
}

export const saveMessages = async (ctx: IContext, messages: Array<number>) => {
    messages.forEach(item => { ctx.data.messages.push(item); });
}

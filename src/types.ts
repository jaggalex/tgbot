import { Context, Scenes } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/types';


export type CallbackButtonArray = Array<Array<InlineKeyboardButton.CallbackButton>>;

export enum TScenes {
    MainScene = 'mainScene',
    AddressScene = 'addressScene',
    PaymentScene = 'paymentScene',
    FindOrgScene = 'findOrgScene',
    FindAccountScene = 'findAccountScene',
    InvoiceScene = 'invoiceScene',
    OrgScene = 'orgScene',
};

interface IRecord {
    [key: string]: string;
}

export interface ISceneContext {
    scene: TScenes;
    context: {};
}

export interface IData {
    startMessage?: number;
    messages: Array<number>;
    scenes: Array<ISceneContext>;
    session: {
        [key: string]: any;
    };
}

export const defaultData: IData = { session: { prev_scene: 'mainScene' }, messages: [], scenes: [] };

export const defaultSceneContext: ISceneContext = { scene: TScenes.MainScene, context: {} };

export interface IContext extends Context {
    data: IData;
    scene: Scenes.SceneContextScene<IContext, Scenes.WizardSessionData>;
    wizard: Scenes.WizardContextWizard<IContext>;
}



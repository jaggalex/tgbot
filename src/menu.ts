import { Markup } from 'telegraf';

export const btnBack = Markup.button.callback('Назад', 'back');

export const btnHome = Markup.button.callback('Домой', 'home');

export const btnBottom = [btnBack, btnHome];
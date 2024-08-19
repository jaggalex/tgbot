import { config, DotenvParseOutput } from 'dotenv';
import { IConfigApp } from './config.interface';

export class ConfigApp implements IConfigApp {
    private config: DotenvParseOutput;

    constructor() {
        const { error, parsed } = config();
        if (error) {
            throw new Error('File .env not found!');
        }
        if (!parsed) {
            throw new Error('File .env is empty!');
        }
        this.config = parsed;
    }

    get(key: string): string {
        const res = this.config[key];
        if (!res) {
            throw new Error('Key not found!');
        }
        return res;
    }
}
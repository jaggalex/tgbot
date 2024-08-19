import serviceConsumer from '../data/serviceConsumer.json';
import address from '../data/address.json';
import org from '../data/org.json';
import invoice from '../data/invoice.json';

export interface IAddress {
    id: string;
    address: string;
}

export interface IOrganization {
    id: string;
    name: string;
    tin: string;
}

export interface IAccount {
    resident_id: string;
    org_id: string;
    account: string;
}

export interface IService {
    name: string;
    amount: number;
}
export interface IInvoice {
    id: string;
    org_id: string;
    type: string;
    account: string;
    period: string;
    amount: number;
    services: Array<IService>;
}

export const findOrg = (search: string): Array<IOrganization> | [] => {
    const searchLC = search.toLowerCase();
    let orgs: Array<IOrganization> = [];
    orgs = org.filter(
        item => {
            if (item.name.toLowerCase().includes(searchLC) ||
                item.tin.toLowerCase() === searchLC) return true;
        });
    return orgs;
}

export const findAccount = (orgID: string, search: string): Array<IInvoice> | [] => {
    const searchLC = search.toLowerCase();
    let invoices: Array<IInvoice> = [];
    invoices = invoice.filter(
        item => {
            if (item.account.toLowerCase() === searchLC &&
                item.org_id === orgID
            ) return true;
        });

    return invoices;
}

export const findAddressByID = (id: string): IAddress | null => {
    const adr = address.find(x => x.id == id);
    if (adr && adr.address) {
        return { id: adr.id, address: adr.address };
    } else { return null; }
}

export const findInvoiceByID = (id: string): IInvoice | null => {
    const inv = invoice.find(x => x.id == id);
    if (inv && inv.id) {
        return inv;
    } else { return null; }
}

export const getAddressList = (id: number): Array<IAddress> => {
    let addressList: Array<IAddress> = [];
    id = 284695016;  // test
    const srv = serviceConsumer.find(x => x.id == id);

    if (srv?.addresses) {
        srv?.addresses.forEach((item) => {
            let address = findAddressByID(item.address_id);
            if (address) {
                addressList.push(address);
            }
        });
    }
    return addressList;
}

export const getAccountByAddress = (user_id: number, address_id: string): Array<IAccount> => {
    let accountList: Array<IAccount> = [];
    user_id = 284695016;  // test
    const srv = serviceConsumer.find(x => x.id == user_id);

    if (srv !== undefined && srv.addresses !== undefined && srv.addresses.length > 0) {
        const adr = srv.addresses.find(x => x.address_id == address_id);
        if (adr !== undefined && adr.data !== undefined && adr.data.length > 0) {
            adr.data.forEach((item) => {
                accountList.push(
                    { resident_id: item.resident_id, org_id: item.org_id, account: item.account }
                );
            });
        }
    }
    return accountList;
}
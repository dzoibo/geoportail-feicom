import { writable } from 'svelte/store';

// Créez le store pour les valeurs d'attribution uniques

export const dataStore = writable({ dataArr: [], mandatData: [], icspData: [] });
export const rangeValue = writable(0);
export const rangeValueAccord = writable(0);
export const buttonICSP = writable(true);
export const storeIndicateur5 = writable([])
export const storeIndicateur4 = writable([])
export const storeIndicateur3 = writable([])
export const storeIndicateur2 = writable([])
export const storeIndicateur1 = writable([])
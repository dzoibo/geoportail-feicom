import { writable } from 'svelte/store';

// Créez le store pour les valeurs d'attribution uniques

export const dataStore = writable({ dataArr: [], mandatData: [], icspData: [] });
export const rangeValue = writable(0);
export const buttonICSP = writable(true);
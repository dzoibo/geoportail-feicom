// utilitaires.js
// @ts-ignore
export function uniqueValues(tableau, attribut) {
    // @ts-ignore
    const valeursUniques = new Set(tableau.map(objet => objet[attribut]));
    return Array.from(valeursUniques);
}

// Function to get statistics
export function getSumOf(data, key) {
    const statistics = {};

    data.forEach(item => {
        const value = item[key];
        if (value) {
            if (statistics[value]) {
                statistics[value]++;
            } else {
                statistics[value] = 1;
            }
        }
    });

    // Convert the statistics object to an array of objects with the specified structure
    const result = Object.entries(statistics).map(([key, value]) => ({
        ['Région']: key,
        value
    }));

    return result;
}



export function findMinMax(array, key) {
    if (!array || array.length === 0) {
        return null;
    }

    let min = array[0][key];
    let max = array[0][key];

    for (let i = 1; i < array.length; i++) {
        const value = array[i][key];

        if (value < min) {
            min = value;
        }

        if (value > max) {
            max = value;
        }
    }

    return { min, max };
}
/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */
// utilitaires.js
// @ts-ignore
export function uniqueValues(tableau, attribut) {
    // Utilisez filter pour éliminer les valeurs null
    const filteredArray = tableau.filter(objet => objet[attribut] !== null);

    // Créez un Set avec les valeurs uniques
    const valeursUniques = new Set(filteredArray.map(objet => objet[attribut]));

    // Créez un tableau de résultats avec la propriété "checked" initialisée à false pour chaque élément
    const result = Array.from(valeursUniques).map(valeur => ({
        'key': valeur,
        checked: false
    }));

    return result;
}

export function uniqueValuesInArrayOfObject(tableau, attribut) {
    // @ts-ignore
    const valeursUniques = new Set(tableau.map(objet => objet[attribut]));
    return Array.from(valeursUniques);
}

// Function to get statistics
// @ts-ignore
export function getSumOf(data, key) {
    const statistics = {};
    // @ts-ignore
    data.forEach(item => {
        const value = item[key];
        if (value) {
            // @ts-ignore
            if (statistics[value]) {
                // @ts-ignore
                statistics[value]++;
            } else {
                // @ts-ignore
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

export function getSumPerYear(data, year) {
    const statistics = {};

    data.forEach(item => {
        const region = item['Région'];
        const itemYear = item['Année financement'];

        // Vérifier si l'année correspond à celle spécifiée en argument
        if (itemYear === year) {
            if (statistics[region]) {
                statistics[region]++;
            } else {
                statistics[region] = 1;
            }
        }
    });

    // Convertir l'objet de statistiques en un tableau d'objets avec la structure spécifiée
    const result = Object.entries(statistics).map(([region, count]) => ({
        'Région': region,
        'value': count
    }));

    return result;
}




export function calculateTotalByRegion(data, year) {
    const totalByRegion = {};

    for (const entry of data) {
        const region = entry.Région;
        const totalString = typeof entry.TOTAL === 'string' ? entry.TOTAL.replace(/\D+/g, '') : '0'; // Supprimer les caractères non numériques
        const total = parseFloat(totalString);

        if (!isNaN(total) && entry.ANNEE === year) {
            if (!totalByRegion[region]) {
                totalByRegion[region] = total;
            } else {
                totalByRegion[region] += total;
            }
        }
    }

    // Convertir le totalByRegion en la structure souhaitée
    const result = Object.entries(totalByRegion).map(([key, value]) => ({
        'Région': key,
        'value': value
    }));

    return result;
}

// @ts-ignore
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

export function sumISPValues(data, region) {
    const averages = {};

    for (const entry of data) {
        if (entry.Région === region) {
            const year = entry.ANNEE;
            const total = parseFloat(typeof entry.TOTAL === 'string' ? entry.TOTAL.replace(/\D+/g, '') : '0');

            if (!isNaN(total)) {
                if (!averages[year]) {
                    averages[year] = [];
                }

                averages[year].push(total);
            }
        }
    }

    return {
        data: Object.values(averages).map(yearData => yearData.reduce((acc, value) => acc + value, 0) / yearData.length),
        label: Object.keys(averages).map(Number),
    };
}


export function transformDataForBarChart(data, region, year) {
    // Filtrer les données pour la région et l'année spécifiées
    const filteredData = data.filter((entry) => entry.Région === region && entry.ANNEE === year);

    if (filteredData.length === 0) {
        // Aucune donnée correspondante trouvée
        return [];
    }

    // Créer un tableau d'objets pour chaque valeur ISP
    const chartData = [];
    for (let i = 1; i <= 4; i++) {
        const ispValue = filteredData[0][`ISP${i}`].replace(/\s+/g, ''); // Supprimer les espaces
        chartData.push({ x: `ISP${i}`, y: parseFloat(ispValue) });
    }

    return chartData;
}



export function findAllObjectsByAttribute(array, nom_attribut, id) {
    return array.filter(obj => obj[nom_attribut] === id);
}


export function formattedValue(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function rechercheMulticriteres(dataForMap, critères) {
    if (critères.length === 0) {
        // Si le tableau de critères est vide, retournez simplement l'array original
        return dataForMap;
    }

    // Utilisez la méthode filter pour filtrer les objets en utilisant les critères spécifiés
    return dataForMap.filter(objet => {
        return critères.every(critère => {
            const champ = critère.indicateur;
            const valeurs = critère.data;

            if (valeurs.length === 0) {
                return true; // Si aucune valeur n'est spécifiée, passez à la prochaine condition
            }

            return valeurs.includes(objet[champ]);
        });
    });
}





export function optionForBarChart(dataForBarChart, region) {
    let optionsForChart = {
        colors: ['#1A56DB'],
        series: [{
            name: region,
            color: '#1A56DB',
            data: dataForBarChart
        }],
        chart: {
            type: 'bar',
            height: 'auto',
            fontFamily: 'Inter, sans-serif',
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '70%',
                borderRadiusApplication: 'end',
                borderRadius: 8
            }
        },

        tooltip: {
            shared: true,
            intersect: false,
            style: {
                fontFamily: 'Inter, sans-serif'
            },
            custom: function({ series, seriesIndex, dataPointIndex }) {
                const formatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' });
                const formattedValue = formatter.format(series[seriesIndex][dataPointIndex]);
                return `<div class="text-center p-2">${formattedValue}</div>`;
            }

        },
        states: {
            hover: {
                filter: {
                    type: 'darken',
                    value: 1
                }
            }
        },
        stroke: {
            show: true,
            width: 0,
            colors: ['transparent']
        },
        grid: {
            show: false,
            strokeDashArray: 4,
            padding: {
                left: 2,
                right: 2,
                top: -14
            }
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            show: false
        },
        xaxis: {
            floating: false,
            labels: {
                show: true,
                style: {
                    fontFamily: 'Inter, sans-serif',
                    cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            show: false
        },
        fill: {
            opacity: 1
        }
    };

    return optionsForChart;
}


export function optionForLineChart(label, data, geo) {

    let optionsForChartLine = {
        chart: {
            height: 'auto',
            maxWidth: '100%',
            type: 'area',
            fontFamily: 'Inter, sans-serif',
            dropShadow: {
                enabled: false
            },
            toolbar: {
                show: false
            }
        },
        tooltip: {
            enabled: true,
            x: {
                show: false
            },
            custom: function({ series, seriesIndex, dataPointIndex }) {
                const formatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' });
                const formattedValue = formatter.format(series[seriesIndex][dataPointIndex]);
                return `<div class="text-center p-2">${formattedValue}</div>`;
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                opacityFrom: 0.55,
                opacityTo: 0,
                shade: '#1C64F2',
                gradientToColors: ['#1C64F2']
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            width: 6
        },
        grid: {
            show: false,
            strokeDashArray: 4,
            padding: {
                left: 2,
                right: 2,
                top: 0
            }
        },
        series: [{
            name: geo,
            data: data,
            color: '#1A56DB'
        }],
        xaxis: {
            categories: label,
            labels: {
                show: true
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            show: false
        }
    };
    return optionsForChartLine;
}
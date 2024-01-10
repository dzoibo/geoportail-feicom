// dataService.js
import Papa from "papaparse";

export async function fetchData() {
    const file =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSGDmlwNMcXwsL8qD4yHrLdmZFvBTYhsguNNFedK7ysi3Tf_jO7vgfr9MccVzJYn-N8t41nBuLiqGCy/pub?gid=1430480319&single=true&output=tsv";

    const mandat =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSGDmlwNMcXwsL8qD4yHrLdmZFvBTYhsguNNFedK7ysi3Tf_jO7vgfr9MccVzJYn-N8t41nBuLiqGCy/pub?gid=1420528268&single=true&output=tsv";

    const [mandatData, dataArr] = await Promise.all([
        fetchDataFromSheet(mandat),
        fetchDataFromSheet(file),
    ]);

    return { mandatData, dataArr };
}

// @ts-ignore
async function fetchDataFromSheet(url) {
    return new Promise((resolve, reject) => {
        Papa.parse(url, {
            download: true,
            delimiter: "	",
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                resolve(results.data);
            },
            error: function(error) {
                reject(error);
            },
        });
    });
}
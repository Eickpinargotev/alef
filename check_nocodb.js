
const https = require('https');

const headers = {
    'xc-token': 'J85xPNLm5dtBtEMBYtPRbl0kNSuBzYH53P2sXTHc'
};

const urlCamisas = 'https://n8n-nocodb.hvo3jf.easypanel.host/api/v2/tables/mp5ukvigb8y2hnx/records?offset=0&limit=5&viewId=vwmb6wabkp5a36za';
const urlArticulos = 'https://n8n-nocodb.hvo3jf.easypanel.host/api/v2/tables/mwrbfzn0e5e7x1y/records?offset=0&limit=5&viewId=vwejmjwe478vt03p';

function fetchData(url, name) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log(`--- ${name} Data Sample ---`);
                    if (json.list && json.list.length > 0) {
                        console.log(JSON.stringify(json.list[0], null, 2));
                    } else {
                        console.log("No records found or different structure:", data.substring(0, 200));
                    }
                    resolve();
                } catch (e) {
                    console.error(`Error parsing JSON for ${name}:`, e.message);
                    resolve();
                }
            });
        }).on('error', (err) => {
            console.error(`Error fetching ${name}:`, err.message);
            resolve();
        });
    });
}

(async () => {
    await fetchData(urlCamisas, 'Camisas');
    await fetchData(urlArticulos, 'Articulos');
})();


const https = require('https');

const headers = {
    'xc-token': 'J85xPNLm5dtBtEMBYtPRbl0kNSuBzYH53P2sXTHc'
};

const urlTzitzit = 'https://n8n-nocodb.hvo3jf.easypanel.host/api/v2/tables/mpbvibjnz5kaf24/records?offset=0&limit=25&viewId=vw6vav32narvatfh';

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
                    console.log(`--- ${name} Data ---`);
                    if (json.list && json.list.length > 0) {
                        json.list.forEach(item => {
                            console.log(`Name: ${item.nombre}, Image: ${item.imagen ? 'Yes' : 'No'}`);
                        });
                    } else {
                        console.log("No records found.");
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
    await fetchData(urlTzitzit, 'Tzitzit/Banks');
})();

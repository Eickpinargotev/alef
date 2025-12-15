const NOCO_TOKEN = 'J85xPNLm5dtBtEMBYtPRbl0kNSuBzYH53P2sXTHc';
const URL = 'https://n8n-nocodb.hvo3jf.easypanel.host/api/v2/tables/mpbvibjnz5kaf24/records?offset=0&limit=25&where=&viewId=vw6vav32narvatfh';

async function check() {
    try {
        const res = await fetch(URL, {
            headers: { 'xc-token': NOCO_TOKEN }
        });
        const json = await res.json();
        console.log(JSON.stringify(json, null, 2));
    } catch (e) {
        console.error(e);
    }
}

check();

const fs = require('fs');
const path = require('path');

async function fetchTsumegoData() {
    const url = 'https://xapi.verywill.com/sgf_list_plus?cid=9&start=0&pageSize=10';
    try {
        console.log("Fetching tsumego from XGoo API...");
        const response = await fetch(url, { method: 'POST' });
        const data = await response.json();
        
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        
        fs.writeFileSync(path.join(dataDir, 'tsumego.json'), JSON.stringify(data, null, 4));
        console.log("✅ Tsumego data cached successfully to data/tsumego.json");
    } catch (error) {
        console.error("❌ Failed to fetch tsumego:", error.message);
        process.exit(1);
    }
}

fetchTsumegoData();

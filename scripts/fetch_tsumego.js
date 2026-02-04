const fs = require('fs');
const path = require('path');

async function downloadFile(url, dest) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download ${url}`);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
}

async function fetchTsumegoData() {
    const url = 'https://xapi.verywill.com/sgf_list_plus?cid=9&start=0&pageSize=10';
    try {
        console.log("Fetching tsumego from XGoo API...");
        const response = await fetch(url, { method: 'POST' });
        const data = await response.json();
        
        const dataDir = path.join(__dirname, '..', 'data');
        const sgfDir = path.join(dataDir, 'sgf');
        
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
        if (!fs.existsSync(sgfDir)) fs.mkdirSync(sgfDir);
        
        // Sync JSON
        fs.writeFileSync(path.join(dataDir, 'tsumego.json'), JSON.stringify(data, null, 4));
        console.log("✅ Tsumego JSON cached.");

        // Download SGFs locally to avoid CORS
        for (const problem of data) {
            if (problem.sgf_url) {
                const fileName = path.basename(problem.sgf_url);
                const localPath = path.join(sgfDir, fileName);
                const remoteUrl = "https://www.verywill.com" + problem.sgf_url;
                
                try {
                    await downloadFile(remoteUrl, localPath);
                    console.log(`Downloaded: ${fileName}`);
                } catch (e) {
                    console.error(`Error downloading ${fileName}:`, e.message);
                }
            }
        }
        
        console.log("✨ All tsumego resources synced locally.");
    } catch (error) {
        console.error("❌ Global fetch error:", error.message);
        process.exit(1);
    }
}

fetchTsumegoData();

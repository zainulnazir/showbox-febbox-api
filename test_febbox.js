import FebboxAPI from './src/FebBoxApi.js';

(async () => {
    const api = new FebboxAPI();
    const shareKey = 'fNBTg8at'; // Example key from README
    console.log(`Testing Febbox API with share key: ${shareKey}`);

    try {
        console.log("Fetching file list...");
        const files = await api.getFileList(shareKey);
        console.log("File list retrieved successfully!");
        
        let targetFile = files.find(f => !f.is_dir);
        
        if (!targetFile) {
            const folder = files.find(f => f.is_dir);
            if (folder) {
                console.log(`Entering folder: ${folder.file_name} (id: ${folder.fid})`);
                const subFiles = await api.getFileList(shareKey, folder.fid);
                console.log(`Found ${subFiles.length} files in subfolder.`);
                targetFile = subFiles.find(f => !f.is_dir);
            }
        }

        if (targetFile) {
             console.log(`Testing getLinks for file: ${targetFile.file_name} (fid: ${targetFile.fid})`);
             const links = await api.getLinks(shareKey, targetFile.fid);
             console.log("Links retrieved successfully!");
             console.log(links);
        } else {
            console.log("Could not find any file to test links.");
        }

    } catch (e) {
        console.error("Febbox API Test Failed:", e);
    }
})();

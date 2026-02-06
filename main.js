import ShowboxAPI from './src/ShowboxAPI.js';
import FebboxAPI from './src/FebBoxApi.js';

(async () => {
    const api = new ShowboxAPI();
    const febboxApi = new FebboxAPI();

    // Search for a movie
    const movieTitle = 'ratatouille';
    const results = await api.search(movieTitle, 'movie');
    const movie = results[0];
    console.log('🎬 Movie:', movie);

    // Fetch FebBox ID and file links for the movie
    let febBoxId = await api.getFebBoxId(movie.id, movie.box_type);
    if (febBoxId) {
        console.log('🔗 FebBox ID:', febBoxId);
        const files = await febboxApi.getFileList(febBoxId);
        console.log('📂 File List:', files);
        const file = files[1];
        const links = await febboxApi.getLinks(febBoxId, file.fid);
        console.log('🌐 Links:', links);
    }

    // Search for a TV show
    const showTitle = 'breaking bad';
    const showResults = await api.search(showTitle, 'tv');
    const show = showResults[0];
    console.log('📺 Show:', show);

    // Fetch show details and FebBox ID
    const showId = show.id;
    const showDetails = await api.getShowDetails(showId);
    console.log('📜 Show Details:', showDetails);

    febBoxId = await api.getFebBoxId(show.id, show.box_type);
    if (febBoxId) {
        const files = await febboxApi.getFileList(febBoxId);
        console.log('📂 File List:', files);
        
        if (files && files.length > 0) {
            // Try to find a directory first, otherwise take the first file
            const file = files.find(f => f.is_dir) || files[0];
            
            if (file.is_dir) {
                const seasonFiles = await febboxApi.getFileList(febBoxId, file.fid);
                console.log('📂 Season Files:', seasonFiles);
                if (seasonFiles && seasonFiles.length > 0) {
                    const seasonFile = seasonFiles[0];
                    const links = await febboxApi.getLinks(febBoxId, seasonFile.fid);
                    console.log('🌐 Season Links:', links);
                }
            } else {
                const links = await febboxApi.getLinks(febBoxId, file.fid);
                console.log('🌐 Links:', links);
            }
        } else {
            console.log('⚠️ No files found for this show.');
        }
    }
})();
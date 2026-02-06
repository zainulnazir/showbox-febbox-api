import ShowboxAPI from './src/ShowboxAPI.js';

(async () => {
    const api = new ShowboxAPI();
    try {
        console.log("Fetching details for movie 899...");
        const details = await api.getMovieDetails(899);
        console.log(JSON.stringify(details, null, 2));
    } catch (e) {
        console.error(e);
    }
})();

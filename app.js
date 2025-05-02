// Retrieving the form and user search elements
const animeForm = document.getElementById('anime-search-form');
const userAnimeSearch = document.getElementById('anime-search');

// Event listener for submitted form
animeForm.addEventListener('submit', async event => {
    // stops page reload
    event.preventDefault();
    
    // User search value and null check
    const userAnimeValue = userAnimeSearch.value.trim();
    console.log(userAnimeValue);
    if (!userAnimeValue) return;
    
    // Jikan getAnimeSearch URL
    const jikanAnimeSearchURL = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(userAnimeValue)}&limit=10`;

    // API request could break program, put in a try/catch block
    try {
        const response = await fetch(jikanAnimeSearchURL);
        const data = await response.json();

        // Log data to console to check it works
        console.log(data.data);
    } catch (e) {
        console.log('Error fetching data from Jikan API', e);
    }
});

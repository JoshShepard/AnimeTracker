// Retrieving HTML elements
const animeForm = document.getElementById('anime-search-form');
const userAnimeSearch = document.getElementById('anime-search');
const mainElement = document.getElementById('main-section');
const headerElement = document.getElementById('header');

// Event listener for submitted form
animeForm.addEventListener('submit', async event => {
    // stops page reload
    event.preventDefault();
    
    // User search value and null check
    const userAnimeValue = userAnimeSearch.value.trim();
    // console.log(userAnimeValue);
    if (!userAnimeValue) return;
    
    // Jikan getAnimeSearch URL
    const jikanAnimeSearchURL = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(userAnimeValue)}&limit=10`;

    // API request could return error, put in a try/catch block
    try {
        const response = await fetch(jikanAnimeSearchURL);
        const data = await response.json();
        // Log data to console to check it works
        // console.log(data.data);

        // Call anime data processing function to grab wanted data points
        const processedAnimeData = processAnimeData(data.data);
        console.log(processedAnimeData);

        // After user searches move search bar to header
        formUIChange();



    } catch (e) {
        console.log('Error fetching data from Jikan API', e);
    }
});

const processAnimeData = animeObjectArray => {
    return animeObjectArray.map(anime => {
        return {
            title: anime.title,
            mal_id: anime.mal_id,
            imageURL: anime.images.jpg.image_url,
            synopsis: anime.synopsis ? anime.synopsis.slice(0, 100) + '...' : 'No synopsis available.',
            episodes: anime.episodes || 'N/A', 
        };
    });
}

const formUIChange = () => {
    // Remove animeForm from main section
    mainElement.removeChild(animeForm);

    // Appends animeForm to header section
    headerElement.appendChild(animeForm);

    // Update header styles
    headerElement.style.display = 'flex';
    headerElement.style.justifyContent = 'space-between';

    // Update logo styles
    document.getElementById('logo').style.marginLeft = '1rem';

    // Update form styles
    animeForm.style.width = '40%';
    animeForm.style.justifyContent = 'end';
    animeForm.style.marginRight = '1rem';
    
    // Update search input to look better within header
    userAnimeSearch.style.maxWidth = '100%';
}

const addAnimeResultCard = processedAnimeData => {
    // Clear previous main element
    mainElement.innerHTML = '';

    const cardDiv = document.createElement('div');
    cardDiv.setAttribute('id', 'anime-card-return-container');

    processedAnimeData.forEach(anime => {
        const animeCard = createAnimeResultCard(anime);
        cardDiv.appendChild(animeCard);
    });

    mainElement.appendChild(cardDiv);
}
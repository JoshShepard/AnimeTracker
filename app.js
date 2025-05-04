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
    
    // Jikan getAnimeSearch URL with 20 responses
    const jikanAnimeSearchURL = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(userAnimeValue)}&limit=20`;

    // API request could return error, put in a try/catch block
    try {
        const response = await fetch(jikanAnimeSearchURL);
        // Error Handling - fetching api url error
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        // Error Handling - data returned is not there or length of 0
        if (!data.data || data.data.length === 0) {
            formUIChange();
            userAnimeSearch.value = '';
            showError('No results found. Please try another anime!');
            return;
        }
        // Log data to console to check it works
        // console.log(data.data);

        // Call anime data processing function to grab wanted data points
        const processedAnimeData = processAnimeData(data.data);
        // console.log(processedAnimeData);

        // After user searches move search bar to header
        formUIChange();
        
        // Display search results to screen
        addAnimeResultCard(processedAnimeData);

        // Clear search input
        userAnimeSearch.value = '';
    } catch (e) {
        console.log('Error fetching data from Jikan API', e);
        showError('Something went wrong. Please try again later!');
    }
});

// Error Handling Function
const showError = message => {
    // Clear main element to show error message only
    mainElement.innerHTML = '';

    // Create error message div
    const errorContainer = document.createElement('div');
    errorContainer.textContent = message;

    // Error container styling - Move to external CSS file after project
    errorContainer.style.color = 'red';
    errorContainer.style.fontSize = '1.5rem';
    errorContainer.style.marginTop = '6rem';
    errorContainer.style.textAlign = 'center';
    errorContainer.style.fontFamily = 'var(--main-font)';
    
    // Add error to main element for display
    mainElement.appendChild(errorContainer);
}

// Function to extract useful data as an object for each anime card
const processAnimeData = animeObjectArray => {
    return animeObjectArray.map(anime => {
        return {
            title: anime.title,
            mal_id: anime.mal_id,
            imageURL: anime.images.jpg.image_url,
            synopsis: anime.synopsis ? anime.synopsis : 'No synopsis available.',
            episodes: anime.episodes ? anime.episodes : 'N/A', 
            airedFrom: anime.aired.prop.from.year,
            airedTo: anime.aired.prop.to.year, 
        };
    });
}

// Function to move search bar into header element and empty main section element
const formUIChange = () => {
    if (!mainElement.contains(animeForm)) return;
    // Remove animeForm from main section
    mainElement.removeChild(animeForm);

    // Appends animeForm to header section
    headerElement.appendChild(animeForm);

    // Update header styles
    headerElement.style.display = 'flex';
    headerElement.style.justifyContent = 'space-between';
    headerElement.style.backgroundColor = '#141414';

    // Update logo styles
    document.getElementById('logo').style.marginLeft = '1rem';

    // Update form styles
    animeForm.style.width = '40%';
    animeForm.style.justifyContent = 'end';
    animeForm.style.marginRight = '1rem';
    
    // Update search input to look better within header
    userAnimeSearch.style.maxWidth = '100%';
}

// Function that adds the completed anime cards to main section element
const addAnimeResultCard = processedAnimeData => {
    // Clear previous main element
    mainElement.innerHTML = '';

    // Create div to hold anime cards
    const cardContainer = document.createElement('div');
    cardContainer.setAttribute('id', 'anime-card-return-container');

    // Style main element to adjust for header and height for overflow
    mainElement.style.height = 'auto';
    mainElement.style.marginTop = '6rem';

    // Calling helper function to get each anime, create the card, and add it to container
    processedAnimeData.forEach(anime => {
        const animeCard = createAnimeResultCard(anime);
        cardContainer.appendChild(animeCard);
    });

    // Add the card container to main element
    mainElement.appendChild(cardContainer);
}

// Helper function to place each anime data points within the card
const createAnimeResultCard = animeObj => {
    // Create individual card
    const cardDiv = document.createElement('div');
    cardDiv.setAttribute('id', 'anime-card');

    // Create anime image element
    const animeImage = document.createElement('img');
    animeImage.setAttribute('src', animeObj.imageURL);
    animeImage.setAttribute('alt', animeObj.title);
    animeImage.classList.add('animeImage');

    // Create text div (container for all text information)
    const animeDetailDiv = document.createElement('div');

    // Create anime title element
    const animeTitle = document.createElement('h3');
    animeTitle.textContent = animeObj.title;
    animeTitle.classList.add('animeTitle');
    animeDetailDiv.appendChild(animeTitle);

    // Create anime synopsis
    const animeSynopsis = document.createElement('p');
    animeSynopsis.textContent = animeObj.synopsis
    animeSynopsis.classList.add('animeSynopsis');
    animeDetailDiv.appendChild(animeSynopsis);

    const animeAirDates = document.createElement('p');
    animeAirDates.classList.add('animeAirDates');
    
    // if there is a aired from and aired to, display both
    if (animeObj.airedFrom && animeObj.airedTo) {
        animeAirDates.textContent = `Air Dates: ${animeObj.airedFrom} - ${animeObj.airedTo}`;
        animeDetailDiv.appendChild(animeAirDates);
    } else { // Movies only have aired from
        animeAirDates.textContent = `Air Date: ${animeObj.airedFrom}`
        animeDetailDiv.appendChild(animeAirDates);
    }

    // Create anime episode number
    const animeEpisodeNumber = document.createElement('p');
    animeEpisodeNumber.textContent = `Total Number of Episodes: ${animeObj.episodes}`;
    animeEpisodeNumber.classList.add('animeEpisodeNum');
    animeDetailDiv.appendChild(animeEpisodeNumber);

    // Create and add 'Add to Watch List' button
    const watchListBtn = document.createElement('button');
    watchListBtn.textContent = 'Add to Watch List ';

    const watchListBtnIcon = document.createElement('i');
    watchListBtnIcon.classList.add('fa-solid', 'fa-plus');
    watchListBtn.appendChild(watchListBtnIcon);
    watchListBtn.setAttribute('aria-label', 'Add to Watch List');
    animeDetailDiv.appendChild(watchListBtn);

    // Add to watch list event listener
    watchListBtn.addEventListener('click', () => {
        addToWatchList(animeObj);
    })

    // Add anime cover image and text information to the card
    cardDiv.appendChild(animeImage);
    cardDiv.appendChild(animeDetailDiv);

    // returns the individual anime card that will be added to the card container
    return cardDiv;
}

const addToWatchList = animeObj => {
    // Wrap in a try/catch in case localstorage is full or unavailable also because this is a feature that could break and send an error 
    try {
        // Grabs users watch list in local storage, creates new array if there is none in local storage
        const watchListArray = JSON.parse(localStorage.getItem('watchList')) || [];
    
        // Check if anime is already in users watch list
        if (watchListArray.some(anime => anime.mal_id === animeObj.mal_id)) {
            console.log('Anime is already in the watch list!');
            return;
        }
    
        // Anime is NOT in watch list
        // Add anime to watchListArray
        watchListArray.push(animeObj);
        localStorage.setItem('watchList', JSON.stringify(watchListArray));
        console.log(`You have successfully added ${animeObj.title} to watch list in local storage`);
    } catch (error) {
        console.error(`Error adding ${animeObj.title} to the watch list`, error);
    }
}
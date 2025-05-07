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

    // Create and add 'Add to Watch List' button (keeps state of button(add/remove) on refresh)
    const watchListBtn = document.createElement('button');
    const watchListBtnIcon = document.createElement('i');
    const watchListArray = JSON.parse(localStorage.getItem('watchList')) || [];
    const isInWatchList = watchListArray.some(anime => anime.mal_id === animeObj.mal_id);

    if (isInWatchList) {
        watchListBtn.classList.add('remove-watch-list');
        watchListBtnIcon.classList.add('fa-solid', 'fa-minus');
        watchListBtn.appendChild(watchListBtnIcon);
        watchListBtn.appendChild(document.createTextNode(' Remove from Watch List'));
        watchListBtn.setAttribute('aria-label', 'Remove from Watch List');
    } else {
        watchListBtn.classList.add('add-watch-list');
        watchListBtnIcon.classList.add('fa-solid', 'fa-plus');
        watchListBtn.appendChild(watchListBtnIcon);
        watchListBtn.appendChild(document.createTextNode(' Add to Watch List'));
        watchListBtn.setAttribute('aria-label', 'Add to Watch List');
    }
    animeDetailDiv.appendChild(watchListBtn);

    // Add to watch list event listener
    watchListBtn.addEventListener('click', () => {
        toggleWatchList(animeObj, watchListBtn);
    })

    // Add anime cover image and text information to the card
    cardDiv.appendChild(animeImage);
    cardDiv.appendChild(animeDetailDiv);

    // returns the individual anime card that will be added to the card container
    return cardDiv;
}

const toggleWatchList = (animeObj, button) => {
    // Wrap in a try/catch in case localstorage is full or unavailable
    try {  
        // Grab watch list from localStorage or create a new one 
        let watchListArray = JSON.parse(localStorage.getItem('watchList')) || [];

        // Find anime object index in watch list array
        const animeIndex = watchListArray.findIndex(anime => anime.mal_id === animeObj.mal_id);

        // We found the anime in the array
        if (animeIndex > -1) {
            watchListArray.splice(animeIndex, 1);
            localStorage.setItem('watchList', JSON.stringify(watchListArray));

            // Update button to add
            button.textContent = '';
            button.classList.remove('remove-watch-list');
            button.classList.add('add-watch-list');
            const icon = document.createElement('i');
            icon.classList.add('fa-solid', 'fa-plus');
            button.appendChild(icon);
            button.appendChild(document.createTextNode(' Add to Watch List'));

            console.log(`${animeObj.title} removed from watch list!`);
        } else {
            // Add anime ot list
            watchListArray.push(animeObj);
            localStorage.setItem('watchList', JSON.stringify(watchListArray));

            button.textContent = '';
            button.classList.remove('add-watch-list')
            button.classList.add('remove-watch-list');
            const icon = document.createElement('i');
            icon.classList.add('fa-solid', 'fa-minus');
            button.appendChild(icon);
            button.appendChild(document.createTextNode(' Remove from Watch List'));

            console.log(`${animeObj.title} added to watch list`);
        }
    } catch (error) {
        console.error('Error toggling watch list:', error);
    }
};

const createWatchListSection = () => {
    try {
        // Grab localStorage array
        const localWatchList = JSON.parse(localStorage.getItem('watchList')) || [];
    
        if (localWatchList.length > 0) {
            // Move search bar to header
            formUIChange();

            // Check if the section already exists to avoid adding it again
            let existingSection = document.querySelector('.watch-list-section');
            // Exit if section already exists
            if (existingSection) return; 

            const watchListSection = document.createElement('section');
            watchListSection.classList.add('watch-list-section');

            // loop through the watch list
            localWatchList.forEach(anime => {
                // Each anime will call the animeResultCard function
                const animeCard = createAnimeResultCard(anime); 

                // Add anime card to the watch list section
                watchListSection.appendChild(animeCard);
            });
    
            // Add watchListSection to main element
            mainElement.appendChild(watchListSection);
        } else {
            console.log('Your watchlist is empty!');
        }
    } catch (error) {
        console.error('Error trying to grab local storage ', error);
    }
};

// Onces page loads, call createWatchListSection function to load users localStorage and display list if available
document.addEventListener('DOMContentLoaded', () => {
    createWatchListSection();
});
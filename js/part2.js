"use strict";
// --------------------------
/**
 * get icons : font-awesome star icon
 * @param {Number} rating : the number of icons is equal to rating number
 * @returns {string}
 */
const movieStars = rating => {
    let stars = '';
    for (let i = 0; i <= rating; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    return stars;
};
// ----------------------------------------------------
/**
 * if there are movies show sort bar else hide it
 * @param {Number} moviesCount
 */
const showOrHideSortBar = (moviesCount) => {
    const sortBar = document.querySelector('#sortBar');
    if (moviesCount)
        sortBar.style.display = 'flex';
    else
        sortBar.style.display = 'none';
};
// --------------------------
/**
 * render movies
 * @param {Promise} movies
 */
const updateMovies = (movies) => {
    const moviesUL = document.querySelector('#moviesList');
    let moviesList = '';
    movies
        .then(movies => {
            showOrHideSortBar(movies.length);
            movies.forEach((movie, index) => {
                moviesList +=
                    `<li class="media">
                        <h2 class="thumb mr-3 c${(index % 16) + 1}">
                            ${movie.title.match(/\w/g)[0]} 
                        </h2>
                       <div class="media-body">
                            <h5 class="mt-0 mb-1">${movie.title}</h5>
                            <i class="far fa-calendar-alt"></i> ${movie.year} &nbsp;&nbsp;&nbsp;
                            <i class="fas fa-heart"></i> ${movie.votes} &nbsp;&nbsp;&nbsp;
                            <i class="fas fa-eye"></i> ${movie.running_times}
                        </div>
                       <div>
                            <span class="float-right text-center">
                                <i class="text-warning"> ${movieStars(movie.rating)}</i> <br> 
                                <span class="${movie.tag}"> ${movie.tag}</span>
                            </span>
                        </div>
                    </li>`;
            });
            moviesUL.innerHTML = moviesList;
        })
        .catch(error => {
            moviesUL.innerHTML = error;
        });

};
// ----------------------------------------------------
/**
 * get rating average of movies
 * @param {Array} movies
 * @returns {Number}
 */
const calculateTotalRatingAverage = movies => {
    const average = movies
        .reduce((sum, movie) => sum += movie.rating, 0) / movies.length;
    return Number(average.toFixed(2));
};
// ----------------------------------------------------
/**
 * render count of movies and rating average
 * @param {Promise} movies
 */
const updateStates = movies => {
    movies.then(renderedMovies => {
        document.querySelector('#states').innerHTML =
            `Total results <span class="badge badge-info">${renderedMovies.length}</span>, 
         The average rating of all result is: 
         <span class="badge badge-info">${calculateTotalRatingAverage(renderedMovies)}</span>.`;
    });
};


// ----------------------------------------------------
/**
 * movies list after adding tag property (Good/Average/Bad)
 * @returns {Promise}
 */
const getTaggedMovies = () => {
    const moviesUrl = 'https://gist.githubusercontent.com/pankaj28843/08f397fcea7c760a99206bcb0ae8d0a4/raw/02d8bc9ec9a73e463b13c44df77a87255def5ab9/movies.json';
    return fetch(moviesUrl)
        .then(responseMovies => responseMovies.json())
        .then(movies => {
            movies.forEach(addTagToMovie);
            return movies;
        });
};
const taggedMoviesPromise = getTaggedMovies();

// ----------------------------------------------------
/**
 * add tag property for a movie according to rating value
 * @param movie
 */
const addTagToMovie = movie => {
    if (movie.rating >= 7) {
        movie.tag = "Good";
    }
    if (movie.rating >= 4 && movie.rating < 7) {
        movie.tag = "Average";
    }
    if (movie.rating < 4) {
        movie.tag = "Bad";
    }
};

// --------------------------
/**
 /**
 * highlight search word at result titles
 * @param {String} keyword
 * @param {String} text
 * @returns {String}
 */
function highlight(keyword, text) {
    if (!keyword) {
        return text;
    }
    const pattern = new RegExp("(" + keyword + ")", "gi");
    return text.replace(pattern, `<span class='highlight'>${keyword}</span>`);
}

// =================================
const filterMoviesByTitle = (movies, filterTitle) => {
    return movies
        .filter(movie => movie.title.toLowerCase().includes(filterTitle.toLowerCase()))
        .map(movie => ({...movie, title: highlight(filterTitle, movie.title)}));
};

// --------------------------
const filterMoviesByTag = (movies, filterTag) => {
    return filterTag === 'All' ? movies : movies
        .filter(movie => movie.tag === filterTag);
};

// --------------------------
const filterMoviesByDecades = (movies, filterDecades) => {
    return movies
        .filter(movie => movie.year >= parseInt(filterDecades[0]) &&
            movie.year <= (parseInt(filterDecades[1]) + 10));
};

// --------------------------
/**
 * get the form (#moviesSearchForm) values to use at getFilteredMovies(...)
 * @returns {Array}
 */
const getFilterValues = () => {
    const filterTitle = document.querySelector('#movieTitle').value.trim();
    const filterTag = document.querySelector(`input[name=moviesTag]:checked`).value;
    let decades = document.querySelector(`input[name=decades]`).value.match(/\d+/g);
    return [filterTitle, filterTag, decades];
};
// --------------------------
/**
 * filter movies by search keyword or by radio button value
 * @param {String} filterTitle
 * @param {String} filterTag
 * @param {Array} filterDecades
 * @returns {Promise}
 */
const getFilteredMovies = (filterTitle, filterTag, filterDecades) => {

    return taggedMoviesPromise
        .then(movies => filterMoviesByTitle(movies, filterTitle))
        .then(movies => filterMoviesByTag(movies, filterTag))
        .then(movies => filterMoviesByDecades(movies, filterDecades));
};
// --------------------------
// when any radio button checked => filter the rendered movies by selected value
document.querySelectorAll('input[name="moviesTag"]').forEach(moviesState => {
    moviesState.addEventListener('change', function () {
        getFilteredMoviesAndRender(...getFilterValues());
    });
});

// ----------------------------------------------------
/**
 * filter movies then render the results
 * @param movieTitle
 * @param moviesTag
 * @param decades
 */
const getFilteredMoviesAndRender = (movieTitle, moviesTag, decades) => {

    // filter movies by title (previous gotten keyword)
    filteredMovies = getFilteredMovies(movieTitle, moviesTag, decades);

    // render movies
    updateMovies(filteredMovies);

    // update total result, average
    updateStates(filteredMovies)

};

// ----------------------------------------------------

/**
 * when submit movies search form (filter movies by title)
 */
let filteredMovies;
document.querySelector('#moviesSearchForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const formEventTarget = new FormData(event.target);

    // get search keyword (movie title) from input text at movies search form
    const movieTitle = String(formEventTarget.get('movieTitle').trim());

    // get checked radio button value (to filter movies by selected tag)
    const moviesTag = formEventTarget.get('moviesTag');

    let decades = formEventTarget.get('decades'); // string example: "1970s,2020s"
    decades = decades.match(/\d+/g); // regular expressions => [1970, 2020]

    getFilteredMoviesAndRender(movieTitle, moviesTag, decades);

});

// --------------------------
/**
 * Javascript range slider
 * @link https://github.com/slawomir-zaziablo/range-slider
 */
const mySlider = new rSlider({
    target: '#decadeSlider', // id
    // decades array
    values: ['1920s', '1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s'],
    range: true,
    tooltip: false,
    scale: true,
    labels: true,
    // initial value: all the time
    set: ['1920s', '2010s'],
    // callback function
    onChange: onDecadeSliderChange
});

// --------------------------
// temporary value to disable submitting the form when run the page
let submitForm = false;

function onDecadeSliderChange() {
    if (submitForm) {
        getFilteredMoviesAndRender(...getFilterValues());
    }
    submitForm = true;
}

// --------------------------
/**
 * remove span tag from string
 * example: <span class='highlight'>Some text</span>   ==>  Some text
 * @param {String} string contains spam HTML tag
 * @returns {string} without tags
 */
const stripSpanTags = string => {
    let res = string.replace('<span class=\'highlight\'>', '');
    res = res.replace('</span>', '');
    return res.toLowerCase();
};

// --------------------------
// default sorting of results is ascending
const ascendingOrder = {
    title: true,
    year: true,
    rating: true
};

// --------------------------
/**
 * sort movies by title
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
function sortByTitle(a, b) {
    // strip span tag from titles
    const aTitle = stripSpanTags(a.title);
    const bTitle = stripSpanTags(b.title);
    // ascending
    if (ascendingOrder.title)
        return aTitle < bTitle ? -1 : aTitle > bTitle ? 1 : 0;
    // descending
    else
        return aTitle < bTitle ? 1 : aTitle > bTitle ? -1 : 0;
}

// --------------------------
/**
 * sort movies by year
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
function sortByYear(a, b) {
    if (ascendingOrder.year)
        return a.year - b.year;
    else
        return b.year - a.year;

}

// --------------------------
/**
 * sort movies by rating
 * @param a
 * @param b
 * @returns {number}
 */
function sortByRating(a, b) {
    if (ascendingOrder.rating)
        return a.rating - b.rating;
    else
        return b.rating - a.rating;
}


// --------------------------
const sortMovies = (movies, sortBy) => {

    return movies
        .then(
            movies => {
                switch (sortBy) {
                    case 'title':
                        return movies.sort(sortByTitle);
                    case 'year':
                        return movies.sort(sortByYear);
                    case 'rating':
                        return movies.sort(sortByRating);
                }
            }
        );
};
// --------------------------
/**
 * toggle between (ascending/ descending)
 * and between fa-sort-up/fa-sort-down icon
 * @param {HTMLElement} sortButton
 */
const inverseOrderAndSetSortIcon = sortButton => {
    const sortBy = sortButton.id;
    ascendingOrder[sortBy] = !ascendingOrder[sortBy];
    const sortClasses = ['fa-sort', 'fa-sort-up', 'fa-sort-down'];

    const iconClassList = sortButton.querySelector('i').classList;
    iconClassList.remove(...sortClasses);

    if (ascendingOrder[sortBy]) {
        iconClassList.add(sortClasses[1]);
    }
    else {
        iconClassList.add(sortClasses[2]);
    }

};

// --------------------------
// sort by: (Name | Year | Rating)
document.querySelectorAll('.sortBy').forEach(function (sortButton) {
    sortButton.addEventListener('click', function () {
        inverseOrderAndSetSortIcon(this);
        const sortedMovies = sortMovies(filteredMovies, this.id);
        // render movies
        updateMovies(sortedMovies);

    });
});
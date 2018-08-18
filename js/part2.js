"use strict";

/**
 * get icons : font-awesome star icon
 * @param {Number} rating : the number of icons is equal to rating number
 * @returns {string}
 */
let movieStars = rating => {
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
let showOrHideSortBar = (moviesCount) => {
    let sortBar = document.querySelector('#sortBar');
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
let updateMovies = (movies) => {
    let moviesUL = document.querySelector('#moviesList');
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
let calculateTotalRatingAverage = movies => {
    let average = movies
        .reduce((sum, movie) => sum += movie.rating, 0) / movies.length;
    return Number(average.toFixed(2));
};
// ----------------------------------------------------
/**
 * render count of movies and rating average
 * @param {Promise} movies
 */
let updateStates = movies => {
    movies.then(renderedMovies => {
        document.querySelector('#states').innerHTML =
            `Total results <span class="badge badge-info">${renderedMovies.length}</span>, 
         The average rating of all result is: 
         <span class="badge badge-info">${calculateTotalRatingAverage(renderedMovies)}</span>.`;
    });
};

// ----------------------------------------------------
/**
 * original movies list
 * @returns {Promise}
 */
let getAllMovies = () => {
    // spinner... show loading icon while loading movies
    document.querySelector('#moviesList').innerHTML = `<h2><i class="fas fa-sync fa-spin"></i> loading...</h2>`;
    const moviesUrl = 'https://gist.githubusercontent.com/pankaj28843/08f397fcea7c760a99206bcb0ae8d0a4/raw/02d8bc9ec9a73e463b13c44df77a87255def5ab9/movies.json';
    return fetch(moviesUrl)
        .then(responseMovies => responseMovies.json())
};

// ----------------------------------------------------
/**
 * movies list after adding tag property (Good/Average/Bad)
 * @returns {Promise}
 */
let taggedMovies = () => {
    return getAllMovies()
        .then(movies => {
            movies.forEach(addTagToMovie);
            return movies;
        });
};

// ----------------------------------------------------
/**
 * add tag property for a movie according to rating value
 * @param movie
 */
function addTagToMovie(movie) {
    if (movie.rating >= 7) {
        movie.tag = "Good";
    }
    if (movie.rating >= 4 && movie.rating < 7) {
        movie.tag = "Average";
    }
    if (movie.rating < 4) {
        movie.tag = "Bad";
    }
}

// ----------------------------------------------------
/**
 * filter movies by checked tag
 * @param {Array} movies
 * @returns {Array}
 */
function filterMoviesByTag(movies) {
    return movies
        .filter(movies => movies.tag === filter.tag.value);
}

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
    let pattern = new RegExp("(" + keyword + ")", "gi");
    return text.replace(pattern, `<span class='highlight'>${keyword}</span>`);
}

// --------------------------
/**
 * filter movies by search keyword or by radio button value
 * @param movies {Promise}
 * @param filter {Object}: search keyword or radio buttons filter value
 * @returns {Promise}
 */

let getFilteredMovies = (movies, filter) => {
    return movies
        .then(filterMoviesByTitle)
        .then(filterMoviesByTag)
        .then(filterMoviesByDecades);

// --------------------------
    /**
     * filter movies by tag
     * @param {Array} movies
     * @returns {Array}
     */
    function filterMoviesByTag(movies) {
        if (filter.tag === 'All') {
            return movies;
        }
        else {
            return movies
                .filter(movie => movie.tag === filter.tag);
        }
    }

// --------------------------
    /**
     * filter movies by title
     * @param {Array} movies
     * @returns {Array}
     */
    function filterMoviesByTitle(movies) {
        return movies
            .filter(movie => movie.title.toLowerCase().includes(filter.title.toLowerCase()))
            .map(movie => ({...movie, title: highlight(filter.title, movie.title)}));
    }

// --------------------------
    function filterMoviesByDecades(movies) {
        return movies
            .filter(
                movie => movie.year >= filter.startDecade
                    && movie.year <= (filter.endDecade + 10)
            );
    }

}; // end of getFilteredMovies function

// ======================= MAIN ===============================

// when any radio button checked => filter the rendered movies by selected value
document.querySelectorAll('input[name="moviesTag"]').forEach(moviesState => {
    moviesState.addEventListener('change', function () {
        document.querySelector('#submitSearchForm').click();
    });
});

// ----------------------------------------------------

/**
 * when submit movies search form (filter movies by title)
 */
let filteredMovies;
document.querySelector('#moviesSearchForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const formEventTarget = new FormData(event.target);

    // get search keyword (movie title) from input text at movies search form
    let movieTitle = String(formEventTarget.get('movieTitle').trim());

    // get checked radio button value (to filter movies by selected tag)
    let moviesTag = formEventTarget.get('moviesTag');

    let decades = formEventTarget.get('decades'); // string example: "1970s,2020s"
    decades = decades.match(/\d+/g); // regular expressions => [1970, 2020]

    // filter object
    let filter = {
        title: movieTitle,
        tag: moviesTag,
        startDecade: parseInt(decades[0]),
        endDecade: parseInt(decades[1])
    };

    // filter movies by title (previous gotten keyword)
    filteredMovies = getFilteredMovies(taggedMovies(), filter);

    // render movies
    updateMovies(filteredMovies);

    // update total result, average
    updateStates(filteredMovies)
});

// --------------------------
/**
 * Javascript range slider
 * @link https://github.com/slawomir-zaziablo/range-slider
 */
let mySlider = new rSlider({
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
        document.querySelector('#submitSearchForm').click();
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
let stripSpanTags = string => {
    let res = string.replace('<span class=\'highlight\'>', '');
    res = res.replace('</span>', '');
    return res.toLowerCase();
};

// --------------------------
// default sorting of results is ascending
let ascendingOrder = {
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
    let aTitle = stripSpanTags(a.title);
    let bTitle = stripSpanTags(b.title);
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
let sortMovies = (movies, sortBy) => {

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
let inverseOrderAndSetSortIcon = sortButton => {
    const sortBy = sortButton.id;
    ascendingOrder[sortBy] = !ascendingOrder[sortBy];
    let sortClasses = ['fa-sort', 'fa-sort-up', 'fa-sort-down'];

        let iconClassList = sortButton.querySelector('i').classList;
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
        let sortedMovies = sortMovies(filteredMovies, this.id);
        // render movies
        updateMovies(sortedMovies);

    });
});
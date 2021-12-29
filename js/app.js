const apiUrl = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=1';
const IMGPATH = 'https://image.tmdb.org/t/p/w1280';
const SEARCHAPI =
  'https://api.themoviedb.org/3/search/movie?&api_key=04c35731a5ee918f014970082a0088b1&query=';

const main = $('#main');
const form = $('#form');
const search = $('#search');
const button = $('#search-button');

const mediaQuery = window.matchMedia('(max-width:725px)');
const mediaQueryBig = window.matchMedia('(min-width:725px)');

const showMovies = (url) => {
  appendLoader();
  fetch(url).then((res) => {
    if (res.ok) {
      return res.json();
    } else {
      throw new Error('Something went wrong');
    }
  }).then((data) => {
    main.empty();
    if (data.total_results == 0) {
      appendNoMoviesFound();
    } else {
      data.results.forEach(element => {
        createMovieDom(element);
      });
    };
  }).catch((error) => {
    main.empty();
    if (search.val().trim() == '') {
      appendNoMoviesFound();
    } else {
      appendSomethingWentWrong();
    }
  });
};

const convertToEuropeanDate = (dateInput) => {
  const dateValues = dateInput.split('-');
  let humanReadableDate = [];
  for (let i = dateValues.length - 1; i >= 0; i--) {
    humanReadableDate.push(dateValues[i]);
  }
  return humanReadableDate.join('/');
};

const calculateEndDateString = (dateString, timeString, minutes) => {
  const date = new Date(dateString + 'T' + timeString);
  return addMinutes(date, minutes);
}

const addMinutes = (date, minutes) => {
  return transferDateToGoogleApiString(new Date(date.getTime() + minutes * 60000));
}


const transferDateToGoogleApiString = (date) => {
  const isoString = date.toISOString();
  const isoArray = isoString.split('.');
  return isoArray[0];
}

const getReleaseYear = (releaseDate) => {
  const fullDate = releaseDate.split('-');
  return fullDate[0] != '' ? fullDate[0] : 'unknown';
}

const convertToStars = (rating) => {
  const numberOfStars = Math.round(rating / 2);
  let stars = '';
  for (let i = 0; i < numberOfStars; i++) {
    stars = stars + '&starf;';
  }
  return stars;
}

button.click((e) => {
  e.preventDefault();

  showMovies(SEARCHAPI + search.val().trim());
});

form.submit((e) => {
  e.preventDefault();
  showMovies(SEARCHAPI + search.val().trim());
});

const getDurationById = (movieId) => {
  return fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=04c35731a5ee918f014970082a0088b1`).then(res => res.json())
    .then(data => {
      duration = data.runtime;
      return duration;
    });
};

const appendNoMoviesFound = () => {
  const emptyText = $('<h2>No movies found.</h2>').addClass('no-movies');
  main.append(emptyText);
}

const appendLoader = () => {
  main.empty();
  const loader = $('<div></div>').addClass('loader');
  main.append(loader);
}

const appendSomethingWentWrong = () => {
  main.append('<h2>Something went wrong.</h2>');
}

const createMovieDom = (element) => {
  const container = $('<div></div>').addClass('container');
  const columnText = $('<div></div>').addClass('column-text');
  const columnPoster = $('<div></div>').addClass('column-poster');
  const lengthAndRelease = $('<div></div>');

  let poster = createPoster(element);
  columnPoster.append(poster);

  const name = $('<h2></h2>').text(element.title).addClass('movie-title');

  const rating = $('<div></div>').addClass('rating').html(
    convertToStars(element.vote_average)
  );

  const releaseYear = $('<div></div>').html(`<strong>Release: </strong>${getReleaseYear(element.release_date)}`).addClass('release-year');
  const description = $('<div></div>').text(element.overview).addClass('description');

  const pickers = $('<div></div>').addClass('pickers');

  const dateRow = $('<div></div>').addClass('row');
  const dateText = $('<p></p>').html('<strong>Select a date:</strong>');

  const dateInput = $('<input/>').attr('type', 'date');

  dateRow.append(dateText, dateInput);

  const timeRow = $('<div></div>').addClass('row');
  const timeText = $('<p></p>').html('<strong>Select a time:</strong>');
  const timeInput = $('<input/>').attr('type', 'time');

  timeRow.append(timeText, timeInput);

  getDurationById(element.id).then((length) => {
    let lenghtText = length == 0 ? 'unknown' : `${length} min`;
    const duration = $('<div></div>').html(`<strong>Length: </strong> ${lenghtText}`).addClass('length');
    const submitButton = $('<button></button>').addClass('submit-button').text('Add to google calendar').click(() => {
      if (gapi.auth2.getAuthInstance().isSignedIn.get()) {

        if (dateInput.val() == '' && timeInput.val() == '') {
          Swal.fire({
            title: 'Error!',
            text: 'Enter date and time first',
            icon: 'error',
            confirmButtonText: 'Ok',
            confirmButtonColor: 'grey'
          });
        } else if (dateInput.val() == '') {
          Swal.fire({
            title: 'Error!',
            text: 'Enter date first',
            icon: 'error',
            confirmButtonText: 'Ok',
            confirmButtonColor: 'grey'
          });
        } else if (timeInput.val() == '') {
          Swal.fire({
            title: 'Error!',
            text: 'Enter time first',
            icon: 'error',
            confirmButtonText: 'Ok',
            confirmButtonColor: 'grey'
          });
        } else {
          let startDateString = calculateEndDateString(dateInput.val(), timeInput.val(), 0);
          let endDateString = calculateEndDateString(dateInput.val(), timeInput.val(), length);

          const event = createEvent(element, startDateString, endDateString);
          insertEvent(event, element, dateInput, timeInput);
        }
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Log in to your google account first',
          icon: 'error',
          confirmButtonText: 'Ok',
          confirmButtonColor: 'grey'
        });
      }
    });
    lengthAndRelease.append(duration, releaseYear);
    columnText.append(name, rating, lengthAndRelease, description, pickers);
    pickers.append(dateRow, timeRow, submitButton);
    container.append(columnText, columnPoster);
    main.append(container);
  });
}

const insertEvent = (event, element, dateInput, timeInput) => {
  var request = gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': event
  });

  request.execute(() => {
    Swal.fire({
      title: 'Event added!',
      html: `${element.title} has been added to your google calendar!
      <div id="alert-datetime">
      <strong>Date:</strong> ${convertToEuropeanDate(dateInput.val())}
      <strong>Time:</strong> ${timeInput.val()}
      </div>`,
      icon: 'success',
      confirmButtonText: 'Ok',
      confirmButtonColor: 'grey'
    });
  });
};

const createEvent = (element, startDateString, endDateString) => {
  return {
    'summary': `Watch ${element.title}`,
    'start': {
      'dateTime': `${startDateString}-00:00`,
      'timeZone': 'Europe/Prague'
    },
    'end': {
      'dateTime': `${endDateString}-00:00`,
      'timeZone': 'Europe/Prague'
    },
    'reminders': {
      'useDefault': false,
      'overrides': [
        { 'method': 'email', 'minutes': 24 * 60 },
        { 'method': 'popup', 'minutes': 10 }
      ]
    }
  };
};



const createPoster = (element) => {
  let image = undefined;

  if (element.poster_path == null) {
    image = $('<div></div>').text('Poster for this movie is missing').addClass('missing');
  } else {
    image = $('<img/>').attr('src', IMGPATH + element.poster_path).attr('alt', `Poster of ${element.title}`);
  }
  return image;
}

const initialQuerySetup = () => {
  initialQueryCheck();
  addResolutionChangeListeners();
}

const initialQueryCheck = () => {
  if (mediaQuery.matches) {
    search.val('enter a movie name');
    search.click(() => {
      search.val('');
    });
  }
}

const addResolutionChangeListeners = () => {
  addListenerSmallScreen();
  addListenerBigScreen();
}


const addListenerBigScreen = () => {
  mediaQueryBig.addEventListener('change', event => {
    if (event.matches && search.val() == 'enter a movie name') {
      search.val('');
    }
  });
}

const addListenerSmallScreen = () => {
  mediaQuery.addEventListener('change', event => {
    if (event.matches && search.val().trim() == '') {
      search.val('enter a movie name');
      search.click(() => {
        search.val('');
      });
    }
  });
}


initialQuerySetup();
showMovies(apiUrl);

const apiUrl = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=1';
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI =
  "https://api.themoviedb.org/3/search/movie?&api_key=04c35731a5ee918f014970082a0088b1&query=";

const main = $('#main');
const form = $('#form');
const search = $('#search');
const button = $('#search-button');
const html = $('html'); 

const mediaQuery = window.matchMedia('(max-width:725px)');

if (mediaQuery.matches) {
  search.val('enter a moovie name');
  search.click(() => {
    search.val('');
  });
}

  mediaQuery.addEventListener('change', event => {
    if (event.matches && search.val() == '') {
      search.val('enter a moovie name');
      search.click(() => {
        search.val('');
      });
    } else {
      search.val('');
    }
  });

  const showMovies = (url) => {
    main.empty();
    const loader = $('<div></div>').addClass('loader');
    main.append(loader);
    fetch(url).then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error('Something went wrong');
      }
    }).then((data) => {
      main.empty();
      if (data.total_results == 0) {
        const emptyText = $('<h2>No movies found.</h2>').addClass('no-movies');
        main.append(emptyText);
      } else {


        data.results.forEach(element => {

          const container = $('<div></div>').addClass('container');
          const column1 = $('<div></div>').addClass('column-text');
          const column2 = $('<div></div>').addClass('column-poster');
          const lengthAndRelease = $('<div></div>');

          let image = undefined;

          if (element.poster_path == null) {
            image = $('<div></div>').text('Poster for this movie is missing').addClass('missing');
          } else {
            image = $('<img/>').attr('src', IMGPATH + element.poster_path).attr('alt', `Poster of ${element.title}`);
          }
          column2.append(image);

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
                  alert('Enter date and time first.');
                } else if (dateInput.val() == '') {
                  alert('Enter date first.');
                } else if (timeInput.val() == '') {
                  alert('Enter time first.');
                } else {
                  let startDateString = calculateEndDateString(dateInput.val(), timeInput.val(), 0);
                  let endDateString = calculateEndDateString(dateInput.val(), timeInput.val(), length);

                  var event = {
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

                  var request = gapi.client.calendar.events.insert({
                    'calendarId': 'primary',
                    'resource': event
                  });

                  request.execute(() => {
                    alert(`${element.title} was added to your google calendar!
                    \nDate: ${convertToEuropeDate(dateInput.val())}
                    \nTime: ${timeInput.val()}`);
                  });
                }
              } else {
                alert('Log in to your google account first.')
              }
            });
            lengthAndRelease.append(duration, releaseYear);
            column1.append(name, rating, lengthAndRelease, description, pickers);
            pickers.append(dateRow, timeRow, submitButton);
            container.append(column1, column2);
            main.append(container);
          });
        });
      };
    }).catch((error) => {
      main.empty();
      if (search.val() == '') {
        const emptyText = $('<h2>No movies found.</h2>').addClass('no-movies');
        main.append(emptyText);
      } else {
        main.append('<h2>Something went wrong.</h2>');
      }
    });
  };

  const convertToEuropeDate = (dateInput) => {
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

    showMovies(SEARCHAPI + search.val());
  });

  form.submit((e) => {
    e.preventDefault();
    showMovies(SEARCHAPI + search.val());
  });

  const getDurationById = (movieId) => {
    return fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=04c35731a5ee918f014970082a0088b1`).then(res => res.json())
      .then(data => {
        duration = data.runtime;
        return duration;
      });
  };


  // Client ID and API key from the Developer Console
  var CLIENT_ID = '779681715031-0u954k7mb1545tuhl6e1k2d6u62caokr.apps.googleusercontent.com';
  var API_KEY = 'AIzaSyDdopeSLDxcJlI66BplqPTH6TqJnMb05LI';

  // Array of API discovery doc URLs for APIs used by the quickstart
  var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  var SCOPES = "https://www.googleapis.com/auth/calendar";

  var loginButton = document.getElementById('login-button');
  var logoutButton = document.getElementById('logout-button');

  /**
   *  On load, called to load the auth2 library and API client library.
   */
  function handleClientLoad() {
    gapi.load('client:auth2', initClient);
  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  function initClient() {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      loginButton.onclick = handleAuthClick;
      logoutButton.onclick = handleSignoutClick;
    }, function (error) {
      appendPre(JSON.stringify(error, null, 2));
    });
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      loginButton.style.display = 'none';
      logoutButton.style.display = 'block';
    } else {
      loginButton.style.display = 'block';
      logoutButton.style.display = 'none';
    }
  }

  /**
   *  Sign in the user upon button click.
   */
  function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
  }

  showMovies(apiUrl);
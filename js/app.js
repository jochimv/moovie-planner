

const apiUrl = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=1';
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI =
    "https://api.themoviedb.org/3/search/movie?&api_key=04c35731a5ee918f014970082a0088b1&query=";

    const main = $('#main');
    const form = $('#form');
    const search = $('#search');
    const button = $('#search-button');

    showMovies(apiUrl);

    function showMovies(url){
        fetch(url).then(res => res.json())
        .then((data) => {

            data.results.forEach(element => {
            
              console.log(getDurationById(element.id));
            const duration = $('<div></div>').text(getDurationById(element.id) + ' min');

            const container = $('<div></div>').addClass('container');
            
            const column1 = $('<div></div>').addClass('column');
            const column2 = $('<div></div>').addClass('column');
    
            const image = document.createElement('img');
            image.src = IMGPATH + element.poster_path;
            column2.append(image);
    
            const name = $('<h2></h2>').text(element.title);
    
            const rating = $('<div></div>').addClass('rating').html(
                convertToStars(element.vote_average)
            );
            
            const description = $('<div></div>').text(element.overview);
    
            const pickerContainer = $('<div></div>').addClass('picker-container');
    
            const dateRow = $('<div></div>').addClass('row');
            const dateText = $('<p></p>').html('<strong>Select a date:</strong>');
    
            const dateInput = $('<input/>').attr('type','date');
            
            dateRow.append(dateText,dateInput);
    
            const timeRow = $('<div></div>').addClass('row');
            const timeText = $('<p></p>').html('<strong>Select a time:</strong>');
            const timeInput = $('<input/>').attr('type','time');

            timeRow.append(timeText,timeInput);
    
            const submitButton = $('<button></button>').addClass('submit-button').text('Add to google calendar').click(() => {
                console.log(timeInput.val());
                console.log(dateInput.val());

                var event = {
                  'summary': `Watch ${element.title}`,
                //  'description': 'A chance to hear more about Google\'s developer products.',
                  'start': {
                  'dateTime': `${dateInput.val()}T${timeInput.val()}:00-00:00`,
                  'timeZone': 'Europe/Prague'
                  },
                  'end': {
                  'dateTime': '2021-12-25T23:59:00-00:00',
                  'timeZone': 'Europe/Prague'
                  },
                  'reminders': {
                  'useDefault': false,
                  'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 10}
                  ]
                  }
                  };
              
                var request = gapi.client.calendar.events.insert({
                  'calendarId': 'primary',
                  'resource': event
                  });

                  
                request.execute(function(event) {
                console.log('Event created: ' + event.htmlLink);
              });
         
            });
    
            pickerContainer.append(dateRow,timeRow,submitButton);
    
            column1.append(name,rating,duration,description,pickerContainer);
    
            container.append(column1,column2);
            main.append(container);
            
        }); 
    });
    }
    
    const convertToStars = (rating) => {
        const numberOfStars = Math.round(rating / 2);
        let stars = '';
        for(let i = 0; i < numberOfStars; i++){
            stars = stars + '&starf;';
        }
        return stars;
    }
    
    button.click((e) => {
        e.preventDefault();
        main.empty();
         
        const searchTerm = search.val();
    
        if (searchTerm) {
            showMovies(SEARCHAPI + searchTerm);
            search.value = searchTerm;
        }
    });

    const getDurationById = (movieId) => {
      fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=04c35731a5ee918f014970082a0088b1`).then(res => res.json())
      .then(data => {
        const duration = data.runtime; 
        console.log(duration);
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

  var authorizeButton = document.getElementById('authorize_button');
  var signoutButton = document.getElementById('signout_button');

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
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
    }, function(error) {
      appendPre(JSON.stringify(error, null, 2));
    });
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      authorizeButton.style.display = 'none';
      signoutButton.style.display = 'block';
    } else {
      authorizeButton.style.display = 'block';
      signoutButton.style.display = 'none';
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

  /**
   * Append a pre element to the body containing the given message
   * as its text node. Used to display the results of the API call.
   *
   * @param {string} message Text to be placed in pre element.
  
  function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
  }

 */
  // Refer to the JavaScript quickstart on how to setup the environment:
// https://developers.google.com/calendar/quickstart/js
// Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
// stored credentials.


/*
eventButton.addEventListener('click', (event) => {
  var event = {
    'summary': 'Google I/O 2015',
    'description': 'A chance to hear more about Google\'s developer products.',
    'start': {
    'dateTime': '2021-12-24T09:00:00-07:00',
    'timeZone': 'Europe/Prague'
    },
    'end': {
    'dateTime': '2021-12-24T17:00:00-07:00',
    'timeZone': 'Europe/Prague'
    },
    'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'email', 'minutes': 24 * 60},
      {'method': 'popup', 'minutes': 10}
    ]
    }
    };

  var request = gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': event
    });
    
    //tady bude potvrzení o tom, že se event úspěšně přidal

    request.execute(function(event) {
    appendPre('Event created: ' + event.htmlLink);
    });

});

*/
const apiUrl = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=1';
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI =
    "https://api.themoviedb.org/3/search/movie?&api_key=04c35731a5ee918f014970082a0088b1&query=";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");
const button = document.getElementById("search-button");

showMovies(apiUrl);

function showMovies(url){
    fetch(url).then(res => res.json())
    .then(function(data){
        console.log(data);
    console.log(data.results);
    data.results.forEach(element => {

        const container = document.createElement('div');
        container.classList.add('container');
        
        const column1 = document.createElement('div');
        column1.classList.add('column');
        const column2 = document.createElement('div');
        column2.classList.add('column');

        const image = document.createElement('img');
        image.src = IMGPATH + element.poster_path;
        column2.append(image);

        const name = document.createElement('h2');
        name.innerText = element.title;

        const rating = document.createElement('div');
        rating.classList.add('rating');
        rating.innerHTML = convertToStars(element.vote_average);

        const description = document.createElement('div');
        description.innerText = element.overview;



        const pickerContainer = document.createElement('div');
        pickerContainer.classList.add('picker-container');

        const dateRow = document.createElement('div');
        dateRow.classList.add('row');
        const dateText = document.createElement('p');
        dateText.innerHTML = '<strong>Select a date:</strong> ';

        const dateInput = document.createElement('input');
        dateInput.setAttribute('type','date');
        
        dateRow.append(dateText,dateInput);

        const timeRow = document.createElement('div');
        timeRow.classList.add('row');
        const timeText = document.createElement('p');
        timeText.innerHTML = '<strong>Select a time:</strong>';

        const timeInput = document.createElement('input');
        timeInput.setAttribute('type','time');
         
        timeRow.append(timeText,timeInput);

        const submitButton = document.createElement('button');
        submitButton.classList.add('submit-button');
        submitButton.innerText = 'Add to google calendar';

        pickerContainer.append(dateRow,timeRow,submitButton);

        column1.append(name,rating,description,pickerContainer);

        container.append(column1,column2);
        main.append(container);
        
    }); 
});
}

const convertToStars = (rating) => {
    console.log('rating= ' + rating + "\nrating / 2 = " + rating / 2 + "\nrating rounded = " + Math.round(rating/2));
    const numberOfStars = Math.round(rating / 2);
    let stars = '';
    for(let i = 0; i < numberOfStars; i++){
        stars = stars + '&starf;';
    }
    return stars;
}

button.addEventListener("click", (e) => {
    e.preventDefault();
    main.innerHTML = '';
     
    const searchTerm = search.value;

    if (searchTerm) {
        showMovies(SEARCHAPI + searchTerm);
        search.value = searchTerm;
    }
});

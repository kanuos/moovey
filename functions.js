const axios = require('axios');

const URL = `http://www.omdbapi.com/?apikey=${process.env.MOVIE_API_KEY}&`

const MONTHS = [
    "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"
]

const getMovieTitles = async (searchKeyword) => {
    try {
        const response = await axios(URL + `s=${searchKeyword}`);
        return response.data.Search;
    } catch (error) {
        return [];
    }
}

const getFullImage = imageURL => {
    /*
    converts a 300 * 300 thumbnail to full poster
    Sample URL
    https://m.media-amazon.com/images/M/MV5BOTY4YjI2N2MtYmFlMC00ZjcyLTg3YjEtMDQyM2ZjYzQ5YWFkXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg
    */
   if (imageURL.includes("._V1_SX300"))
        return imageURL.replaceAll("._V1_SX300")
    return imageURL;
}

const minimumLength = (input="", minLength = 6) => {
    return input.length >= minLength
}

const maximumLength = (input="", maxLength = 6) => {
    return input.length < maxLength
}

const validEmail = (input) => {
    const regexp = new RegExp("^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9-]+\....?.?.?$");
    return regexp.test(input);
}

const titleCase = input => {
    const words = input.split(" ");
    return words.map(word => {
        return word[0].toUpperCase() + word.slice(1,word.length)     
    }).join(" ")
}

const readableDateStringFormat = (dateStr = Date.now()) => {
    // Wed Apr 21 2021 12:32:29 GMT-0400 (Eastern Daylight Time)
    const dateObj = new Date(dateStr);
    let suffix = "th";
    if (parseInt(dateObj.getDate()) % 10 === 1) { suffix = "st"}
    else if (parseInt(dateObj.getDate()) % 10 === 2) { suffix = "nd"}
    else if (parseInt(dateObj.getDate()) % 10 === 3) { suffix = "rd"}

    return {
        date : dateObj.getDate() < 10 ? `0${dateObj.getDate()}` : dateObj.getDate(),
        year : dateObj.getFullYear(),
        month : MONTHS[dateObj.getMonth()],
        suffix
    }
}

const dbLikeQueryString = string => {
    return `'%${string.toLowerCase().trim()}%'`;
}

const reformatMovieURL = url => {
    url = url.replace("._V1_SX300", '');
    return url;
}

const slugify = str => {
    return str.split(" ").join("+")
}

const formatAPIResponse = obj => {
    const json = {}
    for (let key in obj){
        if (key === "Poster"){
            json[key.toLowerCase()]  = reformatMovieURL(obj[key])
        }
        else{
            json[key.toLowerCase()]  =obj[key]
        }
    }
    return json
}



module.exports = {
    formatAPIResponse,
    getMovieTitles, 
    slugify,
    getFullImage,
    minimumLength,
    validEmail,
    titleCase,
    reformatMovieURL,
    dbLikeQueryString,
    maximumLength,
    readableDateStringFormat
}

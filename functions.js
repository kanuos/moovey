const axios = require('axios');

const URL = `http://www.omdbapi.com/?apikey=${process.env.MOVIE_API_KEY}&`



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

const validEmail = (input) => {
    const regexp = new RegExp("^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9-]+\....?.?.?$");
    return regexp.test(input);
}


module.exports = {
    getMovieTitles, 
    getFullImage,
    minimumLength,
    validEmail,
}

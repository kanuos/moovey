const MONTHS = [
    "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"
]

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
    const dateObj = new Date(dateStr);
    let suffix = "th";
    if (parseInt(dateObj.getDate()) % 10 === 1) { suffix = "st"}
    else if (parseInt(dateObj.getDate()) % 10 === 2) { suffix = "nd"}
    else if (parseInt(dateObj.getDate()) % 10 === 3) { suffix = "rd"}

    return {
        date : dateObj.getDate() < 10 ? `0${dateObj.getDate()}` : dateObj.getDate(),
        year : dateObj.getFullYear(),
        month : monthInWords(dateObj.getMonth()),
        suffix
    }
}

const monthInWords = month => {
    return MONTHS[month]
}

const doubleDigitDate = date => {
    return (""+date).padStart(2,"0")
}

const dbLikeQueryString = string => {
    return `'%${string.toLowerCase().trim()}%'`;
}

const reformatMovieURL = url => {
    if (url && url.includes("._V1_SX300")){
        url = url.replace("._V1_SX300", '');
    }
    return url;
}

const slugify = str => {
    return str?.split(" ").join("+")
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

const getAbsoluteURL = async req => {
    const {protocol, hostname, originalUrl} = req;
    return `${protocol}://${hostname}${originalUrl}`
}


module.exports = {
    getAbsoluteURL,
    formatAPIResponse,
    slugify,
    minimumLength,
    validEmail,
    titleCase,
    reformatMovieURL,
    dbLikeQueryString,
    maximumLength,
    readableDateStringFormat,
    monthInWords,
    doubleDigitDate
}

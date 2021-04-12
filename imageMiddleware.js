const path = require("path");

async function imageMiddleware(req, res, next) {
    const profilePic = req.files?.picture;
    if (profilePic) {
        const tempPath = path.join(__dirname, "TEMP_FILES", profilePic.name);
        req.tempPath = tempPath
    }
    next();
}


module.exports = imageMiddleware
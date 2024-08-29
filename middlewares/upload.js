const multer = require('multer');
const path = require('path');

// Configure multer to store files in the 'uploads' directory
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Ensure this directory exists or create it
    },
    filename: function (req, file, cb) {
        const { patientId, date } = req.query;
        const cleanedDateStr = date.replace(/\//g, '');
        let ext = path.extname(file.originalname); // Extract file extension
        let patientsId = patientId || 'patientReport'; // Default to 'unknown' if not provided
        let dates = cleanedDateStr || Date.now(); // Default to current time if not provided
        cb(null, `${patientsId}_${dates}${ext}`); // Rename file to include patientId and date
    }
});

var upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limit file size to 5MB
    }
});

module.exports = upload;

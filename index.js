// declaration files 
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { PatientTreatmentFormRecords, BloodReportUploadModel } = require('./models/treatmentModel');
const authRoute = require('./routers/authRoute');

//routers declaration
// const createPatientProfile = require('./routers/doctorRoute')


// config.env files 
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') })
const port = process.env.PORT;

//import router
const doctorRouter = require('./routers/doctorRoute');
const upload = require('./middlewares/upload');

// main function 
const app = express();

// middleware
app.use(express.json())
const corsOptions = {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
};

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});
app.use(cors(corsOptions));

app.use("/uploads", express.static('uploads'));
//routes here
app.use('/api', authRoute)
app.use('/', doctorRouter)

// Endpoint to handle file uploads
app.post("/fileUploads", upload.single("file"), async (req, res) => {
    try {
        const { patientId, date, cycleTestName } = req.query;
        const file = req.file; // File information from Multer

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Construct the file path
        const filePath = file.path;
        const fileName = file.filename;

        // Update the database
        const updateResult = await PatientTreatmentFormRecords.updateOne(
            {
                patientRef_id: patientId,
                'cycleTestList.cycleTestName': cycleTestName,
                'cycleTestList.appointmentDates.date': date
            },
            {
                $set: {
                    'cycleTestList.$[ct].appointmentDates.$[ad].generalInfo.uploadBloodReport': filePath
                }
            },
            {
                arrayFilters: [
                    { 'ct.cycleTestName': cycleTestName },
                    { 'ad.date': date }
                ]
            }
        );

        console.log("patientRef_id:", patientId);
        console.log("date: ", date);
        console.log("cycleTestName:", cycleTestName);
        console.log("filePath:", filePath);


        var uploadFile = new BloodReportUploadModel({
            patientRef_id: patientId,
            date: date,
            cycleTestName: cycleTestName,
            filePath: filePath
        })

        // Save the new document to the database
        const result = await uploadFile.save();

        if (updateResult.nModified === 0) {
            return res.status(404).json({ message: 'Record not found or no update performed' });
        }

        return res.status(201).json({
            message: 'Blood report uploaded successfully',
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Failed to upload blood report',
            error: error.message
        });
    }
});


app.get('/getRecords', async (req, res) => {

    try {
        console.log("req.query:", req.query);

        // Extract query parameters
        const { patientRefId, cycleTestName } = req.query;

        if (!patientRefId || !cycleTestName) {
            return res.status(400).json({ message: 'Missing required query parameters' });
        }

        const data = await BloodReportUploadModel.find({ patientRef_id: patientRefId, cycleTestName: cycleTestName });

        // // Construct query object
        // const query = {
        //     patientRef_id: patientRefId,
        //     'cycleTestList.cycleTestName': cycleTestName,
        //     'cycleTestList.appointmentDates.date': date
        // };

        // Send the file path as response
        res.json({ data });
    } catch (error) {
        console.error('Error fetching records:', error); // Log errors
        res.status(500).json({ message: error?.message }); // Send error response
    }
});


// ========== check port ======
app.listen(port, () => {
    console.log(`Server running on Port : ${port}`);
})

// db connection over here
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "chemo"
})
    .then(() => {
        console.log("Connected to MongoDB Successfully");
    })
    .catch((error) => {
        console.log("Error connection:", error);
    })

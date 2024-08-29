const mongoose = require("mongoose");

// Define the schemas without unnecessary fields and constraints

const generalInfoSchema = new mongoose.Schema({
    cancerType: {
        type: String,
        // required: true
    },
    regimenType: {
        type: String,
        // required: true
    },
    dayOfCycle: {
        type: String,
        // required: true
    },
    currentDate: {
        type: String,
        // required: true
    },
    patientName: {
        type: String,
        // required: true
    },
    patientAge: {
        type: Number,
        // required: true
    },
    patientGender: {
        type: String,
        // required: true
    },
    patientUhid: {
        type: Number,
        // required: true
    },
    patientIp: {
        type: Number,
        required: true
    },
    patientHeight: {
        type: Number,
        // required: true
    },
    patientWeight: {
        type: Number,
        // required: true
    },
    patientBSA: {
        type: Number,
        // required: true
    },
    patientComments: {
        type: String,
        // required: true
    },
    patientConsultant: {
        type: String,
        // required: true
    },
    patientBloodReportComment: {
        type: String,
        // required: true
    },
    uploadBloodReport: {
        type: String,
    }
});

const premedicationDrugItemSchema = new mongoose.Schema({
    preDrugID: {
        type: Number,
        required: true
    },
    drugType: {
        type: String,
        required: true
    },
    drugName: {
        type: String,
        required: true
    },
    brandName: {
        type: String,
        required: true
    },
    doseValue: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    frequency: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    route: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    signature: {
        type: String,
        required: true
    }
});

const chemotherapyDrugItemSchema = new mongoose.Schema({
    chemoDrugID: {
        type: Number,
        required: true
    },
    drugType: {
        type: String,
        required: true
    },
    drugName: {
        type: String,
        required: true
    },
    doseRangeA: {
        type: Number,
        required: true
    },
    doseRangeB: {
        type: Number,
        required: true
    },
    dose: {
        type: Number,
        required: true
    },
    doseUnit: {
        type: String,
        required: true
    },
    dilution: {
        type: Number,
        required: true
    },
    dosePct: {
        type: Number,
        required: true
    },
    brandName: {
        type: String,
        required: true
    },
    route: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    expiredDate: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    signature: {
        type: String,
        required: true
    }
});

const takeHomeDrugItemSchema = new mongoose.Schema({
    takeHomeDrugID: {
        type: Number,
        required: true
    },
    drugType: {
        type: String,
        required: true
    },
    drugName: {
        type: String,
        required: true
    },
    brandName: {
        type: String,
        required: true
    },
    doseValue: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    frequency: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    dispensed: {
        type: String,
        default: 'Null'
    },
    signature: {
        type: String,
        required: true
    }
});


const cycleTestSchema = new mongoose.Schema({
    cycleTestName: {
        type: String,
        required: true
    },
    appointmentDates: [
        {
            date: {
                type: String,
                required: true
            },
            generalInfo: generalInfoSchema,
            premedicationItems: [premedicationDrugItemSchema], // Array of premedicationDrugItemSchema
            chemotherapyItems: [chemotherapyDrugItemSchema], // Array of chemotherapyDrugItemSchema
            takeHomeItems: [takeHomeDrugItemSchema] // Array of takeHomeDrugItemSchema
        }
    ]
});

// Define the Patient schema
const patientSchema = new mongoose.Schema({
    patientRef_id: {
        type: String,
        required: true,
        unique: true // Ensure uniqueness of patientRef_id
    },
    cycleTestList: [cycleTestSchema], // An array of CycleTest objects
    createdAt: {
        type: Date,
        default: Date.now()
    }
});


// // Define the Patient schema
const fileUploadSchema = new mongoose.Schema({
    patientRef_id: {
        type: String,
        required: true,
    },
    cycleTestName: {
        type: String,
        required: true,
    }, // An array of CycleTest objects
    date: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});


const BloodReportUploadModel = mongoose.model('BloodReportFile', fileUploadSchema)

const PatientTreatmentFormRecords = mongoose.model('PatientTreatmentFormRecord', patientSchema);

module.exports = { PatientTreatmentFormRecords, BloodReportUploadModel };

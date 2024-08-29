const mongoose = require('mongoose');

// auto increments 
const patientAutoIncrement = require('mongoose-sequence')(mongoose);
const premedicatonAutoIncrement = require('mongoose-sequence')(mongoose);
const chemoAutoIncrement = require('mongoose-sequence')(mongoose);
const takeHomeAutoIncrement = require('mongoose-sequence')(mongoose);

// Schema and model for Create Patient Profile
const createPatientProfile = new mongoose.Schema({
    patientsId: {  //patientId
        type: Number,
        unique: true
    },
    name: {
        type: String,
        require: true
    },
    age: {
        type: Number,
        require: true
    },
    dateOfBirth: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        require: true
    },
    mobileNo: {
        type: Number,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    occupation: {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    uhid: {
        type: Number,
        require: true
    },
    ip: {
        type: Number,
        require: true
    },
    status: {
        type: String,
        require: true
    },
    customId: {
        type: String,
        unique: true
    },
    joinAt: {
        type: String,
        require: true
    }
});

createPatientProfile.plugin(patientAutoIncrement, { inc_field: 'patientsId' });

createPatientProfile.virtual('customIds').get(function () {
    return 'PID' + this.patientsId.toString().padStart(3, '0');
});

createPatientProfile.set('toJSON', { virtuals: true });
createPatientProfile.set('toObject', { virtuals: true });

const PatientsProfileModel = mongoose.model("patientsTable", createPatientProfile);



//  Schema and model for Premedication drug table
const premedicationDrugSchema = new mongoose.Schema({
    preDrugID: {
        type: Number,
        require: true,
    },
    drugType: {
        type: String,
        require: true
    },
    drugName: {
        type: String,
        require: true
    },
    brandName: {
        type: String,
        require: true
    },
    doseValue: {
        type: Number,
        require: true
    },
    unit: {
        type: String,
        require: true
    },
    duration: {
        type: Number,
        require: true
    },
    frequency: {
        type: String,
        require: true
    },
    details: {
        type: String,
        require: true
    },
    route: {
        type: String,
        default: 'IV'
    },
    startTime: {
        type: String,
        default: '10-07-2024'
    },
    endTime: {
        type: String,
        default: '10-07-2024'
    },
    signature: {
        type: String,
        default: 'Dr.Name'
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})
premedicationDrugSchema.plugin(premedicatonAutoIncrement, { inc_field: 'preDrugID' });
const PremedicationDrugModel = mongoose.model("PremedicationDrug", premedicationDrugSchema);


//  Schema and model for Chemo drug table
const chemoDrugSchema = new mongoose.Schema({
    chemoDrugID: {
        type: Number,
        require: true
    },
    drugType: {
        type: String,
        require: true
    },
    drugName: {
        type: String,
        require: true
    },
    doseRangeA: {
        type: Number,
        require: true
    },
    doseRangeB: {
        type: Number,
        require: true
    },
    dose: {
        type: Number,
        require: true
    },
    doseUnit: {
        type: String,
        require: true
    },
    dilution: {
        type: Number,
        require: true
    },
    dosePct: {
        type: Number,
        require: true
    },
    brandName: {
        type: String,
        require: true
    },
    route: {
        type: String,
        require: true
    },
    duration: {
        type: Number,
        require: true
    },
    details: {
        type: String,
        require: true
    },
    expiredDate: {
        type: String,
        default: '10-07-2024'
    },
    startTime: {
        type: String,
        default: '10-07-2024'
    },
    endTime: {
        type: String,
        default: '10-07-2024'
    },
    signature: {
        type: String,
        default: 'Dr.Name'
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },

})
chemoDrugSchema.plugin(chemoAutoIncrement, { inc_field: "chemoDrugID" })
const ChemotherapyDrugModel = mongoose.model("ChemoDrug", chemoDrugSchema);


//  Schema and model for take home drug table
const takeHomeDrugSchema = new mongoose.Schema({
    takeHomeDrugID: {
        type: Number,
        require: true,
    },
    drugType: {
        type: String,
        require: true
    },
    drugName: {
        type: String,
        require: true
    },
    brandName: {
        type: String,
        require: true
    },
    doseValue: {
        type: Number,
        require: true
    },
    unit: {
        type: String,
        require: true
    },
    duration: {
        type: Number,
        require: true
    },
    frequency: {
        type: String,
        require: true
    },
    details: {
        type: String,
        require: true
    },
    dispensed: {
        type: String,
        default: 'Null'
    },
    signature: {
        type: String,
        default: 'Dr.Name'
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})
takeHomeDrugSchema.plugin(takeHomeAutoIncrement, { inc_field: "takeHomeDrugID" })
const TakeHomeDrugModel = mongoose.model("TakeHomeDrug", takeHomeDrugSchema);

const RegimenSchema = new mongoose.Schema({
    preData: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PremedicationDrug' }],
    chemoData: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChemoDrug' }],
    takeHomeData: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TakeHomeDrug' }]
});


const MasterRecordsSchema = new mongoose.Schema({
    cancerType: { type: String, required: true },
    regimens: {
        type: Map,
        of: RegimenSchema
    }
});

const MasterRecordModel = mongoose.model('MasterRecord', MasterRecordsSchema);

// module export 
module.exports = {
    PatientsProfileModel, PremedicationDrugModel,
    ChemotherapyDrugModel, TakeHomeDrugModel,
    MasterRecordModel
};


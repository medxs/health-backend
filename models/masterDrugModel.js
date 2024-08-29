const mongoose = require("mongoose");

const CancerSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})
const RegimenSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    cancerId: {
        type: String,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})

const PremedicationSchema = new mongoose.Schema({
    preRefId: {
        type: String,
        require: true,
    },
    cancerId: {
        type: String,
        require: true,
    },
    regimenId: {
        type: String,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})

const ChemoTherapySchema = new mongoose.Schema({
    chemoRefId: {
        type: String,
        require: true,
    },
    cancerId: {
        type: String,
        require: true,
    },
    regimenId: {
        type: String,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },

})
const TakeHomeSchema = new mongoose.Schema({
    takeHomeRefId: {
        type: String,
        require: true,
    },
    cancerId: {
        type: String,
        require: true,
    },
    regimenId: {
        type: String,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },

})

const PremedicationSchemaModel = mongoose.model("PreMedicationRegimen", PremedicationSchema);
const ChemoTherapySchemaModel = mongoose.model("ChemoTherapyRegimen", ChemoTherapySchema);
const TakeHomeSchemaModel = mongoose.model("TakeHomeRegimen", TakeHomeSchema);
const RegimenSchemaModel = mongoose.model("RegimenList", RegimenSchema);
const CancerSchemaModel = mongoose.model("CancerList", CancerSchema);

module.exports = {
    PremedicationSchemaModel, ChemoTherapySchemaModel,
    TakeHomeSchemaModel, RegimenSchemaModel,
    CancerSchemaModel
};
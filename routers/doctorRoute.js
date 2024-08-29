const express = require('express');
const router = express.Router();

const { createPatientProfile, getSinglePremedicationRecord, getSingleChemoRecord, getSingleTakeHomeRecord, deletePremedicationRecord, deleteChemoRecord, deleteTakeHomeRecord, getSinglePatientRecord, deletePatientProfileDetailswithAllRecords, getPremedicationDrugRecords, getChemotherapyDrugRecords, getTakeHomeDrugRecords, getAllPremedicationDrugRecords, yetToStartTreatmentRecords, getTodayCasesTreatmentRecords, getPremedicationDrugRecordsForTreatmentForm, getChemotherapyDrugRecordsForTreatmentForm, getTakeHomeDrugRecordsForTreatmentForm } = require('../controller/doctorLogic/dashboardController');
const { PremedicationDrugItems } = require('../controller/doctorLogic/dashboardController');
const { ChemotherapyDrugItems } = require('../controller/doctorLogic/dashboardController')
const { TakeHomeDrugItems } = require('../controller/doctorLogic/dashboardController');

const { AllPatientsRecords } = require('../controller/doctorLogic/dashboardController');

const { getAllPremedicationRecords } = require('../controller/doctorLogic/dashboardController');
const { createMasterRecord, getPreMedicationList,
    getChemotherapyList, getTakeHomeList,
    getCancerList, getRegimenList,
    addNewPremedicationRecordIntoMasterRecord,
    deletePremedicationRecordFromMasterRecord,
    deleteChemotherapyRecordFromMasterRecord,
    addNewChemotherapyRecordIntoMasterRecord,
    addNewTakeHomeRecordIntoMasterRecord,
    deleteTakeHomeRecordFromMasterRecord
} = require('../controller/doctorLogic/MasterDrugController');
const { createTreatmentPremedicationRecord, getAllTreatmentRecords } = require('../controller/doctorLogic/treatmentController');
const { createPatientTreatmentAppointments, getSinglePatientTreatmentFormRecord, submitPatientMainTreatmentForm,
    fileUpload, getForUpdatePatientMainTreatmentForm, updatedSubmitPatientMainTreatmentForm, appointmentDataDeleteInTreatmentForm } = require('../controller/doctorLogic/patientTreatmentFormController');
const { getPatientDrugTreatmentViewRecord } = require('../controller/doctorLogic/viewPatientController');
const { authorizeRoles, isAuthenticatedUser } = require('../middlewares/authenticate');


router.route('/CreatePatientsProfile').post(isAuthenticatedUser, authorizeRoles("user"), createPatientProfile);


// get all patient Record from DB 
router.route('/allPatients').get(isAuthenticatedUser, authorizeRoles("user"), AllPatientsRecords)



// get Single Record from DB request
router.route('/allPatients/f1/:id').get(isAuthenticatedUser, authorizeRoles("user"), getSinglePatientRecord)

router.route('/pre/addDrug').post(isAuthenticatedUser, authorizeRoles("user"), PremedicationDrugItems)
router.route('/chemo/addDrug').post(isAuthenticatedUser, authorizeRoles("user"), ChemotherapyDrugItems)
router.route('/takehome/addDrug').post(isAuthenticatedUser, authorizeRoles("user"), TakeHomeDrugItems)

/* Master Record Routes */

router.route('/master-record/create').post(isAuthenticatedUser, authorizeRoles("user"), createMasterRecord)
router.route('/master-record/cancer-list').get(isAuthenticatedUser, authorizeRoles("user"), getCancerList)
router.route('/master-record/regimen-list').get(isAuthenticatedUser, authorizeRoles("user"), getRegimenList)


router.route('/master-record/premedication').get(isAuthenticatedUser, authorizeRoles("user"), getPreMedicationList)
router.route('/master-record/chemotherapy').get(isAuthenticatedUser, authorizeRoles("user"), getChemotherapyList)
router.route('/master-record/takehome').get(isAuthenticatedUser, authorizeRoles("user"), getTakeHomeList)

// get all data from DB in Add Drug page..
router.route('/allPatients/createdProfileRecord').get(isAuthenticatedUser, authorizeRoles("user"), yetToStartTreatmentRecords)
router.route('/allPatients/todayCasesProfileRecord').get(isAuthenticatedUser, authorizeRoles("user"), getTodayCasesTreatmentRecords)

// get 10 pre records
// router.route('/getAllData/allPremedicationRecord').get(getAllPremedicationDrugRecords)


// treatment Module add extra drug
router.route('/getAllData/premedication/treatmentPage').get(isAuthenticatedUser, authorizeRoles("user"), getPremedicationDrugRecordsForTreatmentForm)
router.route('/getAllData/chemotherapy/treatmentPage').get(isAuthenticatedUser, authorizeRoles("user"), getChemotherapyDrugRecordsForTreatmentForm)
router.route('/getAllData/takehome/treatmentPage').get(isAuthenticatedUser, authorizeRoles("user"), getTakeHomeDrugRecordsForTreatmentForm)





// get pre drug Data
router.route('/getAllData/premedication').get(isAuthenticatedUser, authorizeRoles("user"), getPremedicationDrugRecords)
router.route('/getAllData/chemotherapy').get(isAuthenticatedUser, authorizeRoles("user"), getChemotherapyDrugRecords)
router.route('/getAllData/takehome').get(isAuthenticatedUser, authorizeRoles("user"), getTakeHomeDrugRecords)


router.route('/getAllData/addDrug').get(isAuthenticatedUser, authorizeRoles("user"), getAllPremedicationRecords)
// router.route('/chemo/addDrug').get(getAllPremedicationRecords)
// router.route('/takeHome/addDrug').get(getAllPremedicationRecords)



// get single documents in premedication over here..
router.route('/pre/addDrug/:id').put(isAuthenticatedUser, authorizeRoles("user"), getSinglePremedicationRecord);
router.route('/chemo/addDrug/:id').put(isAuthenticatedUser, authorizeRoles("user"), getSingleChemoRecord);
router.route('/takehome/addDrug/:id').put(isAuthenticatedUser, authorizeRoles("user"), getSingleTakeHomeRecord);


// Delete the documents in DB
router.route('/pre/addDrug/:id').delete(isAuthenticatedUser, authorizeRoles("user"), deletePremedicationRecord)
router.route('/chemo/addDrug/:id').delete(isAuthenticatedUser, authorizeRoles("user"), deleteChemoRecord)
router.route('/takehome/addDrug/:id').delete(isAuthenticatedUser, authorizeRoles("user"), deleteTakeHomeRecord)

// ********************** Treatments Data Handle req and res while before submit ****************


//    Add the Pre Dataa
// router.route('/treatment/addPreDrug').post(createTreatmentPremedicationRecord)
// router.route('/treatment/getRecords').get(getAllTreatmentRecords)


// treatments form router
router.route('/treatment/f1').post(isAuthenticatedUser, authorizeRoles("user"), createPatientTreatmentAppointments);
router.route('/treatment/f1/f2/single/:id').get(isAuthenticatedUser, authorizeRoles("user"), getSinglePatientTreatmentFormRecord);


// insert main treatment form data
router.route('/maintreatment').post(isAuthenticatedUser, authorizeRoles("user"), submitPatientMainTreatmentForm);

// get main treatment form data
router.route('/maintreatment/get').get(isAuthenticatedUser, authorizeRoles("user"), getForUpdatePatientMainTreatmentForm);

// Updated main treatment form data
router.route('/maintreatment/edit').put(isAuthenticatedUser, authorizeRoles("user"), updatedSubmitPatientMainTreatmentForm);

router.route('/maintreatment/delete').delete(isAuthenticatedUser, authorizeRoles("user"), appointmentDataDeleteInTreatmentForm);


// view page , view patient drug treatment record details
router.route('/viewDetails/treatment/getRecord').get(isAuthenticatedUser, authorizeRoles("user"), getPatientDrugTreatmentViewRecord);
router.route('/patient/allDetails/deleteRecord').delete(isAuthenticatedUser, authorizeRoles("user"), deletePatientProfileDetailswithAllRecords)



// add extra new record into master records

// premedication drug only..
router.route('/master-record').post(isAuthenticatedUser, authorizeRoles("user"), addNewPremedicationRecordIntoMasterRecord);
router.route('/master-record').delete(isAuthenticatedUser, authorizeRoles("user"), deletePremedicationRecordFromMasterRecord);



// Chemotherapy drug only..
router.route('/master-record/chemo').post(isAuthenticatedUser, authorizeRoles("user"), addNewChemotherapyRecordIntoMasterRecord);
router.route('/master-record/chemo').delete(isAuthenticatedUser, authorizeRoles("user"), deleteChemotherapyRecordFromMasterRecord);



// Take Home drug only..
router.route('/master-record/takeHome').post(isAuthenticatedUser, authorizeRoles("user"), addNewTakeHomeRecordIntoMasterRecord);
router.route('/master-record/takeHome').delete(isAuthenticatedUser, authorizeRoles("user"), deleteTakeHomeRecordFromMasterRecord);


module.exports = router;







// model schema
const { PatientsProfileModel, PremedicationDrugModel, ChemotherapyDrugModel, TakeHomeDrugModel } = require('../../models/doctorModel');
const { PremedicationSchemaModel: PremedicationRegimenSchemaModel, ChemoTherapySchemaModel: ChemoTherapyRegimenSchemaModel, TakeHomeSchemaModel: TakeHomeRegimenSchemaModel } = require('../../models/masterDrugModel');
const { PatientTreatmentFormRecords, BloodReportUploadModel } = require('../../models/treatmentModel');


// create patients profile and logic
exports.createPatientProfile = async (req, res, next) => {
    try {
        const UHID_Exist = await PatientsProfileModel.findOne({ uhid: req.body.uhid });
        if (UHID_Exist) {
            return res.json({ message: `UHID already exist` })
        }
        const Email_Exist = await PatientsProfileModel.findOne({ email: req.body.email });
        if (Email_Exist) {
            return res.json({ message: `Email already exist` })
        }
        const MobileNO_Exist = await PatientsProfileModel.findOne({ mobileNo: req.body.mobileNo });
        if (MobileNO_Exist) {
            return res.json({ message: `Mobile NO already exist` })
        }

        let currentDate = new Date();
        let day = String(currentDate.getDate()).padStart(2, '0');
        let month = String(currentDate.getMonth() + 1).padStart(2, '0');
        let year = currentDate.getFullYear();
        let formattedDate = `${day}-${month}-${year}`;

        var patientProfile = new PatientsProfileModel({
            name: req.body.name,
            age: req.body.age,
            dateOfBirth: req.body.dateOfBirth,
            gender: req.body.gender,
            mobileNo: req.body.mobileNo,
            email: req.body.email,
            occupation: req.body.occupation,
            address: req.body.address,
            uhid: req.body.uhid,
            ip: req.body.ip,
            status: req.body.status,
            joinAt: formattedDate,
        })

        const data = await patientProfile.save();
        data.customId = 'PID' + data.patientsId.toString().padStart(3, '0');
        await data.save();

        res.json({ message: "Successfully Created Profile" })
    } catch (error) {
        res.status(400).json({ error: error.message })
        console.error('Error creating patient:', error);
    }
}


exports.deletePatientProfileDetailswithAllRecords = async (req, res, next) => {
    try {
        const { patient_id } = req.query;
        console.log("Test id:", patient_id);

        // Find the patient profile and delete it
        const firstTest = await PatientsProfileModel.findByIdAndDelete({ _id: patient_id });

        // Delete associated treatment form records
        const secTest = await PatientTreatmentFormRecords.deleteMany({ patientRef_id: patient_id });

        const test = await BloodReportUploadModel.deleteMany({ patientRef_id: patient_id });

        // Find records to return
        // const datasss = await PatientTreatmentFormRecords.find({ patientRef_id: patient_id });

        console.log("firstTest:", firstTest);
        console.log("secTest:", secTest);
        console.log("test:", test);

        res.status(200).json({ message: "Record Permanently Deleted Successfully" });

    } catch (error) {
        res.status(500).json({ message: error?.message });
    }
}


// Get All patients profile records and logic

exports.AllPatientsRecords = async (req, res, next) => {
    try {


        const { page = 1, per_page = 10, search = '' } = req.query;
        const skip = (page - 1) * per_page;
        const limit = parseInt(per_page);

        // Build a query to search patients based on the search term
        const query = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { customId: { $regex: search, $options: 'i' } },
            ]
        } : {};

        // Fetch patients with pagination and search
        const data = await PatientsProfileModel.find(query).skip(skip).limit(limit);
        const count = await PatientsProfileModel.countDocuments(query);

        res.status(200).json({ data: data, count: count });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};




exports.yetToStartTreatmentRecords = async (req, res, next) => {
    try {
        const { page = 1, per_page = 10, search = '' } = req.query;
        const skip = (page - 1) * per_page;
        const limit = parseInt(per_page);

        // Build a query to search patients based on the search term
        const query = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { customId: { $regex: search, $options: 'i' } },
            ]
        } : {};

        // Find all patientRefIds that are already in PatientTreatmentFormRecords
        const data = await PatientTreatmentFormRecords.find({}, { patientRef_id: 1, _id: 0 });
        const patientRefIds = data.map(patient => patient.patientRef_id);

        // Find profiles that are not in patientRefIds and match the search query
        const profileCreated = await PatientsProfileModel.find({
            _id: { $nin: patientRefIds },
            ...query
        })
            .skip(skip)
            .limit(limit);

        // Count the total number of profiles that match the search query
        const profileCreatedCounts = await PatientsProfileModel.countDocuments({
            _id: { $nin: patientRefIds },
            ...query
        });
        // console.log("profileCreated:", profileCreated);
        res.status(200).json({ profileCreated, profileCreatedCounts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTodayCasesTreatmentRecords = async (req, res) => {
    try {
        console.log("Tests...:", req.query);
        const { page = 1, per_page = 10, search = '' } = req.query;
        const skip = (page - 1) * per_page;
        const limit = parseInt(per_page);

        // Build a query to search patients based on the search term
        const query = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { customId: { $regex: search, $options: 'i' } },
            ]
        } : {};
        // Get today's date in the format 'YYYY/MM/DD'
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}/${month}/${day}`;

        // Find documents where appointmentDates.date matches today's date
        const results = await PatientTreatmentFormRecords.find(
            {
                cycleTestList: {
                    $elemMatch: {
                        appointmentDates: {
                            $elemMatch: {
                                date: formattedDate
                            }
                        }
                    }
                }
            },
            {
                patientRef_id: 1,
                _id: 0
            }
        );

        // Extract patientRef_id values from the results
        const patientRefIds = results.map(record => record.patientRef_id);

        const todayCasesProfile = await PatientsProfileModel.find({
            _id: { $in: patientRefIds },
            ...query
        })
            .skip(skip)
            .limit(limit);

        // Count the total number of profiles that match the search query
        const todayCasesProfileCounts = await PatientsProfileModel.countDocuments({
            _id: { $in: patientRefIds },
            ...query
        });
        res.status(200).json({ todayCasesProfile, todayCasesProfileCounts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// exports.AllPatientsRecords = async (req, res, next) => {


//     try {

//         const reqq = req.query;
//         console.log('Request:', reqq);
//         const data = await PatientsProfileModel.find();
//         const count = data.length;
//         // console.log('Count : ', count);
//         res.json({ data: data, count: count });
//     }
//     catch (error) {
//         console.log(error);
//         res.status(500).json({ message: error.message })
//     }
// }



//Get Single Records form  DB to handle the treatment form
exports.getSinglePatientRecord = async (req, res, next) => {
    try {
        const id = req.params.id
        console.log("Get Patient Records with id:", id);
        const getSingleData = await PatientsProfileModel.findOne({ _id: id })
        res.status(200).json(getSingleData);
    } catch (err) {
        console.log("Single request for DB Param iD:  -------: Error:", err);
        res.status(500).json({ message: err.message })
    }
}


// get all doc from premedicaiton , chemo, takehome table
exports.getAllPremedicationRecords = async (req, res, next) => {
    try {
        const preData = await PremedicationDrugModel.find();
        // console.log(preData);
        const chemoData = await ChemotherapyDrugModel.find();
        // console.log(chemoData);
        const takeHomeData = await TakeHomeDrugModel.find();
        // console.log(takeHomeData);
        res.status(200).json({ preData: preData, chemoData: chemoData, takeHomeData: takeHomeData });
        // res.json()
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}


// get first 10 records in pre
exports.getAllPremedicationDrugRecords = async (req, res, next) => {
    try {
        const data = await PremedicationDrugModel.find().limit(10);
        const premedicationDrugCount = await PremedicationDrugModel.countDocuments();
        res.status(200).json({
            data: data,
            count: premedicationDrugCount
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};



// get all records data for treatment page , add extra records
exports.getPremedicationDrugRecordsForTreatmentForm = async (req, res, next) => {
    try {
        const data = await PremedicationDrugModel.find()
        const premedicationDrugCount = await PremedicationDrugModel.countDocuments();
        res.status(200).json({ data: data, count: premedicationDrugCount });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}


// get all records data for treatment Page , that use for adding extra data
exports.getChemotherapyDrugRecordsForTreatmentForm = async (req, res, next) => {
    try {
        const data = await ChemotherapyDrugModel.find();
        const chemotherapyDrugCount = await ChemotherapyDrugModel.countDocuments();
        res.status(200).json({ data: data, count: chemotherapyDrugCount });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}



// get all records data for treatment Page , that use for adding extra data
exports.getTakeHomeDrugRecordsForTreatmentForm = async (req, res, next) => {
    try {
        const data = await TakeHomeDrugModel.find()
        const takeHomeDrugCount = await TakeHomeDrugModel.countDocuments();
        res.status(200).json({ data: data, count: takeHomeDrugCount });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}


exports.getPremedicationDrugRecords = async (req, res, next) => {
    try {
        console.log("Pre Request and Response:", req.query);

        const { page = 1, per_page = 5, search = '' } = req.query;
        const skip = (page - 1) * per_page;
        const limit = parseInt(per_page);

        // Build a query to search patients based on the search term
        const query = search ? {
            $or: [
                { drugName: { $regex: search, $options: 'i' } },
                { brandName: { $regex: search, $options: 'i' } },
            ]
        } : {};

        // Fetch patients with pagination and search
        const data = await PremedicationDrugModel.find(query).skip(skip).limit(limit);
        const premedicationDrugCount = await PremedicationDrugModel.countDocuments(query);

        // console.log("PremedicationDrugModel data:", data);
        res.status(200).json({ data: data, count: premedicationDrugCount });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}





exports.getChemotherapyDrugRecords = async (req, res, next) => {
    try {
        console.log("Chemo Request and Response:", req.query);

        const { page = 1, per_page = 5, search = '' } = req.query;
        const skip = (page - 1) * per_page;
        const limit = parseInt(per_page);
        // Build a query to search patients based on the search term
        const query = search ? {
            $or: [
                { drugName: { $regex: search, $options: 'i' } },
                { brandName: { $regex: search, $options: 'i' } },
            ]
        } : {};
        // Fetch patients with pagination and search
        const data = await ChemotherapyDrugModel.find(query).skip(skip).limit(limit);
        const chemotherapyDrugCount = await ChemotherapyDrugModel.countDocuments(query);
        // console.log("ChemotherapyDrugModel data:", data);
        res.status(200).json({ data: data, count: chemotherapyDrugCount });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}


exports.getTakeHomeDrugRecords = async (req, res, next) => {
    try {
        console.log("Take home Request and Response:", req.query);

        const { page = 1, per_page = 10, search = '' } = req.query;
        const skip = (page - 1) * per_page;
        const limit = parseInt(per_page);

        // Build a query to search patients based on the search term
        const query = search ? {
            $or: [
                { drugName: { $regex: search, $options: 'i' } },
                { brandName: { $regex: search, $options: 'i' } },
            ]
        } : {};

        // Fetch patients with pagination and search
        const data = await TakeHomeDrugModel.find(query).skip(skip).limit(limit);
        const takeHomeDrugCount = await TakeHomeDrugModel.countDocuments(query);

        // console.log("getTakeHomeDrugRecords data:",data);
        res.status(200).json({ data: data, count: takeHomeDrugCount });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}



// create Premedication Drug documents and logic
exports.PremedicationDrugItems = async (req, res, next) => {
    try {
        const drugNameExist = await PremedicationDrugModel.findOne({ drugName: req.body.drugName, brandName: req.body.brandName });
        if (drugNameExist) {
            return res.json({ message: `This Drug Item Already Exist in premedication Table...` })
        }
        var premedicationDrug = new PremedicationDrugModel({
            drugType: req.body.drugType,
            drugName: req.body.drugName,
            brandName: req.body.brandName,
            doseValue: req.body.doseValue,
            unit: req.body.unit,
            duration: req.body.duration,
            frequency: req.body.frequency,
            details: req.body.details,
        })
        const data = await premedicationDrug.save();
        res.status(200).json({ message: "Successfully added!!" })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }

}

// create Chemo Drug documents  and logic
exports.ChemotherapyDrugItems = async (req, res, next) => {
    try {
        const drugNameExist = await ChemotherapyDrugModel.findOne({ drugName: req.body.drugName, brandName: req.body.brandName });
        if (drugNameExist) {
            return res.json({ message: `This Drug Item  Already Exist in Chemotherapy Table...` })
        }
        var chemoDrug = new ChemotherapyDrugModel({
            drugType: req.body.drugType,
            drugName: req.body.drugName,
            doseRangeA: req.body.doseRangeA,
            doseRangeB: req.body.doseRangeB,
            dose: req.body.doseRangeA,
            doseUnit: req.body.doseUnit,
            dilution: req.body.dilution,
            dosePct: req.body.dosePct,
            brandName: req.body.brandName,
            route: req.body.route,
            duration: req.body.duration,
            details: req.body.details,
        })
        const data = await chemoDrug.save();
        console.log('Chemo Details:', data);
        res.status(200).json({ message: "Successfully added!!" })
    }
    catch (error) {
        res.status(400).json({ message: error.message })
        console.error('Error creating Chemo In :', error);
    }
}

// create Take Home drug documents and logic
exports.TakeHomeDrugItems = async (req, res, next) => {
    try {
        const drugNameExist = await TakeHomeDrugModel.findOne({ drugName: req.body.drugName, brandName: req.body.brandName });
        if (drugNameExist) {
            return res.json({ message: `This Drug Item  Already Exist in Take Home Table..` })
        }
        var takeHomeDrug = new TakeHomeDrugModel({
            drugType: req.body.drugType,
            drugName: req.body.drugName,
            brandName: req.body.brandName,
            doseValue: req.body.doseValue,
            unit: req.body.unit,
            duration: req.body.duration,
            frequency: req.body.frequency,
            details: req.body.details
        })
        const data = await takeHomeDrug.save();
        res.status(200).json({ message: "Successfully added!!" })

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}



// get single doc from premedicaiton table
exports.getSinglePremedicationRecord = async (req, res, next) => {
    try {
        const id = req.params.id
        const {
            drugType,
            drugName,
            brandName,
            doseValue,
            unit,
            duration,
            frequency,
            details
        } = req.body;

        const drugNameExist = await PremedicationDrugModel.findOne({ drugName: req.body.drugName, brandName: req.body.brandName });
        if (drugNameExist) {
            return res.status(200).json({ message: `This Drug Item Already Exist in premedication Table` })
        }

        // console.log(findId);
        const data = await PremedicationDrugModel.findByIdAndUpdate(
            id,
            {
                drugType,
                drugName,
                brandName,
                doseValue,
                unit,
                duration,
                frequency,
                details
            }, { new: true })
        res.status(200).json({ message: "Updated Sucessfully !!! " })
    }
    catch (error) {
        res.status(400).json({ error: error?.message })
    }

}

// get single doc from chemo table
exports.getSingleChemoRecord = async (req, res, next) => {
    const id = req.params.id;

    try {
        const id = req.params.id
        const {
            drugType,
            drugName,
            doseRangeA,
            doseRangeB,
            doseUnit,
            dilution,
            dosePct,
            brandName,
            route,
            duration,
            details
        } = req.body;

        const drugNameExist = await ChemotherapyDrugModel.findOne({ drugName: req.body.drugName, brandName: req.body.brandName });
        if (drugNameExist) {
            return res.status(200).json({ message: `This Drug Item Already Exist in Chemotherapy Table.....` })
        }

        const data = await ChemotherapyDrugModel.findByIdAndUpdate(
            id,
            {
                drugType,
                drugName,
                doseRangeA,
                doseRangeB,
                doseUnit,
                dilution,
                dosePct,
                brandName,
                route,
                duration,
                details
            }, { new: true })

        res.status(200).json({ message: "Updated Sucessfully !!!" });
    }
    catch (error) {
        res.status(500).json({ message: error?.message })
    }
}

// get single doc from take home table
exports.getSingleTakeHomeRecord = async (req, res, next) => {
    const id = req.params.id;
    try {
        const id = req.params.id
        const {
            drugType,
            drugName,
            brandName,
            doseValue,
            unit,
            duration,
            frequency,
            details
        } = req.body;

        const drugNameExist = await TakeHomeDrugModel.findOne({ drugName: req.body.drugName, brandName: req.body.brandName });
        if (drugNameExist) {
            return res.status(200).json({ message: `Drug Name Already Exist in take home Table` })
        }

        const data = await TakeHomeDrugModel.findByIdAndUpdate(
            id,
            {
                drugType,
                drugName,
                brandName,
                doseValue,
                unit,
                duration,
                frequency,
                details
            }, { new: true })

        console.log(data);
        res.status(200).json({ message: "Updated Sucessfully !!!" })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}


exports.deletePremedicationRecord = async (req, res, next) => {

    try {
        const id = req.params.id;

        // console.log("Test Pre Id:", id);

        const deleteRecord = await PremedicationDrugModel.findByIdAndDelete(id);

        await PremedicationRegimenSchemaModel.deleteMany({ preRefId: id })

        res.status(200).json({ message: `Deleted successfully` });
    } catch (error) {
        console.log("Delete Error:", error);
        res.status(500).json({ message: error.message })
    }
}

exports.deleteChemoRecord = async (req, res, next) => {
    try {

        const id = req.params.id;

        await ChemoTherapyRegimenSchemaModel.deleteMany({ chemoRefId: id })

        const deleteRecord = await ChemotherapyDrugModel.findByIdAndDelete(id)

        res.status(200).json({ message: `Deleted Sucessfully` });

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


exports.deleteTakeHomeRecord = async (req, res, next) => {
    try {
        const id = req.params.id;

        await TakeHomeRegimenSchemaModel.deleteMany({ takeHomeRefId: id })

        const deleteRecord = await TakeHomeDrugModel.findByIdAndDelete(id)

        res.status(200).json({ message: `Deleted Sucessfully` });

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
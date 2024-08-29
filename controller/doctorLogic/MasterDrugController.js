const { PremedicationDrugModel, ChemotherapyDrugModel, TakeHomeDrugModel } = require("../../models/doctorModel")
const { CancerSchemaModel, RegimenSchemaModel, PremedicationSchemaModel, ChemoTherapySchemaModel, TakeHomeSchemaModel } = require("../../models/masterDrugModel")

exports.createMasterRecord = async (req, res, next) => {
    const { preRefIds, chemoRefIds, takeHomeRefIds, cancerInputData, regimenInputData } = req.body



    try {

        const cancerExist = await CancerSchemaModel.findOne({ name: cancerInputData });
        const cancerId = cancerExist._id;

        // already have cancer now we are add New regimen over here......... Start
        if (cancerExist) {
            // console.log("Inside come start");
            const regimenExist = await RegimenSchemaModel.findOne({ cancerId: cancerId, name: regimenInputData });
            if (regimenExist) {
                //start
                return res.status(200).json({ message: `Regimen is already exist in this Cancer !!` })
            }

            const regimenData = await RegimenSchemaModel.create({ name: regimenInputData, cancerId: cancerExist._id })
            console.log("regimenData In:", regimenData);
            if (!regimenData) {
                return res.status(400).json({ message: `Error creating record` })
            }

            const premedicationsData = preRefIds.map(async (preRefId) => {
                const premedicationData = await PremedicationSchemaModel.create({
                    preRefId,
                    cancerId: cancerExist._id,
                    regimenId: regimenData._id,
                })
                return premedicationData;
            })
            if (premedicationsData.length === 0) {
                return res.status(400).json({ message: `Error creating record` })
            }

            const chemotherapyDatas = chemoRefIds.map(async (chemoRefId) => {
                const chemotherapyData = await ChemoTherapySchemaModel.create({
                    chemoRefId,
                    cancerId: cancerExist._id,
                    regimenId: regimenData._id
                })
                return chemotherapyData;
            })
            if (chemotherapyDatas.length === 0) {
                return res.status(400).json({ message: `Error creating record` })
            }


            const takeHomeDatas = takeHomeRefIds.map(async (takeHomeRefId) => {
                const takeHomeData = await TakeHomeSchemaModel.create({
                    takeHomeRefId,
                    cancerId: cancerExist._id,
                    regimenId: regimenData._id
                })
                return takeHomeData;
            })
            if (takeHomeDatas.length === 0) {
                return res.json({ message: `Error creating record` })
            }

            res.json({ message: "ReCreated Sucessfully !!! " })
            // already have cancer now we are add New regimen over here......... end

        } else {


            const cancerData = await CancerSchemaModel.create({ name: cancerInputData })
            if (!cancerData) {
                return res.json({ message: `Error creating record` })
            }

            // Otherwise create new cancer and new regimen here......
            const regimenData = await RegimenSchemaModel.create({ name: regimenInputData, cancerId: cancerData._id })
            console.log("regimenData:", regimenData);
            if (!regimenData) {
                return res.json({ message: `Error creating record` })
            }


            const premedicationsData = preRefIds.map(async (preRefId) => {
                const premedicationData = await PremedicationSchemaModel.create({
                    preRefId,
                    cancerId: cancerData._id,
                    regimenId: regimenData._id,
                })
                return premedicationData;
            })
            if (premedicationsData.length === 0) {
                return res.json({ message: `Error creating record` })
            }


            const chemotherapyDatas = chemoRefIds.map(async (chemoRefId) => {
                const chemotherapyData = await ChemoTherapySchemaModel.create({
                    chemoRefId,
                    cancerId: cancerData._id,
                    regimenId: regimenData._id
                })
                return chemotherapyData;
            })
            if (chemotherapyDatas.length === 0) {
                return res.json({ message: `Error creating record` })
            }


            const takeHomeDatas = takeHomeRefIds.map(async (takeHomeRefId) => {
                const takeHomeData = await TakeHomeSchemaModel.create({
                    takeHomeRefId,
                    cancerId: cancerData._id,
                    regimenId: regimenData._id
                })
                return takeHomeData;
            })
            if (takeHomeDatas.length === 0) {
                return res.json({ message: `Error creating record` })
            }
            res.json({ message: "New Record Created Sucessfully !!! " })
        }


    }
    catch (error) {
        res.status(400).json({ message: error.message })
        console.error('Error Master Records:', error);
    }
}

/* Data get requests */

exports.getCancerList = async (req, res, next) => {
    const cancerData = await CancerSchemaModel.find()
    const regimenData = await RegimenSchemaModel.find()
    res.json({ cancerData, regimenData })
}

exports.getRegimenList = async (req, res, next) => {
    const { cancerId } = req.query;
    const regimenData = await RegimenSchemaModel.find({ cancerId })
    res.json({
        regimenData
    })
}

exports.getPreMedicationList = async (req, res, next) => {
    const { cancerId, regimenId } = req.query;
    const preMedicationRegimenData = await PremedicationSchemaModel.find({ cancerId, regimenId });

    const preMedicationData = await Promise.all(
        preMedicationRegimenData.map(async (data) => {
            return await PremedicationDrugModel.findOne({ _id: data.preRefId });
        })
    );
    res.json({
        preMedicationData
    })
}

exports.getChemotherapyList = async (req, res, next) => {
    const { cancerId, regimenId } = req.query;
    const chemotherapyRegimenData = await ChemoTherapySchemaModel.find({ cancerId, regimenId });

    const chemotherapyData = await Promise.all(
        chemotherapyRegimenData.map(async (data) => {
            return await ChemotherapyDrugModel.findOne({ _id: data.chemoRefId });
        })
    );
    res.json({
        chemotherapyData
    })
}

exports.getTakeHomeList = async (req, res, next) => {
    const { cancerId, regimenId } = req.query;
    const takeHomeRegimenData = await TakeHomeSchemaModel.find({ cancerId, regimenId });

    const takeHomeData = await Promise.all(
        takeHomeRegimenData.map(async (data) => {
            return await TakeHomeDrugModel.findOne({ _id: data.takeHomeRefId });
        })
    );
    res.json({ takeHomeData })
}


// ------  added extra drug into master page  -----------

exports.addNewPremedicationRecordIntoMasterRecord = async (req, res, next) => {
    try {
        const { cancerId, regimenId, preRefId } = req.query; // Assuming data is sent in the request body

        // Validate input
        if (!cancerId || !regimenId || !preRefId) {
            return res.status(400).json({ message: "Invalid input" });
        }

        // Convert comma-separated string to array
        const preRefIdArray = preRefId.split(',').map(id => id.trim());

        // Iterate over the preRefId array and create records
        const recordsToSave = preRefIdArray.map(id => ({
            cancerId,
            regimenId,
            preRefId: id
        }));

        // Check for existing records and save new records
        for (const record of recordsToSave) {
            const existingRecord = await PremedicationSchemaModel.findOne({
                cancerId: record.cancerId,
                regimenId: record.regimenId,
                preRefId: record.preRefId
            });

            if (!existingRecord) {
                await new PremedicationSchemaModel(record).save();
            }
        }
        res.status(201).json({ message: "Records added successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


exports.addNewChemotherapyRecordIntoMasterRecord = async (req, res, next) => {
    try {
        const { cancerId, regimenId, chemoRefId } = req.query; // Extract data from query parameters

        console.log("Request Here:", req.query);

        // Validate input
        if (!cancerId || !regimenId || !chemoRefId) {
            return res.status(400).json({ message: "Invalid input" });
        }

        // Convert comma-separated string to array
        const chemoRefIdArray = chemoRefId.split(',').map(id => id.trim());
        console.log("chemoRefIdArray:", chemoRefIdArray);

        // Iterate over the chemoRefId array and create records
        const recordsToSave = chemoRefIdArray.map(id => ({
            cancerId,
            regimenId,
            chemoRefId: id
        }));

        // Check for existing records and save new records
        for (const record of recordsToSave) {
            const existingRecord = await ChemoTherapySchemaModel.findOne({
                cancerId: record.cancerId,
                regimenId: record.regimenId,
                chemoRefId: record.chemoRefId
            });

            if (!existingRecord) {
                await new ChemoTherapySchemaModel(record).save();
            }
            console.log("existingRecord:", existingRecord);
        }

        res.status(201).json({ message: "Records added successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


exports.addNewTakeHomeRecordIntoMasterRecord = async (req, res, next) => {
    try {
        const { cancerId, regimenId, takeHomeRefId } = req.query; // Extract data from query parameters

        console.log("Request Here:", req.query);

        // Validate input
        if (!cancerId || !regimenId || !takeHomeRefId) {
            return res.status(400).json({ message: "Invalid input" });
        }

        // Convert comma-separated string to array
        const takeHomeRefIdArray = takeHomeRefId.split(',').map(id => id.trim());
        console.log("takeHomeRefIdArray:", takeHomeRefIdArray);

        // Iterate over the takeHomeRefId array and create records
        const recordsToSave = takeHomeRefIdArray.map(id => ({
            cancerId,
            regimenId,
            takeHomeRefId: id
        }));

        // Check for existing records and save new records
        for (const record of recordsToSave) {
            const existingRecord = await TakeHomeSchemaModel.findOne({
                cancerId: record.cancerId,
                regimenId: record.regimenId,
                takeHomeRefId: record.takeHomeRefId
            });

            if (!existingRecord) {
                await new TakeHomeSchemaModel(record).save();
            }
            console.log("existingRecord:", existingRecord);
        }

        res.status(201).json({ message: "Records added successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}



// ************************* Delete opration in master page *********************************
exports.deletePremedicationRecordFromMasterRecord = async (req, res, next) => {
    try {
        const { cancerId, regimenId, preRefId } = req.query;

        console.log("Request query:", req.query);

        // Validate input
        if (!cancerId || !regimenId || !preRefId) {
            return res.status(400).json({ message: "Invalid input" });
        }

        // Find and delete the document
        const result = await PremedicationSchemaModel.findOneAndDelete({ cancerId, regimenId, preRefId }).exec();

        if (!result) {
            return res.status(404).json({ message: "Record not found" });
        }

        res.status(200).json({ message: "Deleted Successfully" });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
}


exports.deleteChemotherapyRecordFromMasterRecord = async (req, res, next) => {
    try {
        const { cancerId, regimenId, chemoRefId } = req.query;

        // Validate input
        if (!cancerId || !regimenId || !chemoRefId) {
            return res.status(400).json({ message: "Invalid input" });
        }

        // Find and delete the document
        const result = await ChemoTherapySchemaModel.findOneAndDelete({ cancerId, regimenId, chemoRefId }).exec();

        if (!result) {
            return res.status(404).json({ message: "Record not found" });
        }

        res.status(200).json({ message: "Deleted Successfully" });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: error.message });
    }
}


exports.deleteTakeHomeRecordFromMasterRecord = async (req, res, next) => {
    try {
        const { cancerId, regimenId, takeHomeRefId } = req.query;

        // Validate input
        if (!cancerId || !regimenId || !takeHomeRefId) {
            return res.status(400).json({ message: "Invalid input" });
        }

        // Find and delete the document
        const result = await TakeHomeSchemaModel.findOneAndDelete({ cancerId, regimenId, takeHomeRefId }).exec();

        if (!result) {
            return res.status(404).json({ message: "Record not found" });
        }

        res.status(200).json({ message: "Deleted Successfully" });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: error.message });
    }
}




// http://localhost:5000/master-record
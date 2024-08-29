const { PatientTreatmentFormRecords } = require("../../models/treatmentModel");

exports.createPatientTreatmentAppointments = async (req, res, next) => {

    // const getSingleCycleTestData = await PatientTreatmentFormRecords.find();
    // console.log("createPatientTreatmentAppointments:", getSingleCycleTestData);

    console.log("createPatientTreatmentAppointments:", req.body);
    const { patientRef_id, ref, dates } = req.body;
    if (!patientRef_id || !ref || !dates) {
        return res.status(400).json({
            message: "Missing required fields: patientRef_id, ref, or dates",
            status: "Error"
        });
    }

    const cycleTestName = ref;

    // Convert date strings to Date objects (or keep as strings if that's the expected format)
    const newDates = dates.map(dateStr => ({ date: dateStr }));

    try {
        // Find the existing patient record
        let patientRecord = await PatientTreatmentFormRecords.findOne({ patientRef_id: patientRef_id });

        if (!patientRecord) {
            // If patient record does not exist, create a new one
            patientRecord = new PatientTreatmentFormRecords({
                patientRef_id: patientRef_id,
                cycleTestList: [{
                    cycleTestName: cycleTestName,
                    appointmentDates: newDates
                }]
            });

            await patientRecord.save();
            res.status(201).json({ message: "Created first Cycle test successfully....!!!" });
        } else {
            // If patient record exists, update it with new cycle test or dates
            // Check if cycleTestName already exists in cycleTestList
            const existingCycleTest = patientRecord.cycleTestList.find(test => test.cycleTestName === cycleTestName);


            if (existingCycleTest) {
                // Update existing cycleTest with new dates
                existingCycleTest.appointmentDates = [...existingCycleTest.appointmentDates, ...newDates];

                await patientRecord.save();
                res.status(200).json({ message: `Added New Date into ${cycleTestName} successfully...!!` });
            } else {
                // Add new cycleTest with dates
                patientRecord.cycleTestList.push({
                    cycleTestName: cycleTestName,
                    appointmentDates: newDates
                });
                await patientRecord.save();
                res.status(200).json({ message: "Added New cycle test successfully." });
            }
        }
    } catch (saveError) {
        // Handle save errors
        res.status(500).json({ message: saveError, status: "Error" });
    }
};


exports.getSinglePatientTreatmentFormRecord = async (req, res, next) => {
    try {
        const id = req.params.id;
        const getSingleCycleTestData = await PatientTreatmentFormRecords.findOne({ patientRef_id: id });
        res.json({ singleData: getSingleCycleTestData });
    } catch (err) {
        console.log("Single request for DB Param iD: Error:", err);
        res.status(500).json({ message: err.message, singleData: [] })
    }
}




// get data for update main treatment form 
exports.getForUpdatePatientMainTreatmentForm = async (req, res, next) => {
    try {
        const { patient_id, cycleName, date } = req.query;

        const patientRef_id = patient_id;
        const cycleTestName = cycleName;

        // console.log("patientRef_id:", patientRef_id);
        // console.log("cycleTestName:", cycleTestName);
        // console.log("date:", date);

        let patientTreatmentData = await PatientTreatmentFormRecords.findOne(
            {
                patientRef_id: patientRef_id,
                "cycleTestList.cycleTestName": cycleTestName,
                "cycleTestList.appointmentDates.date": date
            },
            {
                "cycleTestList.$": 1 // This includes the matched cycleTestName in the result
            }
        );

        if (patientTreatmentData && patientTreatmentData.cycleTestList.length > 0) {
            // Filter the appointmentDates array to get the exact date match
            const appointmentData = patientTreatmentData.cycleTestList[0].appointmentDates.find(appt => appt.date === date);

            if (appointmentData) {
                res.status(200).json({
                    data: {
                        generalInfo: appointmentData.generalInfo,
                        premedicationItems: appointmentData.premedicationItems,
                        chemotherapyItems: appointmentData.chemotherapyItems,
                        takeHomeItems: appointmentData.takeHomeItems
                    },
                    message: "Got it Successfully...!!!"
                });
            } else {
                res.status(404).json({ message: "Appointment date not found." });
            }
        } else {
            res.status(404).json({ message: "Cycle test not found." });
        }
        // res.status(404).json({ data: req.query });
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: error?.message });
    }
};


//submit new patient treatment form
exports.submitPatientMainTreatmentForm = async (req, res, next) => {
    try {
        // console.log("Response:", req.body);

        const { patientRef_id, cycleTestName, updatedDate, geneInfo, preSubmitData, chemoSubmitData, takehomeSubmitData } = req.body;

        // Find the patient by patientRef_id
        let patientTreatmentData = await PatientTreatmentFormRecords.findOne({ patientRef_id });

        // console.log("First, Find patient:", patientTreatmentData);
        if (!patientTreatmentData) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Find the specific cycle test index
        const cycleTestIndex = patientTreatmentData.cycleTestList.findIndex(test => test.cycleTestName === cycleTestName);
        console.log("Second, Find specific cycle test index:", cycleTestIndex);

        if (cycleTestIndex === -1) {
            return res.status(404).json({ message: "Cycle Test not found" });
        }

        // Find the specific appointment date index
        const appointmentDateIndex = patientTreatmentData.cycleTestList[cycleTestIndex].appointmentDates.findIndex(date => date.date === updatedDate);

        if (appointmentDateIndex === -1) {
            return res.status(404).json({ message: "Appointment date not found" });
        }

        // Build the update query dynamically
        let updateQuery = {
            $set: {
                [`cycleTestList.${cycleTestIndex}.appointmentDates.${appointmentDateIndex}.generalInfo`]: geneInfo
            }
        };

        // Add to premedicationItems if provided
        if (preSubmitData && preSubmitData.length > 0) {
            updateQuery.$addToSet = {
                [`cycleTestList.${cycleTestIndex}.appointmentDates.${appointmentDateIndex}.premedicationItems`]: { $each: preSubmitData }
            };
        }

        // Add to chemotherapyItems if provided
        if (chemoSubmitData && chemoSubmitData.length > 0) {
            if (!updateQuery.$addToSet) updateQuery.$addToSet = {};
            updateQuery.$addToSet[`cycleTestList.${cycleTestIndex}.appointmentDates.${appointmentDateIndex}.chemotherapyItems`] = { $each: chemoSubmitData };
        }

        // Add to takeHomeItems if provided
        if (takehomeSubmitData && takehomeSubmitData.length > 0) {
            if (!updateQuery.$addToSet) updateQuery.$addToSet = {};
            updateQuery.$addToSet[`cycleTestList.${cycleTestIndex}.appointmentDates.${appointmentDateIndex}.takeHomeItems`] = { $each: takehomeSubmitData };
        }

        // Update the document
        patientTreatmentData = await PatientTreatmentFormRecords.findOneAndUpdate(
            { patientRef_id },
            updateQuery,
            { new: true } // Return the updated document
        );

        res.status(200).json({ message: "Submitted Successfully...!!!" });
    } catch (error) {
        // Handle save errors
        res.status(500).json({ message: error?.message });
    }
};



//submit updated patient treatment form
exports.updatedSubmitPatientMainTreatmentForm = async (req, res, next) => {
    try {
        const { patientRef_id, cycleTestName, updatedDate, geneInfo, preSubmitData, chemoSubmitData, takehomeSubmitData } = req.body;


        console.log("Test Query:", req.body);
        console.log("Test Query patientRef_id:", patientRef_id);
        console.log("Test Query cycleTestName:", cycleTestName);
        console.log("Test Query updatedDate:", updatedDate);

        // Find the patient by patientRef_id
        let patientTreatmentData = await PatientTreatmentFormRecords.findOne({ patientRef_id });

        if (!patientTreatmentData) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Find the specific cycle test index
        const cycleTestIndex = patientTreatmentData.cycleTestList.findIndex(test => test.cycleTestName === cycleTestName);

        if (cycleTestIndex === -1) {
            return res.status(404).json({ message: "Cycle Test not found" });
        }

        // Find the specific appointment date index
        const appointmentDateIndex = patientTreatmentData.cycleTestList[cycleTestIndex].appointmentDates.findIndex(date => date.date === updatedDate);

        if (appointmentDateIndex === -1) {
            return res.status(404).json({ message: "Appointment date not found" });
        }

        // Build the update query to replace previous values
        let updateQuery = {
            $set: {
                [`cycleTestList.${cycleTestIndex}.appointmentDates.${appointmentDateIndex}.generalInfo`]: geneInfo,
                [`cycleTestList.${cycleTestIndex}.appointmentDates.${appointmentDateIndex}.premedicationItems`]: preSubmitData || [],
                [`cycleTestList.${cycleTestIndex}.appointmentDates.${appointmentDateIndex}.chemotherapyItems`]: chemoSubmitData || [],
                [`cycleTestList.${cycleTestIndex}.appointmentDates.${appointmentDateIndex}.takeHomeItems`]: takehomeSubmitData || []
            }
        };

        // Update the document
        patientTreatmentData = await PatientTreatmentFormRecords.findOneAndUpdate(
            { patientRef_id },
            updateQuery,
            { new: true } // Return the updated document
        );

        res.status(200).json({ message: "Patient Details Updated Successfully...!" });
    } catch (error) {
        // Handle save errors
        res.status(500).json({ message: error?.message });
    }
};



exports.appointmentDataDeleteInTreatmentForm = async (req, res, next) => {
    try {
        const { patientRef_id, cycleTestName, appointmentDate } = req.query; // Extract data from the request query

        console.log("patientRef_id, cycleTestName, appointmentDate:", patientRef_id, cycleTestName, appointmentDate);

        // Find the patient and the specific cycle test, then remove the appointment date  
        const result = await PatientTreatmentFormRecords.updateOne(
            {
                patientRef_id,
                'cycleTestList.cycleTestName': cycleTestName
            },
            {
                $pull: {
                    'cycleTestList.$.appointmentDates': { date: appointmentDate }
                }
            }
        );

        console.log("result :", result);
        console.log("result.nModified :", result.modifiedCount);

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Appointment date not found or already deleted' });
        }
        res.status(200).json({ message: 'Appointment date deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error?.message });
    }
};



// exports.appointmentDataDeleteInTreatmentForm = async (req, res, next) => {
//     try {
//         const { patientRef_id, cycleTestName, appointmentDate } = req.query; // Extract data from the request body


//         console.log("patientRef_id, cycleTestName, appointmentDate:", patientRef_id, cycleTestName, appointmentDate);

//         // // Perform the delete operation
//         const result = await PatientTreatmentFormRecords.updateOne(
//             {
//                 patientRef_id: patientRef_id,
//                 "cycleTestList.cycleTestName": cycleTestName
//             },
//             {
//                 $pull: {
//                     "cycleTestList.$.appointmentDates": { date: appointmentDate }
//                 }
//             }
//         );

//         if (result.nModified > 0) {
//             res.status(200).json({ message: "Deleted Successfully...! " });
//         } else {
//             res.status(200).json({ message: "Deleted Successfully...!!!!" });
//         }
//     } catch (error) {
//         // Handle save errors
//         res.status(500).json({ message: error?.message });
//     }
// };













exports.fileUpload = async (req, res, next) => {
    try {
        console.log("req :", req.query);
        res.status(200).json({ message: "Submitted Successfully...!!!" });
    } catch (error) {
        // Handle save errors
        res.status(500).json({ message: error?.message });
    }
};

const { PatientTreatmentFormRecords } = require("../../models/treatmentModel");
exports.getPatientDrugTreatmentViewRecord = async (req, res, next) => {
    try {
        const { patient_id, cycleTestName, date } = req.query;
        console.log("Get Req :", req.query);

        // Fetch the patient record based on patient_id
        const findRecord = await PatientTreatmentFormRecords.findOne({ patientRef_id: patient_id });
        if (!findRecord) {
            return res.status(404).json({ message: "Record not found" });
        }

        // Find the cycleTestList that matches the cycleTestName
        const findCycleTestName = findRecord.cycleTestList.find(cycle => cycle.cycleTestName === cycleTestName);
        if (!findCycleTestName) {
            return res.status(404).json({ message: "Cycle test name not found" });
        }

        // Find the appointment date that matches the provided date
        const findAppointmentDate = findCycleTestName.appointmentDates.find(appointment => appointment.date === date);
        if (!findAppointmentDate) {
            return res.status(404).json({ message: "Appointment date not found" });
        }
        // Return the found appointment date
        res.status(200).json({ findAppointmentDate });
    }
    catch (error) {
        res.status(500).json({ ErrorMessage: error });
    }
};


// const { PremedicationDrugModel } = require("../../models/doctorModel");
const  {TreatmentPageModel}  = require("../../models/treatmentModel");


exports.createTreatmentPremedicationRecord = async (req, res, next) => {


    try {
        preTreatmentData = req.body;

        const treatmentPage = new TreatmentPageModel.create({ preTreatmentData });
        const preTreatmentDataLength = treatmentPage.preTreatmentData.length;
        console.log("preTreatmentDataLength:", preTreatmentDataLength);


        // if (preTreatmentDataLength > 0){
        //     const treatmentPage = new TreatmentPageModel.insertMany()
        // }
        
        const data = await treatmentPage.save();
        res.json({ data })
    } catch (error) {
        res.json({ "message": error?.message })
    }
}


// get all doc from premedicaiton , chemo, takehome table
exports.getAllTreatmentRecords = async (req, res, next) => {
    try {

        const data = await TreatmentPageModel.find();

        console.log("Datass:", data);

        // if (!data || data.length === 0) {
        //     return res.status(404).json({ message: 'No treatment records found' });
        // }

        const preTreatmentData = data.map(doc => doc.preTreatmentData).flat();

        res.json({ preTreatmentData });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}


//Get Products - /api/v1/products
// exports.getProducts = catchAsyncError(async(req, res, next)=>{
//     const resPerPage = 4;
 // /api/v1/products?keyword="clovas"

//     let buildQuery = () =>{
//        return new APIFeatures(Product.find(), req.query).search().filter()
//     }
//     const filteredProductCount =await buildQuery().query.countDocuments({})
//     const totalProductsCount = await Product.countDocuments({});
//     let productsCount = totalProductsCount;

//     if( filteredProductCount !== totalProductsCount){
//         productsCount =filteredProductCount;
//     }

//     const products = await buildQuery().paginate(resPerPage).query;
    
    
//     res.status(200).json({
//         success : true,
//         count: productsCount,
//         resPerPage,
//         products
//     })
// })
//using promises 
//can write fn orfunction or requestHandler just name
const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err));
    }
}





export {asyncHandler};

//fn for try catch in async functions
// This function is used to handle errors in async functions in Express.js
// const asyncHandler = (fn)=>async (req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code ||500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }
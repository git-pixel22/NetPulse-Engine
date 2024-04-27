// method 1
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
        catch((error) => next(error))
    }
}

export default asyncHandler;

// method 2
// function asyncHandler(requestHandler) {
    
//     function newFunction(req, res, next) {
//         Promise.resolve(requestHandler(req,res,next)).catch((error) => next(error))
//     }

//     return newFunction;
// }

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }
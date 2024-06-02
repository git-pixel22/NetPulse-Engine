import { sendErrorResponse } from "./sendErrorResponse.js";

// Method to handle async functions and send error responses
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((error) => {
                // Extracting the relevant error message
                const errorMessage = error.message.split('\n')[0];
                return sendErrorResponse(res, error.statusCode || 500, errorMessage);
            });
    };
};

export { asyncHandler };

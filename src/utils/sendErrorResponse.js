// Utility function to send error responses to the frontend
const sendErrorResponse = (res, statusCode, errorMessage) => {
    // Construct the error response object
    const errorResponse = {
        status: statusCode,
        error: {
            message: errorMessage
        }
    };

    // Send the error response
    res.status(statusCode).json(errorResponse);
};

export { sendErrorResponse };

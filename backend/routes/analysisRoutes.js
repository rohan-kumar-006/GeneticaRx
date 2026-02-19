const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const multer = require('multer');

// Configure Multer with memory storage and strict limits
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.toLowerCase().endsWith(".vcf")) {
            cb(new AppError("Only VCF files are allowed.", 400, "INVALID_FILE_TYPE"));
        } else {
            cb(null, true);
        }
    },
});

router.post("/analyze", (req, res, next) => {
    upload.single("file")(req, res, function (err) {
        if (err) {
            // Check for Multer specific errors
            if (err.code === "LIMIT_FILE_SIZE") {
                return next(
                    new AppError(
                        "File size exceeds 5MB limit.",
                        413,
                        "FILE_TOO_LARGE",
                        "Maximum allowed file size is 5MB."
                    )
                );
            }

            if (err instanceof AppError) {
                return next(err);
            }

            return next(
                new AppError(
                    "File upload error.",
                    400,
                    "FILE_UPLOAD_ERROR",
                    err.message
                )
            );
        }
        next();
    });
}, asyncHandler(analysisController.analyzeVCF));

module.exports = router;

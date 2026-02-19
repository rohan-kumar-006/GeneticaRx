const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const analysisRoutes = require('./routes/analysisRoutes');

dotenv.config();

// STEP 7: Process Safety Nets
process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...", err);
    console.error(err.name, err.message);
    // STAGE 7 REQUIREMENT: DO NOT call process.exit(). Server must survive.
    // We log and keep running.
});

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION! 💥 Shutting down...", err);
    console.error(err.name, err.message);
    // STAGE 7 REQUIREMENT: DO NOT call process.exit().
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api', analysisRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('GeneticaRx API is running');
});

// STEP 5: Global Express Error Middleware
app.use((err, req, res, next) => {
    console.error("Global Error Caught:", err);

    // If it's an operational error (AppError)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                type: err.type,
                message: err.message,
                details: err.details || null
            }
        });
    }

    // Programming or unknown error: convert to 500
    return res.status(500).json({
        success: false,
        error: {
            type: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong.",
            details: null // Do not leak stack trace
        }
    });
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;

const pino = require('pino');

let logger;

if (process.env.NODE_ENV !== 'production') {
    // In non-production environments, log to the console in a readable format
    logger = pino({
        level: 'debug',
        transport: {
            target: "pino-pretty",
        },
    });
} else {
    // production
    logger = pino();
}

module.exports = logger;

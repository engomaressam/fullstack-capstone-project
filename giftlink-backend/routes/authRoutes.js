/*jshint esversion: 8 */
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
// Use `body` and `validationResult` from express-validator for input validation
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');  // Import Pino logger

dotenv.config();
const logger = pino();  // Create a Pino logger instance

// JWT secret comes from the .env file
const JWT_SECRET = process.env.JWT_SECRET;

// Register: POST /api/auth/register
router.post('/register', [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Validation errors in register request');
        return res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
    }
    try {
        // Task 1: Connect to `giftdb` in MongoDB through `connectToDatabase` in `db.js`
        const db = await connectToDatabase();

        // Task 2: Access the `users` collection
        const collection = db.collection("users");

        // Task 3: Check for an existing email
        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            logger.error('Email id already exists');
            return res.status(400).json({ error: 'Email id already exists' });
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;

        // Task 4: Save user details in the database
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        // Task 5: Create a JWT with the user _id as payload
        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };
        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User registered successfully');
        res.json({ authtoken, email });
    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});

// Login: POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        // Task 1: Connect to `giftdb` in MongoDB through `connectToDatabase` in `db.js`
        const db = await connectToDatabase();

        // Task 2: Access the `users` collection
        const collection = db.collection("users");

        // Task 3: Check for user credentials in the database
        const theUser = await collection.findOne({ email: req.body.email });

        if (theUser) {
            // Task 4: Check if the password matches the encrypted password
            const result = await bcryptjs.compare(req.body.password || '', theUser.password);
            if (!result) {
                logger.error('Passwords do not match');
                return res.status(404).json({ error: 'Wrong password' });
            }

            // Task 5: Fetch user details from the database
            const userName = theUser.firstName;
            const userEmail = theUser.email;

            // Task 6: Create a JWT with the user _id as payload
            const payload = {
                user: {
                    id: theUser._id.toString(),
                },
            };
            const authtoken = jwt.sign(payload, JWT_SECRET);

            logger.info('User logged in successfully');
            return res.status(200).json({ authtoken, userName, userEmail });
        } else {
            // Task 7: Send an appropriate message if the user is not found
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (e) {
        logger.error(e);
        return res.status(500).json({ error: 'Internal server error', details: e.message });
    }
});

// Update user information: PUT /api/auth/update
router.put('/update', [
    body('name').trim().notEmpty().withMessage('Name is required')
], async (req, res) => {
    // Task 2: Validate the input using `validationResult` and return an appropriate message if there is an error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Validation errors in update request');
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Task 3: Check if `email` is present in the header and throw an appropriate error message if not present
        const email = req.headers.email;
        if (!email) {
            logger.error('Email not found in the request headers');
            return res.status(400).json({ error: "Email not found in the request headers" });
        }

        // The bearer token must belong to the user being updated
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            logger.error('Missing or invalid token');
            return res.status(401).json({ error: "Missing or invalid token" });
        }

        // Task 4: Connect to MongoDB
        const db = await connectToDatabase();
        const collection = db.collection("users");

        // Task 5: Find the user credentials in the database
        const existingUser = await collection.findOne({ email });
        if (!existingUser) {
            logger.error('User not found');
            return res.status(404).json({ error: "User not found" });
        }
        if (existingUser._id.toString() !== String(decoded.user.id)) {
            logger.error('Token does not match the user');
            return res.status(403).json({ error: "Not allowed to update this user" });
        }

        // Task 6: Update the user credentials in the database
        const updatedUser = await collection.findOneAndUpdate(
            { _id: new ObjectId(existingUser._id) },
            { $set: { firstName: req.body.name, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        // Task 7: Create a JWT with the user _id as payload using the secret key from the .env file
        const payload = {
            user: {
                id: updatedUser._id.toString(),
            },
        };
        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User updated successfully');
        res.json({ authtoken, userName: updatedUser.firstName, userEmail: updatedUser.email });
    } catch (e) {
        logger.error(e);
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router;

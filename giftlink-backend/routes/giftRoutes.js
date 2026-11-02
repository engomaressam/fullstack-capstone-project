/*jshint esversion: 8 */
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Get all gifts: GET /api/gifts
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        // Task 1: Connect to MongoDB and store connection to db constant
        const db = await connectToDatabase();

        // Task 2: use the collection() method to retrieve the gift collection
        const collection = db.collection("gifts");

        // Task 3: Fetch all gifts using the collection.find method. Chain with toArray method to convert to JSON array
        const gifts = await collection.find({}).toArray();

        // Task 4: return the gifts using the res.json method
        res.json(gifts);
    } catch (e) {
        logger.error('Error fetching gifts', e);
        next(e);
    }
});

// Get a single gift by ID: GET /api/gifts/:id
router.get('/:id', async (req, res, next) => {
    try {
        // Task 1: Connect to MongoDB and store connection to db constant
        const db = await connectToDatabase();

        // Task 2: use the collection() method to retrieve the gift collection
        const collection = db.collection("gifts");

        const id = req.params.id;

        // Task 3: Find a specific gift by ID using the collection.findOne method and store in constant called gift
        const gift = await collection.findOne({ id: id });

        if (!gift) {
            return res.status(404).send('Gift not found');
        }

        res.json(gift);
    } catch (e) {
        logger.error('Error fetching gift', e);
        next(e);
    }
});

// Add a new gift
router.post('/', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("gifts");
        const result = await collection.insertOne(req.body);

        res.status(201).json(Object.assign({ _id: result.insertedId }, req.body));
    } catch (e) {
        next(e);
    }
});

module.exports = router;

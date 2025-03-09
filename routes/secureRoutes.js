const express = require("express");
const { getDb } = require("../db/db");
const { ObjectId } = require("mongodb");

const router = express.Router();

router.get("/", (_req, res) => {
    const db = getDb();
    let secureData = [];

    db.collection("secure_data")
        .find({})
        .sort({ "user.surname": 1 })
        .forEach((entry) => secureData.push(entry))
        .then(() => res.status(200).json(secureData))
        .catch((error) => {
            res.status(500).json({ Error: "Could not get secure data", "Error message": error });
        });
});

router.get("/:id", (req, res) => {
    const db = getDb();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID format" });

    db.collection("secure_data")
        .findOne({ _id: new ObjectId(id) })
        .then((entry) => {
            if (!entry) return res.status(404).json({ error: "Entry not found" });
            res.status(200).json(entry);
        })
        .catch((error) => {
            res.status(500).json({ Error: "Could not get entry by id", "Error message": error });
        });
});

router.post("/", (req, res) => {
    const db = getDb();
    const { email, user, cardNumber, password } = req.body;

    if (!email || !user || !cardNumber || !password) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    const newEntry = { email, user, cardNumber, password };

    db.collection("secure_data")
        .insertOne(newEntry)
        .then((result) => res.status(201).json(result))
        .catch((error) => {
            res.status(500).json({ Error: "Could not create entry", "Error message": error });
        });
});

// Оновити запис
router.patch("/:id", (req, res) => {
    const db = getDb();
    const id = req.params.id;
    const updates = req.body;

    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Not valid entry id" });

    let updateQuery = {};

    if (updates.email) updateQuery["email"] = updates.email;
    if (updates.user?.name) updateQuery["user.name"] = updates.user.name;
    if (updates.user?.fathername) updateQuery["user.fathername"] = updates.user.fathername;
    if (updates.user?.surname) updateQuery["user.surname"] = updates.user.surname;
    if (updates.cardNumber) updateQuery["cardNumber"] = updates.cardNumber;
    if (updates.password) updateQuery["password"] = updates.password;

    db.collection("secure_data")
        .updateOne({ _id: new ObjectId(id) }, { $set: updateQuery })
        .then((result) => res.status(200).json(result))
        .catch((error) => {
            res.status(500).json({ error: "Could not update the entry", "Error message": error });
        });
});

router.delete("/:id", (req, res) => {
    const db = getDb();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid document id" });

    db.collection("secure_data")
        .deleteOne({ _id: new ObjectId(id) })
        .then((result) => {
            if (result.deletedCount === 0) {
                return res.status(404).json({ Error: "Entry not found" });
            }
            return res.status(200).json({ message: "Entry deleted" });
        })
        .catch((error) => {
            res.status(500).json({ Error: "Could not delete entry", "Error message": error });
        });
});

module.exports = router;
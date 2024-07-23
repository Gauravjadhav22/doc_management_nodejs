const express = require("express");
const {
  deleteDocumentController,
  getDocumentByIdController,
  getDocumentsController,
  shareDocumentController,
  updateDocumentController,
  uploadDocumentController,
} =require( "../controllers/documentControllers");
const multer = require("multer");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// File Upload
router.post("/", upload.single("file"), uploadDocumentController);

// Retrieve a list of documents
router.get("/", getDocumentsController);

// Retrieve a specific document
router.get("/:id", getDocumentByIdController);

// Delete a document
router.delete("/:id", deleteDocumentController);

// Update a document (rename, move)
router.patch("/:id", updateDocumentController);

// Share a document with another user
router.post("/:id/share", shareDocumentController);

module.exports = router;

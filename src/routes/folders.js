const express = require("express");
const {
  createFolderController,
  getFoldersController,
  deleteFolderController,
  updateFolderController,
  getFolderByIdController,
} = require("../controllers/folderControllers");

const router = express.Router();

// Create a new folder
router.post("/", createFolderController);
// Retrieve a list of folders
router.get("/", getFoldersController);
// Retrieve a specific folder
router.get("/:id", getFolderByIdController);
// Delete a folder
router.delete("/:id", deleteFolderController);
// Update a folder (rename, move)
router.patch("/:id", updateFolderController);

module.exports = router;

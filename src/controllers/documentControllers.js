const fs = require("fs");
const path = require("path");
const { readDataFromFile, writeDataToFile } = require("../utils/fileHandler");
const { v4: uuidv4 } = require("uuid");
const uploadDir = "uploads";
const documentsFile = "documents.json";
const foldersFile = "folders.json";

const uploadDocumentController = (req, res) => {
  const { folderId } = req.body;
  console.log(folderId);
  const documents = readDataFromFile(documentsFile);
  const folders = readDataFromFile(foldersFile);

  // Find the folder
  const folder = folders.find((folder) => folder.id === folderId);
  if (!folder) {
    return res.status(404).json({ message: "Folder not found" });
  }

  const fileId = uuidv4();
  const fileName = `${fileId}-${req.file.originalname}`;
  const filePath = path.join(uploadDir, fileName);

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Save the file to the filesystem
  fs.writeFileSync(filePath, req.file.buffer, { mode: 0o644 });

  const file = {
    id: fileId,
    name: req.file.originalname,
    path: filePath,
    owner: req?.user?.email,
    sharedWith: [],
    version: 1,
    activityLog: [
      { action: "uploaded", user: req?.user?.email, timestamp: new Date() },
    ],
  };

  documents.push(file);
  folder.documents.push(file.id); // Associate file with folder
  writeDataToFile(documentsFile, documents);
  writeDataToFile(foldersFile, folders); // Update folders with new document

  res.status(201).json(file);
};

const getDocumentsController = (req, res) => {
  const documents = readDataFromFile(documentsFile);
  const userDocuments = documents.filter(
    (doc) =>
      doc.owner == req?.user?.email ||
      doc.sharedWith.some((itm) => itm.email === req?.user?.email)
  );
  res.json(userDocuments);
};

const getDocumentByIdController = (req, res) => {
  const documents = readDataFromFile(documentsFile);
  const document = documents.find((doc) => doc.id === req.params.id);
  if (
    !document ||
    (document.owner !== req?.user?.email &&
      !document.sharedWith.includes(req?.user?.email))
  ) {
    return res.status(404).json({ message: "Document not found" });
  }

  // Send the file as a downloadable response
  res.download(document.path, document.name, (err) => {
    if (err) {
      return res.status(500).json({ message: "Error downloading the file" });
    }
  });
};

const deleteDocumentController = (req, res) => {
  let documents = readDataFromFile(documentsFile);
  const index = documents.findIndex(
    (doc) => doc.id === req.params.id && doc.owner === req?.user?.email
  );
  if (index === -1)
    return res
      .status(404)
      .json({ message: "Document not found or unauthorized" });

  const document = documents[index];

  // Remove the file from the filesystem
  fs.unlinkSync(document.path);

  documents.splice(index, 1);
  writeDataToFile(documentsFile, documents);
  res.json({ message: "Document deleted" });
};

const updateDocumentController = (req, res) => {
  const documents = readDataFromFile(documentsFile);
  const { name } = req.body;
  const document = documents.find(
    (doc) => doc.id === req.params.id && doc.owner === req?.user?.email
  );
  if (!document)
    return res
      .status(404)
      .json({ message: "Document not found or unauthorized" });
  document.name = name || document.name;
  writeDataToFile(documentsFile, documents);
  res.json(document);
};

const shareDocumentController = (req, res) => {
  const documents = readDataFromFile(documentsFile);
  const { email, permission } = req.body;
  const document = documents.find((doc) => doc.id === req.params.id);
  if (!document || document.owner !== req?.user?.email) {
    return res
      .status(404)
      .json({ message: "Document not found or unauthorized" });
  }
  document.sharedWith.push({ email, permission });
  writeDataToFile(documentsFile, documents);
  res.json({ message: "Document shared" });
};

module.exports = {
  uploadDocumentController,
  getDocumentsController,
  getDocumentByIdController,
  deleteDocumentController,
  updateDocumentController,
  shareDocumentController,
};

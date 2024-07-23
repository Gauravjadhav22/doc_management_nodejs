const { readDataFromFile, writeDataToFile } = require("../utils/fileHandler");
const { v4: uuidv4 } = require("uuid");

const foldersFile = "folders.json";
const docsFile = "documents.json";

const createFolderController = (req, res) => {
  const folders = readDataFromFile(foldersFile);
  const folder = {
    id: uuidv4(),
    name: req.body.name,
    owner: req?.user?.email,
    documents: [],
  };
  folders.push(folder);
  writeDataToFile(foldersFile, folders);
  res.status(201).json(folder);
};

const getFoldersController = (req, res) => {
  const folders = readDataFromFile(foldersFile);
  const userFolders = folders.filter(
    (folder) => folder?.owner === req?.user?.email
  );
  res.json(userFolders);
};

const getFolderByIdController = (req, res) => {
  const folders = readDataFromFile(foldersFile);
  const documentsfiles = readDataFromFile(docsFile);
  const folder = folders.find(
    (folder) =>
      folder.id === req.params.id && folder.owner === req?.user?.email
  );
  
  if (!folder) {
    return res.status(404).json({ message: "Folder not found" });
  }
  
  const documents = folder.documents.map((itemId) => 
    documentsfiles.find((itm) => itm.id === itemId)
  ).filter(itm=>itm!=null);
  
  folder.documents = documents;
  
  res.json(folder);
};

const deleteFolderController = (req, res) => {
  let folders = readDataFromFile(foldersFile);
  const index = folders.findIndex(
    (folder) =>
      folder.id === req.params.id && folder.owner === req?.user?.email
  );
  if (index === -1)
    return res
      .status(404)
      .json({ message: "Folder not found or unauthorized" });
  folders.splice(index, 1);
  writeDataToFile(foldersFile, folders);
  res.json({ message: "Folder deleted" });
};

const updateFolderController = (req, res) => {
  const folders = readDataFromFile(foldersFile);
  const { name } = req.body;
  const folder = folders.find(
    (folder) =>
      folder.id === req.params.id && folder.owner === req?.user?.email
  );
  if (!folder)
    return res
      .status(404)
      .json({ message: "Folder not found or unauthorized" });
  folder.name = name || folder.name;
  writeDataToFile(foldersFile, folders);
  res.json(folder);
};

module.exports = {
  createFolderController,
  getFoldersController,
  getFolderByIdController,
  deleteFolderController,
  updateFolderController,
};

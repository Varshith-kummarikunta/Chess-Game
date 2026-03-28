const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

//Storage config

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb)=>{
        cb(null, Date.now() + path.extname(file.originalname));

  }
});

const upload = multer({ storage });

router.post("/", upload.single("file"), (req, res) => {
  res.json({
    message: "File uploaded successfully",
    filePath: `/uploads/${req.file.filename}`,
  });
});


module.exports = router;

const express = require('express');
const uuid = require('uuid').v1;
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//Init app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var mime = {
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
};

// Set The Storage Engine
const extractFileExtension = (originalname) => {
  if (!originalname) throw new Error('original is required');
  return originalname.split('.')[1].toLowerCase();
};

const generateFileName = (orginalname) => {
  if (!orginalname) throw new Error('original is required');
  const extension = extractFileExtension(orginalname);
  return `${uuid()}.${extension}`;
};

const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    const filename = generateFileName(file.originalname);
    cb(null, filename);
  },
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('file');

const uploads = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    //checkFileType(file, cb);
  },
}).array('files', 12);

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

const addDownloadUrlToFileResponse = (file = {}, downloadRootUrl) => {
  const keys = Object.keys(file);
  if (!keys.includes('filename')) throw new Error('Incorrect parameter');

  const downloadUrl = `${downloadRootUrl}/${file.filename}`;
  const fileResponseWithDownloadUrl = Object.assign(file, { downloadUrl });

  return fileResponseWithDownloadUrl;
};

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    const file = req.file;
    const downloadRootUrl = `${req.protocol}://${req.get('host')}/downloads`;

    if (err) {
      console.log(`upload error  ${err}`);
    } else {
      if (req.file == undefined) {
        console.log('Error: No File Selected!');
      } else {
        console.log(`uploads/${req.file.filename}`);
        const fileReponse = addDownloadUrlToFileResponse(file, downloadRootUrl);

        res.send(file);
      }
    }
  });
});

app.get('/downloads/:filename', (req, res) => {
  const { filename } = req.params;
  if (!filename) {
    res.status(400).json({
      error: 'Filename param is incorrect',
    });
  }

  const fullPath = path.join(__dirname, 'public', 'uploads', filename);

  var readStream = fs.createReadStream(fullPath);
  readStream.on('open', function () {
    readStream.pipe(res);
  });

  readStream.on('error', function (err) {
    console.log(err);
    res.set('Content-Type', 'text/plain');
    res.status(404).end('Not found');
  });
});

const port = 3000;

app.listen(port, () => console.log(`server started on port ${port}`));

const express = require('express');

const bodyParser = require('body-parser');

const multer = require('multer');

const ejs = require('ejs');

const path = require('path');


//Init app 
const app = express();

var mime = {
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
};


// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });


// Init Upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
  }).single('file');

  const uploads = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
      //checkFileType(file, cb);
    }
  }).array('files', 12);

// Check File Type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
}

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    const file = req.file
      if(err){
        console.log(`upload error  ${err}`)
      } else {
        if(req.file == undefined){
        console.log( 'Error: No File Selected!')
        } else {
          console.log(`uploads/${req.file.filename}`)
          res.send(file)
        }
      }
    });
  });

app.set('view engine', 'ejs');

app.get('/storage', (req, res) => {
  var type = mime[path.extname(file).slice(1)] || 'image/jpeg';
  var s = fs.createReadStream(file);
  s.on('open', function () {
    res.set('Content-Type', type);
    s.pipe(res);
  });
  
  s.on('error', function () {
    res.set('Content-Type', 'text/plain');
    res.status(404).end('Not found');
  });
  
})

const port = 3000;

app.listen(port, () => console.log(`server started on port ${port}`));
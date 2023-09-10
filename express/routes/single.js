import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const prisma = new PrismaClient();
const router = express.Router();



const audioStorage = multer.diskStorage({
    
    destination: function (req, file, cb) {
        cb(null, './library');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + 'S' + path.extname(file.originalname));
    }
});

const audioUpload = multer({ storage: audioStorage });

const imageStorage = multer.memoryStorage();
const imageUpload =  multer({storage: imageStorage});


router.use(cors())

router.get('/', async (req, res) => {

    try {
        const singles = await prisma.single.findMany({
            orderBy: {
                id: 'asc'
            },
            select: {
                id: true,
                title: true,
                artist: true
            }
        });
        return res.json(singles);
    } catch (error) {
        console.error('Error getting singles:', error);
        res.status(500).json({ message: 'Failed to get singles' });
      }
});

router.patch('/upload/image', imageUpload.single('cover'), async (req, res) => {

    console.log("Currently handling images")
    console.log(req.file)
    const imageBuffer = req.file.buffer
    console.log(imageBuffer)
    const id = req.body.id
  
    try {

        const single = await prisma.single.update({
            where: {
                id: Number(id)
            },
            data: {
                image: imageBuffer
            }
        })
        console.log("Finished handling images")
    res.status(200).json({message: 'Updated cover successfully'})
    } catch (error) {
        console.error('Error updating cover:', error);
        res.status(500).json({ message: 'Failed to update cover, artist: ' + artist + ' title: ' + title });
    }
});

router.get('/play/:id', async (req, res) => {

    const get = await prisma.single.findUnique({
        where: {
            id: Number(req.params.id)
        },
        select: {
            location: true
        }
    });
    const filePathEP = get.location
    const filePath =  path.join(__dirname, filePathEP);
    return res.sendFile(filePath);
});

router.get('/image/:id', async (req, res) => {

    const single = await prisma.single.findUnique({
        where: {
            id: Number(req.params.id)
        },
        select: {
            image: true
        }
    });
   
    const byteArray = single.image;
    res.set('Content-Type', 'image/png');
    return res.send(byteArray);
});



router.post('/upload/track', audioUpload.single('track'), async (req, res) => {

    const data = req.file;
    const body = req.body
    const filename = data.filename;
    const destination = data.destination;

    try {
        const single =  await prisma.single.create({
            data: {
                artist: body.artist,
                title: body.title,
                location: `../.${destination}/${filename}`
            }
        });
        

        res.json({ message: 'audio uploaded and saved successfully', id: single.id});
}  catch (error) {
    console.error('Error saving audio:', error);
    res.status(500).json({ message: 'Failed to save audio' });
  }
});

  


export { router };


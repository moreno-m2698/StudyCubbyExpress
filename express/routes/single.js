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
                artist: true,
            }
        });
        console.log('Successfully retrieved singles')
        return res.json(singles);
    } catch (error) {
        console.error('Error getting singles:', error);
        res.status(500).json({ message: 'Failed to get singles' });
      }
});

router.patch('/upload/image', imageUpload.single('cover'), async (req, res) => {

    const imageBuffer = req.file.buffer
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
        console.log(`Successfully updated image for ${single.title}`)
    res.status(200).json({message: 'Updated cover successfully'})
    } catch (error) {
        console.error('Error updating cover:', error);
        res.status(500).json({ message: 'Failed to update cover'});
    }
});

router.get('/play/:id', async (req, res) => {

    const single = await prisma.single.findUnique({
        where: {
            id: Number(req.params.id)
        },
        select: {
            location: true,
            title: true,
            id: true
        }
    });
    console.log(`Playing ${single.title}:${single.id} from ${single.location}`)
    const filePathEP = single.location
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
    console.log(`Successfully retrieved image for ${single.title}`)
    const byteArray = single.image;
    res.set('Content-Type', 'image/png');
    return res.send(byteArray);
});



router.post('/upload/track', audioUpload.single('track'), async (req, res) => {

    const data = req.file;
    const body = req.body
    const filename = data.filename;
    const destination = data.destination;
    const location = `../.${destination}/${filename}`
    try {
        const single =  await prisma.single.create({
            data: {
                artist: body.artist,
                title: body.title,
                location: location
            }
        });
        
        console.log(`audio: ${filename} uploaded and saved successfully at ${location}`)
        res.status(200).json({message: 'Uploaded audio successfully', id: single.id})
}  catch (error) {
    console.error('Error saving single audio:', error);
    res.status(500).json({ message: `Failed to save audio at ${location}` });
  }
});

  


export { router };


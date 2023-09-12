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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './library/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + 'T' + path.extname(file.originalname))
    }
});

const upload =  multer({ storage: storage})



router.use(cors());

router.get('/', async (req, res) => {
    

    const tracks = await prisma.track.findMany({
        orderBy: {
            id: 'asc'
        },
        select: {
            id: true,
            title: true,
            artist: true,
            index: true,
            albumId: true

        }
    });
    return res.json(tracks);
  
});

router.get('/:id', async (req, res) => {

    const track = await prisma.track.findUnique({
        where : { 
            id : Number(req.params.id) 
        },
        select: {
            id: true,
            title: true,
            artist: true,
            index: true,
            albumId: true
        }
    });
    return res.json(track)
});

router.get('/play/:id', async (req, res) => {

    const get = await prisma.track.findUnique({
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




router.post('/upload', upload.array('tracks'), async (req, res) => {
    const fileArray = req.files;
    const nameArray = req.body.titles;
    const albumID = req.body.albumID;
    const arrayLength = req.files.length;
    let album;

    try {
        album = await prisma.album.findUnique({
            where:{
                id: Number(albumID)
            }
        });


    } catch (error) {
        console.error(`Error getting albums with id ${albumID}:`, error);
        res.status(500).json({ message: 'Failed to access albums' });
    }

    const artist = album.artist

    try {
        for (let i = 0; i < arrayLength; i++) {
            const file = fileArray[i];
            const name = nameArray[i];
            const location  =`../.${file.destination}${file.filename}`;
 
            const track = await prisma.track.create({
                data: {
                    artist: artist,
                    index: i,
                    albumId: Number(albumID),
                    title: name,
                    location: location
                }
            });        
            
            console.log(`audio: ${name} uploaded and saved successfully at ${location}`)
        }

    } catch (error) {
        console.error('Error trying to upload track:', error);

        res.status(500).json({ message: 'Failed to save tracks' });
    }

    console.error('Error saving track audio:', error);
    return res.status(200).json({message: 'Successfully obtained tracks'})


})

export { router };
import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storage =  multer.memoryStorage();
const upload = multer({ storage })

const prisma = new PrismaClient();
const router = express.Router();

router.use(express.json())
router.use(cors());

router.get('/', async (req, res) => {
    
  try {
    const data = await prisma.album.findMany( 
      { orderBy:{
          id: 'asc'
        },
        select: {
          id: true,
          title: true,
          artist: true
        }
      }
    );
    console.log('Successfully retrieved albums')
    return res.json(data);
  } catch (error) {
    console.error('Error getting albums:', error);
    res.status(500).json({ message: 'Failed to get albums' });
  }
});

router.get('/image/:id', async (req, res) => {
    const album = await prisma.album.findUnique({
        where: {
            id: Number(req.params.id)
        },
        select: {
          image: true
        }
    });

    console.log(`Successfully retrieved image for ${album.title}`)
    const byteArray = album.image;
    res.set('Content-Type', 'image/png');
    return res.send(byteArray);
});

router.get('/tracks/:id', async ( req, res) => {
  const tracks = await prisma.track.findMany({
    where: {
      albumId: Number(req.params.id)
    },
    orderBy: {
      index: 'asc'
    },
    select: {
      id: true,
      title: true,
      artist: true,
      index: true,
      albumId: true
  }
  });
  console.log(`Successfully retrieved tracks for album ID: ${req.params.id}`)
  return res.json(tracks);
})

router.post('/upload', upload.single('cover'), async (req, res) => {
  const imageBuffer = req.file.buffer
  const title =  req.body.title
  const artist = req.body.artist

  try {
    const createdImage = await prisma.album.create({
      data: { 
        image: imageBuffer,
        artist: artist,
        title: title
      },
    });
    console.log(`Successfully uploaded ${title}`)
    res.json({ message: `Successfully uploaded ${title}` });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ message: 'Failed to save image' });
  }
})


export { router } 
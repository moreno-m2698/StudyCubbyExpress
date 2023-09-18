import express, { application } from 'express';
import { router as trackRouter } from "./routes/track.js";
import { router as albumRouter } from "./routes/album.js";
import { router as singleRouter } from "./routes/single.js";

const app = express();

app.get('/', (req, res) => {
    console.log("Express is running");
    res.send("Express is running");
});

app.use('/track', trackRouter);
app.use('/album', albumRouter);
app.use('/single', singleRouter);

app.listen(3000);




import express from 'express';
import cors from 'cors';

import { MapRouter } from './src/endpoints/map.js';
import { GameRouter } from './src/endpoints/game.js';
import { TilesetRouter } from './src/endpoints/tileset.js';
import { MediaRouter } from './src/endpoints/media.js';

const app = express();
const port = process.env.PORT || 8000;

const whitelist = process.env.CORS_DOMAINS.split(',')

const corsOptions = {
  origin: whitelist
}

app.use(express.json({limit: '50mb'}));
app.use(cors(corsOptions));

app.use(GameRouter);
app.use(MapRouter);
app.use(TilesetRouter);
app.use(MediaRouter);

app.listen(port, () => {
    console.log('Server app listening on port ' + port);
});
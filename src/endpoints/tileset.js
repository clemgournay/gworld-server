import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import fs from 'fs';

import { DB } from '../database.js';
import { ObjectId } from 'mongodb';
import { config } from 'process';

/*
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'media/')
    },
    filename: (req, file, cb) => {
        const id = v4();
        const parts = file.originalname.split('.');
        const ext = parts[parts.length - 1];
        const filename = `${id}.${ext}`;
        cb(null, filename);
    }
  })
const upload = multer({storage})*/
const upload = multer({dest: ('./media')});

export const TilesetRouter = express.Router();

TilesetRouter.get('/tilesets', async (req, res) => {
    const tilesets = await DB.collection('tilesets').find().toArray();
    for (let tileset of tilesets) {
        tileset.src = `${process.env.API_URL}/media/${tileset.image}`;
    }
    res.json({'data': tilesets, 'count': tilesets.length});
});

TilesetRouter.post('/tilesets/upload', upload.single('tileset'), (req, res) => {
    console.log(req.file);
    res.json({
        'data': req.file
    });
});

TilesetRouter.post('/tilesets', async (req, res) => {
    const tileset = req.body;
    delete tileset._id;
    console.log(tileset);
    tileset.created_date = new Date();
    tileset.update_date = new Date();
    const resp = await DB.collection('tilesets').insertOne(tileset);
    tileset._id = resp.insertedId.toString();
    res.json({data: tileset});
});

TilesetRouter.put('/tilesets', async (req, res) => {
    const tileset = req.body;
    
    const updateData = {
        name: tileset.name,
        tile_size: tileset.tile_size,
        width: tileset.width,
        height: tileset.height,
        tiles: tileset.tiles,
        updated_date: new Date()
    }
    
    console.log(tileset);
    await DB.collection('tilesets').updateOne({_id: ObjectId.createFromHexString(tileset._id)}, {$set: updateData});
    res.json({message: 'ok'});
});

TilesetRouter.get('/tilesets/:id/export', async (req, res) => {
    const id = req.params.id;
    const tileset = await DB.collection('tilesets').findOne({_id: ObjectId.createFromHexString(id)});
    delete tileset._id;
    tileset.id = id;
    const zipPath = `./data/archives/${id}.zip`;
    let zip;
    if (!fs.existsSync(zipPath))  {
        zip = new AdmZip();
        const imagePath = `./media/${tileset.image}`;
        zip.addLocalFile(imagePath, '', 'tileset.png');

        const tilesetDir = `./data/tilesets/${id}`;
        if (!fs.existsSync(tilesetDir)) fs.mkdirSync(tilesetDir);
        const configPath = `${tilesetDir}/config.json`;
        
        if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify(tileset));
        zip.addLocalFile(configPath, '', 'config.json');
    } else {
        zip = new AdmZip(zipPath);
    }
    
    const zipData = zip.toBuffer();
    const filename = `${tileset.name}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-disposition','attachment; filename=' + filename);
    res.send(zipData);
});
import fs from 'fs';
import express from 'express';
import { ObjectId } from 'mongodb';

import { DB } from '../database.js';

export const MapRouter = express.Router();

MapRouter.get('/maps', async (req, res) => {
    const query = {};
    console.log('QUERY', req.query)
    if (req.query.game) {
        query.game = req.query.game;
    }
    const maps = await DB.collection('maps').find(query).toArray();
    res.json({data: maps, count: maps.length});
});

MapRouter.get('/maps/:id', async (req, res) => {
    const id = req.params.id;
    console.log('MAP ID', id);
    const map = await DB.collection('maps').findOne({_id: ObjectId.createFromHexString(id)});
    res.json({data: map});
});

MapRouter.get('/maps/:id/layers', async (req, res) => {
    const id = req.params.id;
    const dir = `data/maps/${id}`;
    let layers = [];
    if (fs.existsSync(dir)) {
        const path = `${dir}/layers.json`;
        layers = JSON.parse(fs.readFileSync(path));
    }
    res.json({data: layers});
});

MapRouter.post('/maps', async (req, res) => {
    const map = req.body;
    map.created_date = new Date();
    map.updated_date = new Date();
    const layers = JSON.stringify(map.layers);
    delete map._id;
    delete map.layers;
    delete map.screenWidth;
    delete map.screenHeight;
    const resp = await DB.collection('maps').insertOne(map);
    map._id = resp.insertedId.toString();
    const dir = `data/maps/${map._id}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(`${dir}/layers.json`, layers);
    res.json({data: map})
});


MapRouter.post('/maps/:id/copy', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const map = await DB.collection('maps').findOne({_id:  ObjectId.createFromHexString(id)});
    delete map._id;
    delete map.screenWidth;
    delete map.screenHeight;
    map.created_date = new Date();
    map.updated_date = new Date();
    map.name = map.name + ' copy';
    const resp = await DB.collection('maps').insertOne(map);
    const newID = resp.insertedId.toString();

    map.id = newID;

    const dir = `data/maps/${id}`;
    let layers = [];
    if (fs.existsSync(dir)) {
        const path = `${dir}/layers.json`;
        layers = JSON.parse(fs.readFileSync(path));
    
        const newDir = `data/maps/${newID}`;
        if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, {recursive: true});
        fs.writeFileSync(`${newDir}/layers.json`, JSON.stringify(layers));
    }

    res.send({data: map});
});


MapRouter.put('/maps/:id', async (req, res) => {
    const id = req.params.id;
    const updateData = req.body;
    updateData.updated_date = new Date();
    delete updateData._id;

    console.log(updateData.layers);
    if ('layers' in updateData) { 
        const layers = JSON.stringify(updateData.layers);
        delete updateData.layers;
        const dir = `data/maps/${id}`;
        fs.writeFileSync(`${dir}/layers.json`, layers);
    }

    await DB.collection('maps').updateOne({_id: ObjectId.createFromHexString(id)}, {$set: updateData});
    res.json({message: 'ok'});

});

MapRouter.get('/maps/:id/export', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const map = await DB.collection('maps').findOne({_id:  ObjectId.createFromHexString(id)});
    delete map._id;
    map.id = id;
    const dir = `data/maps/${id}`;
    let layers = [];
    if (fs.existsSync(dir)) {
        const path = `${dir}/layers.json`;
        layers = JSON.parse(fs.readFileSync(path));
    }
    map.layers = layers;

    const tileset = await DB.collection('tilesets').findOne({_id: ObjectId.createFromHexString(map.tileset)});
    map.tileset = tileset.name;

    const filename = `map.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-disposition','attachment; filename=' + filename);
    res.send(map);
});

MapRouter.delete('/maps/:id', async (req, res) => {
    const id = req.params.id;
    await DB.collection('maps').deleteOne({_id: ObjectId.createFromHexString(id)});
    
    const dir = `data/maps/${id}`;
    if (fs.existsSync(dir)) {
        const path = `${dir}/layers.json`;
        fs.unlinkSync(path);
    }

    fs.rmdirSync(dir);    

    res.send({message: 'ok'});
});
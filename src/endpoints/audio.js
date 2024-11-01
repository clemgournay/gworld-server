import express from 'express';
import multer from 'multer';

import { DB } from '../database.js';
import { ObjectId } from 'mongodb';


const upload = multer({dest: ('./media')});

export const AudioRouter = express.Router();
 
AudioRouter.get('/audios', async (req, res) => {
    const audios = await DB.collection('audios').find().toArray();
    res.json({'data': audios, 'count': audios.length});
});

AudioRouter.post('/audios/upload', upload.single('audio'), (req, res) => {
    console.log(req.file);
    res.json({
        'data': req.file
    });
});

AudioRouter.post('/audios', async (req, res) => {
    const audio = req.body;
    console.log(audio);
    audio.created_date = new Date();
    audio.update_date = new Date();
    const resp = await DB.collection('audios').insertOne(audio);
    audio._id = resp.insertedId.toString();
    res.json({data: audio});
});

AudioRouter.put('/audios', async (req, res) => {
    const audio = req.body;
    const updateData = {};
    await DB.collection('audios').updateOne({_id: ObjectId.createFromHexString(audio._id)}, {$set: updateData});
    res.json({message: 'ok'});
});

AudioRouter.delete('/audios/:id', async (req, res) => {
    const id = req.query.id;
    await DB.collection('audios').deleteOne({_id: ObjectId.createFromHexString(audio._id)});
    res.json({message: 'ok'});
});
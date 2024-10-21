import fs from 'fs';
import express from 'express';
import { ObjectId } from 'mongodb';

import { DB } from '../database.js';

export const GameRouter = express.Router();

GameRouter.get('/games', async (req, res) => {
    const games = await DB.collection('games').find().toArray();
    res.json({data: games, count: games.length});
});

GameRouter.get('/games/mines', async (req, res) => {
    const user = '6715f95fb48fee022003f06a';
    const games = await DB.collection('games').find({user: user}).toArray();
    res.json({data: games, count: games.length});
});

GameRouter.get('/games/:id', async (req, res) => {
    const id = req.params.id;
    let game;
    if (id) game = await DB.collection('games').findOne({_id: ObjectId.createFromHexString(id)});
    if (game) res.json({data: game});
    else res.status(404);
});

GameRouter.post('/games', async (req, res) => {
    const game = req.body;
    console.log('GAME', game);
    game.user = '6715f95fb48fee022003f06a';
    const resp = await DB.collection('games').insertOne(game);
    game._id = resp.insertedId.toString();
    res.json({data: game});
});

GameRouter.put('/games/:id', async (req, res) => {

});

GameRouter.delete('/games', async (req, res) => {

});

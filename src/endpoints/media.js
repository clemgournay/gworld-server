import express from 'express';
import { dirname, resolve } from 'path';

const __dirname = resolve(dirname(''));

export const MediaRouter = express.Router();

MediaRouter.get('/media/:id', async (req, res) => {
    const id = req.params.id;
    res.sendFile(`${__dirname}/media/${id}`);
});
import {Express, Request, Response, NextFunction} from "express";
const express = require("express");
const app: Express = express();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const APP_SECRET = 'himitsu';
const crypto = require('crypto');

const sequelize = new Sequelize('sample', 'root', null, {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: Op
});

const User = sequelize.define('user', {
    name: {
        type: Sequelize.STRING,
        unique: true,
        null: false
    },
    password: {
        type: Sequelize.STRING,
        null: false
    },
    hash: {
        type: Sequelize.STRING,
        unique: true,
        null: false
    }
});

(async () => {
    await sequelize.sync();
    User.findOrCreate({where: {name: 'hello'}, defaults: {password: 'pass', hash: crypto.randomBytes(8).toString('hex')}});
})();

app.use(bodyParser.json());

app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

const generateToken = (userHash: string) => (
    jwt.sign(
        {hash: userHash},
        APP_SECRET,
        {
            algorithm: "HS256",
            expiresIn: 60 * 60 * 24
        }
    )
)

const verifyToken = (token: string) => (
    new Promise((resolve, reject) => {
        jwt.verify(token, APP_SECRET, (err: any, decoded: string) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    })
);

const xhrOnly = (req: Request, res: Response, next: NextFunction) => {
    if(!(req.xhr)) {
        res.sendStatus(404)
    }

    next();
}

const requireToken = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers) {
        res.sendStatus(401);
    }

    if (req.headers.authorization) {
        const token = req.headers.authorization.replace(/Bearer\s/, '');
        await verifyToken(token).catch((error: any) => {
            console.error(error);
            res.sendStatus(401);
        });

        next();
    }

    res.sendStatus(401);
}

app.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({where: {name: req.body.name}}).catch((error: any) => {
        console.error(error);
        return res.sendStatus(500);
    });

    return user && req.body.password === user.password ? res.send(generateToken(user.hash)) : res.sendStatus(400);
});

app.get('/secret', xhrOnly, requireToken, async (req: Request, res: Response, next: NextFunction) => {
    res.send('secret data!');
});

const server = app.listen(3000, () => {
    console.log("Node.js is listening to PORT:" + server.address().port);
});

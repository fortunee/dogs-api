import express from 'express';
import bodyParser from 'body-parser';
import request from 'request';
import redis from 'redis';
import { REFUSED } from 'dns';

const app = express();
const router = express.Router();
const redisClient = redis.createClient();
const DOGS = 'dogs'

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Populate DB
request.get('https://dog.ceo/api/breed/african/images', (error, response, body) => {
    if (error) {
        return error;
    }

    if (response && response.statusCode === 200) {
        const data = JSON.parse(body);
        redisClient.set(DOGS, JSON.stringify(data.message));
    }
})

// Define routes

/**
 * Gets all dogs data
 */
router.get('/dogs', (req, res) => {
    redisClient.get(DOGS, (err, result) => {
        if (err) {
            return err;
        }
        if (result) {
            return res.status(200).send({ dogs: JSON.parse(result) });
        }
    })
});
/**
 * Updates the dog data
 */
router.put('/dogs', (req, res) => {
    const dog = req.body.dog;
    redisClient.get(DOGS, (err, result) => {
        if (err) throw err;
        const data = JSON.parse(result);
        data.push(dog)
        redisClient.set(DOGS, JSON.parse(data), (err, reply) => {
            if (err) throw err;
            return res.status.send({ message: 'Dogs data updated'});
        });
    })
})

/**
 * Delete a dog data using its array index
 */
router.delete('/dogs/:index', (req, res) => {
    const { index } = req.params;
    redisClient.get(DOGS, (err, result) => {
        if (err) throw err;
        if (result) {
            const dogs = JSON.parse(result);
            const updatedDogs = [...dogs];
            updatedDogs.splice(index, 1);
            redisClient.set(DOGS, JSON.stringify(updatedDogs));
            res.status(204).send({
                previousDogCount: dogs.length,
                updatedDogsCount: updatedDogs.length,
                updatedDogs
            });
        }
    })
})

const PORT = process.env.PORT || 5600;
app.use('/', router);
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


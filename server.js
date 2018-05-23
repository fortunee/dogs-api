import express from 'express';
import bodyParser from 'body-parser';
import request from 'request';
import redis from 'redis';

const app = express();
const router = express.Router();
const redisClient = redis.createClient();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Populate DB
request.get('https://dog.ceo/api/breed/african/images', (error, response, body) => {
    if (error) {
        return error;
    }

    if (response && response.statusCode === 200) {
        const data = JSON.parse(body);
        redisClient.set('dogs', JSON.stringify(data.message));
    }
})

// Define routes
router.get('/dogs', (req, res) => {
    redisClient.get('dogs', (err, result) => {
        if (err) {
            return err;
        }
        if (result) {
            return res.send({ dogs: JSON.parse(result) });
        }
    })
});

const PORT = process.env.PORT || 5600;
app.use('/', router);
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


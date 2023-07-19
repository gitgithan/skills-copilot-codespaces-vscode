// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Map to store comments
const commentsByPostId = {};

// Get all comments for a post
app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

// Create a new comment
app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex'); // Generate unique id for comment
    const { content } = req.body; // Get content from request body
    const comments = commentsByPostId[req.params.id] || []; // Get comments for post

    comments.push({ id: commentId, content, status: 'pending' }); // Add new comment to comments array

    commentsByPostId[req.params.id] = comments; // Update comments

    // Send event to event bus
    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: req.params.id,
            status: 'pending'
        }
    });

    res.status(201).send(comments); // Return comments
});

// Receive event from event bus
app.post('/events', async (req, res) => {
    console.log('Event Received:', req.body.type);

    const { type, data } = req.body;

    if (type === 'CommentModerated') {
        const { id, postId, status, content } = data;

        const comments = commentsByPostId[postId];

        // Find comment in comments array
        const comment = comments.find(comment => {
            return comment.id === id;
        });

        comment.status = status; // Update status of comment

        // Send event to event bus
        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated',
            data: {
                id,
                postId,
                status,
                content
            }
        });
    }

    res.send({});
});

app.listen(4001, () => {
    console.log('Listening on 4001
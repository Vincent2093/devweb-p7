const mongoose = require('mongoose');

// Création du schéma de données postSchema avec mongoose
const postSchema = mongoose.Schema({
    userId: { type: String, required: true },
    content: { type: String, required: true, trim: true },
    imageUrl: { type: String },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    likes: { type: Number, required: true, default: 0 },
    dislikes: { type: Number, required: true, default: 0 },
    usersLiked: { type: [String], required: true, default: [] },
    usersDisliked: { type: [String], required: true, default: [] },
});

module.exports = mongoose.model('Post', postSchema);
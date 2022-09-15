const Post = require('../models/post');
const fs = require('fs');

// Fonction pour la récupération de toutes les posts
exports.getAllPosts = (req, res, next) => {
  Post.find()
    .then((posts) => res.status(200).json(posts))
    .catch((error) => res.status(400).json({ error }));
};

// Fonction pour la récupération d'une post
exports.getOnePost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => res.status(200).json(post))
    .catch((error) => res.status(404).json({ error }));
};

// Fonction pour la création d'une post
exports.createPost = (req, res, next) => {
  const postObject = JSON.parse(req.body.post)
  delete postObject._id;
  const post = new Post({
    ...postObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    createdAt: Date.now,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersdisLiked: []
  });
  post
    .save()
    .then(() => res.status(201).json({ message: 'Nouveau post enregistré !' }))
    .catch((error) => res.status(400).json({ error }));
};

// Fonction pour la modification d'une post
exports.modifyPost = (req, res, next) => {
  const postObject = req.file ? {
    ...JSON.parse(req.body.post),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete postObject._userId;

  Post.findOne({ _id: req.params.id })
    .then((post) => {
      if (!user.isAdmin || post.userId != req.auth.userId) {
        res.status(403).json({ message: 'Non autorisé !' });
        return;
      }
      if (postObject.imageUrl != undefined) {
        const filename = post.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log('Ancienne image supprimée !');
          }
        });
      };

      Post.updateOne({ _id: req.params.id }, { ...postObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Post modifié !' }))
        .catch(error => res.status(401).json({ error }));
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour la suppression d'une post
exports.deletePost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then(post => {
      if (!user.isAdmin || post.userId != req.auth.userId) {
        res.status(403).json({ message: 'Non autorisé !' });
        return;
      }

      const filename = post.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Post.deleteOne({ _id: req.params.id })
          .then(() => { res.status(200).json({ message: 'Post supprimé !' }) })
          .catch(error => res.status(401).json({ error }));
      });
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

// Fonction pour le système de like et dislike
exports.likePost = (req, res, next) => {
  let like = req.body.like
  let userId = req.body.userId
  let postId = req.params.id

  switch (like) {
    case 1:
      Post.updateOne({ _id: postId }, { $push: { usersLiked: userId }, $inc: { likes: +1 } })
        .then(() => res.status(200).json({ message: 'Like' }))
        .catch((error) => res.status(400).json({ error }))
      break;

    case 0:
      Post.findOne({ _id: postId })
        .then((post) => {
          if (post.usersLiked.includes(userId)) {
            Post.updateOne({ _id: postId }, { $pull: { usersLiked: userId }, $inc: { likes: -1 } })
              .then(() => res.status(200).json({ message: 'Neutre' }))
              .catch((error) => res.status(400).json({ error }))
          }
          else if (post.usersDisliked.includes(userId)) {
            Post.updateOne({ _id: postId }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } })
              .then(() => res.status(200).json({ message: 'Neutre' }))
              .catch((error) => res.status(400).json({ error }))
          }
        })
        .catch((error) => res.status(404).json({ error }))
      break;

    case -1:
      Post.updateOne({ _id: postId }, { $push: { usersDisliked: userId }, $inc: { dislikes: +1 } })
        .then(() => { res.status(200).json({ message: 'Dislike' }) })
        .catch((error) => res.status(400).json({ error }))
      break;

    default:
      console.log(error);
  }
}
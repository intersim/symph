var router = require('express').Router();
var mongoose = require('mongoose');
var Loop = mongoose.model('Loop');
var User = mongoose.model('User');
var Mix = mongoose.model('Mix');

//retrieve all loops (all)
router.get('/', function(req, res, next){
  Loop.find()
  .populate('creator')
  .then(function(loops) {
    res.json(loops.map(function(loop) {
      loop.creator = loop.creator.sanitize();
      return loop;
    }) );
  })
  .then(null, next);
});

//create new loop (all users)
router.post('/', function(req, res, next) {
  if (!req.user) {
    res.status(401).send();
  } else {
    req.body.creator = req.user
    var savedLoop;
    Loop.create(req.body)
    .then(function(loop) {
      savedLoop = loop;
      req.user.bucket.push(loop._id);
      return req.user.save();
    })
    .then(function(user) {
      if (!user) throw new Error('issue saving loop onto user');
      res.status(201).json(savedLoop);
    })
    .then(null, next);
  }
});

//loop id param
router.param('loopId', function(req, res, next) {
  Loop.findById(req.params.loopId)
  .populate('creator')
  .exec()
  .then(function(loop) {
    if (loop) {
      loop.creator = loop.creator.sanitize();
      req.loop = loop;
      next();
    } else {
      var err = new Error('No loop found');
      err.status = 404;
      throw err;
    }
  })
  .then(null, next);
})

//get individual loop (all)
router.get('/:loopId', function(req, res, next) {
  res.json(req.loop);
});

//edit loop (creator and admin)
router.put('/:loopId', function(req, res, next){
  if (!req.user) {
    res.status(401).send()
  } else if ( req.user.equals(req.loop.creator) || req.user.isAdmin ) {
    req.loop.set(req.body);
    req.loop.save()
    .then(function(loop) {
      res.status(201).json(loop);
    })
    .then(null, next)
  } else {
    res.status(403).send()
  }
});

//delete loop (creator and admin)
router.delete('/:loopId', function(req, res, next) {
  if ( req.user && ( req.user.equals(req.loop.creator) || req.user.isAdmin ) ) {
    req.loop.remove()
    .then(function(){
      res.status(204).send();
    })
    .then(null, next)
  } else {
    res.status(403).send()
  }
})

//get mixes containing the loop (all)
router.get('/:loopId/mixes', function(req, res, next){
  Mix.findByLoop(req.loop._id)
  .then(function(mixes){
    res.json(mixes)
  })
  .then(null, next)
})


module.exports = router;
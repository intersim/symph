'use strict';

var mongoose = require('mongoose');
var Promise = require('bluebird');

var TrackSchema = new mongoose.Schema({
    measures: [
      {
        rest: {
          type: Boolean,
          default: true
        },
        loop: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Loop'
        }
      }
    ],
    volume: Number,
    numVoices: Number,
    instrument: {
        type: String,
        enum: ['flute']
    }
});

TrackSchema.path('measures').validate(function(measures) {
  return measures.every(function(item) {
    return item.rest || item.loop;
  })
})

TrackSchema.methods.addLoop = function(loopId, idx) {
    while (this.loops.length < idx) this.loops.push({rest: true});
    this.loops.push({rest: false, loop: loopId});
    return this.save();
}

TrackSchema.methods.removeLoop = function(loopId) {
    for (var i in this.loops) {
      if (this.loops[i].loop === loopId) {
        this.loops[i].rest = true;
        delete this.loops[i].loop;
        break;
      }
    }
    return this.save();
}

TrackSchema.methods.findMix = function(){
  return mongoose.model('Mix').findOne({tracks: this._id});
}

TrackSchema.methods.clear = function() {
  this.loops = [];
  return this.save();
}

TrackSchema.methods.changeVolume = function(change) {
    this.volume += change;
    return this.save();
}

TrackSchema.methods.changeInstrument = function(newInstrument) {
    this.instrument = newInstrument;
    return this.save();
}

TrackSchema.methods.changeNumVoices = function(num) {
    this.numVoices = num;
    return this.save();
}

// TrackSchema.post('remove', function(deletedTrack, next) {
//   mongoose.model('Mix').find({tracks: deletedTrack._id})
//   .then(function(mix){
//     mix.tracks = mix.tracks.filter(function(track) {
//         return track !== deletedTrack._id;
//     });
//     return mix.save();
//   })
//   .then(function(){
//     next();
//   })
// });

// TrackSchema.post('save', function(track, next) {
//   track.findMix().populate('tracks')
//   .then(function(mix) {
//       mix.numBars = Math.max( tracks.map(function(track) {
//           return measures.length;
//         })
//       )
//       return mix.save();
//   })
//   .then(function() {
//     next();
//   })
//   .then(null, next);
// })

module.exports = mongoose.model('Track', TrackSchema);
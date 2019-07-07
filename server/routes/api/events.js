const Event = require('../../models/Event');
const authMiddleware = require('../../auth_middleware');

module.exports = app => {
  app.get('/api/events', authMiddleware, (req, res, next) => {
    Event.find({
      doctor: req.userId,
    })
      .exec()
      .then(event => res.json(event))
      .catch(err => next(err));
  });

  app.get('/api/events/:patientId', authMiddleware, (req, res, next) => {
    Event.find({
      patient: req.params.patientId,
      doctor: req.userId,
    })
      .exec()
      .then(event => res.json(event))
      .catch(err => next(err));
  });

  app.post('/api/events/:patientId', authMiddleware, function(req, res, next) {
    const eventArray = [];
    for (let i = 0; i < req.body.length; i++) {
      const event = new Event({
        name: req.body[i].name,
        date: req.body[i].date,
        patient: req.params.patientId,
        doctor: req.userId,
      });
      if (i >= 1) {
        event.parentEvent = eventArray[0]._id;
      }
      eventArray.push(event);
    }
    Event.collection
      .insertMany(eventArray)
      .then(() => res.json(eventArray))
      .catch(err => next(err));
  });

  app.delete('/api/events', authMiddleware, function(req, res, next) {
    Event.deleteMany({ _id: { $in: req.body } })
      .then(a => res.send(a))
      .catch(err => next(err));
  });

  app.put('/api/events', authMiddleware, (req, res, next) => {
    const allEventPromises = req.body.map(element =>
      Event.findByIdAndUpdate(element._id, element)
    );
    Promise.all(allEventPromises)
      .then(() => {
        res.send('ok');
      })
      .catch(err => next(err));
  });
};

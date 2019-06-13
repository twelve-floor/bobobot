const Event = require('../../models/Event');
const authMiddleware = require('../../auth_middleware');

module.exports = app => {
  app.get('/api/events', authMiddleware, (req, res, next) => {
    console.log({
      userId: req.userId
    });
    Event.find()
      .exec()
      .then(event => res.json(event))
      .catch(err => next(err));
  });

  app.get('/api/events/:patientId', authMiddleware, (req, res, next) => {
    console.log({
      patient: req.params.patientId,
      doctor: req.userId
    });
    Event.find({
        patient: req.params.patientId,
        doctor: req.userId
      })
      .exec()
      .then(event => res.json(event))
      .catch(err => next(err));
  });

  app.post('/api/events', authMiddleware, function (req, res, next) {
    let eventArray = [];
    for (i = 0; i < req.body.length; i++) {
      const event = new Event({
        name: req.body[i].name,
        date: req.body[i].date,
        patient: req.body[i].patient,
        doctor: req.body[i].doctor,
        parentEvent: req.body[i].parentEvent,
        sent: req.body[i].sent,
      });
      if (i >= 1) {
        event.parentEvent = eventArray[0]._id;
      };
      eventArray.push(event);
    }
    console.log(eventArray);
    Event.collection.insertMany(eventArray)
      .then(() => res.json(eventArray))
      .catch(err => next(err));
  });

  app.delete('/api/events/:id', authMiddleware, function (req, res, next) {
    Event.findOneAndRemove({
        _id: req.params.id
      })
      .exec()
      .then(event => res.json())
      .catch(err => next(err));
  });

  app.put('/api/events/:id', authMiddleware, (req, res, next) => {
    Event.findById(req.params.id)
      .exec()
      .then(event => {
        event.name = req.body.name;
        event.date = req.body.date;
        event.patient = req.body.patient;
        event.doctor = req.body.doctor;
        event.parentEvent = req.body.parentEvent;
        event.sent = req.body.sent;

        event
          .save()
          .then(() => res.json(event))
          .catch(err => next(err));
      })
      .catch(err => next(err));
  });
};

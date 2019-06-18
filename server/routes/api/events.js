const Event = require('../../models/Event');
const authMiddleware = require('../../auth_middleware');

module.exports = app => {
  app.get('/api/events', authMiddleware, (req, res, next) => {
    Event.find()
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

  app.post('/api/events', authMiddleware, function(req, res, next) {
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

  app.put('/api/events/', authMiddleware, (req, res, next) => {
    req.body.forEach(element => {
      Event.findById(element._id)
        .exec()
        .then(event => {
          event.name = element.name;
          event.date = element.date;
          event.patient = element.patient;
          event.doctor = element.doctor;
          event.parentEvent = element.parentEvent;
          event.sent = element.sent;

          event.save().catch(err => next(err));
        })
        .catch(err => next(err));
    });
    res.json('ok');
  });
};

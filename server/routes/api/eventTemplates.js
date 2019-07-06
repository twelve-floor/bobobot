const EventTemplate = require('../../models/EventTemplate');
const authMiddleware = require('../../auth_middleware');

module.exports = app => {
  app.get('/api/eventTemplates', authMiddleware, (req, res, next) => {
    EventTemplate.find({
      doctor: req.userId,
    })
      .exec()
      .then(event => res.json(event))
      .catch(err => next(err));
  });

  app.post('/api/eventTemplates', authMiddleware, function(req, res, next) {
    const eventTemplate = new EventTemplate({
      name: req.body.name,
      events: req.body.events,
      doctor: req.userId,
    });
    eventTemplate
      .save()
      .then(() => res.json(eventTemplate))
      .catch(err => next(err));
  });

  app.delete('/api/eventTemplates', authMiddleware, function(req, res, next) {
    Event.deleteMany({ _id: { $in: req.body } })
      .then(a => res.send(a))
      .catch(err => next(err));
  });

  app.put('/api/eventTemplates', authMiddleware, (req, res, next) => {
    // req.body.forEach(element => {
    //   Event.findById(element._id)
    //     .exec()
    //     .then(event => {
    //       event.name = element.name;
    //       event.date = element.date;
    //       event.patient = element.patient;
    //       event.doctor = element.doctor;
    //       event.parentEvent = element.parentEvent;
    //       event.sent = element.sent;
    //       event.save().catch(err => next(err));
    //     })
    //     .catch(err => next(err));
    // });
    // res.json('ok');
  });
};

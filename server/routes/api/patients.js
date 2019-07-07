const Patient = require('../../models/Patient');
const authMiddleware = require('../../auth_middleware');

module.exports = app => {
  app.get('/api/patients', authMiddleware, (req, res, next) => {
    Patient.find()
      .exec()
      .then(patient => res.json(patient))
      .catch(err => next(err));
  });

  app.post('/api/patients', authMiddleware, function(req, res, next) {
    const patient = new Patient({
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
    });
    patient
      .save()
      .then(() => res.json(patient))
      .catch(err => next(err));
  });

  app.delete('/api/patients/:id', authMiddleware, function(req, res, next) {
    Patient.findOneAndRemove({ _id: req.params.id })
      .exec()
      .then(patient => res.json())
      .catch(err => next(err));
  });

  app.put('/api/patients/:id', authMiddleware, (req, res, next) => {
    Patient.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
    })
      .then(() => {
        res.send(req.body);
      })
      .catch(err => next(err));
  });
};

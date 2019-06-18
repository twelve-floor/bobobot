const Patient = require('../../models/Patient');
const authMiddleware = require('../../auth_middleware');

module.exports = app => {
  app.get('/api/patients', authMiddleware, (req, res, next) => {
    Patient.find()
      .exec()
      .then(patient => res.json(patient))
      .catch(err => next(err));
  });

  app.post('/api/patients', function(req, res, next) {
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

  app.delete('/api/patients/:id', function(req, res, next) {
    Patient.findOneAndRemove({ _id: req.params.id })
      .exec()
      .then(patient => res.json())
      .catch(err => next(err));
  });

  app.put('/api/patients/:id', (req, res, next) => {
    Patient.findById(req.params.id)
      .exec()
      .then(patient => {
        patient.name = req.body.name;
        patient.age = req.body.age;
        patient.email = req.body.email;

        patient
          .save()
          .then(() => res.json(patient))
          .catch(err => next(err));
      })
      .catch(err => next(err));
  });
};

const Patient = require('../../models/Patient');
const User = require('../../models/User');
const authMiddleware = require('../../auth_middleware');

module.exports = app => {
  app.get('/api/patients', authMiddleware, async (req, res, next) => {
    try {
      const user = await User.findById(req.userId).populate('patients');
      res.json(user.patients);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/patients', authMiddleware, async function(req, res, next) {
    try {
      const user = await User.findById(req.userId);
      let patient = await Patient.findOne({
        phoneNumber: req.body.phoneNumber,
      });
      if (!patient) {
        patient = new Patient({
          name: req.body.name,
          phoneNumber: req.body.phoneNumber,
        });
        await patient.save();
      }
      if (!user.patients.includes(patient._id)) {
        user.patients.push(patient);
        await user.save();
        res.json(patient);
      } else {
        res.json(null);
      }
    } catch (error) {
      next(error);
    }
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

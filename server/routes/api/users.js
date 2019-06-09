const User = require('../../models/User');

module.exports = app => {
  app.post('/api/users', function(req, res, next) {
    const user = new User({
      name : req.body.name,
      email : req.body.email.main
    });
    user
      .save()
      .then(() => res.json(user))
      .catch(err => {
          console.log('Something asdf')
          res.status(500).send('Something broke!')
        });
  });

  app.put('/api/users/:user_id', (req, res, next) => {
    User.findById(req.params.user_id)
      .exec()
      .then(user => {
        user.name = req.body.name;
        user.email = req.body.email.main;

        user
          .save()
          .then(() => res.json(user))
          .catch(err => next(err));
      })
      .catch(err => next(err));
  });
};

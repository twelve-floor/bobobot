const Event = require('../../models/Event');

//вот это очень странно в js. Или есть другой способ найти события с сегодняшней датой?
Date.prototype.ddmmyyyy = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();
  return [
    (dd > 9 ? '' : '0') + dd,
    (mm > 9 ? '' : '0') + mm,
    this.getFullYear(),
  ].join('.');
};

module.exports = app => {
  app.get('/api/wakeup', (req, res, next) => {
    var date = new Date();
    var dateForSearch = date.ddmmyyyy();

    Event.find({
      date: dateForSearch,
    })
      .exec()
      .then(event => res.json(event))
      .catch(err => next(err));
  });
};

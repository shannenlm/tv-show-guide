// helpers for express handlebars
var moment = require('moment');

module.exports = {
  avgRating: function(data) { 
    var _data = JSON.stringify(data);
    var sum = 0;
    var count = 0; 

    for (var i in _data) { 
      if (data[i]) { 
        sum += data[i].rating;
        count += 1;
      }
    }

    return sum/count;
  },

  getTime: function() { 
    return moment().format('MMMM Do YYYY, h:mm:ss a');
  }
}
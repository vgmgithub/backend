const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/hbbook20232', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(
    () => console.log("connected to db successfully.....")
).catch(
    (err) => console.log(err)
);

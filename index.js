const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
// const FileModel = require('./models/FileModel'); // Import your Mongoose model
const fs = require('fs'); // Import the fs module
const app = express();
const port = 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your React.js app's URL
}));
// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/hbbook2023', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("connected to db successfully.....")).catch((err) => console.log(err));




const coordinatesSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
});

const checkboxSchema = new mongoose.Schema({
  parking: Boolean,
  decoration: Boolean,
  powerbackup: Boolean,
  catering: Boolean,
  video_photo: Boolean,
  achall: Boolean,
  smoking: Boolean,
});
// Create a Mongoose Schema for User Registration
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobileNumber: Number,
  address: String, // This field will store the selected address
  coordinates: coordinatesSchema,
  city: String,
  area: String,
  username: String,
  password: String,
  repassword: String,
});

const fileSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number,
  path: String, // Store the path to the actual file on your server or storage service
});
      
     
// Create a Mongoose Schema for Booking
const bookSchema = new mongoose.Schema({
  venue_id: String,
  venue_name: String,
  venue_count: Number,
  venue_location: String,
  user_id: String,     // Add newField1
  user_name: String,
  booking_date: Date,
  booked_on: {
    type: Date,
    default: Date.now,
  },
 

});


// Create a Mongoose Schema for Venue Registration
const venueSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobileNumber: Number,
  city: String,
  area: String,
  address: String, // This field will store the selected address
  coordinates: coordinatesSchema,
  facilities: checkboxSchema,
  venuetype: String,
  startDate: Date,
  endDate: Date,
  maxcount: Number,
  filelist: fileSchema,
  fare: Number,

});

// Create a Mongoose Schema for Contact Registration
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

// const loginSchema = new mongoose.Schema({
//   username: String,
//   password: String,
// });

const User = new mongoose.model('User', userSchema);
const Contact = new mongoose.model('Contact', contactSchema);
const Venue = new mongoose.model('Venue', venueSchema);
const Book = new mongoose.model('Book', bookSchema);



app.use(express.urlencoded({ extended: true }));


app.get('/api/items', async (req, res) => {
  try {
    const items = await User.find(); // Fetch all items from MongoDB
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});


// GET request to fetch item data by ID
app.get('/api/venue/:id', async (req, res) => {
  try {
    const venueId = req.params.id;

    // Use Mongoose's findById method to find a venue by its _id
    const venue = await Venue.findById(venueId);

    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Send the venue data as a JSON response
    res.json(venue);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

});


// GET request to fetch bookings
app.get('/booking/', async (req, res) => {
  try {
    const items = await Book.find(); // Fetch all items from MongoDB
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Bookings' });
  }
});


// GET request to fetch bookings by ID
app.get('/my-booking/:id', async (req, res) => {
  try {
    const Userid = req.params.id;
 
    // Use Mongoose's findById method to find a venue by its _id
    const book = await Book.find({ user_id: Userid});

    if (!book) {
      return res.status(404).json({ error: 'booking not found' });
    }

    // Send the venue data as a JSON response
    res.json(book);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

});




async function getAllDatesByVenueId(venueId) {
  try {
    // Find all bookings with the given venueId
    const bookings = await Book.find({ venue_id:venueId });

    // Extract and collect all unique dates from the bookings
    const allDates = bookings.reduce((dates, booking) => {
      const date = booking.booking_date.toISOString().split('T')[0]; // Assuming the date is stored as a Date object
      if (!dates.includes(date)) {
        dates.push(date);
      }
      // console.log(dates)
      return dates;
    }, []);

    return allDates;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}


// GET request to fetch bookings dates by venueid
const venueavaildate = {};
app.get('/bookingdates/:id', async (req, res) => {
  const venueId = req.params.id;
    try {
      // const { venueId } = req.params.id;
      const dates = await getAllDatesByVenueId(venueId); // Use the function from the previous answer

      venueavaildate[venueId] = dates;
      // console.log(venueavaildate);
      res.json(venueavaildate);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.put('/api/venue/:id', async (req, res) => {
  const venueId = req.params.id;
  const updatedData = req.body; // Updated data from the request body

  try {
    // Use Mongoose to find the venue by ID and update it
    const updatedVenue = await Venue.findByIdAndUpdate(
      venueId,
      updatedData,
      { new: true } // To get the updated venue as the result
    );

    if (!updatedVenue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Send the updated venue as the response
    res.json(updatedVenue);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/venues/:id', async (req, res) => {
  try {
    const venueId = req.params.id;

    // Use your database model's delete method to remove the record by ID
    await Venue.findByIdAndDelete(venueId);

    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 650b487e676d5bd82d76a6d7


app.get('/api/venue', async (req, res) => {
  try {
    const items = await Venue.find(); // Fetch all venue from MongoDB
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch venue' });
  }
});

app.get('/counts', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const venueCount = await Venue.countDocuments();
    const bookCount = await Book.countDocuments();
    res.json({ userCount, venueCount, bookCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Serve images from a specific directory

app.get('/api/getImage/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = `uploads/${imageName}`; // Relative to the root
  // Check if the file exists
  if (fs.existsSync(imagePath)) {
    // If the image exists, send it as a response
    res.sendFile(imagePath, { root: __dirname });
  } else {
    // If the image does not exist, send a default image
    res.sendFile(`uploads/default.jpg`, { root: __dirname });
  }
  // res.sendFile(imagePath, { root: __dirname });
});
// Define a route for user authentication
app.post('/api/authenticate', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if a user with the provided username and password exists in the database
    const user = await User.findOne({ username, password });

    if (user) {
      console.log(user);
      // User exists and credentials are valid
      res.status(200).json({ message: 'Authentication successful',userData: user._id });
    } else {
      // User does not exist or credentials are invalid
      res.status(401).json({ message: 'Authentication failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Authentication error' });
  }
});

// Define a POST route to handle form submissions
app.post('/insertregister', async (req, res) => {
  try {
    console.log(req);
    // Create a new user document
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      address: req.body.address,
      coordinates: req.body.coordinates,
      city: req.body.city,
      area: req.body.area,
      username: req.body.username,
      password: req.body.password,
      
    });

    // Save the user to the database
    await newUser.save();

    res.send('Registration successful!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Registration failed.');
  }
});


// // Define a POST route to handle form submissions
// app.post('/booking', async (req, res) => {
//   try {
//     console.log(req);
//     // Create a new user document
//     const newUser = new Book({
//       venue_id: req.body.venue_id,
//       venue_name: req.body.venue_name,
//       venue_count: req.body.venue_count,
//       venue_location: req.body.venue_location,
//       user_id: req.body.user_id,     // Add newField1
//       user_name: req.body.user_name,
//       booking_date: req.body.booking_date,
      
//     });

//     // Save the user to the database
//     await newUser.save();

//     res.send('Booking successful!');
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Booking failed.');
//   }
// });



app.post('/booking', async (req, res) => {
  try {
    const { venue_id,venue_name,venue_count,venue_location, user_id, user_name, booking_date } = req.body;
    if (!venue_id || !venue_name || !venue_count || !venue_location || !user_id || !user_name || !booking_date) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    // Define the query to find or create the booking
    const query = {
      venue_id,
      user_id,
      booking_date,
    };

    // Define the document to insert or update
    const bookingData = {
      venue_id,
      venue_name,
      venue_count,
      venue_location,
      user_id,     // Add newField1
      user_name,
      booking_date,
      
      // Add other booking fields as needed
    };
    console.log('BookData '+bookingData.venue_name);
    // Use findOneAndUpdate with upsert: true inside an async function
    const booking = await Book.findOneAndUpdate(
      query,
      bookingData,
      { upsert: true, new: true }
    );
      
    res.status(201).json({ message: 'Booking created or updated successfully', booking });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



const storage = multer.diskStorage({
  destination: (req, uploadedImage, cb) => {
    // Define the destination folder where the uploaded files will be stored
    cb(null, 'uploads/');
  },
  filename: (req, uploadedImage, cb) => {
    // Define the filename for the uploaded file
    cb(null, uploadedImage.originalname);
  },
});

const upload = multer({ storage });
// Define a POST route to handle form submissions
app.post('/venue', upload.single('uploadedImage'),async (req, res) => {
  try {
    console.log(req);
    // Create a new user document
    const newVenue = new Venue({
      name: req.body.name,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      city: req.body.city,
      area: req.body.area,
      address: req.body.address,
      coordinates: req.body.coordinates,
      facilities: {
        parking: req.body.parking,
        decoration: req.body.decoration,
        powerbackup: req.body.powerbackup,
        catering: req.body.catering,
        video_photo: req.body.video_photo,
        achall: req.body.achall,
        smoking: req.body.smoking,
      },
      venuetype: req.body.dropdownValue,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      maxcount: req.body.maxcount,
      filelist: req.file,
      fare: req.body.fare,
      
    });
   
    // Save the venue to the database
    await newVenue.save();

    res.send('Venue Registration successful!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Venue Registration failed.');
  }
});


// Define a POST route to handle form submissions
app.post('/contact', async (req, res) => {
  try {
    console.log(req);
    // Create a new user document
    const newContact = new Contact({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
      
    });

    // Save the user to the database
    await newContact.save();

    res.send('Contact submitted successful!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Contact submission failed.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

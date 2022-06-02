import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`connected to mongoDB`);
  })
  .catch((err) => {
    console.log(`error to connect to mongoDB ${err.message}`);
  });

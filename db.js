import mongoose from "mongoose";

const MONGODB_URI = `mongodb+srv://pottenwalder:emtcMKLtQP5OQRkc@cluster0.cjkjp.mongodb.net/?retryWrites=true&w=majority`;

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

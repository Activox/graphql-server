import mongoose from "mongoose";
import uniqueValidators from "mongoose-unique-validator";

const schema = new mongoose.Schema({
  name: {
    type: "string",
    required: true,
    unique: true,
    minlength: 5,
  },
  phone: {
    type: "string",
    minlength: 5,
  },
  street: {
    type: "string",
    required: true,
    minlength: 5,
  },
  city: {
    type: "string",
    required: true,
    minlength: 3,
  },
});

schema.plugin(uniqueValidators);

export default mongoose.model("Person", schema);

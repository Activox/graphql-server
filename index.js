import { ApolloServer, gql, UserInputError } from "apollo-server";
import "./db.js";
import Person from "./models/person.js";
import User from "./models/user.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "^@tUYCwF89F3x^a2VJ7yYj^bCh8%!Q37wwzyp4M2W";

const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }

  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  type User {
    username: String!
    friends: [Person]
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
    me: User
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editPhoneNumber(name: String!, phone: String!): Person
    createUser(username: String!): User
    login(username: String!, password: String!): Token
    addAsFriend(friend: String!): User
  }
`;

const resolvers = {
  Query: {
    personCount: async () => Person.collection.countDocuments(),
    allPersons: async (root, args) => {
      if (!args.phone) return Person.find({});
      return Person.find({
        phone: { $exists: args.phone === "YES" },
      });
    },
    findPerson: async (root, args) => {
      return Person.findOne({ name: args.name });
    },
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Mutation: {
    addPerson: async (root, args, context) => {
      const { currentUser } = context;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }
      const person = new Person({
        ...args,
      });
      try {
        await person.save();
        currentUser.friends = currentUser.friends.concat(person);
        await currentUser.save();

        return person;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },
    editPhoneNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name });
      if (!person) {
        throw new UserInputError("Person not found", {
          invalidArgs: args,
        });
      }
      try {
        person.phone = args.phone;
        await person.save();
        return person;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
      });
      try {
        await user.save();
        return user;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== "secret") {
        throw new UserInputError("Wrong Credentials", {
          invalidArgs: args,
        });
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      };
      return {
        value: jwt.sign(userForToken, JWT_SECRET),
      };
    },
    addAsFriend: async (root, args, { currentUser }) => {
      if (!currentUser) throw new AuthenticationError("not authenticated");

      const person = await Person.findOne({ name: args.friend });
      if (!person) {
        throw new UserInputError("Person not found", {
          invalidArgs: args,
        });
      }

      const nonFriendlyAlready = (person) =>
        !currentUser.friends.map((p) => p._id).includes(person._id);

      if (nonFriendlyAlready(person)) {
        currentUser.friends = currentUser.friends.concat(person);
        await currentUser.save();
      }
      return currentUser;
    },
  },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const { id } = jwt.verify(auth.substring(7), JWT_SECRET);
      const currentUser = await User.findById(id).populate("friends");
      return { currentUser };
    }
  },
});

server.listen().then(({ url }) => console.log(`server ready at ${url}`));

import { ApolloServer, gql, UserInputError } from "apollo-server"
import {v1 as uuid} from "uuid"

const persons = [
    {
        name: 'Paul',
        phone: '8093555339',
        street: "Av. Francisco Lora",
        city: "Santiago",
        id: "3D55FE6E05CB645336F7E86D8904D471"
    },
    {
        name: 'Raine',
        phone: '8097894561',
        street: "Yapur Dumit",
        city: "Santiago",
        id: "62FB18674B6DBD51134BE17A155C5CD3"
    },
    {
        name: 'Miguel',
        street: "Av. Circunvalacion Sur",
        city: "Santiago",
        id: "4C1F31967FDC91AAC1757486354D9C78"
    },
]

const typeDefs = gql`

    enum YesNo {
        YES, 
        NO
    }

    type Address {
        street: String!,
        city: String!
    }

    type Person {
        name: String!
        phone: String
        address: Address!
        id: ID!
    }

    type Query {
        personCount: Int!
        allPersons(phone: YesNo): [Person]!
        findPerson(name: String!): Person
    }

    type Mutation {
        addPerson(
            name: String!,
            phone: String,
            street: String!,
            city: String!
        ): Person
    }
`

const resolvers = {
    Query: {
        personCount: () => persons.length,
        allPersons: (root, args) => {
            if (!args.phone) return persons

            return persons.filter(person => (
                args.phone === "YES" ? person.phone : !person.phone
            ))
        },
        findPerson: (root, args) => {
            const {name} = args
            return persons.find(person => person.name === name)
        }
    },
    Mutation: {
        addPerson: ( root, args ) => {
            if(persons.find(person => person.name === args.name)){
                throw new UserInputError("Person already exist!", {
                    invalidArgs: args.name
                })
            }
            const person = {...args, id: uuid()}
            persons.push(person)
            return person
        }
    },
    Person: {
        address: (root) => {
            return {
                street: root.street,
                city: root.city
            }
        }
    }
}

const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers
})

server.listen().then(({url})=> console.log(`server ready at ${url}`))
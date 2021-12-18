import { ApolloServer, gql, UserInputError } from "apollo-server"
import {v1 as uuid} from "uuid"
import axios from "axios"

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
        editPhoneNumber(
            name: String!,
            phone: String!
        ): Person
    }
`

const personsFromApi = async () => {
    return await axios.get('http://localhost:3000/persons')
}

const resolvers = {
    Query: {
        personCount: async () => {
            const {data: persons} = await personsFromApi()
            return persons.length
        },
        allPersons: async (root, args) => {
            const {data: persons} = await personsFromApi()
            if (!args.phone) return persons
            return persons.filter(person => (
                args.phone === "YES" ? person.phone : !person.phone
            ))
        },
        findPerson: async (root, args) => {
            const {data: persons} = await personsFromApi()
            const {name} = args
            return persons.find(person => person.name === name)
        }
    },
    Mutation: {
        addPerson: async ( root, args ) => {
            const {data: persons} = await personsFromApi()
            if(persons.find(person => person.name === args.name)){
                throw new UserInputError("Person already exist!", {
                    invalidArgs: args.name
                })
            }
            const person = {...args, id: uuid()}
            persons.push(person)
            return person
        },
        editPhoneNumber: async(root, args) => {
            const {data: persons} = await personsFromApi()
            const personIndex = persons.findIndex(person => person.name === args.name)
            if (personIndex === -1){
                throw new UserInputError("Person no exists!")
            }
            const updatedPerson = {...persons[personIndex], phone: args.phone}
            persons[personIndex] = updatedPerson
            return updatedPerson
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
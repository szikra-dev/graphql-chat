import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { Kind, OperationTypeNode } from 'graphql'
import { createClient as createWsClient } from 'graphql-ws'
import { getAccessToken } from '../auth'

const GRAPHQL_URL = 'http://localhost:9000/graphql'
const GRAPHQL_WS_URL = 'ws://localhost:9000/graphql'

const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
})

const wsClient = createWsClient({
  url: GRAPHQL_WS_URL,
  connectionParams: () => ({
    accessToken: getAccessToken(),
  }),
})

const wsLink = new GraphQLWsLink(wsClient)

const isSubscription = ({ query }) => {
  const definition = getMainDefinition(query)
  return (
    definition.kind === Kind.OPERATION_DEFINITION &&
    definition.operation === OperationTypeNode.SUBSCRIPTION
  )
}

export const client = new ApolloClient({
  link: split(isSubscription, wsLink, httpLink),
  cache: new InMemoryCache(),
})

export default client

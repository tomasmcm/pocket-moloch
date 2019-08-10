import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Amplify from 'aws-amplify';

import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { withClientState } from 'apollo-link-state';
import { ApolloLink } from 'apollo-link';
import { ApolloProvider } from 'react-apollo';

import config from './config';
import { resolvers } from './utils/Resolvers';
import Store from './contexts/Store';

Amplify.configure({
  Auth: {
    mandatorySignIn: false,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
  },
  Storage: {
    region: config.s3.REGION,
    bucket: config.s3.BUCKET,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
  },
});

const cache = new InMemoryCache();

const client = new ApolloClient(
  {
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.map(({ message, locations, path }) =>
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
            ),
          );
        if (networkError) console.log(`[Network error]: ${networkError}`);
      }),
      new HttpLink({
        uri: config.GRAPH_NODE_URI,
        credentials: 'same-origin'
      }),
      withClientState({
        defaults: {
          isConnected: true
        },
        resolvers,
        cache
      })
    ]),
    cache
  }
);

  
// {
//   uri: config.GRAPH_NODE_URI,
//   clientState: {
//     resolvers,
//   },
// }

const Index = () => (
  <ApolloProvider client={client}>
    <Store>
      <App client={client} />
    </Store>
  </ApolloProvider>
);
ReactDOM.render(<Index />, document.getElementById('root'));

serviceWorker.unregister();

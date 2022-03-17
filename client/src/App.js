import { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import './App.css';

const QUERY_URL = 'https://api.studio.thegraph.com/query/23346/bayc/v0.0.10';
const query = `
  query {
    owners(first: 10, orderBy: tokenCount, orderDirection:desc) {
      address
      tokenCount
    }
  }`;
const client = new ApolloClient({
  uri: QUERY_URL,
  cache: new InMemoryCache()
})

function App() {
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    client.query({
      query: gql(query),
    })
    .then(({ data: { owners } }) => setOwners(owners))
    .catch(err => {
      console.log('Error fetching data: ', err)
    })
  }, []);

  return (
    <div className="App">
      <h1>The addresses that own the most <a target="_blank" href="https://boredapeyachtclub.com/#/">BAYC (Bored Ape Yacht Club)</a> tokens</h1>
      <ol>{owners.map(renderOwner)}</ol>
    </div>
  );

  function renderOwner({ address, tokenCount }) {
    return (
      <li key={address} className="owner">
        <a target="_blank" href={`https://opensea.io/${address}`}>{address}</a> owns {tokenCount} BAYC token{tokenCount == 1 ? '' : 's'}.
      </li>
    );
  }
}

export default App;

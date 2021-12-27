import { Amplify,DataStore } from 'aws-amplify';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { useEffect } from 'react';

import { Todo } from './models';

Amplify.configure(awsExports);

export default function App() {

    useEffect(() => {
      const getTodos = async () => {
        const todos = await DataStore.query(Todo);
        console.log(todos);
      }

      getTodos()
    }, [])
  

    return (
      <Authenticator>
        {({ signOut, user }) => (    
          <main>
            <h1>Hello {user.username}</h1>
            <button onClick={signOut}>Sign out</button>
          </main>
        )}
      </Authenticator>
    );
  
}
import React, { useContext, useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import { Auth } from 'aws-amplify'

import { CurrentUserContext } from '../../contexts/Store'

const SignOut = () => {
  const [, setCurrentUser] = useContext(CurrentUserContext)

  useEffect(() => {
    // log user out of aws cognito auth,
    // probably should clear sdk from local storage but no way to recover yet
    const currentUser = async () => {
      try {
        await Auth.signOut()
        setCurrentUser()
        localStorage.clear()
      } catch (err) {
        // TODO: handle errors better
        // eslint-disable-next-line no-console
        console.error('signout failed!', err)
      }
    }

    currentUser()
  }, [setCurrentUser])

  return <Redirect to="/" />
}

export default SignOut

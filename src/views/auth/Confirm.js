import React from 'react';
import { withRouter } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Auth } from 'aws-amplify';

import Loading from '../../components/shared/Loading';
import GreenCheck from '../../assets/GreenCheck.svg';
const Confirm = ({ history }) => {
  const [focused, setFocused] = React.useState(false)
  const [authSuccess, setAuthSuccess] = React.useState(false)
  let historyState = history.location.state;
  let authError = null;
  return (
    <div className="Confirm">
      <Formik
        initialValues={{ userName: '',authCode: '' }}
        validate={(values) => {
          let errors = {};
          if (!values.authCode) {
            errors.authCode = 'Required';
          }
          if (!historyState && !values.userName) {
            errors.userName = 'Required';
          }

          return errors;
        }}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            if (historyState && historyState.userName) {
            let data = await Auth.confirmSignUp(historyState.userName, values.authCode, {
              forceAliasCreation: false,
            })
            setSubmitting(false)
            setAuthSuccess(!!data)}
            else {
              let data = await Auth.confirmSignUp(values.userName, values.authCode, {
              forceAliasCreation: false,
            })
            setSubmitting(false)
            setAuthSuccess(!!data)
            }
          } catch (err) {
            console.log('error confirming signing up: ', err);
            authError = err;
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, errors }) => {
          if (isSubmitting) {
            return <Loading />;
          }

          return (
            <Form className="Form">
              {authError &&
                <div className="Form__auth-error">{authError.message}</div>
              }
              {authSuccess ? <>
                <h2 className="Pad">Email Verified</h2>
                <img src={GreenCheck} alt='check svg'/>
                <button type="button" onClick={()=>history.push('/sign-in')}>
                Sign In
              </button>
              </> :
              <>
              <h2 className="Pad">Confirm your email</h2>
              <p>We sent a Confirmation Code to your email address. Enter it here to continue.</p>
              {!historyState &&
              <>
              <Field name="userName">
              {({ field, form }) => (
                <div
                  className={
                    field.value
                      ? 'Field HasValue'
                      : 'Field '
                  }
                >
                  <label>Username</label>
                  <input type="text" {...field}/>
                </div>
              )}
              </Field>
              <ErrorMessage name="userName"  render={(msg) => <div className="Error">{msg}</div>}
              />
              </>}
              <Field name="authCode">
              {({ field, form }) => (
                <div
                  className={
                    field.value
                      ? 'Field HasValue'
                      : 'Field '
                  }
                >
                  <label>Confirmation Code</label>
                  <input type="text" {...field} onInput={()=>setFocused(true)}/>
                </div>
              )}
              </Field>
              <ErrorMessage name="authCode"  render={(msg) => <div className="Error">{msg}</div>}
              />
              <p style={{color:'#d756d9'}} onClick={()=>history.push('/resend-code')}>Didn't get the code? Click here!</p>
              <button type="submit" className={(Object.keys(errors).length<1 && focused)?"":"Disabled"} disabled={isSubmitting}>
                Submit
              </button>
              </>}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default withRouter(Confirm);

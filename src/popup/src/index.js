import React from 'react'
import ReactDOM from 'react-dom'
import { setDoc, collection, doc } from "firebase/firestore"; 
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
import { FIREBASE_CONFIG } from './const'
import { v4 as uuidv4 } from 'uuid';

export const firebase = initializeApp(FIREBASE_CONFIG)
export const auth = getAuth(firebase)
const database = getFirestore(firebase);

export const App = (props) => {

    const [user, setUser] = React.useState(undefined)

	const [message, setMessage] = React.useState('');
	const [showMessage, setShowMessage] = React.useState(false);

	const styles = {
		formStyle: {
			width: '385px',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
		},
		inputStyle: {
			boxSizing: 'border-box',
			width: '100%',
			margin: '5px auto',
			marginRight: '5px',
			height: '35px',
			padding: '5px',
			border: '1px solid grey',
			borderRadius: '5px',
			fontSize: '14px',
			color: '#555',
			outline:'none',
		},
		addBtnStyle: {
			minWidth: '100%',
			height: '30px',
			backgroundColor: '#0d6efd',
			border: 'none',
			borderRadius: '3px',
			cursor: 'pointer',
			color: 'white',
			textAlign: 'center',
			padding: '5px',
			textDecoration: 'none',
		},
		signOutBtnStyle: {
			height: '20px',
			backgroundColor: '#f54b4b',
			border: 'none',
			borderRadius: '3px',
			cursor: 'pointer',
			color: 'white',
			textAlign: 'center',
			padding: '3px',
			marginLeft: '5px',
			textDecoration: 'none',
		},
		signInBtnStyle: {
			height: '40px',
			width: '150px',
			backgroundColor: '#f54b4b',
			border: 'none',
			borderRadius: '3px',
			cursor: 'pointer',
			color: 'white',
			textAlign: 'center',
			padding: '3px',
			marginLeft: '5px',
			marginTop: '20px',
			textDecoration: 'none',
		}
	}

	React.useEffect(() => {
        let timer;
        
        if (showMessage) {
            timer = setTimeout(() => {
                setShowMessage(false)
            }, 2000);
        }

        return () => clearTimeout(timer);
        // eslint-disable-next-line
    }, [showMessage]);    

	const AddWordModal = () => {

		const [english, setEnglish] = React.useState('');
    	const [russian, setRussian] = React.useState('');

		const linkToWords = {
			firstUrl: 'users',
			secondUrl: user.uid,
			thirdUrl: 'words'
		}

		const handleSubmit = (e) => {
			e.preventDefault();
	
			const newObj = {
				english: english.toLowerCase(),
				russian: russian.toLowerCase(),
				date: Date.now(),
				favorite: false,
				id: uuidv4()
			}
	
			const colRef = collection(database, linkToWords.firstUrl, linkToWords.secondUrl, linkToWords.thirdUrl)
			setDoc(doc(colRef, newObj.id), newObj);
			
			setEnglish('');
			setRussian('');
			
			setShowMessage(true);
            setMessage("It's was successfully added!")
		}
		
		return (
			<form className='addmodal__form' onSubmit={handleSubmit} style={styles.formStyle} >
				<div className='addmodal__title' style={{fontSize: '20px'}}>Add new word</div>

				<div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
					<input 
						tabindex={1}
						autocomplete="off"
						style={styles.inputStyle}
						value={english}
						maxLength={30}
						onChange={(e) => setEnglish(e.target.value.replace(/[^a-zA-Z-.,!? ]/g, ''))}
						type="text" 
						id='english' 
						placeholder='English' 
						required
					/>

					<input 
						tabindex={2}
						autocomplete="off"
						style={styles.inputStyle}
						value={russian}
						maxLength={30}
						onChange={(e) => setRussian(e.target.value.replace(/[^а-яА-Я-.,!? ]/g, ''))}
						type="text" 
						id='russian' 
						placeholder='Russian' 
						required
					/>

					{showMessage ? <div style={{marginBottom: '5px', color: 'green'}}>{message}</div> : null}

					<button style={styles.addBtnStyle} className='addmodal__btn' type='submit'>Add</button>
				</div>
			</form> 
		)
	}
  
    const signIn = e => {
        e.preventDefault()

        chrome.identity.getAuthToken({interactive :true}, token => {
          	if ( chrome.runtime.lastError || ! token ) {
            	alert(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
            	return
          	}

          	signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
            	.then(res => {
              		console.log('signed in!')
            	})
            	.catch(err => {
              		alert(`SSO ended with an error: ${err}`)
            	})
        })
    }

	React.useEffect(() => {
    	auth.onAuthStateChanged(user => {
      		setUser(user && user.uid ? user : null)
    	})
  	}, [])

	if ( undefined === user ) {
		return <h1 style={{textAlign: 'center', verticalAlign: 'middle'}}>Loading...</h1>
	}
		
	if ( user != null ) {
		return (
			<div style={{display: 'flex', flexDirection: 'column'}}>
				<AddWordModal/>
			  	<div style={{display: 'flex', marginTop: '10px', justifyContent: 'flex-end', alignItems: 'center'}}>
				  	<div style={{fontSize: '12px'}}>Signed in as <span style={{textDecoration: 'underline'}}>{user.displayName}</span>.</div>
			  		<button 
						style={styles.signOutBtnStyle} 
					onClick={auth.signOut.bind(auth)}>Sign Out</button>
				</div>
			</div>
		)
	}
    
	return (
		<div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
			<div style={{fontSize: '25px', marginTop: '20px', textAlign: 'center'}}>To start using this extension you have to sign in with Google.</div>
			<button 
				style={styles.signInBtnStyle}
				onClick={signIn}>Sign In with Google</button>
		</div>
	)
}

ReactDOM.render(<App/>, document.getElementById('root'))

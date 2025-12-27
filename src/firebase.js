import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// TODO: Replace this with your actual Firebase config from console.firebase.google.com
const firebaseConfig = {
  apiKey: "AIzaSyAFcTv8rOTz111kH7T73wUlEXDeuZ2BB5U",
  authDomain: "birthday-34-website.firebaseapp.com",
  databaseURL: "https://birthday-34-website-default-rtdb.firebaseio.com",
  projectId: "birthday-34-website",
  storageBucket: "birthday-34-website.firebasestorage.app",
  messagingSenderId: "44575399938",
  appId: "1:44575399938:web:4e03571cda6a11608f871b"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)

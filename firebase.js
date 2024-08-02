// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6kvZIfBS2E-sogmRvp_tl97zSxkIaXjY",
  authDomain: "inventory-management-1a9fb.firebaseapp.com",
  projectId: "inventory-management-1a9fb",
  storageBucket: "inventory-management-1a9fb.appspot.com",
  messagingSenderId: "879965416903",
  appId: "1:879965416903:web:f92159d3c9eff4e3387de2",
  measurementId: "G-NZE46TCVE2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)

export {firestore}
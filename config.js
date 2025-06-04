import firebase from "firebase/compat/app";
import 'firebase/compat/storage';

const firebaseConfig={
  apiKey: "AIzaSyAlPGbDsEGteofSA2CBUBhdr_4pF8-uP-Y",
  authDomain: "mediaupload-768f7.firebaseapp.com",
  projectId: "mediaupload-768f7",
  storageBucket: "mediaupload-768f7.firebasestorage.app",
  messagingSenderId: "697730262170",
  appId: "1:697730262170:web:9910b29f65540450a5eb23",
  measurementId: "G-L07YW4K59G"
}

if (!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
}

export {firebase};
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBtQZ8L25GfZJSMlalF1vNehIv9QUnalEE",
  authDomain: "evaluacion-firebase-2020-d5db7.firebaseapp.com",
  projectId: "evaluacion-firebase-2020-d5db7",
  storageBucket: "evaluacion-firebase-2020-d5db7.firebasestorage.app",
  messagingSenderId: "873605424529",
  appId: "1:873605424529:web:632866f5c373bd88692630"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const database = getFirestore(app);

export { auth, database };
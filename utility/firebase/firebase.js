const { initializeApp,getApp }= require("firebase/app");
const { getFirestore }= require("firebase/firestore");
const { collection, doc, setDoc, getDoc,getDocs,addDoc,deleteDoc  }= require("firebase/firestore"); 
const { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject }= require("firebase/storage");
const { getAnalytics }= require("firebase/analytics");

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);



module.exports = { firestore,collection,doc,setDoc,getDoc,getDocs,getStorage,ref,uploadBytes, uploadBytesResumable, getDownloadURL,addDoc,deleteObject,deleteDoc,getApp }
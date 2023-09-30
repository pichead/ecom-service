const {
    firestore,
    collection,
    addDoc,
    doc,
    setDoc,
    getDoc,
    getDocs,
    getStorage,
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    deleteDoc,
    getApp
  } = require("./firebase");
// const galleryRef = collection(firestore, "gallery");
const storage = getStorage();
const firebaseApp = getApp();
const storage1 = getStorage(firebaseApp, "gs://project-incident.appspot.com");
const { v4: uuidv4 } = require("uuid");
const timestampNow = Math.floor(Date.now() / 1000)
var path = require('path')


const getGallery = async () => {
    // const docRef = await getDocs(collection(firestore, "gallery"));
    const data = await getDocs(collection(firestore, "gallery"));
    let res = [];
    data.forEach( async (doc) => {
        res.push({
            docId: doc.id,
            name:doc.data().name,
            src:doc.data().src
        })
        // let url = doc.data().src.replace("https://firebasestorage.googleapis.com/v0/b/mademypizza.appspot.com/o/images%2F","")
        // let filename = url.split('?')[0]
        // console.log(filename)
        // updateGallery(doc.id,filename)
        // split_url = .split('/')

        // last_part = split_url[-1]

        // filename = last_part.split('?')[0]
        // console.log(filename)
    })
    return res;
}


const saveFiles = async (files) => {
    const uploadPromises = files.map(async (file) => {
        const fileExtension = path.extname(file.originalname).toLowerCase();
        const newFilename = timestampNow+uuidv4()+fileExtension

        const storageRef = ref(storage, 'hax/' + newFilename);
        const metadata = {
            contentType: file.mimetype,
        };
        const uploadTask = await uploadBytesResumable(storageRef, file.buffer, metadata);

        const geturl = await getDownloadURL(uploadTask.ref);

        return {
            src: geturl,
            name: newFilename
        };
    });

    const results = await Promise.all(uploadPromises);

    return results;
};

const delImage = async (filename,docId) => {
    const desertRef = ref(storage, "/images/"+filename);
    await deleteObject(desertRef)
    await deleteDoc(doc(firestore, "gallery", docId));

    return "successfully deleted"
}


const testSave = async (files) => {
    const uploadPromises = files.map(async (file) => {
        const fileExtension = path.extname(file.originalname).toLowerCase();
        const newFilename = timestampNow+uuidv4()+fileExtension
        const listRef = ref(storage);
        console.log("listRef : ",listRef)
        const storageRef = ref(storage1, newFilename);
        const metadata = {
            contentType: file.mimetype,
        };
        const uploadTask = await uploadBytesResumable(storageRef, file.buffer, metadata);

        const geturl = await getDownloadURL(uploadTask.ref);

        return {
            src: geturl,
            name: newFilename
        };
    });

    const results = await Promise.all(uploadPromises);

    return results;
}

const testCheck = async () => {
    
}

module.exports = { getGallery,saveFiles,delImage,testSave,testCheck } 
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCIPA7V9FyEQvi9cE_12QV2OLsf2La5Ta0",
  authDomain: "inventory-management-739f8.firebaseapp.com",
  projectId: "inventory-management-739f8",
  storageBucket: "inventory-management-739f8.appspot.com",
  messagingSenderId: "487285246495",
  appId: "1:487285246495:web:3aaffbf52bc8cc5128e32a",
  measurementId: "G-DZ4H2D62CD"
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

export default database;
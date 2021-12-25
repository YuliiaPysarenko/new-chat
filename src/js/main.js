import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { FIREBASE_CONFIG } from "../js/const.js";

import {createButton} from '../pages/login.js';
import {createChat, createTextMsg} from '../pages/chat.js';

const app = initializeApp(FIREBASE_CONFIG);
const provider = new GoogleAuthProvider();
const auth = getAuth();
const db = getDatabase();

const rootRef = document.querySelector("#root");

let user = true;

// function start() {
//     if (user) {
//         rootRef.innerHTML = createChat();
//         userSignOut();
//     } else {
//         rootRef.innerHTML = createButton();
//         onClickBtn();
//     }
// }

// start();

onAuthStateChanged(auth, (userFirebase) => {
    if (userFirebase) {
        const {photoURL, uid} = userFirebase;
        user = {
            photoURL,
            uid
        }
        console.log(user);
        rootRef.innerHTML = createChat();
        userSignOut();
        createMsg();
    } else {
        rootRef.innerHTML = createButton();
        onClickBtn();
    }
    // if (user) {
    //   // User is signed in, see docs for a list of available properties
    //   // https://firebase.google.com/docs/reference/js/firebase.User
    //   const uid = user.uid;
    //   // ...
    // } else {
    //   // User is signed out
    //   // ...
    // }
  });

  const date = new Date();

function getTime() {
    return `${date.getHours()}:${date.getMinutes()}`
}

function sendMsg(value) {
    const time = Date.now();
  set(ref(db, 'chat/' + time), {
    message: value,
    time: getTime(),
    ...user,
  });
}

const starCountRef = ref(db, 'chat/');
onValue(starCountRef, (snapshot) => {
  const data = snapshot.val();
  const markup = createTextMsg(Object.values(data), user.uid);
  document.querySelector(".messages").innerHTML = markup;
});

function createMsg() {
    const formRef = document.querySelector('.msg-form');
    formRef.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = e.target.elements.msg.value.trim();
        if(!text) {
            return
        }
        sendMsg(text);
        e.target.reset();
    })
}

function onClickBtn() {
    console.log(1);
    const loginBtnRef = document.querySelector(".js-msg-btn");
    loginBtnRef.addEventListener("click", () => {
        
        signInWithPopup(auth, provider)
        .then((result) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          // The signed-in user info.
          const user = result.user;
          console.log(user);
          // ...
        }).catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const email = error.email;
          // The AuthCredential type that was used.
          const credential = GoogleAuthProvider.credentialFromError(error);
          // ...
        });})
}

function userSignOut() {
    const loginBtnRef = document.querySelector(".btn-sign-out");
    loginBtnRef.addEventListener("click", () => {
      signOut(auth).then(() => {
        // Sign-out successful.
        console.log(2);
      }).catch((error) => {
        // An error happened.
      });
    })  
}
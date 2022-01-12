'use strict'
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { FIREBASE_CONFIG, PATH } from "../js/const.js";

import { createButton } from '../pages/login.js';
import { createChat, createTextMsg } from '../pages/chat.js';

const app = initializeApp(FIREBASE_CONFIG);
const provider = new GoogleAuthProvider();
const auth = getAuth();
const db = getDatabase();
const starCountRef = ref(db, PATH);

const containerRef = document.querySelector("#container");
const formRef = document.querySelector("#msg-form");
const editorRef = document.querySelector('[data-tiny-editor]');

formRef.style.display = 'none';

let user = true;
containerRef.innerHTML = createChat();

onAuthStateChanged(auth, (userFirebase) => {
  const chatRef = document.querySelector('.chat');
    if (userFirebase) {

      const {photoURL, uid, displayName} = userFirebase;
      user = {
          photoURL,
          uid,
          displayName
      };      
      insertChat();      
      formRef.style.display = 'flex';

    } else {
      containerRef.innerHTML = createButton();
      formRef.style.display = 'none';
      onClickBtn();
    }
  });

function insertChat() {
  containerRef.innerHTML = createChat();
  userSignOut();
  createMsg();

  onValue(starCountRef, (snapshot) => {
    const data = snapshot.val();
    const markup = createTextMsg(Object.values(data), user.uid);
    document.querySelector(".messages").innerHTML = markup;
  });
}

function createMsg() {
  let text = "";
  editorRef.addEventListener('input', (e) => {text = e.target.innerHTML;});

  formRef.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!text) {
      return
    }
    sendMsg(text);
    const editorRef = document.querySelector('[data-tiny-editor]');
    editorRef.textContent ="";
  });
}

const date = new Date();

function getTime() {
  return `${date.getHours()}:${date.getMinutes()}`
}

function sendMsg(value) {
    const time = Date.now();
  set(ref(db, PATH + time), {
    message: value,
    time: getTime(),
    ...user,
  });
}

function onClickBtn() {
  const loginBtnRef = document.querySelector(".js-msg-btn");
  loginBtnRef.addEventListener("click", () => {        
    signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      
      insertChat();
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
        // onAuthStateChanged();
        // Sign-out successful.
      }).catch((error) => {
        // An error happened.
      });
    })  
}
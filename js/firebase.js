const firebaseConfig = {
    apiKey: "AIzaSyBNvHFNWhPLglgIcn1R0Vv2fzNsPBZLOik",
    authDomain: "teno-324ed.firebaseapp.com",
    databaseURL: "https://teno-324ed.firebaseio.com",
    projectId: "teno-324ed",
    storageBucket: "teno-324ed.appspot.com",
    messagingSenderId: "831814607590",
    appId: "1:831814607590:web:31847de88ccad3f9f19127",
    measurementId: "G-YN5TG889JZ"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth
const storage = firebase.storage
const firestore = firebase.firestore
const FIREBASE_STATUS = {
    SUCCESS: true,
    FAIL: false
}

    async function onFacebookButtonPress() {
        const facebookCredential = new auth.FacebookAuthProvider();
        return auth().signInWithCredential(facebookCredential)
        .then((data) => {
            return FIREBASE_STATUS.SUCCESS
        })
        .catch((error) => {
            return FIREBASE_STATUS.FAIL
        });
    }
  
  async function onGoogleButtonPress() {
    const provider = new auth.GoogleAuthProvider();
    return auth().signInWithRedirect(provider)
      .then((data) => {
        return FIREBASE_STATUS.SUCCESS
      })
      .catch((error) => {
        return FIREBASE_STATUS.FAIL
      });
  }
  
  async function onLoginButtonPress({ email, password }) {
    return auth().signInWithEmailAndPassword(email, password)
      .then((data) => {
        return FIREBASE_STATUS.SUCCESS
      })
      .catch((error) => {
        return FIREBASE_STATUS.FAIL
      });
  }
  
  async function onSignUpButtonPress({ email, password }) {
    return auth().createUserWithEmailAndPassword(email, password)
      .then(async () => {
        var user = auth().currentUser;
        await user.sendEmailVerification();
        return FIREBASE_STATUS.SUCCESS;
      })
      .catch(error => {
        return FIREBASE_STATUS.FAIL
      });
  }
  
  async function onSignOutButtonPress() {
    return auth().signOut()
      .then(() => {
        return FIREBASE_STATUS.SUCCESS
      })
      .catch(() => {
        return FIREBASE_STATUS.FAIL
      })
  }
  
  //xác nhận xem user còn hạn đăng nhập hay không
  function checkUserSignIn () { return new Promise((resolve, reject) => {
    auth().onAuthStateChanged((user) => {
      if (user) {
        return resolve(FIREBASE_STATUS.SUCCESS)
      }
      return resolve(FIREBASE_STATUS.FAIL)
    });
  })}

  function onForgotPasswordButtonPress (email) {
    return auth().sendPasswordResetEmail(email)
    .then(function() {
      return FIREBASE_STATUS.SUCCESS
    })
    .catch(function(error) {
      return FIREBASE_STATUS.FAIL
    });
  }
  
  //dùng khi thực hiện các hành động nhạy cảm cần đăng nhập lại để xác nhận
  async function reAuthenUser() {
    var user = auth().currentUser;
    var credential;
    return user.reauthenticateWithCredential(credential).then(function () {
      return FIREBASE_STATUS.SUCCESS
    }).catch(function (error) {
      return FIREBASE_STATUS.FAIL
    });
  }
  
  const getCurrentUserProfile = () => {
    var user = auth().currentUser;
    if (user != null) {
      return user
    }
  }
  
  function updateUserProfile(user) {
    var user = auth().currentUser;
    return user.updateProfile(user).then(function () {
      return FIREBASE_STATUS.SUCCESS
    }).catch(function (error) {
      return FIREBASE_STATUS.FAIL
    });
  }
  
  const uploadImage = (data) => {
    return checkUserSignIn()
    .then(async res => {
      const user = auth().currentUser;
      const filename = uuidv4();
      const imageRef = storage().ref("image").child(`images/${user.uid}/${filename}`)
    
      await imageRef.putString(data, 'data_url')
    
      return imageRef.getDownloadURL()
    })
  }
  
  function getLocationCode(pos) {
    let lat = pos.lat
    let lon = pos.lon
    let degreeLat = Math.floor(lat)
    degreeLat = degreeLat < 0 ? (Math.abs(degreeLat) - 1) : degreeLat
    let minuteLat = Math.floor(((Math.abs(lat) - degreeLat)*3600)/60)
    let degreeLon = Math.abs(Math.floor(lon))
    degreeLon = degreeLon < 0 ? (Math.abs(degreeLon) - 1) : degreeLon
    let minuteLon = Math.floor(((Math.abs(lon) - degreeLon)*3600)/60)
    return (degreeLat + "°" + (Math.floor(minuteLat/5)*5) + "'" + (lat >= 0 ? "N" : "S") + "," + degreeLon + "°" + (Math.floor(minuteLon/5)*5) + "'" + (lon >= 0 ? "E" : "W"))
  }

  function updateMetadata (user, images) {
    let metadataRef = firestore().collection("Diaries").doc(user.uid).collection("Stories").doc('metadata')
    metadataRef.get()
    .then((docSnapshot) => {
      if (docSnapshot.exists) {
        if (images.length !== 0)
          metadataRef.update({
            images: firebase.firestore.FieldValue.arrayUnion(...images)
          });
      } else {
        metadataRef.set({images: images})
      }
    });
  }

  function uploadOneStory (story, images) {
    return checkUserSignIn()
    .then(res => {
      var user = auth().currentUser;
      const diariesCollection = firestore().collection("Diaries");
      const userStoriesCollection = diariesCollection.doc(user.uid).collection("Stories");
      return userStoriesCollection.doc(story.id).set(story)
        .then(() => {
          let code = getLocationCode(story.geolocation)
          updateMetadata(user, images)
          if(story.isPublic) {
            firestore().collection("Newsfeed").doc("GeoStory")
              .collection(code)
              .doc(story.id)
              .set({...story, userPhoto: user.photoURL, userName: user.displayName})
          } else {
            firestore().collection("Newsfeed").doc("GeoStory")
              .collection(code)
              .doc(story.id)
              .delete()
          }
          return FIREBASE_STATUS.SUCCESS                                                         
        })
        .catch((e) => {
          console.log(e)
          return FIREBASE_STATUS.FAIL
        })
    })
  }

  function getUserImages() {
    return checkUserSignIn()
    .then(res => {
      var user = auth().currentUser;
      const diariesCollection = firestore().collection("Diaries");
      const userImagesCollection = diariesCollection.doc(user.uid).collection("Stories").doc("metadata");
      return userImagesCollection.get()
        .then(function(querySnapshot) {
          return querySnapshot
        })
        .catch(function(error) {
            return FIREBASE_STATUS.FAIL
        });
    })
  }
  
  //lasvisible là doc cuối dùng của snapshot của collection trước
  //lastVisible = querySnapshots.docs[querySnapshots.docs.length-1];
  //code lấy story theo 20 dòng một
  function getStories (lastVisible) {
    var user = auth().currentUser;
    const diariesCollection = firestore().collection("Diaries");
    const userStoriesCollection = diariesCollection.doc(user.uid).collection("Stories");
    const query = userStoriesCollection
                  .orderBy("datetime")
                  .limit(20)
                  .lastVisible?startAfter(lastVisible):{} //nếu có truyền lastvisible thì chạy hàm này không thì thôi
    return query.get()
      .then(function(querySnapshot) {
        return querySnapshot
      })
      .catch(function(error) {
          return FIREBASE_STATUS.FAIL
      });
  }

  function getStoriesById (id) {
    return checkUserSignIn()
    .then(res => {
      var user = auth().currentUser;
      const diariesCollection = firestore().collection("Diaries");
      const userStoriesCollection = diariesCollection.doc(user.uid).collection("Stories").doc(id);
      return userStoriesCollection.get()
        .then(function(querySnapshot) {
          return querySnapshot
        })
        .catch(function(error) {
          return FIREBASE_STATUS.FAIL
        });
    })
  }
  
  function getNewsfeed (lastVisible) {
    return checkUserSignIn()
    .then(res => {
      let code = getLocationCode(story.geolocation)
      var user = auth().currentUser;
      const newsfeedCollection = firestore().collection("Newsfeed").doc("GeoStory").collection(code);
      const query = newsfeedCollection
                    .orderBy("datetime")
                    .limit(20)
                    .lastVisible?startAfter(lastVisible):{}
      return query.get()
        .then(function(querySnapshot) {
          return querySnapshot
        })
        .catch(function(error) {
            return FIREBASE_STATUS.FAIL
        });
    })
  }
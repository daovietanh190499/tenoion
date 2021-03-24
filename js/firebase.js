const firebaseConfig = {
    apiKey: "AIzaSyA8voZbFQV9IwG0BoWZv6KbcOlJqU9dsq8",
    authDomain: "teno-4cec1.firebaseapp.com",
    databaseURL: "https://teno-4cec1.firebaseio.com",
    projectId: "teno-4cec1",
    storageBucket: "teno-4cec1.appspot.com",
    messagingSenderId: "843736270960",
    appId: "1:843736270960:web:e570448f5b2022755c8cb5",
    measurementId: "G-N1EPZDVC3G"
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

  function getLocationDegree(pos) {
    let lat = pos.lat
    let lon = pos.lon
    let degreeLat = Math.floor(lat)
    degreeLat = degreeLat < 0 ? (Math.abs(degreeLat) - 1) : degreeLat
    let minuteLat = Math.floor(((Math.abs(lat) - degreeLat)*3600)/60)
    let degreeLon = Math.abs(Math.floor(lon))
    degreeLon = degreeLon < 0 ? (Math.abs(degreeLon) - 1) : degreeLon
    let minuteLon = Math.floor(((Math.abs(lon) - degreeLon)*3600)/60)
    return {degreeLat: degreeLat, degreeLon: degreeLon, minuteLat: minuteLat, minuteLon: minuteLon}
  }
  
  function getLocationCode(pos) {
    let lat = pos.lat
    let lon = pos.lon
    let data = getLocationDegree(pos)
    return (data.degreeLat + "+" + (Math.floor(data.minuteLat/5)*5) + (lat >= 0 ? "N" : "S") + "," + data.degreeLon + "+" + (Math.floor(data.minuteLon/5)*5) + (lon >= 0 ? "E" : "W"))
  }

  function getLocationCodeLevel2(pos) {
    let lat = pos.lat
    let lon = pos.lon
    let data = getLocationDegree(pos)
    return (data.degreeLat + "+" + (Math.floor(data.minuteLat/15)*15) + (lat >= 0 ? "N" : "S") + "," + data.degreeLon + "+" + (Math.floor(data.minuteLon/15)*15) + (lon >= 0 ? "E" : "W"))
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
          let codev2 = getLocationCodeLevel2(story.geolocation)
          updateMetadata(user, images)
          if(story.isPublic) {
            firestore().collection("Newsfeed")
              .doc(story.id)
              .set({...story, locationCode: code, locationCodev2: codev2, userPhoto: user.photoURL, userName: user.displayName})
          } else {
            firestore().collection("Newsfeed")
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
    return checkUserSignIn()
    .then(res => {
      var user = auth().currentUser;
      const diariesCollection = firestore().collection("Diaries");
      const userStoriesCollection = diariesCollection.doc(user.uid).collection("Stories");
      let query = userStoriesCollection
                    .orderBy("datetime")
                    .limit(20)
      query = lastVisible ? query.startAfter(lastVisible) : query
      return query.get()
        .then(function(querySnapshot) {
          return querySnapshot
        })
        .catch(function(error) {
            return FIREBASE_STATUS.FAIL
        });
    })
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

  function deleteStoryById (story) {
    return checkUserSignIn()
    .then(res => {
      var user = auth().currentUser;
      const diariesCollection = firestore().collection("Diaries");
      const userStoriesCollection = diariesCollection.doc(user.uid).collection("Stories").doc(story.id);
      return userStoriesCollection.delete()
        .then(function() {
          if(story.isPublic)
            firestore().collection("Newsfeed")
              .doc(story.id)
              .delete()
          return FIREBASE_STATUS.SUCCESS
        })
        .catch(function(error) {
          return FIREBASE_STATUS.FAIL
        });
    })
  }
  
  function getNewsfeed (geolocation, distance, lastVisible) {
    return checkUserSignIn()
    .then(res => {
      let listCode = []
      let code = getLocationDegree(geolocation)
      let totalMinuteLat = (code.degreeLat*60 + code.minuteLat) * (geolocation.lat < 0 ? -1 : 1)
      let totalMinuteLon = (code.degreeLon*60 + code.minuteLon) * (geolocation.lon < 0 ? -1 : 1)
      let number = distance/10
      let codeType = number > 2 ? "locationCodev2" : "locationCode"
      let degreeBase = number > 2 ? 15 : 5
      numberRun = number > 2 ? number/3 : number
      for(let i = -(numberRun - 1); i <= numberRun - 1; i ++) {
        let minuteLat = totalMinuteLat + i*degreeBase
        for(let j = -(numberRun - 1); j <= numberRun - 1; j ++) {
          let minuteLon = totalMinuteLon + j*degreeBase
          let code = number > 2 ? getLocationCodeLevel2({lat: minuteLat/60, lon: minuteLon/60}) : getLocationCode({lat: minuteLat/60, lon: minuteLon/60})
          listCode.push(code)
        }
      }
      console.log(listCode)
      const newsfeedCollection = firestore().collection("Newsfeed")
      let query = newsfeedCollection
                    .orderBy("datetime")
                    .limit(20)
                    .where(codeType, "in", listCode)
      query = lastVisible ? query.startAfter(lastVisible) : query
      return query.get()
        .then(function(querySnapshot) {
          console.log(querySnapshot)
          return querySnapshot
        })
        .catch(function(error) {
            console.log(error)
            return FIREBASE_STATUS.FAIL
        });
    })
  }

  function getNewsfeedById(id) {
    return firestore().collection("Newsfeed")
              .doc(id)
              .get()
              .then(function(querySnapshot) {
                return querySnapshot
              })
              .catch(function(error) {
                  return FIREBASE_STATUS.FAIL
              });
  }

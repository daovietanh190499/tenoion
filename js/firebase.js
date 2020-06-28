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
  
  function getCurrentUserProfile() {
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
  
  function uploadImage (file, progressListener = (progress) => {}) { return new Promise((resolve, reject) => {
    var user = auth().currentUser;
    var filename = uuid();
    var userImageRef = storage().ref().child(`images/${user.uid}/${filename}${file.type}`);
    var uploadTask = userImageRef.put(file)
    uploadTask.on(storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressListener(progress)
      },
      (error) => {
        return reject(FIREBASE_STATUS.FAIL)
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
          return resolve(downloadURL)
        });
      }
    );
  })}
  
  function uploadOneStory (story) {
    var user = auth().currentUser;
    const diariesCollection = firestore().collection("Diaries");
    const userStoriesCollection = diariesCollection.doc(user.uid).collection("Stories");
    return userStoriesCollection.doc(story.id).set(story)
      .then(() => {
        if(story.isPublic) firestore().collection("Newsfeed").add({...story, ...user})
        return FIREBASE_STATUS.SUCCESS                                                              //hàm realtime lỗi không ảnh hưởng
      })
      .catch(() => {
        return FIREBASE_STATUS.FAIL
      })
  }
  
  function updateOneStory (story) {
    var user = auth().currentUser;
    const diariesCollection = firestore().collection("Diaries");
    const userStoriesCollection = diariesCollection.doc(user.uid).collection("Stories");
    return userStoriesCollection.doc(story.id).update(story)
      .then(() => {
        if(story.isPublic) firestore().collection("Newsfeed").add({...story, ...user})
        return FIREBASE_STATUS.SUCCESS                                                              //hàm realtime lỗi không ảnh hưởng
      })
      .catch(() => {
        return FIREBASE_STATUS.FAIL
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
                  .orderBy("updatedAt")
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
  
  function getUserPublicStory (uid, lastVisible) {
    var user = auth().currentUser;
    const diariesCollection = firestore().collection("Diaries");
    const userStoriesCollection = diariesCollection.doc(uid).collection("Stories");
    const query = userStoriesCollection
                  .where("isPublic", "==", "true") //đã cài rule chỉ cho lấy story public của user khác trên firebase
                  .orderBy("updatedAt")
                  .limit(20)
                  .lastVisible?startAfter(lastVisible):{}
    return query.get()
      .then(function(querySnapshot) {
        return querySnapshot
      })
      .catch(function(error) {
          return FIREBASE_STATUS.FAIL
      });
  }
  
  function getNewsfeed (lastVisible) {
    var user = auth().currentUser;
    const newsfeedCollection = firestore().collection("Newsfeed");
    const query = newsfeedCollection
                  .orderBy("updatedAt")
                  .limit(20)
                  .lastVisible?startAfter(lastVisible):{}
    return query.get()
      .then(function(querySnapshot) {
        return querySnapshot
      })
      .catch(function(error) {
          return FIREBASE_STATUS.FAIL
      });
  }
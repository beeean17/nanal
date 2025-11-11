// Firebase 설정
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyBrgTBo0kSNKWpKSTJfXJmagmqqZl9Al4s",
  authDomain: "nanal-7d751.firebaseapp.com",
  projectId: "nanal-7d751",
  storageBucket: "nanal-7d751.firebasestorage.app",
  messagingSenderId: "777277474479",
  appId: "1:777277474479:web:e68c83788b285a7c47365a",
  measurementId: "G-NM87SCR8W4"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Firestore 헬퍼 함수들
const FirebaseDB = {
  // 데이터 가져오기
  async get(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error('Firebase get error:', error);
      return null;
    }
  },

  // 컬렉션 전체 가져오기
  async getAll(collectionName, conditions = {}) {
    try {
      const collectionRef = collection(db, collectionName);
      let q = collectionRef;

      // 쿼리 조건 추가
      if (conditions.where) {
        q = query(q, where(...conditions.where));
      }
      if (conditions.orderBy) {
        q = query(q, orderBy(...conditions.orderBy));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Firebase getAll error:', error);
      return [];
    }
  },

  // 데이터 저장/업데이트
  async set(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, data, { merge: true });
      return true;
    } catch (error) {
      console.error('Firebase set error:', error);
      return false;
    }
  },

  // 데이터 업데이트
  async update(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
      return true;
    } catch (error) {
      console.error('Firebase update error:', error);
      return false;
    }
  },

  // 데이터 삭제
  async delete(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Firebase delete error:', error);
      return false;
    }
  }
};

// Auth 헬퍼 함수들
const FirebaseAuth = {
  // 이메일 로그인
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  // 회원가입
  async signUp(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  // 구글 로그인
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  // 로그아웃
  async signOut() {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      return false;
    }
  },

  // 로그인 상태 감지
  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // 현재 유저
  getCurrentUser() {
    return auth.currentUser;
  }
};

export { db, auth, FirebaseDB, FirebaseAuth };

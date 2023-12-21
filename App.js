// Install necessary packages if not already installed
// npm install react react-dom firebase

// Import necessary libraries
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app'; // Update import statement
import 'firebase/compat/auth'; // Update import statement
import 'firebase/compat/firestore'; // Update import statement

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDQB8b6hzRd50qBRiJ6Y8-6ORQCxee01eY",
    authDomain: "client-side-final.firebaseapp.com",
    projectId: "client-side-final",
    storageBucket: "client-side-final.appspot.com",
    messagingSenderId: "22770330061",
    appId: "1:22770330061:web:38ca1eb968c30c2cf2fc84"
  };
  

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const App = () => {
  const [user, setUser] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    // Check if the user is already logged in
    const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        loadSearchHistory(authUser.uid);
      } else {
        setUser(null);
      }
    });

    // Cleanup on component unmount
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await firebase.auth().signInWithPopup(provider);
    } catch (error) {
      console.error(error.message);
    }
  };

  const signOut = () => {
    firebase.auth().signOut();
    setUser(null);
  };

  const loadSearchHistory = async (userId) => {
    // Load search history from Firestore
    const historyRef = db.collection('searchHistory').doc(userId);
    const historySnapshot = await historyRef.get();
    if (historySnapshot.exists) {
      setSearchHistory(historySnapshot.data().history);
    }
  };

  const saveSearchHistory = async (userId, history) => {
    // Save search history to Firestore
    const historyRef = db.collection('searchHistory').doc(userId);
    await historyRef.set({ history });
  };

  const handleSearch = async () => {
    try {
      // Perform a search using themealdb.com/api/json/v1/1/search.php?s=<searchTerm>
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
      const data = await response.json();

      // Update search results
      setSearchResults(data.meals || []);

      // Update search history
      if (user) {
        const updatedHistory = [...searchHistory, searchTerm];
        setSearchHistory(updatedHistory);
        saveSearchHistory(user.uid, updatedHistory);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSearchAgain = (term) => {
    setSearchTerm(term);
    handleSearch();
  };

  return (
    <div>
      <h1>Meal/Recipe Search Platform</h1>
      
      {user ? (
        <div>
          <p>Welcome, {user.displayName}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <button onClick={signInWithGoogle}>Sign In with Google</button>
      )}

      <div>
        <input
          type="text"
          placeholder="Enter a meal or recipe"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div>
        <h2>Search Results</h2>
        <ul style={{ textAlign: 'center', paddingInlineStart: 0 }}>

          {searchResults.map((result) => (
            <li key={result.idMeal}>
              {result.strMeal}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Search History</h2>
        <ul style={{ textAlign: 'center', paddingInlineStart: 0 }}>
          {searchHistory.map((term) => (
            <li key={term}>
              {term}
              <button onClick={() => handleSearchAgain(term)}>Search Again</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API, apiConfig } from '../../api'; // Adjust path based on your structure
import './AddFriend.css'; // Optional styling

// Helper function to get auth headers
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
  'Content-Type': 'application/json',
});

const AddFriend = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    try {
      const url = `${API.SEARCH_USER}${searchQuery}/`; // Ensure your backend expects a trailing slash
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
        timeout: apiConfig.timeout,
      });
      console.log("Search Response:", response.data);
      setSearchResults(response.data.users || []);
      setError('');
    } catch (err) {
      console.error("Search error:", err);
      setError(err.response?.data?.error || 'An error occurred while searching');
      setSearchResults([]);
    }
  };

  const sendFriendRequest = async (receiverUsername) => {
    if (!receiverUsername) {
      setError("Cannot send request: No username provided.");
      return;
    }
    console.log("Sending friend request to:", receiverUsername);
    const payload = { receiver: receiverUsername };
    console.log("Request payload:", payload);
    try {
      const response = await axios.post(
        API.SEND_FRIEND_REQUEST,
        payload,
        {
          headers: getAuthHeaders(),
          timeout: apiConfig.timeout,
        }
      );
      console.log("Send Request Response:", response.data);
      setSuccessMessage(response.data.message);
      fetchPendingRequests();
    } catch (err) {
      console.error("Send request error:", err);
      const backendError = err.response?.data;

      if (backendError && backendError.receiver) {
        setError(backendError.receiver.join(" "));
      } else if (
        backendError &&
        backendError.non_field_errors
      ) {
        setError(backendError.non_field_errors.join(" "));
      } else {
        setError(err.response?.data?.error || 'Failed to send friend request');
      }
    }
  };
  // Wrap fetchPendingRequests in useCallback
  const fetchPendingRequests = useCallback(async () => {
    console.log("Fetching pending requests...");
    try {
      const response = await axios.get(API.PENDING_REQUESTS, {
        headers: getAuthHeaders(),
        timeout: apiConfig.timeout,
      });
      console.log("Pending Requests Response:", response.data);
      setPendingRequests(response.data.requests || []);
    } catch (err) {
      console.error("Pending requests error:", err);
      setError(err.response?.data?.error || 'Failed to fetch pending requests');
    }
  }, []);

  const respondToRequest = async (requestId, action) => {
    console.log(`Responding to request ${requestId} with action: ${action}`);
    try {
      const url = `${API.RESPOND_REQUEST}${requestId}/`; // Ensure backend expects this URL pattern
      const response = await axios.post(
        url,
        { action },
        {
          headers: getAuthHeaders(),
          timeout: apiConfig.timeout,
        }
      );
      console.log("Respond Request Response:", response.data);
      setSuccessMessage(response.data.message);
      fetchPendingRequests();
    } catch (err) {
      console.error("Respond request error:", err);
      setError(err.response?.data?.error || 'Failed to respond to request');
    }
  };

  // Run fetchPendingRequests on component mount
  useEffect(() => {
    // Only fetch if a token is available
    if (localStorage.getItem("access_token")) {
      fetchPendingRequests();
    } else {
      setError('No valid token found. Please log in again.');
    }
  }, [fetchPendingRequests]);

  return (
    <div className="add-friend-container">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for friends..."
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          {searchResults.map((user) => (
            <div key={user.id} className="user-result">
              <span>{user.username}</span>
              <button
                onClick={() => sendFriendRequest(user.username)}
                className="add-button"
              >
                Add Friend
              </button>
            </div>
          ))}
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div className="pending-requests">
          <h3>Pending Friend Requests</h3>
          {pendingRequests.map((request) => (
            <div key={request.id} className="request-item">
              <span>{request.sender.username}</span>
              <button
                onClick={() => respondToRequest(request.id, 'accept')}
                className="accept-button"
              >
                Accept
              </button>
              <button
                onClick={() => respondToRequest(request.id, 'reject')}
                className="reject-button"
              >
                Reject
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddFriend;

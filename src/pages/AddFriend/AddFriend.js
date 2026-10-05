import React, { useState, useEffect, useCallback } from 'react';
import {
  searchUsers,
  sendFriendRequest as sendFriendRequestApi,
  getPendingRequests,
  respondToFriendRequest,
  errorMessage,
} from '../../api';
import './AddFriend.css'; // Optional styling

const RESPONSE_ACTIONS = ['accept', 'reject'];

const AddFriend = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const showError = (msg) => {
    setSuccessMessage('');
    setError(msg);
  };

  const showSuccess = (msg) => {
    setError('');
    setSuccessMessage(msg);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      showError('Enter a username to search for.');
      setSearchResults([]);
      return;
    }
    try {
      const response = await searchUsers(query);
      setSearchResults(Array.isArray(response.data.users) ? response.data.users : []);
      setError('');
    } catch (err) {
      showError(errorMessage(err, 'An error occurred while searching'));
      setSearchResults([]);
    }
  };

  const fetchPendingRequests = useCallback(async () => {
    try {
      const response = await getPendingRequests();
      setPendingRequests(Array.isArray(response.data.requests) ? response.data.requests : []);
    } catch (err) {
      showError(errorMessage(err, 'Failed to fetch pending requests'));
    }
  }, []);

  const sendFriendRequest = async (receiverUsername) => {
    if (!receiverUsername) {
      showError('Cannot send request: No username provided.');
      return;
    }
    setBusy(true);
    try {
      const response = await sendFriendRequestApi(receiverUsername);
      showSuccess(response.data?.message || 'Friend request sent.');
      fetchPendingRequests();
    } catch (err) {
      showError(errorMessage(err, 'Failed to send friend request'));
    } finally {
      setBusy(false);
    }
  };

  const respondToRequest = async (requestId, action) => {
    if (!RESPONSE_ACTIONS.includes(action)) return;
    setBusy(true);
    try {
      const response = await respondToFriendRequest(requestId, action);
      showSuccess(response.data?.message || `Request ${action}ed.`);
      fetchPendingRequests();
    } catch (err) {
      showError(errorMessage(err, 'Failed to respond to request'));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  return (
    <div className="page add-friend-page">
      <div className="card">
        <h1>Find Friends</h1>
        <form onSubmit={handleSearch} className="add-friend-search">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            aria-label="Search users"
            maxLength={150}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {error && <p className="alert alert-error" role="alert">{error}</p>}
        {successMessage && <p className="alert alert-success" role="status">{successMessage}</p>}

        {searchResults.length > 0 && (
          <section className="add-friend-section">
            <h2>Search Results</h2>
            {searchResults.map((user) => (
              <div key={user.id} className="add-friend-row">
                <span className="add-friend-name">{user.username}</span>
                <button
                  onClick={() => sendFriendRequest(user.username)}
                  className="btn btn-success btn-sm"
                  disabled={busy}
                >
                  Add Friend
                </button>
              </div>
            ))}
          </section>
        )}
      </div>

      {pendingRequests.length > 0 && (
        <section className="card add-friend-section">
          <h2>Pending Friend Requests</h2>
          {pendingRequests.map((request) => (
            <div key={request.id} className="add-friend-row">
              <span className="add-friend-name">{request.sender?.username}</span>
              <div className="add-friend-actions">
                <button
                  onClick={() => respondToRequest(request.id, 'accept')}
                  className="btn btn-success btn-sm"
                  disabled={busy}
                >
                  Accept
                </button>
                <button
                  onClick={() => respondToRequest(request.id, 'reject')}
                  className="btn btn-secondary btn-sm"
                  disabled={busy}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default AddFriend;

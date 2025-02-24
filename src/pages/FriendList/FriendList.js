import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API, apiConfig } from "../../api";
import "./FriendList.css";

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  });

  const fetchFriends = useCallback(
    async (query = "") => {
      try {
        const url = query.trim()
          ? `${API.FRIENDLIST}?search=${query}`
          : API.FRIENDLIST;
        const response = await axios.get(url, {
          ...apiConfig,
          headers: getAuthHeaders(),
        });
        setFriends(response.data.friends);
        setError("");
        if (query.trim() && response.data.friends.length === 0) {
          setSearchError(`No friends found matching "${query}".`);
        } else {
          setSearchError("");
        }
      } catch (err) {
        setError("Failed to load friends list.");
      }
    },
    [] // dependencies for getAuthHeaders and API values are stable
  );

  // Fetch full friend list on mount
  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 3) {
        fetchFriends(searchQuery);
      } else if (searchQuery.trim().length === 0) {
        fetchFriends(); // Reset to full list when query is cleared
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery, fetchFriends]);

  return (
    <div className="friendlist-container">
      <h2>My Friends</h2>
      {error && <p className="error">{error}</p>}

      {/* Search Section */}
      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by username or name"
          className="search-input"
        />
      </div>

      {/* Display search error or no results message */}
      {searchError && searchQuery.trim().length >= 3 && (
        <p className="error">{searchError}</p>
      )}

      {/* Friend list */}
      {friends.length === 0 && searchQuery.trim().length < 3 && !error ? (
        <p>No friends to display.</p>
      ) : (
        <ul>
          {friends.map((friend) => (
            <li key={friend.id} className="friend-item">
              <span className="friend-name">
                {friend.first_name} {friend.last_name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendList;

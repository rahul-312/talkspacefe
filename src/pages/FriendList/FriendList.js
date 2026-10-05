import { useState, useEffect, useCallback } from "react";
import { getFriends } from "../../api";
import "./FriendList.css";

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  const fetchFriends = useCallback(
    async (query = "") => {
      try {
        const response = await getFriends(query.trim());
        setFriends(Array.isArray(response.data.friends) ? response.data.friends : []);
        setError("");
        if (query.trim() && !response.data.friends?.length) {
          setSearchError(`No friends found matching "${query}".`);
        } else {
          setSearchError("");
        }
      } catch (err) {
        setError("Failed to load friends list.");
      }
    },
    []
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

  const initials = (friend) =>
    `${friend.first_name?.[0] || ""}${friend.last_name?.[0] || ""}`.toUpperCase() ||
    friend.username?.[0]?.toUpperCase() ||
    "?";

  return (
    <div className="page friendlist-page">
      <div className="card friendlist-card">
        <h1>My Friends</h1>
        {error && <p className="alert alert-error" role="alert">{error}</p>}

        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by username or name"
          aria-label="Search friends"
          maxLength={100}
          className="friend-search"
        />

        {searchError && searchQuery.trim().length >= 3 && (
          <p className="alert alert-error">{searchError}</p>
        )}

        {friends.length === 0 && searchQuery.trim().length < 3 && !error ? (
          <p className="friend-empty">No friends to display.</p>
        ) : (
          <ul className="friend-list">
            {friends.map((friend) => (
              <li key={friend.id} className="friend-item">
                <span className="friend-avatar" aria-hidden="true">{initials(friend)}</span>
                <span className="friend-name">
                  {friend.first_name} {friend.last_name}
                  {friend.username && <span className="friend-username">@{friend.username}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FriendList;

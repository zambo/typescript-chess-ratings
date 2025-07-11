# The Problem

Use [https://lichess.org/api.](https://lichess.org/api.) No auth needed when using the public APIs!

## 1. List the top 50 classical chess players. Just print their usernames

## 2. Print the rating history for the top chess player in classical chess for the last 30 calendar days

This can be in the format assuming today is Sep 15:

> - username, {Sep 15: 990, Sep 14: 991, ..., Aug 17: 932, Aug 16: 1000}

```python
def print_last_30_day_rating_for_player() -> None:
pass
```

Key assumption: If a player doesn't play, then the score stays the same.

## 3. Create a CSV that shows the rating history for each of these 50 players, for the last 30 days.

- The first column should be the player’s username.
- The 2nd column should be the player’s rating 30 days ago.
- The 32nd column should be the player’s rating today.

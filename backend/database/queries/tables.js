/**
 * @userTable {string : users} query string to create user table in psql
 * @playlistTable {string: playlists} query string to create playlist table in psql
 * @videosTable {string: videos} query string to create videos table in psql
 * @users {user_id, username, password, email, premium, created_on, last_login}
 * @playlists {playlist_id, playlist_origin_id, user_id: REF(users), origin_source, playlist_title, created_on, published_at}
 * @vidoes {video_id, playlist_id: REF(playlists), video_youtube_id, user_id: REF(users), origin_source: REF(playlists), video_title, created_on, published_at}
 */

const createUsersTable = () => `CREATE TABLE IF NOT EXISTS users (
  user_id serial PRIMARY KEY,
  username VARCHAR (50) UNIQUE not NULL,
  password VARCHAR (50) NOT NULL,
  email VARCHAR ( 255 ) UNIQUE NOT NULL,
  premium boolean NOT NUll,
  created_on timestamp NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  last_login TIMESTAMP
)
`

const createPlaylistTable = () => `
CREATE TABLE IF NOT EXISTS playlists (
  playlist_id INT NOT NULL
  playlist_origin_id text UNIQUE NOT NULL,
  user_id INT NOT NULL,
  origin_source VARCHAR (50) NOT NULL,
  playlist_title VARCHAR (250) NOT NULL,
  created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  published_at TIMESTAMP NOT NULL,
  PRIMARY KEY (playlist_id,user_id),
  FOREIGN KEY (user_id)
    REFERENCES users (user_id),
)
`
const createVideosTable = () => `
CREATE TABLE IF NOT EXISTS videos (
  video_id INT NOT NULL,
  playlist_id INT NOT NULL,
  video_origin_id text UNIQUE NOT NULL,
  user_id INT NOT NULL,
  origin_source VARCHAR (50) NOT NULL,
  video_title VARCHAR (250) NOT NULL,
  created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  published_at TIMESTAMP NOT NULL,
  PRIMARY KEY (playlist_id,user_id,video_id)
  FOREIGN KEY (user_id)
    REFERENCES users (user_id),
  FOREIGN KEY (playlist_id)
    REFERENCES playlists (playlist_id),
  FOREIGN KEY (origin_source)
    REFERENCES playlists (origin_source),
)
`

module.exports= {
  createUsersTable,
  createPlaylistTable,
  createVideosTable,
}
# Milestone 1 Report

## Dataset

The dataset is composed by around 600 thousands music tracks and 1 million artists present on Spotify which published songs between 1922 and 2021.
In particular, the tracks data contains:
- Song and artists
- Publish details: duration, genres, release date, key, tempo, etc.
- Followers and popularity
- Statistics: danceability, energy, loudness, etc.

Artists data is focused on the genres, popularity and number of followers on Spotify.

The data has been obtained from **[Kaggle Spotify Dataset](https://www.kaggle.com/yamaerenay/spotify-dataset-19212020-160k-tracks?select=tracks.csv)** which contains a large-scale and up-to-date dataset extracted from the **[Spotify API](https://developer.spotify.com)**.

The artists dataset contains generally few missing values and it is relatively clean except for genres. About 4.5% of the artists miss the genre attribute. Thus, we would need to polish the data or recover it using tracks data or the Spotify API before comparing on the genre.

## Problematic

Clearly, music has evolved in the years in terms of trending genres, popularity, and danceability. Using this dataset, we have the opportunity to tell a story that shows the evolution of music through time covering a whole century of history. Some visualization ideas that we have are:
- Artists that made the history of the music over the years
- Evolution of the most popular genres and tracks over the years
- Exploit statistics to link songs and time (e.g. danceability, energy)
- Compare music trends between years

This project aims to show the evolution of music, genre, and taste through time while suggesting the best songs and artist for each category in a simple interactive visualization manner. Consequently, the target audience is broad: from audiophiles to sporadic music listeners.

## Exploratory Data Analysis
Data preprocessing and statistics are available in the **[notebook](../exploratory_data_analysis.ipynb)**.

As you can see in the notebook, the dataset is quite clean. For the artists, there is only some missing data in the followers field as well as the genre which is sometimes empty. For the tracks, some names are missing but only a handful so they could be discarded without losing too much data.

An important information in both of our datasets is the popularity. This is a metric computed by a secret algorithm developed at Spotify which gives a ranking to songs (and by extension to artists). It seems to be related to the number of plays of a given song and how fast it reached this number of plays. It ranges from 0 to 100 and allows us to have a concrete way of ranking tracks and identifying (current) top hits. It is important to note that this value changes over time and represent the popularity as of today.

Using this information, here are some basic statistics on the data :
- Rock is the most popular genre (represented by 576 artists) and there are 370 niche genre that are represented by a single artist only.
- The most popular artist is Justin Bieber (popularity of 100) but the one with the most followers is Ed Sheeran (popularity of 92).
- Unsurprisingly, the most popular song is "Peaches" by Justin Bieber (featuring Daniel Caesar and Giveon) which was released less than a month ago. This indicates that the dataset is regularly maintained up-to-date.

You can take a look at the notebook for more detailed statistics and graphs.

## Related Work
Multiple visualizations have already been proposed in the music field. We take inspiration from the following ones:
- **[History of rock](https://svds.com/rockandroll/)** shows rock song statistics and influences among bands
- **[The evolution of popular music](https://ibruins.weebly.com/visualizations.html)** shows the evolution of genres and records per year from around 1980 to 2010
- **[The Billboard](https://pudding.cool/2017/03/music-history/)** shows through time the top 5 trending songs while reproducing the best track
- **[Are Pop Lyrics Getting More Repetitive?](https://pudding.cool/2017/05/song-repetition/)** studies the repetitiveness of songs through several decades. It compares a measure of repetitiveness by song, by artist, or by year, using bar charts, plots and bubble charts. This can be an inspiration for visualizing the danceability, energy, etc.

Our idea is to do a deeper analysis over the last century that combines trending songs, genres, and statistics. Furthermore, we plan to add interactive charts and filters by genre to better exploit the available data.

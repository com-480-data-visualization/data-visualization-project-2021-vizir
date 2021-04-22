# Milestone 1 Report

## Dataset

The dataset is composed by around 600 thousands music tracks and 1 million artists present on Spotify which published songs between 1922 and 2021.
In particular, the tracks data contains:
- Song and artists
- Publishing details: duration, genres, release date, key, tempo, etc.
- Followers and popularity
- Statistics: danceability, energy, loudness, etc.

Artists data is focused on the genres, popularity and number of followers on Spotify.

The data has been obtained from **[Kaggle Spotify Dataset](https://www.kaggle.com/yamaerenay/spotify-dataset-19212020-160k-tracks?select=tracks.csv)** which contains a large-scale and up-to-date dataset extracted from the **[Spotify API](https://developer.spotify.com)**.

The artists dataset contains generally few missing values and it is relatively clean except for genres. About 4.5% of the artists miss the genre attribute. Thus, we would need to polish the data or recover it using tracks data or the Spotify API before comparing on the genre.

## Problematic

Clearly, the music has evolved in the years starting from genres, popularity, and danceability. Using this dataset, we have the opportunity to tell a story that shows the evolution of music through time covering a whole century of history. Some visualization ideas that we have are:
- Artists that made the history of the music over the years
- Evolution of the most popular genres and tracks over the years
- Exploit statistics to link songs and time (e.g. danceability, energy)
- Compare music trends between years

This project aims to show the evolution of music, genre, and taste through time while suggesting the best songs and artist for each category in a simple interactive visualization manner. Consequently, the target audience is broad: from audiophiles to sporadic music listeners.

## Exploratory Data Analysis
Data preprocessing and statistics are available in the **[notebook](../exploratory_data_analysis.ipynb)**.


## Related Work
Multiple visualizations have already been proposed in the musical field. We take inspiration from the following ones:
- **[History of rock](https://svds.com/rockandroll/)** shows rock song statistics and influences among bands
- **[The evolution of popular music](https://ibruins.weebly.com/visualizations.html)** shows the evolution of genres and records per year from around 1980 to 2010
- **[The Billboard](https://pudding.cool/2017/03/music-history/)** shows through time the top 5 trending songs while reproducing the best track

Our idea is to do a deeper analysis over the last century that combines trending songs, generes, and statistics. Furthermore, we plan to add interactive charts and filters by genre to better exploit the available data.

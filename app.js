App.onLaunch = function() {
    showAlbums();
};

// Главный экран — сетка альбомов
function showAlbums() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://multura.github.io/audiobittv/albums.json");
    xhr.send();

    xhr.onload = function() {
        if (xhr.status !== 200 || !xhr.responseText) {
            console.error("Failed to load albums.json! Status:", xhr.status);
            return;
        }

        var data;
        try {
            data = JSON.parse(xhr.responseText);
        } catch (e) {
            console.error("JSON parse error:", e);
            return;
        }

        var items = "";

        data.albums.forEach(album => {
            items += `
            <lockup onselect="showAlbum('${album.title}')">
                <img src="${album.cover}" width="400" height="400"/>
                <title>${album.title}</title>
            </lockup>`;
        });

        var tvml = `
        <document>
            <catalogTemplate>
                <banner>
                    <title>My Music</title>
                </banner>
                <grid>
                    <section>${items}</section>
                </grid>
            </catalogTemplate>
        </document>`;

        var doc = new DOMParser().parseFromString(tvml, "application/xml");
        navigationDocument.pushDocument(doc);
    };

    xhr.onerror = function() {
        console.error("Network error while loading albums.json");
    };
}

// Экран альбома — список треков
function showAlbum(albumTitle) {
    getAlbumByTitle(albumTitle, function(album) {
        if (!album) return;

        var items = "";

        album.tracks.forEach(track => {
            var badges = "";
            if (track.format === "alac") badges += `<badge>HD</badge>`;
            if (track.quality === "hires") badges += `<badge>LOSSLESS</badge>`;

            items += `
            <listItemLockup onselect="play('${track.url}', '${album.cover}')">
                <title>${track.title}</title>
                ${badges}
            </listItemLockup>`;
        });

        var tvml = `
        <document>
            <listTemplate>
                <banner>
                    <title>${album.title}</title>
                </banner>
                <section>${items}</section>
            </listTemplate>
        </document>`;

        var doc = new DOMParser().parseFromString(tvml, "application/xml");
        navigationDocument.pushDocument(doc);
    });
}

// Воспроизведение трека с обложкой
function play(url, coverURL) {
    var player = new Player();
    var playlist = new Playlist();

    var mediaItem = new MediaItem("audio", url);
    mediaItem.artworkImageURL = coverURL;

    playlist.push(mediaItem);
    player.playlist = playlist;
    player.play();
}

// Вспомогательная функция — ищем альбом по title
function getAlbumByTitle(title, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://content.uzbekistation.serv00.net/music/albums.json");
    xhr.send();

    xhr.onload = function() {
        if (xhr.status !== 200 || !xhr.responseText) {
            console.error("Failed to load albums.json in getAlbumByTitle!");
            callback(null);
            return;
        }

        var data;
        try {
            data = JSON.parse(xhr.responseText);
        } catch (e) {
            console.error("JSON parse error in getAlbumByTitle:", e);
            callback(null);
            return;
        }

        var album = data.albums.find(a => a.title === title);
        callback(album);
    };

    xhr.onerror = function() {
        console.error("Network error while loading albums.json in getAlbumByTitle");
        callback(null);
    };
}

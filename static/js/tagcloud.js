var TagCloud = {
    width: 310,
    height: 310,
    devicePixelRatio: 2,
    n: 0,

    init: function() {
        
    },

    renderTopicClouds: function(topics){
        TagCloud.n = 0;
        topics.forEach(function(topic) {
            TagCloud.renderTagCloud(topic);
        });
    },

    renderTagCloud: function(topic) {
        var options = {
            gridSize: 9,
            weightFactor: 5,
            fontFamily: 'Hiragino Mincho Pro, serif',
            color: 'random-dark',
            backgroundColor: '#fafafa',
            rotateRatio: 0,
            hover: TagCloud.OnWordHover,
            click: TagCloud.OnWordClick,
        }
        var n = TagCloud.n;
        TagCloud.n = n + 1;

        $('#cloud-gallery').append(`<div class="tile tile-large" data-role="tile" alt="${n}"><canvas id="cluster${n}"></canvas></div>`);
        $(`#cluster${n}`).attr('width', TagCloud.width * TagCloud.devicePixelRatio).attr('height', TagCloud.height * TagCloud.devicePixelRatio);

        topic = topic.slice(0, 200);

        var total = 0;
        topic.forEach(function(item) {
            total += item[1];
        });
        normalize_factor = total / 800.0;
        topic = topic.map(function(item) {
            return [item[0], item[1] / normalize_factor];
        });
        options['list'] = topic;

        WordCloud(document.getElementById(`cluster${n}`), options);
    },

    OnWordHover: function(item, dimension) {
        $('#box').remove();
        var $canvasContainer = $('#cloud-gallery .tile:hover');
        var $box = $('<div id="box" hidden />');
        $canvasContainer.append($box);
        if (!dimension) {
            $box.prop('hidden', true);
            return;
        }

        var dppx = TagCloud.devicePixelRatio;

        $box.prop('hidden', false);
        $box.css({
            left: dimension.x / dppx + 'px',
            top: dimension.y / dppx + 'px',
            width: dimension.w / dppx + 'px',
            height: dimension.h / dppx + 'px'
        });
    },

    OnWordClick: function(item, dimension, event) {
        var word = item[0];
        SearchTopic.searchArticles(word);
    },
}
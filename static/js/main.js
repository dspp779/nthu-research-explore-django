var csrftoken;

$(document).ready(function() {
    csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();
    SearchTopic.init();
    TagCloud.init();
});


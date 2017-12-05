var SearchTopic = {
  lastQuery: '',
  departments: null,

  init: function() {
    $('#search-form').submit(function(e) {
      e.preventDefault();
      var querystr = $('#search-form input#query-input').val().trim();

      if (querystr) {
        SearchTopic.query(querystr);
      }
      // return false to prevent default and stop propagation
      return false;
    });

    $('.dialog-close-button').on('click', SearchTopic.closeArticleView);

    $('#query-input').autocomplete({
      source: "/autocomplete/",
      minLength: 0,
      select: function(event, ui) {
        var keyword = ui.item.value;
        SearchTopic.query(keyword);
      }
    });

    $('#query-input').on('focusin', function() {
      SearchTopic.changeStep(1);
    }).on('focusout', function() {
      var content = $('#cloud-gallery').html();
      if(content) {
        SearchTopic.changeStep(2);
      }
    });
  },

  query: function(querystr) {
    $.ajax({
      url: '/topic/' + querystr,
      type: 'GET',
      dataType: 'json',
    })
    .done(SearchTopic.renderSearchResult);

    $('#cloud-gallery').html('<i class="fa fa-spinner fa-pulse fa-4x fa-fw margin10"></i>')
  },

  searchArticles: function(keyword) {
    var query = encodeURIComponent(`${keyword}, ${SearchTopic.lastQuery}`);
    $.ajax({
      url: '/article/' + query,
      type: 'GET',
      dataType: 'json',
    })
    .done(SearchTopic.renderTopicInfo);
  },

  renderSearchResult: function(data) {
    SearchTopic.lastQuery = data.query;
    $('#cloud-gallery').html('');
    SearchTopic.changeStep(2);
    TagCloud.renderTopicClouds(data.results);
  },

  renderTopicInfo: function(data) {
    var htmlFrag = ''
    // 
    SearchTopic.departments = data.results
    $('#topic-dialog .header').text(`您搜尋的字詞：${SearchTopic.lastQuery}, ${data.query}`);

    $.each(data.results, function(department, professors) {
      htmlFrag += `<div class="list-group collapsed department"><span class="list-group-toggle department">${department}</span><div class="list-group-content" style="display: none;">`;
      $.each(professors, function(professor, articles){
        htmlFrag += `<div class="list professor">${professor}</div>`;
      });
      htmlFrag += '</div></div>'
    });
    $('.department-area').html(htmlFrag);

    $('.list.professor').click(function() {
      department = $(this).parents( ".department" ).children('span').text();
      professor = $(this).text().trim();
      SearchTopic.renderRelatedArticle(SearchTopic.departments[department][professor]);
    });
    SearchTopic.changeStep(3);
    $('body').scrollTop(0).addClass('unscrollable');
    $('#search-form h1').hide();
    metroDialog.toggle('#topic-dialog');

    $('.dialog-overlay').click(SearchTopic.closeArticleView);

  },

  renderRelatedArticle: function(articles) {
    var htmlFrag = '';
    articles.forEach(function(item) {
      titleZh = item[0];
      titleEn = item[1];
      article = item[2];
      htmlFrag += `<div class="listview padding20" data-role="listview">
                    <div class="list-group collapsed department">
                      <div class="list-group-toggle">
                        <h5 class="header align-justify">${titleZh}</h5>
                        <h5 class="header align-justify">${titleEn}</h5>
                      </div>
                      <blockquote class="list-group-content" style="display: none;">
                        <p class="align-justify">${article}</p>
                      </blockquote>
                    </div>
                  </div>`;
    });
    $('.article-area').html(htmlFrag);
  },

  closeArticleView: function() {
    SearchTopic.changeStep(2);
    $('#search-form h1').show();
    $('body').scrollTop(0).removeClass('unscrollable');
    $('.article-area').html('');
  },

  changeStep: function(n) {
    $('.steps').find('a').removeClass('active').end().find(`a.step${n}`).addClass('active');
  },
}
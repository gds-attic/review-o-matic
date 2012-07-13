function positionButtons() {
    $('.buttons').css('margin-left', (($('.mapping_info').width() - $('.buttons').width()) / 2 ) );
}

$(document).ready( function() {

    // Set position of buttons based on screen width
    positionButtons();
    $(window).resize(function() {
        positionButtons();
    });

  $('#overlay').fadeTo('fast', 0);

  var can_load_new_mapping = true;

  $('.browser .buttons button').click(function(e) {
    e.preventDefault();

    var form_path = $(this).parent('form').attr('action');
    var all_buttons = $(this).parent('form').find('button');
    var button = $(this);

    $.ajax({
      type: "PUT",
      url: form_path,
      data: { result: $(this).attr('name') },
      success: function(data) {
        all_buttons.removeClass('selected');
        if (can_load_new_mapping == true) {
          load_new_mapping();
        }
      },
      error: function(data) {
        all_buttons.removeAttr('disabled').removeClass('selected');
        $('.buttons').removeClass('disabled');

        alert("An error occurred whilst trying to save your review. Please reload the page and try again.");
        window.location = window.location;
      },
      beforeSend: function(data) {
        $('.buttons, .mapping_links_container a').addClass('disabled');
        all_buttons.attr('disabled',true).removeClass('selected');
        button.addClass('selected');
      }
    });
  });

  // Submit Comment using PUT
  $('.browser .comments input').click(function(event) {
    event.preventDefault();
    var form_path = $(this).parent('form').attr('action');
    var $commentTextarea = $(this).parent().find('textarea');
    console.log($commentTextarea.val());
    $.ajax({
      type: "PUT",
      url: form_path,
      data: { comment: $commentTextarea.val() }, 
      error: function(data) {
        alert("An error occurred whilst trying to save your review. Please reload the page and try again.");
        window.location = window.location;
      },
      beforeSend: function(data) {

      }
    });
  });

  // Hide comment textarea and submit button
  $('.browser .comments > div').hide();

  // Display comment form
  $('.browser .comments .question').click(function(event) {
    event.preventDefault();
    $('.browser .comments > div').fadeIn();
  });

  // Load next mapping
  $('.browser .comments .next').click(function(event) {
    event.preventDefault();
    if (can_load_new_mapping == true) {
      load_new_mapping();
    }
  });


  window.onpopstate = function(event) {
    if (event.state && event.state.mapping_id !== undefined) {
      load_mapping(event.state.mapping_id);
    }
  };

  function load_new_mapping() {
    $.getJSON('/browse.json', function(data) {
      load_mapping(data.next_mapping_id);
    });
  }

  function load_mapping(id) {
    $('#overlay').fadeTo('fast', 0.9);

    $.getJSON('/browse/'+ id +'.json', function(data) {
      switch (data.status) {
        case 301:
          mapping_result = "→ <a href='" + data.new_url + "' target='blank'>" + data.new_url + "</a>";
          new_page_src = data.new_url;
          break;
        case 410:
          mapping_result = "→ Gone";
          new_page_src = '/browser/410.html';
          break;
        default:
          mapping_result = "None";
          new_page_src = '/browser/no_status.html';
      }

      if (data.result !== null) {
        $('.buttons button[name="'+ data.result +'"]').addClass('selected');
      }

      $('#mapping_title a').text(data.title).attr('href', data.old_url);
      $('#mapping_result').html(mapping_result);
      $('#mapping_old_page').attr('src', data.old_url);
      $('.mapping_links_container .left').empty().append('<a href="' + data.old_url +'">' + data.old_url + '</a>');
      $('#mapping_new_page').attr('src', new_page_src);
      $('.mapping_links_container .right').empty().append('<a href="' + new_page_src +'">' + new_page_src + '</a>');

      history.pushState( { mapping_id: data.id }, '', '/browse/' + data.id );

      $('.user_score').text( parseInt( $('.user_score').text() ) + 1 );

      can_load_new_mapping = true;
      $('.buttons form').attr('action', '/reviews/' + data.id);
      $('.buttons button').removeAttr('disabled');
    });

    $('#mapping_old_page').load( function(){
      $('.buttons').removeClass('disabled');
      $('#overlay').fadeTo('fast', 0);
    });
  }
});

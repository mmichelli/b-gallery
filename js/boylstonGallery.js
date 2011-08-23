$.fn.BoylstonGallery =  function(options) {

  var defaults = {
    index : 0,
    next : ".Navigation .next, .Navigation .nextslide",
    previous: ".Navigation .previous, .Navigation .previousslide",
    slides : ".slide",
    slideFX : slideFX,
    bubbleFX : bubbleFX
  };

  var opts = $.extend(defaults, options);

  var gallery = this,
  index = opts.index,
  next = $(opts.next, gallery),
  previous = $(opts.previous, gallery),
  slides = $(opts.slides, gallery),
  slideFX = opts.slideFX,
  bubbleFX = opts.bubbleFX;

  init();

  function init()
  {
    jumpToHash();
    addClickEvents();
    updateCounter();
  }

  function addClickEvents()
  {
    next.click(function() {
      incIndex(1);
      return false;
    });

    previous.click(function() {
      incIndex(-1);
      return false;
    });
  }

  $(".icon a.point" , gallery).click(function() {
    var bubble =  $(this).parent();
    bubble.toggleClass("active");
    if(bubble.hasClass("active"))
    {
      closeOtherBubbles(bubble);
    }
    bubbleFX();
    return false;
  });

  function closeOtherBubbles(bubble)
  {
    bubble.siblings().removeClass("active");
  }

  function closeBubbles()
  {
    $(".icon" , gallery).siblings().removeClass("active");
  }



  function update()
  {
    updateSlider();
    updateCounter();
    updateHash();
    slideFX();
    bubbleFX();
  }

  function updateSlider()
  {
    slides.filter(".bottom").removeClass("bottom");
    slides.filter(".top").removeClass("top").addClass("bottom");
    $(slides.get(index)).addClass("top");
  }

  function updateCounter()
  {
    var idd = doubleDigit(index + 1),
    sdd =  doubleDigit(slides.size());
    $(".count", gallery).html(idd+"/"+sdd);

  }

  function jumpToHash()
  {
    if(gallery.attr("id") && window.location.hash.indexOf(gallery.attr("id") != -1))
    {
      var id =  window.location.hash.split("_");
      if(id.length == 2  ) {
        var i = Number(id[1]);
        i = (isNaN(i))?0: Number(id[1]);
        setIndex(i - 1);
      }
    }
  }

  function updateHash()
  {
    window.location.hash  = gallery.attr("id") + "_" +  (index + 1);
  }

  function incIndex(inc)
  {
    var top = slides.filter(".top"),
    i = slides.index(top);
    i = (i + inc) % slides.size();
    setIndex(i);
  }

  function setIndex(i) {
    var updateView = index != i;
    index = i;
    if(updateView) {
      closeBubbles();
      update();

    }

  }

  function doubleDigit(n)
  {
    var s = n + 1000 + "";
    return s.substring(s.length -2, s.length );

  }

  function bubbleFX()
  {
    $(".icon" , gallery).filter(".active").children(".bubble:hidden").fadeIn(500);
    $(".icon" , gallery).not(".active").children(".bubble:visible").fadeOut(500);

  }


  function slideFX()
  {
    var top = slides.filter(".top"),
    bottom = slides.filter(".bottom");
    top.css("opacity", 0);
    top.animate({
      "opacity": 1,
    }, 500, function() {
      // Animation complete.
    });

  }



}
